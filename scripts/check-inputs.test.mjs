import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const profile = JSON.parse(await readFile(new URL(".memory-bank/spec/engineering/code-check-profile.json", root)));
test("API check policy includes runner dependencies without unrelated web source", async () => {
  for (const alias of ["@check/api-contract", "@check/api-unit", "@check/api-integration"]) {
    const inputs = profile.inputs_by_alias[alias];
    for (const required of ["apps/api", "scripts", "package.json", "pnpm-lock.yaml", "tsconfig.base.json", "docker-compose.yml", "apps/web/package.json"]) assert.ok(inputs.includes(required), `${alias}: ${required}`);
    assert.ok(!inputs.includes(".") && !inputs.includes("apps/web"));
    for (const input of inputs) await access(new URL(input, root));
  }
  assert.equal(profile.inputs_by_alias["@check/quality"], undefined);
  assert.equal(profile.inputs_by_alias["@check/docs"], undefined);
});
test("browser and web policy retain their actual source contours", async () => {
  assert.ok(profile.inputs_by_alias["@check/browser"].includes("apps/api"));
  assert.ok(profile.inputs_by_alias["@check/browser"].includes("apps/web"));
  for (const inputs of Object.values(profile.inputs_by_alias)) for (const input of inputs) await access(new URL(input, root));
});
