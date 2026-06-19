import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const THEME_KEY = "adminHMD.colorTheme";

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-bs-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

export default function SignupPage() {
  const navigate = useNavigate();

  const [name,            setName]            = useState("");
  const [username,        setUsername]        = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms,           setTerms]           = useState(false);
  const [validated,       setValidated]       = useState(false);
  const [error,           setError]           = useState("");

  // "idle" | "checking" | "available" | "taken" | "error"
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const usernameTimer = useRef(null);

  // ── Theme ────────────────────────────────────────────────────────────────
  useEffect(() => {
    applyTheme(getPreferredTheme());
    document.body.classList.add("auth-body");
    return () => document.body.classList.remove("auth-body");
  }, []);

  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "light"
  );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setTheme(document.documentElement.getAttribute("data-theme") || "light")
    );
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  function handleThemeToggle() {
    applyTheme(theme === "dark" ? "light" : "dark");
  }

  // ── Username availability check (debounced 600 ms) ───────────────────────
  function handleUsernameChange(e) {
    const value = e.target.value.toLowerCase().replace(/\s/g, "");
    setUsername(value);
    setUsernameStatus("idle");

    clearTimeout(usernameTimer.current);
    if (!value || value.length < 3) return;

    setUsernameStatus("checking");
    usernameTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/user/check-username?username=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        // Expects: { available: true } or { available: false }
        setUsernameStatus(data.available ? "available" : "taken");
      } catch {
        setUsernameStatus("error");
      }
    }, 600);
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setValidated(true);
    if (!e.target.checkValidity()) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (usernameStatus === "taken") {
      setError("That username is already taken. Please choose another.");
      return;
    }

    if (usernameStatus === "checking") {
      setError("Please wait while we check username availability.");
      return;
    }

    try {
      let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name,
          username,
          email,
          password,
          role: "Recruiter",
          active: true,
        }),
      });
      response = await response.json();
      if (response.result === "Done") {
        navigate("/login");
      } else {
        setError(
          response.reason?.email ||
          response.reason?.username ||
          response.message ||
          "Registration failed."
        );
      }
    } catch {
      setError("Internal Server Error. Please try again.");
    }
  }

  // ── Username feedback helpers ────────────────────────────────────────────
  const usernameFeedback = {
    idle:      null,
    checking:  { cls: "text-muted",   icon: "bi-arrow-repeat spin", msg: "Checking availability…" },
    available: { cls: "text-success", icon: "bi-check-circle-fill", msg: "Username is available!" },
    taken:     { cls: "text-danger",  icon: "bi-x-circle-fill",     msg: "Username is already taken." },
    error:     { cls: "text-warning", icon: "bi-exclamation-circle",msg: "Could not verify. Try again." },
  }[usernameStatus];

  const usernameInputClass = [
    "form-control",
    validated && !username ? "is-invalid" : "",
    usernameStatus === "taken"     ? "is-invalid"  : "",
    usernameStatus === "available" ? "is-valid"    : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <style>{`.spin { animation: spin .8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Floating theme toggle */}
      <button
        className="icon-button theme-toggle auth-theme-toggle"
        type="button"
        onClick={handleThemeToggle}
        aria-label="Switch color theme"
        title="Switch color theme"
      >
        <i
          className={theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars"}
          aria-hidden="true"
        />
      </button>

      <main className="auth-page">
        <section className="auth-card">

          {/* Brand */}
          <Link className="auth-brand" to="/">
            <span className="brand-icon">
              <i className="bi bi-grid-1x2-fill" aria-hidden="true"></i>
            </span>
            <span>
              <strong>adminHMD</strong>
              <small>Create your adminHMD account.</small>
            </span>
          </Link>

          {/* Hero image */}
          <div className="auth-visual">
            <img
              src="/images/png/dasher-ui-bootstrap-5.jpg"
              alt="adminHMD dashboard interface"
            />
          </div>

          {/* Form */}
          <form
            className={`needs-validation${validated ? " was-validated" : ""}`}
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="mb-4">
              <p className="eyebrow mb-1">Secure Access</p>
              <h1 className="h3 mb-1">Register</h1>
              <p className="text-muted mb-0">Create your adminHMD account.</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 mb-3 d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {error}
              </div>
            )}

            {/* Full name */}
            <div className="mb-3">
              <label className="form-label" htmlFor="registerName">Full name</label>
              <input
                className="form-control"
                id="registerName"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Jane Smith"
                required
              />
              <div className="invalid-feedback">Full name is required.</div>
            </div>

            {/* Username */}
            <div className="mb-3">
              <label className="form-label" htmlFor="registerUsername">
                Username
              </label>
              <div className="input-group">
                <span className="input-group-text">@</span>
                <input
                  className={usernameInputClass}
                  id="registerUsername"
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="your_username"
                  minLength={3}
                  required
                />
                <div className="invalid-feedback">
                  {usernameStatus === "taken"
                    ? "Username is already taken."
                    : "Username must be at least 3 characters."}
                </div>
                {usernameStatus === "available" && (
                  <div className="valid-feedback">Username is available!</div>
                )}
              </div>
              {/* Live status badge (below the input) */}
              {usernameFeedback && (
                <div className={`d-flex align-items-center gap-1 mt-1 small ${usernameFeedback.cls}`}>
                  <i className={`bi ${usernameFeedback.icon}`}></i>
                  {usernameFeedback.msg}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label" htmlFor="registerEmail">Email address</label>
              <input
                className="form-control"
                id="registerEmail"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <div className="invalid-feedback">Enter a valid email.</div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label" htmlFor="registerPassword">Password</label>
              <input
                className="form-control"
                id="registerPassword"
                type="password"
                minLength={8}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Min. 6 characters"
                required
              />
              <div className="invalid-feedback">Min 8 chars, include uppercase, lowercase and a number.</div>
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <label className="form-label" htmlFor="registerConfirmPassword">Confirm Password</label>
              <input
                className={`form-control${validated && confirmPassword && password !== confirmPassword ? " is-invalid" : ""}`}
                id="registerConfirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                placeholder="Repeat your password"
                required
              />
              <div className="invalid-feedback">Passwords do not match.</div>
            </div>

            {/* Terms */}
            <div className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="terms"
                checked={terms}
                onChange={e => setTerms(e.target.checked)}
                required
              />
              <label className="form-check-label" htmlFor="terms">
                I agree to the terms
              </label>
              <div className="invalid-feedback">You must agree before continuing.</div>
            </div>

            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={usernameStatus === "checking" || usernameStatus === "taken"}
            >
              <i className="bi bi-person-plus" aria-hidden="true"></i> Create Account
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>

        </section>
      </main>
    </>
  );
}