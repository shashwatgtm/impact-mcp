// Run 22 (test first): the word API alone is not an API governance product. A managed data platform that mentions its REST API and a Terraform
// provider was read as an API program (API catalog, spec drift, API governance) in the message and channel copy. The API reading now needs
// an API specific phrase. Invented companies only. Run: node --no-warnings --test tests/run22-api-function.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { call } from "./run22-impact-common.mjs";

const DATAHAUL = {
  positioning_statement: "For platform and data engineering teams at software companies, Datahaul is the managed open source data platform: Kafka, PostgreSQL, OpenSearch and ClickHouse on any cloud, with one console, API, Terraform provider and Kubernetes operator across three clouds. Alternatives buyers use today: cloud native managed databases tied to one provider. What sets it apart: genuine open source on open standards, every service runs the upstream version with standard drivers and APIs, so code written against Datahaul works against a self hosted instance, and the API covers every service.",
  target_customer: "platform and data engineering teams at software companies",
  key_benefit: "run production data services without a database operations team",
  product_name: "Datahaul",
};
const DEVBRIDGE = {
  positioning_statement: "For API teams and developers at software companies, Devbridge is the API platform for the whole lifecycle. Unlike disconnected tools for design, build, test and release, it offers one catalog and governance for every API.",
  target_customer: "API teams and developers at software companies",
  key_benefit: "high productivity for developers and airtight governance for organizations, from one platform for building and using APIs",
  product_name: "Devbridge",
};
const WRONG = /API governance|spec drift|API catalog|API program|specs and implementations|Head of API Platform/i;

test("a managed data platform that mentions its REST API is not read as an API governance product (translate)", async () => {
  const t = await call("impact_translate_execution", DATAHAUL);
  assert.doesNotMatch(t, WRONG, (t.match(WRONG) || [""])[0]);
});

test("a managed data platform that mentions its REST API is not read as an API governance product (craft message)", async () => {
  const t = await call("impact_craft_message", { target_customer: DATAHAUL.target_customer, product_name: "Datahaul", key_benefit: DATAHAUL.key_benefit, category: "managed open source data platform", unique_differentiator: "backups, upgrades and monitoring handled for you, with a REST API and a Terraform provider" });
  assert.doesNotMatch(t, WRONG, (t.match(WRONG) || [""])[0]);
});

test("an API platform is still read as an API product", async () => {
  const t = await call("impact_translate_execution", DEVBRIDGE);
  assert.match(t, /API/);
});
