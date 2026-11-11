"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paragraphs = exports.textField = void 0;
exports.validateChain = validateChain;
exports.isoDate = isoDate;
exports.httpsUrl = httpsUrl;
const textField = (description, maxLength = 4000) => ({ type: 'string', minLength: 1, maxLength, description });
exports.textField = textField;
function validateChain(value, schema, path = 'Brief') {
    if (schema.type === 'object') {
        if (!value || typeof value !== 'object' || Array.isArray(value))
            return [`${path}: supply an object.`];
        const v = value, errors = [];
        for (const key of schema.required ?? [])
            if (v[key] === undefined)
                errors.push(`${path}: supply ${key.replace(/_/g, ' ')}.`);
        for (const [key, entry] of Object.entries(v)) {
            if (entry === undefined && !schema.required?.includes(key))
                continue;
            if (!schema.properties?.[key]) {
                if (schema.additionalProperties === false)
                    errors.push(`${path}: remove the unknown field.`);
            }
            else
                errors.push(...validateChain(entry, schema.properties[key], `${path}, ${key.replace(/_/g, ' ')}`));
        }
        return errors;
    }
    if (schema.type === 'array') {
        if (!Array.isArray(value))
            return [`${path}: supply a list.`];
        if (value.length < (schema.minItems ?? 0) || value.length > (schema.maxItems ?? 100))
            return [`${path}: check the number of entries.`];
        return value.flatMap((v, i) => validateChain(v, schema.items, `${path}, entry ${i + 1}`));
    }
    if (typeof value !== schema.type)
        return [`${path}: supply ${schema.type === 'boolean' ? 'true or false' : 'text'}.`];
    if (schema.enum && !schema.enum.includes(value))
        return [`${path}: choose ${schema.enum.map(x => String(x).replace(/_/g, ' ')).join(', ')}.`];
    if (typeof value === 'string') {
        if (value.trim().length < (schema.minLength ?? 0) || value.length > (schema.maxLength ?? 12000))
            return [`${path}: supply complete text within the stated length.`];
        // Refuse markup rather than changing an immutable proof sentence during escaping.
        if (/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/.test(value) || /```|~~~|!?\[[^\]]*\]\s*\(|^\s*#{1,6}\s/m.test(value))
            return [`${path}: use plain text without markup or hidden controls.`];
    }
    return [];
}
function isoDate(s) {
    return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
}
function httpsUrl(s) {
    try {
        const u = new URL(s);
        return u.protocol === 'https:' && !!u.hostname && !u.username && !u.password;
    }
    catch {
        return false;
    }
}
const paragraphs = (s) => s.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g)?.map(x => x.trim()).filter(Boolean) ?? [];
exports.paragraphs = paragraphs;
//# sourceMappingURL=chain-inputs.js.map