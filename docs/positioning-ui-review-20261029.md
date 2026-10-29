# W4 positioning UI review

29 October 2026. All implementation, builds and browser checks ran in the assigned cloud environment. The owner register confirms this MCP site uses manual CLI deployment. The owner explicitly authorized the codex branch and draft PR writes through the GitHub connector. No deployment or workflow dispatch is authorized.

## Owner correction update

The owner authorized four corrections while Positioning 2.2.27 is In review. This update starts from the exact source tree of PR head 8167757578601a5eb030c7059bed171e290750bc. No new version is prepared. PR #7 and W5a #5 remain draft.

Local edits, local weight changes, explicit recalculation and reset now take ownership of the form and displayed result. Tool input, result and cancellation notifications have no matching request ID. Once local ownership starts, these notifications are ignored and a visible stale notice explains why. The last accepted calculation remains visible until an explicit matching recalculation succeeds. Reset remains available while loading and invalidates the previous request generation.

Both successful and rejected RPC replies now check edit revision and request generation before changing the view or error state. An old reply cannot finish a newer run or restore a result cleared by reset. Literal input text and inert DOM rendering are unchanged.

Initialization declares availableDisplayModes as inline only. A ResizeObserver measures natural body height. It debounces size notifications for 75 milliseconds and suppresses unchanged dimensions. Body height is used instead of scrollHeight so an iframe can shrink after content collapses. Font loading and viewport resizing also schedule a measurement.

The agent directly read these official sources for this correction:

- https://developers.openai.com/plugins/build/chatgpt-ui
- https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx

The MCP Apps specification defines inline capability declaration, flexible container dimensions and debounced size-change notifications. No bridge method, tool schema, endpoint, authentication or server/package version is changed.

[Current logs, checksums and screenshots](review-assets/positioning-ui-20261029/corrections/README.md) record the correction checks. Build and generated-output checks passed. Focused tests passed 11. Preserved host-review tests passed 5. Full tests passed 57 file-level cases. Browser checks passed 57. Final failures and skips were zero. Counts overlap. The actual host iframe grew from 3314 to 6751 pixels and shrank to 3314. Mobile widths of 390 and 320 pixels were checked. A test-harness retry wait was corrected after one intermediate failure. Its actual log is retained.

Latest main is 5267d1bd94316281e84941179be9a565e6a1a9aa. Its walkthrough video is preserved by reusing the exact existing blob e8317f6415a97d8858728e749470e30fbfc7e595 in the delivery tree. No video bytes are changed or uploaded. No main/master write, merge, force push, deployment, workflow dispatch, Netlify command, DNS change, header/challenge edit, submission, package upload, publication or declaration occurs. W5a text is not edited. Actual ChatGPT host acceptance remains unverified.

The sections below preserve the initial implementation rationale and its earlier receipts.

## Change

The existing impact_full_audit tool now links to ui://helix/positioning/v1.html. It returns structuredContent alongside its unchanged text. No render tool was added. No input schema changed. Other tools are unchanged.

The same component runs at public/lab/positioning/. It starts empty. It edits all supported audit fields. Host mode recalculates through tools/call. Standalone mode runs the shared deterministic module with no external calls. The HTML resource bundles the existing Archivo and VT323 fonts. Colours and the h logo treatment come from public/assets/helix.css. The static page loads only repository assets.

The evidence board separates reported, assumption and contradicted inputs. Observed stays at zero because the app makes no independent observations. A user saying something was observed is still a user report. Every row identifies its input field. Missing feedback is identified as missing evidence, not proof. Assumption and contradicted labels follow explicit labels in the user's text. They do not independently resolve conflicting claims.

Alternatives use only supplied names. Strategic fit is explicitly unassessed. Evidence confidence is explicitly unverified. No competitor features are inferred. The provisional decision contains Do not claim and Minimum validation lines.

## Schema constraints and local scenarios

The full audit has no weight, source-document, verification-status or comparative-evidence inputs. It has customer_feedback, not customer_metrics. Those constraints are preserved.

All six original completeness weights are visible as one. Users can change weights only for a local what-if average. It never changes the original score or sends unsupported fields to the host. All scores are labelled input completeness. None is called positioning strength, evidence confidence or win probability.

The module mirrors the legacy completeness rules. Those rules can count a long missing-feedback statement as detailed input. The UI explains that limit and still marks the feedback evidence as missing. Existing text and scoring rules were not repaired in this workstream.

Structured text retains the existing inert-text escape contract. inputsBase64 carries the supported original input object as UTF-8 JSON. The component validates and decodes it, recomputes the view, and uses textContent and form values. It does not insert received HTML. It ignores remote computed claims and statuses. Base64 is transport encoding, not encryption.

## Bridge and CSP

The resource uses text/html;profile=mcp-app. Initialization precedes ui/notifications/initialized. Tool input and result notifications are handled. Recalculation calls only impact_full_audit. Messages must come from window.parent. After initialization, messages must also match the parent's origin. Opaque origins are supported.

Loading, edits during loading, malformed results, cancellations, timeouts and errors have explicit states. Native buttons work without sandbox form-navigation permission. There is no checkout or durable browser storage.

Resource _meta.ui.csp has empty connectDomains, resourceDomains and frameDomains. Its own policy permits only hashed inline scripts and styles plus bundled font data. Connections, nested frames and form navigation are blocked. The static page works under the existing site headers and adds a stricter no-connection policy. public/_headers was not edited.

## Documentation provenance

The coordinator supplied verified findings from these exact pages in the follow-up. The agent then independently opened and read the relevant sections through the web connector on 29 October 2026:

- https://developers.openai.com/plugins/build/chatgpt-ui
- https://developers.openai.com/plugins/deploy/app-review

The UI page supports resource association, the MCP Apps bridge, structured results and narrowly declared CSP. The review page describes server and UI review expectations. The user's explicit existing-tool attachment requirement takes precedence over the optional separate-render-tool example. No submission, publication, verification declaration or deployment action was taken.

Direct cloud curl could not reach the proxy. That did not block the successful web connector reads.

## Repository and automation

- Repository: shashwatgtm/impact-mcp.
- Base: 765730ad684365b1da444d77768b9803c8d49491.
- Branch: codex/positioning-ui-20261029.
- Tested implementation commit: f52df6835f12fa68343427bf950240c911be0855.
- The initial delivery added only this note and docs/review-assets. The four later corrections and their receipts are described above.
- Delivery uses the requested branch and a draft PR targeting main. The final remote head and draft state are verified through the GitHub connector and recorded in the PR handoff.

The coordinator verified the base through GitHub at about 09:48 IST. The agent also independently resolved main through the GitHub connector to this SHA. No origin/main ref was required. The initial tree was clean. Applicable AGENTS.md searches found none.

Automation inspection found no local .github directory. Remote .github on main returned 404. Main had zero check runs and zero commit statuses. netlify.toml contains the existing build and publish settings. The owner register subsequently confirmed that IMPACT uses manual CLI deployment. Only Alpha master is git linked. The owner explicitly authorized this new codex branch and draft PR. Delivery uses GitHub blob, tree, commit and branch tools. No deployment setting is changed, and no workflow is dispatched.

## Initial verification commands and receipts

Run from /workspace/impact-mcp with the installed cloud dependencies:

```sh
node --no-warnings scripts/build-positioning.mjs
npm run build
node --no-warnings scripts/build-positioning.mjs --check
node --no-warnings tests/positioning-ui.test.mjs
node --no-warnings tests/host-review-20261028.test.mjs
npm test
node --no-warnings scripts/check-positioning-browser.mjs
```

- Generation: exit 0. Deterministic output check: exit 0.
- TypeScript build: exit 0. No dependency or package version change.
- Focused UI tests: 11 passed, 0 failed, 0 skipped.
- Preserved host-review tests: 5 passed, 0 failed, 0 skipped.
- Full npm test: 57 reported file-level tests passed, 0 failed, 0 skipped. The focused tests are included in that command, so these counts must not be added together.
- Cloud Chromium: 34 checks passed, 0 failed, 0 skipped. No uncaught browser exceptions.

The four synthetic fixture cases are the exact requested review fixture, a true HR-team input, employee counts with RevOps pain, and the exact review fixture with empty feedback. Real company names occur only in labelled synthetic review fixtures. No metric, interview or quote was invented.

Tests compare all tool schemas and metadata to the base. Only the chosen tool's UI attachment differs. Four legacy text results are compared byte for byte. Tests cover shared calculations, empty and invalid inputs, evidence labels, hostile text, the actual resource, hosted HTTP and the browser calculation bundle. The preserved tests verify the company-size, HR-team, missing-proof and customer_metrics request fixes.

Browser checks cover both modes, all four fixtures, loading, errors, retry, malformed results, source validation, native keyboard activation, local weights, reset, mobile overflow and network requests. The MCP host is a strict sandboxed cloud test harness using actual local tool results. This is not a live ChatGPT or Codex host session. Live host acceptance remains unverified until a separately authorized integration review.

## Failures and fixes during work

The initial full test command reported 55 passes and 1 failure in run40s-escape. The initial raw structured text did not preserve the existing inert-string contract. Escaping the structured view and separately encoding original inputs fixed it. The escape regression and full suite then passed.

The first browser launch was blocked by the execution sandbox's localhost-listener restriction. The authorized cloud browser command ran successfully with execution permission for its loopback server. No proxy or network policy was weakened.

Browser testing exposed reliance on form submission in a sandbox without allow-forms. Recalculation now uses a direct button handler. Harness checks also needed CDP attachment to the out-of-process frame, a native Enter keypress, and a wait for iframe resizing. Final receipts reflect the passing implementation and harness.

Initial git fetch failed with exit 128 because the proxy on port 8080 was unreachable. The direct documentation curl failed with exit 7 for the same reason. No proxy bypass was attempted.

## Screenshots and UI inspection

Nine PNGs are included under [docs/review-assets](review-assets/positioning-ui-20261029/README.md), alongside the actual logs and checksums. Desktop layouts use a left input panel and a right evidence and decision column. Mobile stacks the panels in one column. Paper, ink and oxblood colours match the repository. The review fixture shows reported inputs, an explicit assumption, missing feedback, and unassessed alternative fit. The score area shows the original equal-weight 59/100 and a distinct local what-if score. Validation screenshots include the provisional draft and its claim limits.

The agent visually inspected the desktop fixture, mobile MCP layout and score/alternative screenshot. Keyboard focus uses a visible outline. Fields have labels and required markers. Status and error messages use live regions. Reduced-motion preferences are respected.

## Export and boundary audit

The tested patch includes new files and generated dist outputs. The prior cloud export was verified against a clean temporary index. Delivery now includes the actual screenshots and logs in docs/review-assets/positioning-ui-20261029. The evidence README links each file. checksums.json records their SHA-256 hashes and the tested implementation commit. No unchanged passing test was rerun for the initial delivery-only change. The later code corrections have new focused, full and browser receipts above.

The previous local-only handoff was caused by an unwritable task output directory and uncertainty about deployment automation. The owner register and explicit authorization resolve the remote delivery hold. GitHub is the review destination. No unrelated workstream branch is touched.

No deployment, Netlify command, DNS change, main or master write, merge, force push, package upload, directory submission, publication, legal declaration, skill packaging, shell MCP tool, paid API call or API-billed agent was used. No secret was read, printed or committed. No client or prospect data was used. Existing endpoints, authentication, versions, challenge files, headers and walkthrough videos are unchanged. No deployment settings changed. All 765730a fixes remain intact.

W5a proof guidance is separate. Its likely overlap is src/index.ts around full-audit text and the shared tool-response path. This change edits only resource registration, selected tool metadata and the successful full-audit response wrapper in that file. Existing W5a-related text remains unchanged.
