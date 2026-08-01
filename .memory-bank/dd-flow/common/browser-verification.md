# Browser verification

Use this block when a task changes UI, starts a local dev server, requires visual evidence, or runs a browser-facing experiment.

Browser verification starts with environment analysis. Do not silently fall back to `curl` when a browser route is available.

## Environment analysis

Before choosing the browser route, check and record:

- whether `cmux` is available and whether the current session can use cmux browser surfaces;
- whether `agent-browser` is available;
- whether the project already has Playwright, Cypress, Vitest browser mode, or another local e2e runner;
- which dev-server URL, port, commit, branch, and workspace are being verified;
- whether the gate requires visual proof, DOM proof, interaction proof, screenshot evidence, or only HTTP availability.

Recommended command probes:

```bash
command -v cmux >/dev/null && cmux --version
command -v agent-browser >/dev/null && agent-browser --version
```

If both browser tools are unavailable, say that explicitly and downgrade to HTTP/source/test evidence only when the current gate allows it. If browser proof is required, create a blocker or `DEF-*` instead of claiming visual verification.

## Dev server discipline

Never start a long-running dev server in the foreground from an agent tool call. A foreground `pnpm dev`, `npm run dev`, `vite`, `next dev`, or equivalent command can hang the session, prevent merge/check completion, and confuse experiment timing.

When a local server is needed, run it as a managed background process:

- choose an explicit host/port;
- redirect logs to a file under `.tasks/` or the protocol trace directory;
- write or record the PID;
- wait for a health URL with bounded retries;
- stop the process during cleanup, even when a later check fails.

Record the dev-server command, PID/log path, URL, and cleanup result in the verification passport or trace. Do not call HTTP/source smoke or browser evidence complete until the server has a bounded startup check and a cleanup path.

## Route choice

Prefer a real browser route in this order:

1. `cmux-browser` when `cmux` browser surfaces are available or the experiment is already running inside a cmux workspace.
2. `vercel:agent-browser` / `agent-browser` when the standalone browser CLI is available.
3. Project-native e2e runner when it is the documented project gate.
4. HTTP/source smoke only when no browser route is available and the gate does not require visual/interactive evidence.

Use only one primary route per evidence passport unless the task explicitly compares tools. If a route fails because the tool is unavailable, record the attempted route and reason, then try the next available route.

## cmux-browser route

Follow the `cmux-browser` skill workflow:

```bash
cmux --json browser open http://127.0.0.1:<port>
cmux browser <surface> get url
cmux browser <surface> wait --load-state complete --timeout-ms 15000
cmux browser <surface> snapshot --interactive
```

For interactions, use fresh element refs from `snapshot --interactive`; re-snapshot after navigation or DOM changes. If interactive snapshot fails, fall back to `get text body` or `get html body` and record the limitation.

## agent-browser route

Follow the `vercel:agent-browser` skill workflow:

```bash
agent-browser open http://127.0.0.1:<port>
agent-browser wait --load networkidle
agent-browser snapshot -i
agent-browser screenshot --full
```

Use refs from the latest snapshot. Re-snapshot after clicks, form submits, route changes, or dynamic UI updates. Close the browser session when the experiment does not need it anymore.

## Evidence rules

Record browser evidence in the protocol or verification passport:

- selected route and why;
- tool availability probes;
- URL, commit, branch/worktree, and dev-server command;
- screenshot path, snapshot path, or extracted DOM/text proof;
- scenario or UI contract covered;
- limitation, if the proof is not full browser evidence.

Do not write "browser verified" if the proof was only `curl`, served source, or unit tests. Use precise wording such as `HTTP smoke passed; browser route unavailable`.

## Durable artifact promotion

Raw browser artifacts are disposable until they are copied or summarized into durable protocol evidence.

Before claiming readiness, merge completion, or experiment acceptance, promote any browser proof that must survive cleanup:

- source: `.tasks/`, `.scenario-runs/`, tool temp folders, cmux text/snapshot files, screenshots, DOM dumps, console/network excerpts;
- target: `protocol/<PRT-ID>/evidence/`, `protocol/<PRT-ID>/trace/`, or project-level `evidence/` when the proof is reused outside one protocol;
- record in the verification passport which raw artifacts were promoted, which were summarized instead of copied, and which were intentionally discarded as transient.

If a feature worktree will be removed, promotion must happen before `git worktree remove`. A passport that references a deleted `.tasks/...` file without a durable copy or curated summary is incomplete evidence.
