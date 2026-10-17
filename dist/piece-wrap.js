"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pieceOf = pieceOf;
// Run 42 port: the sector rewrite (src/rw-impact.ts, src/rw-impact2.ts and the helpers in src/index.ts) cuts, joins and
// changes the case of caller text. This keeps main's single escape layer: every helper that returns caller text returns it
// through escapePiece (src/escape-inputs.ts), exactly as the helpers of the older tools do. escapePiece reads a piece back to
// the characters that were typed and scans it again, so a piece that was already escaped comes back the same (never escaped twice).
const escape_inputs_ts_1 = require("./escape-inputs.js");
function pieceOf(v) {
    if (typeof v === 'string')
        return (0, escape_inputs_ts_1.escapePiece)(v);
    if (Array.isArray(v))
        return v.map((x) => pieceOf(x));
    if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
        const out = {};
        for (const [k, x] of Object.entries(v))
            out[k] = pieceOf(x);
        return out;
    }
    return v;
}
//# sourceMappingURL=piece-wrap.js.map