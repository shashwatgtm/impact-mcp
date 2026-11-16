# Job E handover

17 November 2026. IMPACT market sizing by segment.

Code and tests: `64940f8a4b8403429240f6270e1657d8f04db607`. Base: `471e2c74b55f804a129763d6001d54bb9453d481`. Branch: `codex/tam-segment-fix-20261117`.

Each segment receives 700 companies, USD 25,200,000 TAM, USD 10,080,000 SAM and USD 504,000 SOM. The combined row has 1,400 companies, USD 50,400,000 TAM, USD 20,160,000 SAM and USD 1,008,000 SOM. Ranking, the recommended segment calculation and the table use the same allocation. Explicit named counts take priority over partial name matches. Missing allocations stay unknown, and an indivisible equal split prompts for whole company counts. Totals add the displayed cents in each column.

The nine vertical repeats passed. The full native base and candidate comparison remains open because the execution workspace disconnected. The release gate is a native run with the existing lockfile dependencies and a smoke check on the fully assembled coordinator draft. The production site and default branch were outside this run.

Resume at [Coordinator release steps](REPORT-E-20261117.md#coordinator-release-steps). The report includes the exact commands, expected output, changed files and rollback procedure.
