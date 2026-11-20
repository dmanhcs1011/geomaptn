import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  buildSystemInstruction,
  retrieveThaiNguyenContext,
} from './knowledgeBase.ts';

// Ultra-fast primary model (default zero-thinking latency) + backup models
export const FAST_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-3.1-flash-lite';
export const BACKUP_MODEL = 'gemini-4-hydrogen';
// Public-API fallback reached only if an external host key (e.g. Vercel) returns 404 for internal aliases
const PUBLIC_FALLBACK_MODEL = 'gemini-2.5-flash';

const ATTEMPT_TIMEOUT_MS = 8500;
const COOLDOWN_MS = 15_000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 80;

const consecutiveFailures = new Map<string, number>();
const modelCooldownUntil = new Map<string, number>();
const unsupportedModels = new Set<string>();

interface CachedAnswer {
  text: string;
  sources: GroundingSource[];
  expiresAt: number;
}
const responseCache = new Map<string, CachedAnswer>();

let sharedClient: GoogleGenAI | null = null;
let sharedClientKey: string | undefined;

interface ChatHistoryMessage {
  role: 'user' | 'model';
  text: string;
}

interface GroundingSource {
  title: string;
  uri: string;
}

interface AttemptPlan {
  model: string;
  withSearch: boolean;
  streaming: boolean;
  delayBeforeMs?: number;
}

interface RequestWithBody extends IncomingMessage {
  body?: unknown;
}

function getApiKey(): string | undefined {
  const raw = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'MY_GEMINI_API_KEY') return undefined;
  return trimmed;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('MISSING_GEMINI_API_KEY');
  }
  if (!sharedClient || sharedClientKey !== apiKey) {
    sharedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    sharedClientKey = apiKey;
  }
  return sharedClient;
}

function sendJson(res: ServerResponse, statusCode: number, data: Record<string, unknown>) {
  if (res.writableEnded) return;
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

async function readJsonBody(req: RequestWithBody): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString('utf8')) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer | string) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw) as Record<string, unknown>);
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function normalizeContents(
  history: ChatHistoryMessage[],
  trimmedMessage: string
): { role: 'user' | 'model'; parts: { text: string }[] }[] {
  const rawTurns: { role: 'user' | 'model'; text: string }[] = [];

  if (Array.isArray(history)) {
    const sanitized = history
      .filter(
        (item) =>
          item &&
          (item.role === 'user' || item.role === 'model') &&
          typeof item.text === 'string' &&
          item.text.trim().length > 0
      )
      .slice(-6);

    for (const item of sanitized) {
      const text = item.text.trim();
      if (rawTurns.length === 0 && item.role !== 'user') continue;
      const prev = rawTurns[rawTurns.length - 1];
      if (prev && prev.role === item.role) {
        prev.text = `${prev.text}\n${text}`;
      } else {
        rawTurns.push({ role: item.role, text });
      }
    }
  }

  const last = rawTurns[rawTurns.length - 1];
  if (last && last.role === 'user') {
    last.text = `${last.text}\n${trimmedMessage}`;
  } else {
    rawTurns.push({ role: 'user', text: trimmedMessage });
  }

  return rawTurns.map((t) => ({
    role: t.role,
    parts: [{ text: t.text }],
  }));
}

function isModelNotFoundError(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    status === 404 ||
    msg.includes('404') ||
    msg.includes('NOT_FOUND') ||
    msg.includes('is not found') ||
    msg.includes('not supported for generateContent')
  );
}

function isRetryableUpstreamError(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    status === 503 ||
    status === 500 ||
    status === 429 ||
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('TIMEOUT') ||
    msg.includes('high demand') ||
    msg.includes('overloaded')
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error('UPSTREAM_TIMEOUT')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

function makeCacheKey(message: string, lang: string, useWebSearch: boolean): string {
  return `${lang}|${useWebSearch ? '1' : '0'}|${message.toLowerCase().replace(/\s+/g, ' ').trim()}`;
}

function saveToCache(key: string, text: string, sources: GroundingSource[]) {
  if (!text.trim()) return;
  if (responseCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(key, {
    text,
    sources,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function recordModelSuccess(model: string) {
  consecutiveFailures.delete(model);
  modelCooldownUntil.delete(model);
}

function recordModelFailure(model: string) {
  const count = (consecutiveFailures.get(model) || 0) + 1;
  consecutiveFailures.set(model, count);
  if (count >= 3) {
    modelCooldownUntil.set(model, Date.now() + COOLDOWN_MS);
  }
}

function extractGroundingSources(
  candidates?: {
    groundingMetadata?: {
      groundingChunks?: { web?: { uri?: string; title?: string } }[];
    };
  }[],
  targetMap?: Map<string, GroundingSource>
): Map<string, GroundingSource> {
  const map = targetMap || new Map<string, GroundingSource>();
  const groundingChunks = candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (Array.isArray(groundingChunks)) {
    for (const gChunk of groundingChunks) {
      const web = gChunk?.web;
      if (web?.uri && !map.has(web.uri)) {
        map.set(web.uri, {
          title: web.title || web.uri,
          uri: web.uri,
        });
      }
    }
  }
  return map;
}

function buildAttemptPlans(useWebSearch: boolean): AttemptPlan[] {
  const now = Date.now();
  const fastAvailable = !unsupportedModels.has(FAST_MODEL);
  const backupAvailable = !unsupportedModels.has(BACKUP_MODEL);
  const fastCooling = (modelCooldownUntil.get(FAST_MODEL) || 0) > now;
  const backupCooling = (modelCooldownUntil.get(BACKUP_MODEL) || 0) > now;

  const plans: AttemptPlan[] = [];

  if (useWebSearch) {
    if (fastAvailable) {
      plans.push({ model: FAST_MODEL, withSearch: true, streaming: true });
      plans.push({ model: FAST_MODEL, withSearch: true, streaming: false, delayBeforeMs: 300 });
      plans.push({ model: FAST_MODEL, withSearch: false, streaming: true, delayBeforeMs: 200 });
    }
    if (backupAvailable) {
      plans.push({ model: BACKUP_MODEL, withSearch: false, streaming: true });
    }
    if (!unsupportedModels.has(PUBLIC_FALLBACK_MODEL)) {
      plans.push({ model: PUBLIC_FALLBACK_MODEL, withSearch: true, streaming: true });
      plans.push({ model: PUBLIC_FALLBACK_MODEL, withSearch: false, streaming: true });
    }
    return plans;
  }

  if (fastAvailable && (!fastCooling || backupCooling || !backupAvailable)) {
    plans.push({ model: FAST_MODEL, withSearch: false, streaming: true });
    plans.push({ model: FAST_MODEL, withSearch: false, streaming: true, delayBeforeMs: 300 });
    plans.push({ model: FAST_MODEL, withSearch: false, streaming: false, delayBeforeMs: 450 });
    if (backupAvailable) {
      plans.push({ model: BACKUP_MODEL, withSearch: false, streaming: true, delayBeforeMs: 200 });
    }
  } else if (backupAvailable) {
    plans.push({ model: BACKUP_MODEL, withSearch: false, streaming: true });
    if (fastAvailable) {
      plans.push({ model: FAST_MODEL, withSearch: false, streaming: true, delayBeforeMs: 250 });
      plans.push({ model: FAST_MODEL, withSearch: false, streaming: false, delayBeforeMs: 450 });
    }
  }

  if (!unsupportedModels.has(PUBLIC_FALLBACK_MODEL)) {
    plans.push({ model: PUBLIC_FALLBACK_MODEL, withSearch: false, streaming: true, delayBeforeMs: 150 });
    plans.push({ model: PUBLIC_FALLBACK_MODEL, withSearch: false, streaming: false, delayBeforeMs: 300 });
  }

  return plans;
}

export function handleHealthRequest(_req: IncomingMessage, res: ServerResponse) {
  sendJson(res, 200, {
    ok: true,
    configured: Boolean(getApiKey()),
    model: FAST_MODEL,
    backupModel: BACKUP_MODEL,
  });
}

export async function handleAiChatRequest(
  req: RequestWithBody,
  res: ServerResponse
): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method && req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  const body = await readJsonBody(req);
  const {
    message,
    history = [],
    lang = 'vi',
    useWebSearch = false,
  } = body as {
    message?: string;
    history?: ChatHistoryMessage[];
    lang?: 'vi' | 'en';
    useWebSearch?: boolean;
  };

  const trimmedMessage = typeof message === 'string' ? message.trim() : '';
  if (!trimmedMessage) {
    sendJson(res, 400, { error: 'Vui lòng nhập câu hỏi của bạn.' });
    return;
  }

  const safeLang = lang === 'en' ? 'en' : 'vi';

  let ai: GoogleGenAI;
  try {
    ai = getGeminiClient();
  } catch {
    sendJson(res, 503, {
      error:
        safeLang === 'vi'
          ? 'Chưa cấu hình khóa GEMINI_API_KEY trên máy chủ. Nếu đang triển khai trên Vercel, vui lòng vào Project Settings > Environment Variables, thêm biến GEMINI_API_KEY rồi Redeploy.'
          : 'GEMINI_API_KEY is not configured on the server. On Vercel, add GEMINI_API_KEY in Project Settings > Environment Variables and redeploy.',
    });
    return;
  }

  const isStandaloneQuery = !Array.isArray(history) || history.length === 0;
  const cacheKey = isStandaloneQuery
    ? makeCacheKey(trimmedMessage, safeLang, Boolean(useWebSearch))
    : '';

  let clientDisconnected = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      clientDisconnected = true;
    }
  });

  // Configure SSE streaming response immediately (Vercel + Express compatible)
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const sendEvent = (payload: Record<string, unknown>) => {
    if (!res.writableEnded && !clientDisconnected) {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  };

  // Instant cache hit for repeated standalone questions
  if (cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      sendEvent({ type: 'chunk', text: cached.text });
      if (cached.sources.length > 0) {
        sendEvent({ type: 'sources', sources: cached.sources });
      }
      sendEvent({ type: 'done' });
      res.end();
      return;
    }
    if (cached) responseCache.delete(cacheKey);
  }

  const recentUserContext = Array.isArray(history)
    ? history
        .filter((h) => h && h.role === 'user' && typeof h.text === 'string')
        .slice(-1)
        .map((h) => h.text)
        .join(' ')
    : '';
  const retrievedContext = retrieveThaiNguyenContext(
    `${recentUserContext} ${trimmedMessage}`.trim()
  );
  const systemInstruction = buildSystemInstruction(safeLang, retrievedContext);
  const contents = normalizeContents(history, trimmedMessage);

  const attempts = buildAttemptPlans(Boolean(useWebSearch));
  let lastErr: unknown = null;
  let emittedAnyChunk = false;

  try {
    for (const attempt of attempts) {
      if (clientDisconnected || res.writableEnded) return;
      if (unsupportedModels.has(attempt.model)) continue;

      if (attempt.delayBeforeMs && attempt.delayBeforeMs > 0) {
        await new Promise((r) => setTimeout(r, attempt.delayBeforeMs));
        if (clientDisconnected || res.writableEnded) return;
      }

      const config: {
        systemInstruction: string;
        maxOutputTokens: number;
        thinkingConfig?: { thinkingLevel: ThinkingLevel };
        tools?: { googleSearch: Record<string, never> }[];
      } = {
        systemInstruction,
        maxOutputTokens: 1200,
      };

      if (attempt.model === BACKUP_MODEL) {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      }

      if (attempt.withSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      try {
        const sourcesMap = new Map<string, GroundingSource>();
        let fullText = '';

        if (attempt.streaming) {
          const stream = await withTimeout(
            ai.models.generateContentStream({
              model: attempt.model,
              contents,
              config,
            }),
            ATTEMPT_TIMEOUT_MS
          );

          const iterator = stream[Symbol.asyncIterator]();
          const firstResult = await withTimeout(iterator.next(), ATTEMPT_TIMEOUT_MS);

          const processChunk = (chunk: {
            text?: string;
            candidates?: {
              groundingMetadata?: {
                groundingChunks?: { web?: { uri?: string; title?: string } }[];
              };
            }[];
          }) => {
            const deltaText = chunk?.text;
            if (deltaText) {
              emittedAnyChunk = true;
              fullText += deltaText;
              sendEvent({ type: 'chunk', text: deltaText });
            }
            extractGroundingSources(chunk?.candidates, sourcesMap);
          };

          if (!firstResult.done && firstResult.value) {
            processChunk(firstResult.value);
          }

          if (!firstResult.done) {
            while (!clientDisconnected && !res.writableEnded) {
              const nextResult = await withTimeout(iterator.next(), 12000);
              if (nextResult.done) break;
              if (nextResult.value) {
                processChunk(nextResult.value);
              }
            }
          }
        } else {
          const response = await withTimeout(
            ai.models.generateContent({
              model: attempt.model,
              contents,
              config,
            }),
            ATTEMPT_TIMEOUT_MS
          );

          const text = response.text || '';
          if (text) {
            emittedAnyChunk = true;
            fullText = text;
            sendEvent({ type: 'chunk', text });
          }
          extractGroundingSources(response.candidates, sourcesMap);
        }

        if (clientDisconnected || res.writableEnded) {
          return;
        }

        if (!fullText.trim()) {
          throw new Error('EMPTY_UPSTREAM_RESPONSE');
        }

        recordModelSuccess(attempt.model);

        const sources = Array.from(sourcesMap.values()).slice(0, 5);
        if (sources.length > 0) {
          sendEvent({ type: 'sources', sources });
        }

        if (cacheKey) {
          saveToCache(cacheKey, fullText, sources);
        }

        sendEvent({ type: 'done' });
        res.end();
        return;
      } catch (attemptErr: unknown) {
        lastErr = attemptErr;
        if (emittedAnyChunk || clientDisconnected) {
          throw attemptErr;
        }

        if (isModelNotFoundError(attemptErr)) {
          unsupportedModels.add(attempt.model);
          continue;
        }

        const st = (attemptErr as { status?: number })?.status;
        const retryable =
          isRetryableUpstreamError(attemptErr) ||
          (attemptErr instanceof Error &&
            attemptErr.message === 'EMPTY_UPSTREAM_RESPONSE');

        if (retryable && !attempt.withSearch) {
          recordModelFailure(attempt.model);
        }

        const canContinue = retryable || (attempt.withSearch && st === 400);
        if (!canContinue) {
          throw attemptErr;
        }
      }
    }

    throw lastErr || new Error('All Gemini attempts failed');
  } catch (err: unknown) {
    if (clientDisconnected || res.writableEnded) return;

    const errObj = err as { status?: number; message?: string };
    const rawMessage =
      errObj?.message || (err instanceof Error ? err.message : String(err));
    const status = errObj?.status;
    console.warn(
      `[/api/ai/chat] Upstream error (${status ?? 'unknown'}): ${rawMessage.slice(0, 180)}`
    );

    let userMessage =
      safeLang === 'vi'
        ? 'Hệ thống AI đang bận nhẹ do lượng truy cập cao. Em bấm "Thử lại ngay" bên dưới nhé!'
        : 'The AI service is momentarily busy. Please click "Retry now" below!';

    if (
      status === 403 ||
      status === 400 ||
      rawMessage.includes('API_KEY_INVALID') ||
      rawMessage.includes('PERMISSION_DENIED') ||
      rawMessage.includes('API key not valid') ||
      rawMessage.includes('403')
    ) {
      userMessage =
        safeLang === 'vi'
          ? 'Khóa API Gemini chưa hợp lệ hoặc chưa được cấp quyền. Vui lòng kiểm tra biến GEMINI_API_KEY trong phần Settings của Vercel / AI Studio.'
          : 'The Gemini API key is invalid or lacks permission. Please verify GEMINI_API_KEY in Vercel / AI Studio settings.';
    } else if (
      status === 429 ||
      rawMessage.includes('RESOURCE_EXHAUSTED') ||
      rawMessage.includes('429')
    ) {
      userMessage =
        safeLang === 'vi'
          ? 'Hệ thống AI vừa chạm giới hạn lượt gọi nhanh. Em đợi vài giây rồi bấm "Thử lại ngay" nhé!'
          : 'AI rate limit reached briefly. Please wait a few seconds and click "Retry now".';
    }

    sendEvent({
      type: 'error',
      error: userMessage,
      code: status || undefined,
    });
    res.end();
  }
}
