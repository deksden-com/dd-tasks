import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
test("TypeScript resolves package-local types from its config like the native CLI", () => {
  const directory = mkdtempSync(path.join(root, ".tool-test-"));
  try {
    const packageRoot = path.join(directory, "packages", "api");
    const types = path.join(
      packageRoot,
      "node_modules",
      "@types",
      "fixture-local",
    );
    mkdirSync(types, { recursive: true });
    writeFileSync(
      path.join(types, "index.d.ts"),
      "interface FixtureLocal { value: number }\n",
    );
    const source = path.join(packageRoot, "sample.ts");
    const config = path.join(packageRoot, "tsconfig.json");
    writeFileSync(
      config,
      JSON.stringify({
        compilerOptions: { noEmit: true, types: ["fixture-local"] },
        files: ["sample.ts"],
      }),
    );
    for (const [name, value, cliExit, adapterExit] of [
      ["valid", "1", 0, 0],
      ["invalid", "'wrong'", 2, 1],
    ]) {
      writeFileSync(
        source,
        `const value: FixtureLocal = { value: ${value} }; export { value };\n`,
      );
      const cli = spawnSync(
        process.execPath,
        ["node_modules/typescript/bin/tsc", "-p", config, "--noEmit"],
        { cwd: root, encoding: "utf8" },
      );
      assert.equal(cli.status, cliExit, cli.stdout + cli.stderr);
      const reportPath = path.join(directory, `${name}.json`);
      const adapter = spawnSync(
        process.execPath,
        [
          "scripts/test-runner.mjs",
          process.execPath,
          "scripts/tool-diagnostic-runner.mjs",
          "typescript",
          config,
        ],
        {
          cwd: root,
          encoding: "utf8",
          env: {
            ...process.env,
            DD_FLOW_CHECK_INVOCATION_ID: name,
            DD_FLOW_CHECK_COMMAND: "typescript",
            DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: reportPath,
          },
        },
      );
      assert.equal(
        adapter.status,
        adapterExit,
        adapter.stdout + adapter.stderr,
      );
      const report = JSON.parse(readFileSync(reportPath));
      assert.equal(report.completed, true);
      assert.equal(report.failures.length, adapterExit);
      if (adapterExit) assert.equal(report.failures[0].native_code, "TS2322");
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
test("installed native Biome and TypeScript publish bound source diagnostics with CLI-equivalent exits", async () => {
  const directory = mkdtempSync(path.join(root, ".tool-test-"));
  try {
    const run = async (tool, args, id, aggregate = false) => {
      const reportPath = path.join(directory, `${id}.json`);
      const child = spawnSync(
        process.execPath,
        aggregate
          ? [
              "scripts/test-runner.mjs",
              process.execPath,
              "--input-type=module",
              "-e",
              `import {runQuality} from ${JSON.stringify(pathToFileURL(path.join(root, "scripts/quality-runner.mjs")).href)};process.exitCode=await runQuality([{id:'format',argv:[process.execPath,'scripts/tool-diagnostic-runner.mjs',${JSON.stringify(tool)},...${JSON.stringify(args)}]}]);`,
            ]
          : [
              "scripts/test-runner.mjs",
              process.execPath,
              "scripts/tool-diagnostic-runner.mjs",
              tool,
              ...args,
            ],
        {
          cwd: root,
          encoding: "utf8",
          env: {
            ...process.env,
            DD_FLOW_CHECK_INVOCATION_ID: id,
            DD_FLOW_CHECK_COMMAND: tool,
            DD_FLOW_CHECK_RUNNER_EVIDENCE_PATH: reportPath,
          },
        },
      );
      const report = JSON.parse(readFileSync(reportPath));
      assert.equal(child.status, 1, child.stderr);
      assert.ok(
        report.failures.some(
          (item) => item.repair_evidence?.rule === "candidate_tool_diagnostic",
        ),
        JSON.stringify(report) + child.stderr + child.stdout,
      );
      if (process.env.DD_TASKS_ENGINE_EVIDENCE_MODULE) {
        const engine = await import(
          pathToFileURL(process.env.DD_TASKS_ENGINE_EVIDENCE_MODULE).href
        );
        const evidence = engine.readRunnerEvidence(
          directory,
          {
            schema_id: "dd-flow/check-runner-evidence@1",
            path: path.basename(reportPath),
          },
          report.binding,
        );
        const disposition = engine.checkRepairDisposition({
          status: "failed",
          exit_code: 1,
          runner_evidence: evidence,
          candidate_files: engine.candidateFailureFiles(evidence, root),
          candidate_absences: engine.candidateFailureAbsences(evidence, root),
        });
        assert.equal(
          disposition,
          "source_repair",
          JSON.stringify({ evidence, reportPath, report }),
        );
      }
      return report;
    };
    const source = path.join(directory, "sample.ts");
    writeFileSync(source, "const value:number='wrong';\nexport {value};\n");
    const biome = await run("biome", ["check", source], "native-biome", true);
    assert.ok(
      biome.failures.some(
        (item) => item.native_code === "assist/source/organizeImports",
      ),
    );
    const config = path.join(directory, "tsconfig.json");
    writeFileSync(
      config,
      JSON.stringify({
        compilerOptions: { noEmit: true, skipLibCheck: true, types: [] },
        files: [source],
      }),
    );
    const cli = spawnSync(
      process.execPath,
      ["node_modules/typescript/bin/tsc", "-p", config, "--noEmit"],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(cli.status, 2, cli.stderr);
    const report = await run("typescript", [config], "native-typescript");
    assert.ok(report.failures.some((item) => item.native_code === "TS2322"));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
