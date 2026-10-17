import { createRequire } from "node:module";
import { performance } from "node:perf_hooks";
import {
  attempt,
  attemptKey,
  readObservation,
  writeObservation,
} from "./browser-observation.mjs";
import { binding, readyWorldProof } from "./test-observation.mjs";

const require = createRequire(
  new URL("../apps/web/package.json", import.meta.url),
);
const { test: base, expect } = require("@playwright/test");

export { expect };
export const test = base.extend({
  _observeInactivity: [
    async ({ browser }, use, info) => {
      if (process.env.DD_TASKS_TEST_WATCHDOG !== "1") {
        await use();
        return;
      }
      const quiet = Number(
        process.env.DD_FLOW_TEST_EXECUTION_SILENCE_MS ?? 600000,
      );
      const database = databaseHealth();
      void database.check(Math.min(1000, quiet / 4));
      const identity = attempt(info),
        key = attemptKey(identity);
      let epoch = performance.now(),
        phase = "body",
        last = Date.now(),
        cursor = 0;
      let previous = performance.now(),
        gap = false,
        probing = false,
        closed = false;
      const healthState = { closed: false, crashed: false };
      const invalidateBeforeDeadline = () => {
        const snapshot = readObservation(key, "worker");
        if (!snapshot || Date.now() > Date.parse(snapshot.deadline_at)) return;
        try {
          writeObservation(key, "worker", {
            ...snapshot,
            browser: {
              connected: browser.isConnected(),
              page_closed: healthState.closed,
              crashed: healthState.crashed,
            },
          });
        } catch {
          gap = true;
        }
      };
      const disconnected = () => {
        healthState.closed = true;
        invalidateBeforeDeadline();
      };
      browser.on("disconnected", disconnected);
      const observePage = (page) => {
        page.on("crash", () => {
          healthState.crashed = true;
          invalidateBeforeDeadline();
        });
        page.on("close", () => {
          healthState.closed = true;
          invalidateBeforeDeadline();
        });
      };
      const observeContext = (context) => {
        context.pages().forEach(observePage);
        context.on("page", observePage);
        context.on("close", () => {
          healthState.closed = true;
          invalidateBeforeDeadline();
        });
      };
      // Browser contexts are discovered without making page/context fixtures a dependency.
      const contexts = new WeakSet();
      info.setTimeout(quiet);
      const timer = setInterval(
        () => {
          try {
            const now = performance.now();
            if (now - previous > Math.min(1000, quiet / 4)) {
              gap = true;
              const frozen = readObservation(key, "worker");
              if (frozen?.binding)
                writeObservation(key, "worker", {
                  ...frozen,
                  observation_gap: true,
                });
            }
            previous = now;
            for (const context of browser.contexts())
              if (!contexts.has(context)) {
                contexts.add(context);
                observeContext(context);
              }
            if (phase === "body" && info.duration > 0) {
              phase = "teardown";
              epoch = now;
              last = Date.now();
              info.setTimeout(quiet);
            }
            const state = readObservation(key, "reporter");
            if (state?.observation_error) gap = true;
            if (state?.terminal) {
              clearInterval(timer);
              return;
            }
            if (state?.sequence > cursor) {
              cursor = state.sequence;
              if (
                state.progress_phase === phase &&
                Number.isFinite(state.last_progress_at) &&
                state.last_progress_at > last &&
                state.last_progress_at <= Date.now()
              ) {
                last = state.last_progress_at;
                info.setTimeout(
                  Math.ceil(
                    now - epoch + Math.max(1, quiet - (Date.now() - last)),
                  ),
                );
              }
            }
            const deadline = last + quiet;
            if (
              !probing &&
              phase === "body" &&
              deadline - Date.now() <= Math.min(750, quiet / 3) &&
              deadline > Date.now()
            ) {
              probing = true;
              const frozenLast = last;
              void captureHealth(
                browser,
                healthState,
                database,
                Math.min(500, quiet / 6),
              )
                .then((health) => {
                  if (closed || last !== frozenLast || Date.now() >= deadline)
                    return;
                  const current = readObservation(key, "reporter");
                  if (
                    JSON.stringify(current?.active_step) !==
                    JSON.stringify(state?.active_step)
                  )
                    return;
                  writeObservation(key, "worker", {
                    schema_id: "dd-tasks/browser-worker@1",
                    binding: binding(),
                    attempt: identity,
                    phase,
                    step: state?.active_step,
                    sequence: cursor,
                    observed_at: new Date().toISOString(),
                    quiet_ms: quiet,
                    last_progress_at: new Date(last).toISOString(),
                    deadline_at: new Date(deadline).toISOString(),
                    observation_gap: gap,
                    ...health,
                    world: readyWorldProof(),
                  });
                })
                .catch(() => {})
                .finally(() => {
                  probing = false;
                });
            }
          } catch {
            gap = true;
          }
        },
        Math.min(50, quiet / 10),
      );
      timer.unref();
      try {
        await use();
      } finally {
        closed = true;
        clearInterval(timer);
        browser.off("disconnected", disconnected);
        await database.close();
      }
    },
    { auto: true },
  ],
});

async function captureHealth(browser, state, database, budget) {
  const observed = new Date().toISOString();
  const pages = browser.contexts().flatMap((context) => context.pages());
  const check = async (url) => {
    if (!url) return false;
    try {
      return (
        await fetch(url, {
          signal: AbortSignal.timeout(Math.max(1, Math.floor(budget))),
          redirect: "error",
        })
      ).ok;
    } catch {
      return false;
    }
  };
  const localEndpoint = (port, suffix) =>
    /^\d+$/.test(port ?? "") && Number(port) > 0 && Number(port) <= 65535
      ? `http://127.0.0.1:${port}${suffix}`
      : null;
  const [api, web, db] = await Promise.all([
    check(localEndpoint(process.env.DD_FLOW_PORT_API, "/api/health")),
    check(localEndpoint(process.env.DD_FLOW_PORT_WEB, "/login")),
    database.check(budget),
  ]);
  return {
    browser: {
      connected: browser.isConnected(),
      page_closed:
        state.closed ||
        pages.length === 0 ||
        pages.some((page) => page.isClosed()),
      crashed: state.crashed,
    },
    world_health: { api, web, db },
    health_observed_at: observed,
  };
}
function databaseHealth() {
  let ownedDatabase = false;
  try {
    const url = new URL(process.env.DATABASE_URL);
    const world = readyWorldProof();
    ownedDatabase = Boolean(
      world &&
        world.world_id === process.env.DD_TASKS_TEST_WORLD &&
        ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) &&
        url.pathname === `/dd_tasks_foundation_test_${world.world_id}` &&
        !url.search &&
        !url.hash,
    );
  } catch {}
  const postgres = createRequire(
    new URL("../apps/api/package.json", import.meta.url),
  )("postgres");
  const sql = ownedDatabase
    ? // One probe-only session; avoid per-poll reconnect/type discovery and never
      // force-close an initializing connection from a health timer.
      postgres(process.env.DATABASE_URL, {
        max: 1,
        connect_timeout: 1,
        fetch_types: false,
        prepare: false,
        connection: { statement_timeout: 500 },
      })
    : null;
  let active;
  const checkDatabase = async (budget) => {
    if (!ownedDatabase) return false;
    if (active) return false;
    active = sql`select 1`
      .then(
        () => true,
        () => false,
      )
      .finally(() => {
        active = null;
      });
    let timer;
    try {
      return await Promise.race([
        active,
        new Promise((resolve) => {
          timer = setTimeout(() => resolve(false), budget);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  };
  return {
    check: checkDatabase,
    async close() {
      if (sql) await sql.end({ timeout: 1 });
    },
  };
}
