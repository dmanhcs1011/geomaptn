import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Volume2,
  Bot,
  User,
  Lightbulb,
  RotateCcw,
  Globe,
  ExternalLink,
  AlertCircle,
  Square,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { speechService } from '../utils/speech';

interface GroundingSource {
  title: string;
  uri: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  sources?: GroundingSource[];
  isError?: boolean;
  retryQuery?: string;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'vi' | 'en';
}

type PromptCategory =
  | 'all'
  | 'admin'
  | 'history'
  | 'tea'
  | 'culture'
  | 'disaster'
  | 'study';

interface PromptItem {
  category: Exclude<PromptCategory, 'all'>;
  vi: string;
  en: string;
}

const PROMPT_CATEGORIES: { id: PromptCategory; labelVi: string; labelEn: string }[] = [
  { id: 'all', labelVi: 'Gợi ý nổi bật', labelEn: 'Featured' },
  { id: 'admin', labelVi: 'Địa lý & 92 xã/phường', labelEn: 'Geography & 92 Units' },
  { id: 'history', labelVi: 'Lịch sử & Di tích', labelEn: 'History & Relics' },
  { id: 'tea', labelVi: 'Ngũ Đại Danh Trà', labelEn: '5 Famous Teas' },
  { id: 'culture', labelVi: 'Văn hóa & Du lịch', labelEn: 'Culture & Tourism' },
  { id: 'disaster', labelVi: 'Khí hậu & Thiên tai', labelEn: 'Climate & Safety' },
  { id: 'study', labelVi: 'Ôn tập GDĐP', labelEn: 'Study & Exam Prep' },
];

const SAMPLE_PROMPTS: PromptItem[] = [
  {
    category: 'admin',
    vi: 'Sau sáp nhập theo NQ 1683, tỉnh Thái Nguyên có bao nhiêu xã/phường và gồm những vùng phát triển nào?',
    en: 'After the merger under Resolution 1683, how many communes/wards does Thai Nguyen have and what are its 5 development zones?',
  },
  {
    category: 'history',
    vi: 'Ý nghĩa lịch sử của Lán Tỉn Keo tại Khu di tích Quốc gia đặc biệt ATK Định Hóa?',
    en: 'What is the historical significance of Tin Keo Hut at ATK Dinh Hoa?',
  },
  {
    category: 'tea',
    vi: 'Kể tên "Ngũ Đại Danh Trà" của tỉnh Thái Nguyên và giải thích vì sao chè Tân Cương có hương cốm non?',
    en: 'Name Thai Nguyen’s 5 Famous Tea Regions and explain why Tan Cuong tea has a young rice aroma.',
  },
  {
    category: 'culture',
    vi: 'Giới thiệu nghệ thuật Hát Then - Đàn Tính, Lễ hội Lồng Tồng và Làng nhà sàn Thái Hải?',
    en: 'Introduce Then Singing - Tinh Lute, Long Tong Festival, and Thai Hai Ecological Village.',
  },
  {
    category: 'disaster',
    vi: 'Các điểm thường ngập lụt ven sông Cầu, vùng nguy cơ sạt lở đất và quy tắc 4 Không khi mưa lũ?',
    en: 'Which areas face Cau River flooding or landslides, and what are the 4 Golden Safety Rules?',
  },
  {
    category: 'study',
    vi: 'Tạo giúp em 5 câu hỏi trắc nghiệm ôn tập môn Giáo dục địa phương Thái Nguyên có đáp án và giải thích!',
    en: 'Create 5 multiple-choice review questions on Thai Nguyen Local Education with answers and explanations!',
  },
  {
    category: 'history',
    vi: 'Di chỉ khảo cổ Mái đá Ngườm và sự kiện Đại đội 915 thanh niên xung phong có ý nghĩa như thế nào?',
    en: 'What is the significance of Nguom Rock Shelter and Youth Volunteer Company 915?',
  },
  {
    category: 'culture',
    vi: 'Gợi ý hành trình khám phá Hồ Núi Cốc, Hồ Ba Bể, Suối Cửa Tử và ẩm thực đặc sản Thái Nguyên?',
    en: 'Suggest an itinerary covering Nui Coc Lake, Ba Be Lake, Cua Tu Stream, and Thai Nguyen specialties.',
  },
  {
    category: 'admin',
    vi: 'Kinh tế công nghiệp, giáo dục (Đại học Thái Nguyên) và các làng nghề truyền thống tiêu biểu của tỉnh?',
    en: 'Overview of Thai Nguyen’s industry, Thai Nguyen University, and traditional craft villages.',
  },
  {
    category: 'study',
    vi: 'Lập dàn ý bài thuyết trình 5 phút về chủ đề "Thái Nguyên – Đệ nhất danh trà" cho môn GDĐP.',
    en: 'Outline a 5-minute presentation on "Thai Nguyen – Prime Tea Land" for Local Education class.',
  },
];

function createWelcomeMessage(lang: 'vi' | 'en'): Message {
  return {
    id: 'welcome',
    sender: 'ai',
    text:
      lang === 'vi'
        ? 'Xin chào các em học sinh và thầy/cô! Tôi là **Trợ Lý AI Chuyên Gia Tỉnh Thái Nguyên & Môn Giáo Dục Địa Phương (GDĐP)**.\n\nEm có thể hỏi tôi **mọi nội dung** về:\n- **Địa lý & 92 xã/phường mới** của tỉnh Thái Nguyên sau sáp nhập\n- **Lịch sử & Di tích**: ATK Định Hóa, Mái đá Ngườm, Đền Đuổm, Đại đội 915, Lý Nam Đế...\n- **Ngũ Đại Danh Trà**, làng nghề, ẩm thực & kinh tế - xã hội\n- **Văn hóa, lễ hội & thắng cảnh**: Hồ Núi Cốc, Hồ Ba Bể, Suối Cửa Tử, Hang Phượng Hoàng, Làng Thái Hải, Hát Then - Đàn Tính\n- **Khí hậu, phòng chống ngập lụt & sạt lở đất**\n- **Hỗ trợ học môn GDĐP**: giải thích bài học, soạn đề cương, tạo câu hỏi trắc nghiệm ôn tập, lập dàn ý thuyết trình!'
        : 'Hello students and teachers! I am the **Thai Nguyen Province & Local Education (GDĐP) Expert AI Tutor**.\n\nAsk me **anything** about:\n- **Geography & 92 merged communes/wards** of Thai Nguyen Province\n- **History & Relics**: ATK Dinh Hoa, Nguom Rock Shelter, Duom Temple, Company 915\n- **5 Famous Tea Regions**, traditional crafts, cuisine & socio-economic life\n- **Culture, Festivals & Scenic Spots**: Nui Coc Lake, Ba Be Lake, Cua Tu Stream, Phuong Hoang Cave, Thai Hai Village\n- **Climate, Flood & Landslide Safety Protocols**\n- **Local Education Study Help**: study outlines, quizzes, and presentation prep!',
  };
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-bold text-stone-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function FormattedMessageContent({
  text,
  isUser,
}: {
  text: string;
  isUser: boolean;
}) {
  if (isUser) {
    return <div className="whitespace-pre-wrap leading-relaxed">{text}</div>;
  }

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: { type: 'ul' | 'ol'; content: string }[] = [];

  const flushList = (keyPrefix: string) => {
    if (listItems.length === 0) return;
    const isOrdered = listItems[0].type === 'ol';
    if (isOrdered) {
      elements.push(
        <ol key={`${keyPrefix}-ol`} className="list-decimal pl-5 space-y-1 my-1.5">
          {listItems.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {renderInlineFormatting(item.content)}
            </li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul key={`${keyPrefix}-ul`} className="list-disc pl-5 space-y-1 my-1.5">
          {listItems.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {renderInlineFormatting(item.content)}
            </li>
          ))}
        </ul>
      );
    }
    listItems = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushList(`empty-${index}`);
      return;
    }

    const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      flushList(`h-${index}`);
      elements.push(
        <h4
          key={`h-${index}`}
          className="font-extrabold text-[#0e5945] text-sm sm:text-[15px] mt-2.5 mb-1"
        >
          {renderInlineFormatting(headingMatch[1])}
        </h4>
      );
      return;
    }

    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      if (listItems.length > 0 && listItems[0].type !== 'ul') {
        flushList(`sw-${index}`);
      }
      listItems.push({ type: 'ul', content: bulletMatch[1] });
      return;
    }

    const numMatch = line.match(/^\d+[.)]\s+(.+)$/);
    if (numMatch) {
      if (listItems.length > 0 && listItems[0].type !== 'ol') {
        flushList(`swn-${index}`);
      }
      listItems.push({ type: 'ol', content: numMatch[1] });
      return;
    }

    flushList(`p-${index}`);
    elements.push(
      <p key={`p-${index}`} className="leading-relaxed my-1">
        {renderInlineFormatting(line)}
      </p>
    );
  });

  flushList('end');
  return <div className="space-y-0.5">{elements}</div>;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [messages, setMessages] = useState<Message[]>(() => [createWelcomeMessage(lang)]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PromptCategory>('all');
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [createWelcomeMessage(lang)];
      }
      return prev;
    });
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  if (!isOpen) return null;

  const filteredPrompts =
    activeCategory === 'all'
      ? SAMPLE_PROMPTS.slice(0, 6)
      : SAMPLE_PROMPTS.filter((p) => p.category === activeCategory);

  const handleResetChat = () => {
    abortControllerRef.current?.abort();
    speechService.stop();
    setSpeakingMsgId(null);
    setIsLoading(false);
    setMessages([createWelcomeMessage(lang)]);
  };

  const handleStopGenerating = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  const handleSend = async (questionText?: string, retryAiMsgId?: string) => {
    const q = (questionText || inputText).trim();
    if (!q || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = retryAiMsgId || `ai-${Date.now() + 1}`;

    const historyPayload = messages
      .filter(
        (m) =>
          m.id !== 'welcome' &&
          !m.isError &&
          m.id !== retryAiMsgId &&
          m.text.trim().length > 0
      )
      .slice(-6)
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

    if (retryAiMsgId) {
      if (
        historyPayload.length > 0 &&
        historyPayload[historyPayload.length - 1].role === 'user'
      ) {
        historyPayload.pop();
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === retryAiMsgId
            ? { ...m, text: '', isError: false, retryQuery: undefined, sources: undefined }
            : m
        )
      );
    } else {
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, sender: 'user', text: q },
        { id: aiMsgId, sender: 'ai', text: '' },
      ]);
      if (!questionText) setInputText('');
    }
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          history: historyPayload,
          lang,
          useWebSearch,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMessage =
          lang === 'vi'
            ? 'Không thể nhận phản hồi từ Trợ lý AI. Vui lòng thử lại.'
            : 'Failed to receive a response from the AI Assistant.';
        try {
          const errJson = await response.json();
          if (errJson?.error) errorMessage = errJson.error;
        } catch {
          // ignore json parse error
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, text: errorMessage, isError: true, retryQuery: q }
              : m
          )
        );
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const rawEvent of events) {
          const dataLine = rawEvent
            .split('\n')
            .find((l) => l.startsWith('data: '));
          if (!dataLine) continue;

          try {
            const payload = JSON.parse(dataLine.slice(6));
            if (payload.type === 'chunk' && typeof payload.text === 'string') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, text: m.text + payload.text } : m
                )
              );
            } else if (
              payload.type === 'sources' &&
              Array.isArray(payload.sources)
            ) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, sources: payload.sources } : m
                )
              );
            } else if (payload.type === 'error' && payload.error) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        text: m.text ? `${m.text}\n\n${payload.error}` : payload.error,
                        isError: !m.text,
                        retryQuery: !m.text ? q : undefined,
                      }
                    : m
                )
              );
            }
          } catch {
            // ignore malformed SSE line
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId && !m.text
              ? {
                  ...m,
                  text:
                    lang === 'vi'
                      ? '(Đã dừng tạo câu trả lời)'
                      : '(Response generation stopped)',
                }
              : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  text:
                    lang === 'vi'
                      ? 'Mất kết nối tới máy chủ Trợ lý AI. Em bấm "Thử lại ngay" bên dưới nhé!'
                      : 'Lost connection to the AI server. Click "Retry now" below!',
                  isError: true,
                  retryQuery: q,
                }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleToggleSpeak = (msg: Message) => {
    if (speakingMsgId === msg.id) {
      speechService.stop();
      setSpeakingMsgId(null);
      return;
    }
    const cleanText = msg.text.replace(/\*\*/g, '').replace(/#+\s*/g, '');
    setSpeakingMsgId(msg.id);
    speechService.speak(cleanText, lang);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-fadeIn"
      onClick={() => {
        speechService.stop();
        onClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col h-[90vh] max-h-[780px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 bg-gradient-to-r from-[#0e5945] via-[#116149] to-[#16805e] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0">
              <Bot className="w-6 h-6 text-emerald-100" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base truncate">
                  {lang === 'vi'
                    ? 'Trợ Lý AI Chuyên Gia Thái Nguyên & GDĐP'
                    : 'Thai Nguyen & Local Education AI Expert'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-stone-950 shrink-0">
                  GDĐP
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-100 truncate">
                {lang === 'vi'
                  ? 'Hỏi đáp toàn diện 92 xã/phường, lịch sử, danh trà, văn hóa, thiên tai & ôn thi GDĐP'
                  : 'All-in-one Q&A on 92 units, history, teas, culture, hazards & exam prep'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleResetChat}
              title={lang === 'vi' ? 'Cuộc trò chuyện mới' : 'New chat'}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {lang === 'vi' ? 'Làm mới' : 'Reset'}
              </span>
            </button>
            <button
              onClick={() => {
                abortControllerRef.current?.abort();
                speechService.stop();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-white/15 text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Topic Categories & Suggested Prompts */}
        <div className="bg-stone-50 border-b border-stone-200 shrink-0">
          <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {PROMPT_CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    active
                      ? 'bg-[#116149] text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-[#116149]/50 hover:text-[#116149]'
                  }`}
                >
                  {lang === 'vi' ? cat.labelVi : cat.labelEn}
                </button>
              );
            })}
          </div>

          <div className="px-3 pb-2.5 pt-1 overflow-x-auto flex gap-2 scrollbar-none">
            {filteredPrompts.map((p, idx) => (
              <button
                key={`${activeCategory}-${idx}`}
                onClick={() => handleSend(lang === 'vi' ? p.vi : p.en)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:border-[#116149] hover:bg-emerald-50/40 disabled:opacity-50 text-stone-700 text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{lang === 'vi' ? p.vi : p.en}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm bg-white">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            const isEmptyStreaming = isAi && m.text === '' && isLoading;

            return (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${isAi ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isAi
                      ? m.isError
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-[#116149] text-white shadow-sm'
                      : 'bg-stone-700 text-stone-100'
                  }`}
                >
                  {isAi ? (
                    m.isError ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={`relative max-w-[88%] p-3.5 sm:p-4 rounded-2xl ${
                    isAi
                      ? m.isError
                        ? 'bg-rose-50 text-rose-900 border border-rose-200'
                        : 'bg-[#f5f8f5] text-stone-800 border border-emerald-100'
                      : 'bg-[#116149] text-white font-medium shadow-sm'
                  }`}
                >
                  {isEmptyStreaming ? (
                    <div className="flex items-center gap-2 text-stone-500 py-0.5">
                      <Sparkles className="w-4 h-4 text-[#116149] animate-pulse" />
                      <span>
                        {lang === 'vi'
                          ? 'Đang tra cứu dữ liệu Thái Nguyên & soạn câu trả lời...'
                          : 'Searching Thai Nguyen knowledge & composing answer...'}
                      </span>
                    </div>
                  ) : (
                    <FormattedMessageContent text={m.text} isUser={!isAi} />
                  )}

                  {/* Grounding Web Citations */}
                  {isAi && m.sources && m.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-emerald-200/70 space-y-1.5">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-stone-500">
                        <BookOpen className="w-3 h-3 text-[#116149]" />
                        <span>
                          {lang === 'vi' ? 'Nguồn tham khảo mở rộng:' : 'Reference Sources:'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.sources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-emerald-200/80 hover:border-[#116149] text-[11px] text-[#0e5945] font-medium max-w-[240px] truncate transition-colors"
                            title={src.title}
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {isAi && m.isError && m.retryQuery && (
                    <div className="mt-2.5 pt-2 border-t border-red-200/70 flex items-center justify-end">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleSend(m.retryQuery, m.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{lang === 'vi' ? 'Thử lại ngay' : 'Retry now'}</span>
                      </button>
                    </div>
                  )}

                  {isAi && m.id !== 'welcome' && !m.isError && m.text.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center justify-end">
                      <button
                        onClick={() => handleToggleSpeak(m)}
                        className="flex items-center gap-1 text-[11px] text-[#116149] font-bold hover:underline cursor-pointer"
                      >
                        {speakingMsgId === m.id ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>{lang === 'vi' ? 'Dừng đọc' : 'Stop'}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{lang === 'vi' ? 'Nghe giải thích' : 'Listen'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="px-3 py-3 sm:px-4 bg-white border-t border-stone-200 shrink-0 space-y-2">
          <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500 px-1">
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useWebSearch}
                onChange={(e) => setUseWebSearch(e.target.checked)}
                className="rounded accent-[#116149] cursor-pointer"
              />
              <Globe className="w-3.5 h-3.5 text-[#116149]" />
              <span className="font-medium text-stone-600">
                {lang === 'vi'
                  ? 'Kết hợp tìm kiếm mở rộng (trả lời mọi câu hỏi mới về Thái Nguyên)'
                  : 'Enable web grounding (for broader Thai Nguyen queries)'}
              </span>
            </label>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                lang === 'vi'
                  ? 'Hỏi bất kỳ điều gì về tỉnh Thái Nguyên & môn Giáo dục địa phương...'
                  : 'Ask anything about Thai Nguyen Province & Local Education...'
              }
              className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#116149]"
            />
            {isLoading ? (
              <button
                type="button"
                onClick={handleStopGenerating}
                className="px-3.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'vi' ? 'Dừng' : 'Stop'}</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-2xl bg-[#116149] hover:bg-[#0e4e3a] disabled:opacity-40 text-white shadow-sm transition-colors shrink-0 cursor-pointer"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
