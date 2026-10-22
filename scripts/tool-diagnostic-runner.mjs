import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  candidatePath,
  nativeArtifact,
  sha256,
  toolFailure,
} from "./source-diagnostic.mjs";
import { evidence, progress } from "./test-observation.mjs";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");
function stepIdentity(argv) {
  if (process.env.DD_TASKS_CHECK_STEP)
    return JSON.parse(process.env.DD_TASKS_CHECK_STEP);
  return {
    id: "standalone",
    ordinal: 0,
    command_sha256: sha256(JSON.stringify(argv)),
  };
}
export function biomeFailures(report, version, step) {
  if (!Array.isArray(report?.diagnostics))
    throw new Error("Biome did not return native JSON diagnostics");
  return report.diagnostics
    .filter((item) => ["error", "fatal"].includes(item.severity))
    .map((item) => {
      const category = item.category;
      const file =
        typeof item.location?.path === "string"
          ? item.location.path
          : item.location?.path?.file;
      if (
        typeof category !== "string" ||
        !(
          /^(format|lint(?:\/|$))/.test(category) ||
          (version === "2.5.6" && category === "assist/source/organizeImports")
        ) ||
        typeof file !== "string"
      )
        return {
          category: "unclassified",
          code: "unsupported_biome_diagnostic",
          message: String(item.description ?? category ?? "Unknown diagnostic"),
        };
      return toolFailure({
        tool: { name: "biome", version },
        step,
        diagnostic_code: category,
        diagnostic: item,
        file: candidatePath(file),
        message: `Biome ${category}: ${path.relative(root, file)}`,
      });
    });
}
async function execute(command, args) {
  const child = spawn(command, args, { stdio: ["inherit", "pipe", "pipe"] });
  let stdout = "",
    stderr = "";
  child.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
    stdout += chunk;
    if (stdout.length > 2 * 1024 * 1024)
      stdout = stdout.slice(-2 * 1024 * 1024);
  });
  child.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
    stderr += chunk;
    if (stderr.length > 65536) stderr = stderr.slice(-65536);
  });
  const outcome = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code: code ?? 1, signal }));
  });
  return { ...outcome, stdout, stderr };
}
export async function runTool([tool, ...args]) {
  const failures = [];
  let code = 1,
    version = "1",
    completed = true;
  const step = stepIdentity([tool, ...args]);
  try {
    progress(`setup_step_completed:tool:${step.id}`, "startup");
    if (tool === "typescript") {
      const ts = require("typescript");
      version = ts.version;
      let unknown = false;
      for (const config of args) {
        const configFile = ts.readConfigFile(
          path.resolve(config),
          ts.sys.readFile,
        );
        const parsed = configFile.error
          ? { errors: [configFile.error] }
          : ts.parseJsonConfigFileContent(
              configFile.config,
              ts.sys,
              path.dirname(path.resolve(config)),
            );
        const diagnostics = [...parsed.errors];
        if (!diagnostics.length) {
          if (parsed.projectReferences?.length)
            throw new Error(
              "Project-reference CLI semantics need explicit native adapter",
            );
          const program = ts.createProgram(parsed.fileNames, {
            ...parsed.options,
            noEmit: true,
          });
          diagnostics.push(...ts.getPreEmitDiagnostics(program));
        }
        for (const item of diagnostics.filter(
          (value) => value.category === ts.DiagnosticCategory.Error,
        )) {
          const message = ts.flattenDiagnosticMessageText(
            item.messageText,
            "\n",
          );
          console.error(
            ts.formatDiagnosticsWithColorAndContext([item], {
              getCanonicalFileName: (f) => f,
              getCurrentDirectory: () => root,
              getNewLine: () => "\n",
            }),
          );
          if (item.file?.fileName)
            failures.push(
              toolFailure({
                tool: { name: "typescript", version },
                step,
                diagnostic_code: `TS${item.code}`,
                diagnostic: {
                  code: item.code,
                  category: item.category,
                  file: item.file.fileName,
                  start: item.start,
                  length: item.length,
                  message,
                },
                file: item.file.fileName,
                message,
              }),
            );
          else {
            unknown = true;
            failures.push({
              category: "unclassified",
              code: `TS${item.code}`,
              message,
            });
          }
        }
        progress(`step_completed:typescript:${config}`);
        if (diagnostics.some((d) => d.category === ts.DiagnosticCategory.Error))
          break;
      }
      code = failures.length || unknown ? 1 : 0;
    } else if (tool === "biome") {
      version = require("@biomejs/biome/package.json").version;
      const result = await execute("pnpm", [
        "exec",
        "biome",
        ...args,
        "--reporter=json",
      ]);
      code = result.code;
      failures.push(...biomeFailures(JSON.parse(result.stdout), version, step));
    } else if (tool === "command") {
      const result = await execute(args[0], args.slice(1));
      code = result.code;
      if (code !== 0)
        failures.push({
          category: "unclassified",
          code: result.signal ? "step_signal" : "step_nonzero_exit",
          message: `Command ${args[0]} failed (${result.signal ?? code})`,
          diagnostic_artifact: nativeArtifact({
            tool: { name: "command", version },
            step,
            exit_code: code,
            signal: result.signal,
            stdout: result.stdout.slice(-65536),
            stderr: result.stderr,
          }),
        });
    } else throw new Error(`Unsupported native diagnostic tool: ${tool}`);
    if (code !== 0 && !failures.length)
      failures.push({ category: "unclassified", code: "nonzero_exit" });
  } catch (error) {
    completed = false;
    failures.push({
      category: "tooling",
      code: error.code ?? "native_diagnostic_unavailable",
      message: error.message,
    });
  }
  evidence(
    { name: tool ?? "unknown", version },
    { passed: 0, failed: 0, skipped: 0 },
    failures,
    completed,
  );
  progress(`step_completed:tool_terminal:${step.id}`);
  return failures.length ? 1 : code;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  process.exitCode = await runTool(process.argv.slice(2));
