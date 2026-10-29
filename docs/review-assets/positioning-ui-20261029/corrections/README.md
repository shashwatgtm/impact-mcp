# Four authorized W4 corrections

29 October 2026. Source starts from the exact tree of PR head 8167757578601a5eb030c7059bed171e290750bc. No version preparation. Version remains 2.2.27.

## Current results

Build and deterministic output check passed. Focused UI tests: 11 passed. Preserved host-review tests: 5 passed. Full suite: 57 file-level passes. Browser: 57 checks passed. Final failures and skips: zero. Counts overlap and must not be added.

The browser checks preserve local input and result ownership during stale notifications, delayed success, delayed rejection and reset. They verify literal text, inert DOM, inline capability negotiation and a real flexible host. The iframe grows from 3314 to 6751 pixels, then shrinks back to 3314. It reports 5654 pixels of height at a 390-pixel mobile width and 6284 at 320 pixels. Rapid content changes produce one final size notification. Stable dimensions do not produce a feedback loop.

Actual ChatGPT host acceptance remains unverified. This is a cloud Chromium test host.

## Exact commands

```sh
node --no-warnings scripts/build-positioning.mjs
npm run build
node --no-warnings scripts/build-positioning.mjs --check
node --no-warnings tests/positioning-ui.test.mjs
node --no-warnings tests/host-review-20261028.test.mjs
npm test
node --no-warnings scripts/check-positioning-browser.mjs
```

## Actual logs

- [browser-attempt-2.log](logs/browser-attempt-2.log)
- [browser.log](logs/browser.log)
- [build.log](logs/build.log)
- [focused.log](logs/focused.log)
- [full.log](logs/full.log)
- [generate.log](logs/generate.log)
- [generated-check.log](logs/generated-check.log)
- [host-review.log](logs/host-review.log)

browser-attempt-2.log records a harness timing failure. The retry check had waited for the old error to clear, which happens before the reply arrives. It now waits for the completed host result. browser.log is the final passing run.

## Screenshots

- [mcp-decisions-desktop](screenshots/mcp-decisions-desktop.png)
- [mcp-fixture-desktop](screenshots/mcp-fixture-desktop.png)
- [mcp-flexible-grown](screenshots/mcp-flexible-grown.png)
- [mcp-flexible-shrunk](screenshots/mcp-flexible-shrunk.png)
- [mcp-mobile-320](screenshots/mcp-mobile-320.png)
- [mcp-mobile](screenshots/mcp-mobile.png)
- [mcp-validation-desktop](screenshots/mcp-validation-desktop.png)
- [standalone-decisions-desktop](screenshots/standalone-decisions-desktop.png)
- [standalone-empty-desktop](screenshots/standalone-empty-desktop.png)
- [standalone-fixture-desktop](screenshots/standalone-fixture-desktop.png)
- [standalone-mobile](screenshots/standalone-mobile.png)
- [standalone-validation-desktop](screenshots/standalone-validation-desktop.png)

[Browser receipt](browser-receipt.json) | [Flexible host dimensions](flexible-host-receipt.json) | [Checksums](checksums.json)
