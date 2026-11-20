import type { IncomingMessage, ServerResponse } from 'http';
import { handleHealthRequest } from '../src/server/aiChatHandler.ts';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  handleHealthRequest(req, res);
}
