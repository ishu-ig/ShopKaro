import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const THEME_KEY = "adminHMD.colorTheme";

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-bs-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [data, setData] = useState({ username: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Apply theme on mount
  useEffect(() => {
    applyTheme(getPreferredTheme());
    document.body.classList.add("auth-body");
    return () => document.body.classList.remove("auth-body");
  }, []);

  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "light",
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  function handleThemeToggle() {
    applyTheme(theme === "dark" ? "light" : "dark");
  }

  // ── From file 1: single getInputData handler + clears error on change ────────
  function getInputData(e) {
    const { name, value } = e.target;
    setError("");
    setData((old) => ({ ...old, [name]: value }));
  }

  // ── From file 1: postData logic (Admin / Super Admin roles) ──────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setValidated(true);
    if (!e.target.checkValidity()) return;

    setLoading(true);
    try {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/user/login`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            username: data.username,
            password: data.password,
          }),
        },
      );
      response = await response.json();

      if (response.result === "Done" && response.data.active === false) {
        setError("Your account is inactive. Please contact support.");
      } else if (response.result === "Done") {
        if (
          response.data.role === "Admin" ||
          response.data.role === "Super Admin"
        ) {
          localStorage.setItem("login", true);
          localStorage.setItem("name", response.data.name);
          localStorage.setItem("userid", response.data._id);
          localStorage.setItem("role", response.data.role);
          localStorage.setItem("token", response.token);
          const incomplete = [
            "address",
            "state",
            "pin",
            "phone",
            "name",
            "city",
          ].some((f) => !response.data[f]);
          navigate(incomplete ? "/profile" : "/");
        } else {
          setError("You are not authorized to access this panel.");
          localStorage.setItem("login", false);
        }
      } else {
        setError("Invalid username/email or password.");
      }
    } catch {
      alert("Internal Server Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
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
              <small>Sign in to your admin workspace.</small>
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
              <h1 className="h3 mb-1">Login</h1>
              <p className="text-muted mb-0">
                Sign in to your admin workspace.
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 mb-3" role="alert">
                {error}
              </div>
            )}

            {/* Username */}
            <div className="mb-3">
              <label className="form-label" htmlFor="loginUserName">
                Email Address or Username
              </label>
              <input
                className="form-control"
                id="loginUserName"
                name="username"
                value={data.username}
                onChange={getInputData}
                required
              />
              <div className="invalid-feedback">Enter a valid username.</div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <label className="form-label" htmlFor="loginPassword">
                  Password
                </label>
                <Link className="small fw-semibold" to="/forgetPassword-1">
                  Forgot?
                </Link>
              </div>
              <div className="position-relative">
                <input
                  className="form-control pe-5"
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  minLength={6}
                  value={data.password}
                  onChange={getInputData}
                  required
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3 text-muted"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  <i
                    className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}
                    aria-hidden="true"
                  />
                </button>
                <div className="invalid-feedback">
                  Password must be at least 6 characters.
                </div>
              </div>
            </div>

            {/* Remember me */}
            <div className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>

            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Signing in…
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right" aria-hidden="true" />{" "}
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* <div className="auth-footer">
            New here? <Link to="/register">Create an account</Link>
          </div> */}
        </section>
      </main>
    </>
  );
}
