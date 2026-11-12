"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAIN_URI = void 0;
exports.attachChainResults = attachChainResults;
const chain_results_html_ts_1 = require("./chain-results-html.js");
exports.CHAIN_URI = 'ui://helix/results/chains/v1.html';
// Separate address preserves the owner's byte-pinned existing results resource.
function attachChainResults(server, toolName, title) {
    const h = server._requestHandlers;
    if (!(h instanceof Map) || !h.get('tools/list') || !h.get('tools/call'))
        throw new Error('Register tools before the chain view.');
    const list = h.get('tools/list'), call = h.get('tools/call'), resources = h.get('resources/list'), read = h.get('resources/read');
    const meta = { ui: { prefersBorder: true, csp: { connectDomains: [], resourceDomains: [], frameDomains: [] } }, 'openai/widgetDescription': 'Helix results view for a guided chain. Shows the full server answer and sends choices back to chat. It calculates nothing.', 'openai/widgetPrefersBorder': true, 'openai/widgetCSP': { connect_domains: [], resource_domains: [], frame_domains: [] } };
    server.registerCapabilities({ resources: {} });
    h.set('tools/list', async (r, e) => { const result = await list(r, e); return { ...result, tools: result.tools.map((t) => t.name === toolName ? { ...t, _meta: { ...t._meta, ui: { resourceUri: exports.CHAIN_URI }, 'openai/outputTemplate': exports.CHAIN_URI } } : t) }; });
    h.set('tools/call', async (r, e) => {
        const result = await call(r, e);
        if (r.params?.name !== toolName || result.isError || !result.structuredContent)
            return result;
        return { ...result, _meta: { ...result._meta, helixResults: { version: 2, tool: toolName, title, text: result.content.filter((x) => x.type === 'text').map((x) => x.text).join('\n'), chain: result.structuredContent } } };
    });
    const resource = { uri: exports.CHAIN_URI, name: 'helix-chain-results', mimeType: 'text/html;profile=mcp-app', _meta: meta };
    h.set('resources/list', async (r, e) => { const result = resources ? await resources(r, e) : { resources: [] }; return { ...result, resources: [...result.resources, resource] }; });
    h.set('resources/read', async (r, e) => r.params?.uri === exports.CHAIN_URI ? { contents: [{ ...resource, text: chain_results_html_ts_1.CHAIN_RESULTS_HTML }] } : read ? read(r, e) : Promise.reject(new Error('Unknown results resource.')));
}
//# sourceMappingURL=chain-results.js.map