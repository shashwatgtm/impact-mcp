"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCounts = parseCounts;
exports.allocateCounts = allocateCounts;
exports.cents = cents;
exports.dollars = dollars;
exports.segmentTable = segmentTable;
const quantity = String.raw `(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?\s*[km]?`;
const countLine = new RegExp(`^(?:(.*?)\\s*[:=]\\s*)?(?:about |around |roughly |~)?(${quantity})(?:\\s+(?:companies|accounts|firms))?$`, 'i');
const total = `(?:total\\s*[:=]?\\s*)?(${quantity})\\s*(?:total\\s+)?(?:(?:companies|accounts|firms)\\s*)?(?:in total\\s*|total\\s*)?`;
const allocation = '(?:(?:split|divided|distributed|shared)\\s+(?:equally|evenly)|(?:equally|evenly)\\s+(?:split|divided|distributed|shared)|split\\s+50/50)';
const across = '(?:\\s+(?:across|between|among)\\s+(?:the\\s+)?(?:(both|all|two|three|four|\\d+)\\s+)?(?:named\\s+)?segments?)?';
const equalSplit = new RegExp('^' + total + '[,;:]?\\s*' + allocation + across + '[.!]?$', 'i');
function wholeCount(raw) {
    const compact = raw.replace(/[,\s]/g, '').toLowerCase();
    const scale = compact.endsWith('k') ? 1000 : compact.endsWith('m') ? 1000000 : 1;
    const n = Number(compact.replace(/[km]$/, '')) * scale;
    return Number.isSafeInteger(n) && n >= 0 ? n : null;
}
function parseCounts(value) {
    if (typeof value !== 'string')
        return [];
    const rows = [];
    for (const line of value.split(/[;\n]/)) {
        const match = countLine.exec(line.trim());
        if (!match)
            continue;
        const count = wholeCount(match[2]);
        if (count !== null)
            rows.push({ name: (match[1] || '').trim(), count });
    }
    return rows;
}
const key = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();
function allocateCounts(value, segments) {
    const raw = value?.trim() || '';
    const named = new Map();
    const split = equalSplit.exec(raw);
    if (split) {
        const count = wholeCount(split[1]);
        const words = { both: 2, two: 2, three: 3, four: 4 };
        const word = split[2]?.toLowerCase();
        const divisor = !word || word === 'all' ? segments.length : words[word] ?? Number(word);
        if (divisor === segments.length && count !== null && count % divisor === 0 && (!/50\/50/.test(raw) || divisor === 2)) {
            for (const name of segments)
                named.set(name, count / divisor);
        }
        return { named, recommendedOnly: null };
    }
    const rows = parseCounts(raw);
    // The documented bare number denotes only the recommended segment.
    const recommendedOnly = rows.length === 1 && !rows[0].name && countLine.test(raw) ? rows[0].count : null;
    const duplicates = new Set();
    for (const row of rows) {
        if (!row.name)
            continue;
        const label = key(row.name);
        const exact = segments.filter(s => key(s) === label);
        const matches = exact.length ? exact : segments.filter(s => (label.length >= 4 && key(s).includes(label)) || (key(s).length >= 4 && label.includes(key(s))));
        if (matches.length !== 1)
            continue;
        const name = matches[0];
        if (named.has(name))
            duplicates.add(name);
        named.set(name, row.count);
    }
    for (const name of duplicates)
        named.delete(name);
    return { named, recommendedOnly };
}
// Round each segment once to USD cents using the supplied decimal factors.
// Integer addition makes the combined figures reconcile to the displayed rows.
function cents(factors, percentages) {
    let digits = 1n, exponent = 2 - 2 * percentages;
    for (const factor of factors) {
        const [base, exp = '0'] = String(factor).toLowerCase().split('e');
        const [whole, fraction = ''] = base.split('.');
        digits *= BigInt(whole + fraction);
        exponent += Number(exp) - fraction.length;
    }
    if (exponent >= 0)
        return digits * 10n ** BigInt(exponent);
    const divisor = 10n ** BigInt(-exponent);
    return (digits + divisor / 2n) / divisor;
}
function dollars(value) {
    const remainder = value % 100n;
    return '$' + (value / 100n).toLocaleString('en-US') + (remainder ? '.' + String(remainder).padStart(2, '0') : '');
}
function segmentTable(segments, countFor, acv, fit, share) {
    if (segments.length < 2 || !acv || !segments.some(name => countFor(name) !== null))
        return '';
    const lines = ['### Market sizing by segment (USD)', '| Segment | Companies | TAM | SAM | SOM |',
        '| --- | ---: | ---: | ---: | ---: |'];
    let companies = 0n, totalTam = 0n, totalSam = 0n, totalSom = 0n, complete = true;
    for (const name of segments) {
        const n = countFor(name);
        if (n === null) {
            complete = false;
            lines.push(`| ${name} | not supplied | unknown | unknown | unknown |`);
            continue;
        }
        const tam = cents([n, acv], 0);
        const sam = fit === null ? null : cents([n, acv, fit], 1);
        const som = fit === null || share === null ? null : cents([n, acv, fit, share], 2);
        companies += BigInt(n);
        totalTam += tam;
        totalSam += sam ?? 0n;
        totalSom += som ?? 0n;
        lines.push(`| ${name} | ${n.toLocaleString('en-US')} | ${dollars(tam)} | ${sam === null ? 'unknown' : dollars(sam)} | ${som === null ? 'unknown' : dollars(som)} |`);
    }
    if (complete)
        lines.push(`| Total | ${companies.toLocaleString('en-US')} | ${dollars(totalTam)} | ${fit === null ? 'unknown' : dollars(totalSam)} | ${fit === null || share === null ? 'unknown' : dollars(totalSom)} |`);
    else
        lines.push('', 'Supply the missing segment counts before using a combined total.');
    return '\n' + lines.join('\n') + '\n';
}
//# sourceMappingURL=anchor-sizing.js.map