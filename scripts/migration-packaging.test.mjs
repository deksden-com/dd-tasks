import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
test("relocated production migrations do not require repository test tooling", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "migration-package-"));
  try {
    const ts = createRequire(import.meta.url)("typescript");
    const runtime = path.join(directory, "runtime"),
      db = path.join(runtime, "dist/db");
    mkdirSync(db, { recursive: true });
    writeFileSync(
      path.join(runtime, "package.json"),
      JSON.stringify({ type: "module" }),
    );
    mkdirSync(path.join(runtime, "node_modules"));
    symlinkSync(
      realpathSync(path.join(root, "apps/api/node_modules/postgres")),
      path.join(runtime, "node_modules/postgres"),
      "dir",
    );
    for (const name of ["migrations", "test-world"]) {
      const source = readFileSync(
        path.join(root, `apps/api/src/db/${name}.ts`),
        "utf8",
      );
      const output = ts.transpileModule(source, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
        },
      }).outputText;
      writeFileSync(path.join(db, `${name}.js`), output);
    }
    const env = { ...process.env };
    for (const key of Object.keys(env))
      if (key.startsWith("DD_TASKS_")) delete env[key];
    const child = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `const migration=await import(${JSON.stringify(pathToFileURL(path.join(db, "migrations.js")).href)});if(typeof migration.applyMigrations!=='function')process.exit(1);`,
      ],
      { cwd: runtime, env, encoding: "utf8" },
    );
    assert.equal(child.status, 0, child.stderr);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
