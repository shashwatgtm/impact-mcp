# W4 positioning review evidence

These are actual cloud receipts from tested commit f52df6835f12fa68343427bf950240c911be0855. Delivery changed documentation and review assets only. No passing tests were rerun.

Actual ChatGPT host acceptance remains unverified. The MCP browser checks used a strict sandboxed cloud test host. Real names appear only in explicitly authorized synthetic review fixture inputs.

## Screenshots

- [mcp-decisions-desktop](screenshots/mcp-decisions-desktop.png)
- [mcp-fixture-desktop](screenshots/mcp-fixture-desktop.png)
- [mcp-mobile](screenshots/mcp-mobile.png)
- [mcp-validation-desktop](screenshots/mcp-validation-desktop.png)
- [standalone-decisions-desktop](screenshots/standalone-decisions-desktop.png)
- [standalone-empty-desktop](screenshots/standalone-empty-desktop.png)
- [standalone-fixture-desktop](screenshots/standalone-fixture-desktop.png)
- [standalone-mobile](screenshots/standalone-mobile.png)
- [standalone-validation-desktop](screenshots/standalone-validation-desktop.png)

## Actual logs

Final verification: npm test reported 57 file-level passes. Focused UI tests passed 11. Preserved host-review tests passed 5. Cloud browser checks passed 34. These counts overlap and must not be added together. Final test failures and skips were zero. Build and generated-output checks passed.

- [all-tests-final.log](logs/all-tests-final.log)
- [all-tests.log](logs/all-tests.log)
- [boundary-files.log](logs/boundary-files.log)
- [browser.log](logs/browser.log)
- [build.log](logs/build.log)
- [escape-fixed.log](logs/escape-fixed.log)
- [escape-recheck.log](logs/escape-recheck.log)
- [focused-direct.log](logs/focused-direct.log)
- [focused-tests.log](logs/focused-tests.log)
- [generate.log](logs/generate.log)
- [generated-check.log](logs/generated-check.log)
- [host-review.log](logs/host-review.log)
- [patch-apply.log](logs/patch-apply.log)

The initial all-tests.log, focused-tests.log and escape-recheck.log record earlier failures. The review note explains the fixes. The files ending in final, focused-direct, host-review, browser and escape-fixed record passing runs.

## Commands

```sh
node --no-warnings scripts/build-positioning.mjs
npm run build
node --no-warnings scripts/build-positioning.mjs --check
node --no-warnings tests/positioning-ui.test.mjs
node --no-warnings tests/host-review-20261028.test.mjs
npm test
node --no-warnings scripts/check-positioning-browser.mjs
```

[Browser receipt](browser-receipt.json) | [Evidence checksums](checksums.json) | [Review note](../../positioning-ui-review-20261029.md)
