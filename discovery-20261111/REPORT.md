# Discovery report: impact-mcp

Source work is closed on codex/discovery-20261111. Nothing was deployed or published.

Before: No early team route from the message and audit pages.

Why it matters: Individual drafting and team agreement need different destinations.

Now in the draft: Visible method limits and matching guide and workshop routes for Series A, Series B and ITeS teams of 5 to 6 people; current setup, counts and IMPACT graph reference.

Checks: build passed; changed HTML has one h1, valid JSON-LD, titles at most 65 characters, extensionless canonicals, full raw text and resolving local targets. Browser source review passed at 375 and 1280 px with JavaScript disabled. Exact, same meaning and opposite buyer questions are retained in the hub acceptance cases. Runtime tool code, descriptions, schemas, tests and assistant JSON were left untouched.

Full suite: 7121 tests, 7094 passed, 14 failed, 13 skipped. The suite is not clean.

Already failing on main:

- `All tool names descriptions schemas annotations and lists stay unchanged`
- `No region byte parity and three runs: impact_full_audit ai-native`
- `No region byte parity and three runs: impact_full_audit cybersecurity`
- `No region byte parity and three runs: impact_full_audit fintech`
- `No region byte parity and three runs: impact_full_audit ites`
- `No region byte parity and three runs: impact_full_audit logistics-tech`
- `No region byte parity and three runs: impact_full_audit saas`
- `No region byte parity and three runs: impact_full_audit software`
- `No region byte parity and three runs: impact_full_audit telecom`
- `No region byte parity and three runs: impact_full_audit vertical-saas`
- `complete tools/list bytes equal the pinned reviewed production contract over HTTP`
- `complete tools/list bytes equal the pinned reviewed production contract over compiled stdio`
- `scripts/test-in-field.mjs`

The additional full-run escape speed assertion passed when its entire file was rerun separately: 11 passed, 0 failed. No code or test was changed.

Files changed:

- `discovery-20261111/REPORT.md`
- `discovery-20261111/state.json`
- `public/connect/index.html`
- `public/index.html`
- `public/llms.txt`
- `public/tools/impact-anchor-market/index.html`
- `public/tools/impact-craft-message/index.html`
- `public/tools/impact-full-audit/index.html`
- `public/tools/impact-get-framework/index.html`
- `public/tools/impact-identify-champions/index.html`
- `public/tools/impact-map-alternatives/index.html`
- `public/tools/impact-pinpoint-value/index.html`
- `public/tools/impact-translate-execution/index.html`

Owner questions: no additional question for this source branch. Cross-site blockers and the release sequence are in the hub discovery-20261111/OWNER-QUESTIONS.md and REPORT.md. Claude reviews the assembled draft, the owner approves release, then Fable checks the live result.
