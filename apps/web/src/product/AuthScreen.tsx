import { type FormEvent, useEffect, useState } from "react";
import { ProductApiError, productApi, type RegistrationMode } from "./api.js";

type AuthMode = "login" | "register";

type PolicyState =
  | { status: "loading" }
  | { status: "ready"; mode: RegistrationMode }
  | { status: "error"; code: string };

function messageOf(error: unknown): string {
  return error instanceof ProductApiError
    ? error.message
    : "Unexpected server error";
}

function policyErrorCode(error: unknown): string {
  return error instanceof ProductApiError ? error.code : "NOT_READY";
}

function ErrorNotice({ error }: { error: string | null }) {
  return error ? (
    <p className="notice notice-error" data-testid="state-error" role="alert">
      {error}
    </p>
  ) : null;
}

export function AuthScreen({
  mode,
  onNavigate,
}: {
  mode: AuthMode;
  onNavigate: (path: string) => void;
}) {
  const [email, setEmail] = useState(
    mode === "login" ? "owner@example.test" : "",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [policy, setPolicy] = useState<PolicyState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    void productApi
      .config()
      .then((config) => {
        if (active)
          setPolicy({ status: "ready", mode: config.registration_mode });
      })
      .catch((caught) => {
        if (active)
          setPolicy({ status: "error", code: policyErrorCode(caught) });
      });
    return () => {
      active = false;
    };
  }, []);

  const registrationOpen = policy.status === "ready" && policy.mode === "open";
  const registrationBlocked = mode === "register" && !registrationOpen;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await (mode === "login"
        ? productApi.login(email, password)
        : productApi.register(email, password));
      onNavigate("/workspaces");
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main
      className="auth-layout"
      data-screen={`auth-${mode}`}
      data-testid={`auth-${mode}`}
    >
      <section className="auth-story" aria-labelledby="auth-heading">
        <p className="product-kicker">checkpoint 02 / workspace core</p>
        <h1 id="auth-heading">
          Make the work <em>visible.</em>
        </h1>
        <p>
          A focused home for projects and the next concrete task. Local, clear,
          and deliberately small.
        </p>
      </section>
      {registrationBlocked ? (
        <section
          className="auth-card auth-policy-card"
          data-testid="registration-closed-state"
          aria-live="polite"
        >
          <p className="product-kicker">Access policy</p>
          <h2>Registration unavailable</h2>
          <p>
            {policy.status === "loading"
              ? "Checking the current registration policy…"
              : policy.status === "error"
                ? "The service is not ready to accept registrations."
                : "Registration is closed for this preview."}
          </p>
          {policy.status === "error" && (
            <p className="state-copy" data-testid="registration-policy-state">
              Policy status: {policy.code}
            </p>
          )}
          <button
            className="text-button"
            type="button"
            onClick={() => onNavigate("/login")}
          >
            Go to sign in
          </button>
        </section>
      ) : (
        <form className="auth-card" onSubmit={submit}>
          <p className="product-kicker">
            {mode === "login" ? "Welcome back" : "Create account"}
          </p>
          <h2>{mode === "login" ? "Sign in" : "Start here"}</h2>
          <label htmlFor="auth-email">
            Email
            <input
              id="auth-email"
              data-testid="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label htmlFor="auth-password">
            Password
            <input
              id="auth-password"
              data-testid="auth-password"
              name="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              minLength={10}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <ErrorNotice error={error} />
          <button data-testid="auth-submit" type="submit" disabled={busy}>
            {busy
              ? "Working…"
              : mode === "login"
                ? "Enter workspace"
                : "Create account"}
          </button>
          {((mode === "login" && registrationOpen) || mode === "register") && (
            <button
              className="text-button"
              type="button"
              onClick={() =>
                onNavigate(mode === "login" ? "/register" : "/login")
              }
            >
              {mode === "login" ? "Need an account?" : "Already registered?"}
            </button>
          )}
        </form>
      )}
    </main>
  );
}
