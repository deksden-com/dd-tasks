import { readFile } from "node:fs/promises";

const files = process.argv.slice(2);
const highRiskPatterns = [
  /-----BEGIN (?:RSA|OPENSSH|EC|DSA|PRIVATE) KEY-----/i,
  /postgres(?:ql)?:\/\/[^\s"']+@/i,
  /(?:^|[^A-Za-z0-9_])(?:sk|ghp|xoxb|AIza)[A-Za-z0-9_-]{12,}(?:$|[^A-Za-z0-9_])/m,
  /(?:api[_-]?key|access[_-]?token|client[_-]?secret)\s*[:=]\s*[^<\s]+/i,
  /(?:stack trace|traceback|at [A-Za-z0-9_$./-]+ \()/i,
];

const findings = [];
for (const file of files) {
  const text = await readFile(file, "utf8");
  for (const pattern of highRiskPatterns) {
    if (pattern.test(text)) {
      findings.push({ file, pattern: pattern.source });
    }
  }
}

if (findings.length > 0) {
  console.log(
    JSON.stringify({ status: "failed", filesScanned: files.length, findings }),
  );
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify({
      status: "passed",
      filesScanned: files.length,
      findings: 0,
      values: "not reported",
    }),
  );
}
