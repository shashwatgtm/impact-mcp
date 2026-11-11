import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SEGMENT_MESSAGE_TOOL, segmentMessageDefinition, runSegmentMessage } from './segment-message.ts';
export function attachSegmentMessage(server: Server): void {
  const h = (server as any)._requestHandlers as Map<string, (r: any, e: any) => Promise<any>>;
  const list = h.get('tools/list')!, call = h.get('tools/call')!;
  h.set('tools/list', async (r, e) => { const result = await list(r, e); return { ...result, tools: [...result.tools, segmentMessageDefinition] }; });
  h.set('tools/call', async (r, e) => r.params?.name === SEGMENT_MESSAGE_TOOL ? runSegmentMessage(r.params.arguments, (name, args) => call({ ...r, params: { name, arguments: args } }, e)) : call(r, e));
}
