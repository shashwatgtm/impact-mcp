"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachSegmentMessage = attachSegmentMessage;
const segment_message_ts_1 = require("./segment-message.js");
function attachSegmentMessage(server) {
    const h = server._requestHandlers;
    const list = h.get('tools/list'), call = h.get('tools/call');
    h.set('tools/list', async (r, e) => { const result = await list(r, e); return { ...result, tools: [...result.tools, segment_message_ts_1.segmentMessageDefinition] }; });
    h.set('tools/call', async (r, e) => r.params?.name === segment_message_ts_1.SEGMENT_MESSAGE_TOOL ? (0, segment_message_ts_1.runSegmentMessage)(r.params.arguments, (name, args) => call({ ...r, params: { name, arguments: args } }, e)) : call(r, e));
}
//# sourceMappingURL=segment-message-registration.js.map