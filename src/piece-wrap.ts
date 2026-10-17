// Run 42 port: the sector rewrite (src/rw-impact.ts, src/rw-impact2.ts and the helpers in src/index.ts) cuts, joins and
// changes the case of caller text. This keeps main's single escape layer: every helper that returns caller text returns it
// through escapePiece (src/escape-inputs.ts), exactly as the helpers of the older tools do. escapePiece reads a piece back to
// the characters that were typed and scans it again, so a piece that was already escaped comes back the same (never escaped twice).
import { escapePiece } from './escape-inputs.ts';

export function pieceOf<T>(v: T): T {
  if (typeof v === 'string') return escapePiece(v) as unknown as T;
  if (Array.isArray(v)) return v.map((x) => pieceOf(x)) as unknown as T;
  if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) out[k] = pieceOf(x);
    return out as T;
  }
  return v;
}
