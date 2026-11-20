import type { IncomingMessage, ServerResponse } from 'http';
import { handleAiChatRequest } from '../../src/server/aiChatHandler.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleAiChatRequest(req, res);
}
