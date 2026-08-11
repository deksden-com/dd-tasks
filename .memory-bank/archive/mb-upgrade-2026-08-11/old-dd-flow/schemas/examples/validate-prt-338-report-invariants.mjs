import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const schemaDir = resolve(root, ".memory-bank/dd-flow/schemas");
const cli = (process.env.DD_FLOW_CLI || "dd-flow").trim().split(/\s+/);
const temp = mkdtempSync(resolve(tmpdir(), "prt-338-report-schema-"));
const fixtures = {
  specification: ".memory-bank/dd-flow/schemas/examples/specification-stage-report.v2.valid.json",
  plan: ".memory-bank/dd-flow/schemas/examples/plan-stage-report.v4.valid.json",
  eval: ".memory-bank/dd-flow/schemas/examples/eval-report-data.v3.valid.json"
};
const legacy = [
  ["specification-stage-report", ".memory-bank/dd-flow/schemas/examples/specification-stage-report.valid.json"],
  ["plan-stage-report", ".memory-bank/dd-flow/schemas/examples/plan-stage-report.valid.json"],
  ["eval-report-data", ".memory-bank/dd-flow/schemas/examples/eval-report-data.valid.json"],
  ["plan-stage-report", ".memory-bank/dd-flow/schemas/examples/plan-stage-report.v3.valid.json"],
  ["eval-report-data", ".memory-bank/dd-flow/schemas/examples/eval-report-data.v2.valid.json"]
];
const schemaFor = { specification: "specification-stage-report", plan: "plan-stage-report", eval: "eval-report-data" };
const clone = name => JSON.parse(readFileSync(resolve(root, fixtures[name]), "utf8"));
const cases = [
  ["specification breadth/size", "specification", x => { x.legacy_projection.size = "small"; }],
  ["specification impact/risk", "specification", x => { x.legacy_projection.risk = "medium"; }],
  ["specification floor/route", "specification", x => { x.legacy_projection.planning_route_hint = "compact_plan"; }],
  ["plan breadth/size", "plan", x => { x.legacy_projection.size = "small"; }],
  ["plan impact/risk", "plan", x => { x.legacy_projection.risk = "low"; }],
  ["plan floor/route", "plan", x => { x.legacy_projection.planning_route_hint = "full_plan"; }],
  ["eval breadth/size", "eval", x => { x.legacy_projection.size = "large"; }],
  ["eval impact/risk", "eval", x => { x.legacy_projection.risk = "medium"; }],
  ["eval floor/route", "eval", x => { x.legacy_projection.planning_route_hint = "full_plan"; }],
  ["eval mismatch starts plan", "eval", x => { x.eval_provenance.exact_match = false; }],
  ["eval invalid input claims score", "eval", x => { x.eval_provenance.validity_verdict = "invalid_eval_input"; x.eval_provenance.plan_started = false; }],
  ["eval missing goal split", "eval", x => { delete x.eval_provenance.clarification_goal_id; }],
  ["eval empty goal id", "eval", x => { x.eval_provenance.evaluation_goal_id = ""; }],
  ...["plan", "eval"].flatMap(name => [
    [`${name} missing wall clock`, name, x => { delete x.execution_summary.wall_clock_ms; }],
    [`${name} negative wall clock`, name, x => { x.execution_summary.wall_clock_ms = -1; }],
    [`${name} carries legacy capacity projection`, name, x => { x.capacity_summary = {}; }],
    [`${name} carries legacy routing projection`, name, x => { x.routing_summary = {}; }]
  ])
];

function validate(schema, file) {
  return spawnSync(cli[0], [...cli.slice(1), "schema", "validate", "--schema", schema, "--file", file, "--project-root", root, "--schema-dir", schemaDir, "--json"], { encoding: "utf8" });
}

try {
  for (const [schema, rel] of [...legacy, ...Object.entries(fixtures).map(([name, rel]) => [schemaFor[name], rel])]) {
    const result = validate(schema, resolve(root, rel));
    if (result.status !== 0) throw new Error(`valid fixture failed: ${rel}\n${result.stderr || result.stdout}`);
  }
  for (const [label, fixture, mutate] of cases) {
    const value = clone(fixture);
    mutate(value);
    const file = resolve(temp, `${label.replaceAll(/[^a-z0-9]+/gi, "-")}.json`);
    writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    const result = validate(schemaFor[fixture], file);
    if (result.status === 0) throw new Error(`invalid case passed: ${label}`);
  }
  console.log(`validated current and legacy fixtures and rejected ${cases.length} focused invalid cases`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
