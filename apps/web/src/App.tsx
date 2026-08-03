import { useEffect, useState } from "react";
import { FoundationApiError, fetchFoundationHealth } from "./foundation/api.js";
import {
  FOUNDATION_SCREEN,
  type FoundationState,
} from "./foundation/foundation-contract.js";
import { ProductApp } from "./product/ProductApp.js";

function FoundationScreen() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<FoundationState>({ kind: "loading" });

  useEffect(() => {
    // `attempt` is a rerun token for this effect, not request data.
    void attempt;
    const controller = new AbortController();
    setState({ kind: "loading" });

    fetchFoundationHealth(controller.signal)
      .then((health) => {
        setState({ kind: "success", service: health.service });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        if (error instanceof FoundationApiError) {
          setState({ kind: "error", error: error.publicError });
          return;
        }
        setState({
          kind: "error",
          error: { code: "INTERNAL_ERROR", message: "Unexpected server error" },
        });
      });

    return () => controller.abort();
  }, [attempt]);

  const isLoading = state.kind === "loading";

  return (
    <div className="app-shell" data-testid={FOUNDATION_SCREEN.selectors.root}>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="topbar">
        <a
          className="wordmark"
          href={FOUNDATION_SCREEN.route}
          aria-label="dd tasks foundation home"
        >
          <span className="wordmark-mark" aria-hidden="true">
            dd
          </span>
          <span>tasks</span>
        </a>
        <p className="topbar-note">
          checkpoint 01 <span aria-hidden="true">/</span> technical foundation
        </p>
      </header>

      <main className="content-grid">
        <section className="intro" aria-labelledby="foundation-heading">
          <p className="eyebrow">local system / readiness surface</p>
          <h1 id="foundation-heading">
            A calm place
            <span>to start.</span>
          </h1>
          <p className="intro-copy">
            The smallest useful signal from a new project: the workspace is
            here, the API can answer, and the next layer has room to grow.
          </p>
          <section className="intro-rail" aria-label="Foundation scope">
            <span>
              <i className="rail-dot rail-dot-live" aria-hidden="true" /> one
              local surface
            </span>
            <span>
              <i className="rail-dot" aria-hidden="true" /> no product data
            </span>
            <span>
              <i className="rail-dot" aria-hidden="true" /> route{" "}
              {FOUNDATION_SCREEN.route}
            </span>
          </section>
        </section>

        <section
          className="signal-card"
          data-testid={FOUNDATION_SCREEN.selectors.status}
          aria-labelledby="signal-heading"
        >
          <div className="card-topline">
            <span className="card-label">foundation signal</span>
            <span className="card-index" aria-hidden="true">
              01 / 01
            </span>
          </div>

          <div className="signal-copy">
            <p className="eyebrow">API health probe</p>
            <h2 id="signal-heading">Is the core awake?</h2>
            <p className="signal-description">
              A read-only check with a deliberately small contract. No tasks,
              accounts, or assumptions are hiding behind this screen.
            </p>
          </div>

          <div className="state-panel" aria-live="polite" aria-atomic="true">
            {state.kind === "loading" && (
              <div
                className="state state-loading"
                data-testid={FOUNDATION_SCREEN.selectors.loading}
                role="status"
              >
                <span className="state-icon spinner" aria-hidden="true" />
                <span>
                  <strong>Listening for a reply</strong>
                  <small>Checking the local API boundary…</small>
                </span>
              </div>
            )}

            {state.kind === "success" && (
              <div
                className="state state-success"
                data-testid={FOUNDATION_SCREEN.selectors.success}
                role="status"
              >
                <span className="state-icon checkmark" aria-hidden="true">
                  ✓
                </span>
                <span>
                  <strong>Foundation is ready</strong>
                  <small>{state.service} answered with a healthy signal.</small>
                </span>
              </div>
            )}

            {state.kind === "error" && (
              <div
                className="state state-error"
                data-testid={FOUNDATION_SCREEN.selectors.error}
                role="alert"
              >
                <span className="state-icon error-mark" aria-hidden="true">
                  !
                </span>
                <span>
                  <strong>The signal needs attention</strong>
                  <small>{state.error.message}</small>
                </span>
              </div>
            )}
          </div>

          <button
            className="probe-button"
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            disabled={isLoading}
          >
            <span>{isLoading ? "Checking…" : "Probe again"}</span>
            <span className="button-arrow" aria-hidden="true">
              ↗
            </span>
          </button>
          <p className="card-footnote">
            read-only <span aria-hidden="true">·</span> local / test boundary
          </p>
        </section>
      </main>

      <footer className="footer-note">
        <span>dd / tasks</span>
        <span>foundation · {FOUNDATION_SCREEN.screenId}</span>
      </footer>
    </div>
  );
}

function App() {
  return window.location.pathname === FOUNDATION_SCREEN.route ? (
    <FoundationScreen />
  ) : (
    <ProductApp />
  );
}

export default App;
