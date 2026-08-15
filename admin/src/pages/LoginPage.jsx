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

// Mirrors the role options on the signup page. "user" covers Admin /
// Super Admin / Delivery Boy accounts (all live in the User collection);
// "shop" hits the separate shop login endpoint.
const ROLE_OPTIONS = [
  { value: "user", label: "Admin", icon: "bi-person-badge", apiPath: "user" },
  {
    value: "DelieryBoy",
    label: "Delivery Boy",
    icon: "bi-person-badge",
    apiPath: "deliveryBoy",
  },
  {
    value: "shop",
    label: "Shop",
    icon: "bi-shop",
    apiPath: "shop",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
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

  function getInputData(e) {
    const { name, value } = e.target;
    setError("");
    setData((old) => ({ ...old, [name]: value }));
  }

  function handleRoleChange(nextRole) {
    setRole(nextRole);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setValidated(true);
    if (!e.target.checkValidity()) return;

    const selectedRole = ROLE_OPTIONS.find((opt) => opt.value === role);

    setLoading(true);
    try {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/${selectedRole.apiPath}/login`,
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
        // FIX: was `selectedRole.apiPath === "user" || "deliveryBoy"`, which
        // is always true (a non-empty string is truthy) regardless of
        // apiPath, so the Shop branch below was unreachable. Now both
        // sides of the OR actually compare against apiPath.
        if (
          selectedRole.apiPath === "user" ||
          selectedRole.apiPath === "deliveryBoy"
        ) {
          // Explicit allow-list of the two real user-collection roles.
          const isAuthorized =
            response.data.role === "Admin" ||
            response.data.role === "DeliveryBoy";

          if (isAuthorized) {
            localStorage.setItem("login", true);
            localStorage.setItem("name", response.data.name);
            localStorage.setItem("userid", response.data._id);
            localStorage.setItem("role", response.data.role); // exact casing preserved
            localStorage.setItem("token", response.token);

            const incomplete = [
              "address",
              "state",
              "pin",
              "phone",
              "name",
              "city",
            ].some((f) => !response.data[f]);

            // "/profile" is not a registered route. App.js only defines
            // "/:role/:_id/profile". Build the real path using the role
            // that was just returned from the login response.
            navigate(
              incomplete
                ? `/${response.data.role.toLowerCase()}/${response.data._id}/profile`
                : "/",
            );
          } else {
            setError("You are not authorized to access this panel.");
            localStorage.setItem("login", false);
          }
        } else {
          // Shop login
          localStorage.setItem("login", true);
          localStorage.setItem("name", response.data.name);
          localStorage.setItem("userid", response.data._id);
          localStorage.setItem("role", selectedRole.value); // "shop"
          localStorage.setItem("token", response.token);
          navigate("/");
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
      <style>{`
        .auth-card {
          max-width: 550px !important;
          width: 100% !important;
        }
      `}</style>

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
          <Link className="auth-brand text-decoration-none" to="/">
            <span className="brand-icon">
              <i className="bi bi-cart4" aria-hidden="true"></i>
            </span>
            <span className="text-start">
              <strong className="d-block fs-5 text-body">ShopKaro</strong>
              <small className="text-muted">Enterprise Admin Portal</small>
            </span>
          </Link>

          {/* Form */}
          <form
            className={`needs-validation${validated ? " was-validated" : ""}`}
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="mb-4 text-center">
              <h2 className="h4 mb-1 fw-bold text-body">Welcome Back</h2>
              <p className="text-muted small mb-0">
                Sign in to manage products, orders, and store settings.
              </p>
            </div>

            {error && (
              <div className="alert bg-danger-subtle text-danger border border-danger-subtle py-2.5 px-3 mb-3 d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div className="small fw-semibold">{error}</div>
              </div>
            )}

            {/* Role selector segmented tabs */}
            <div className="mb-3">
              <label className="form-label d-block text-muted small text-uppercase fw-bold letter-spacing-wide">Sign In As</label>
              <div className="role-segmented-group">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`role-segmented-btn${role === opt.value ? " active" : ""}`}
                    onClick={() => handleRoleChange(opt.value)}
                  >
                    <i className={`bi ${opt.icon}`}></i>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Username */}
            <div className="mb-3">
              <label className="form-label" htmlFor="loginUserName">
                {role === "shop"
                  ? "Email Address"
                  : "Email Address or Username"}
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

          <div className="auth-footer">
            New here? <Link to="/register">Create an account</Link>
          </div>
        </section>
      </main>
    </>
  );
}