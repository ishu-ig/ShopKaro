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

// The three roles this app supports at signup. Shop accounts start
// out as a simple record with role "Shop" — full shop
// details (menu, hours, seating, etc.) get filled in afterward in a
// separate "complete your shop profile" step, not here.
//
// NOTE: `value` is the internal UI role used for conditional logic in this
// component ("Shop" / "DeliveryBoy"). `dbRole` is the literal string
// sent to the backend in the payload's `role` field.
//
// dbRole for delivery partners MUST be exactly "DeliveryBoy" (capital D,
// capital B) — it has to match both the User schema's enum
// (["Buyer","DeliveryBoy"]) and the PUBLIC_SELF_ASSIGNABLE_ROLES whitelist
// in userController.js's createRecord, character for character. Anything
// else (e.g. "deliveryBoy") silently falls through to the "Buyer" default.
const ROLE_OPTIONS = [
  {
    value: "shop",
    label: "Shop",
    icon: "bi-shop",
    apiPath: "shop",
    dbRole: "shop",
  },
  {
    value: "DeliveryBoy",
    label: "Delivery Partner",
    icon: "bi-bicycle",
    apiPath: "deliveryBoy",
    dbRole: "DeliveryBoy",
  },
];

export default function SignupPage() {
  const navigate = useNavigate();

  const [role,            setRole]            = useState("shop");
  const [name,            setName]            = useState("");   // full name, or shop name if role === "Shop"
  const [ownerName,       setOwnerName]       = useState("");   // only used when role === "Shop"
  const [username,        setUsername]        = useState("");
  const [email,           setEmail]           = useState("");
  const [phone,           setPhone]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms,           setTerms]           = useState(false);
  const [validated,       setValidated]       = useState(false);
  const [error,           setError]           = useState("");

  // "idle" | "checking" | "available" | "taken" | "error"
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const usernameTimer = useRef(null);

  // "idle" | "checking" | "available" | "taken" | "error"
  const [emailStatus, setEmailStatus] = useState("idle");
  const emailTimer = useRef(null);

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
  // Note: shops don't have a username field in the schema, so skip
  // the check entirely for that role to avoid hitting an endpoint that
  // will never resolve "available" for them.
function handleUsernameChange(e) {
    const value = e.target.value.toLowerCase().replace(/\s/g, "");
    setUsername(value);
    setUsernameStatus("idle");

    clearTimeout(usernameTimer.current);
    if (!value || value.length < 3 || role === "shop") return;

    setUsernameStatus("checking");
    usernameTimer.current = setTimeout(async () => {
      try {
        const selectedRole = ROLE_OPTIONS.find((opt) => opt.value === role);
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/${selectedRole.apiPath}/check-username?username=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        setUsernameStatus(data.available ? "available" : "taken");
      } catch {
        setUsernameStatus("error");
      }
    }, 600);
}

  function handlePhoneChange(e) {
    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
    setError("");
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ── Email availability check (debounced 600 ms) ───────────────────────────
  // Email is unique across BOTH the Shop and User (Delivery Boy)
  // collections on the backend, so it doesn't matter which role's
  // check-email endpoint we hit — they both check both collections.
  function handleEmailChange(e) {
    const value = e.target.value;
    setEmail(value);
    setError("");
    setEmailStatus("idle");

    clearTimeout(emailTimer.current);
    if (!EMAIL_RE.test(value)) return;

    setEmailStatus("checking");
    emailTimer.current = setTimeout(async () => {
      try {
        const selectedRole = ROLE_OPTIONS.find((opt) => opt.value === role);
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/${selectedRole.apiPath}/check-email?email=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        // Expects: { available: true } or { available: false }
        setEmailStatus(data.available ? "available" : "taken");
      } catch {
        setEmailStatus("error");
      }
    }, 600);
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setValidated(true);
    if (!e.target.checkValidity()) return;

    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role !== "shop") {
      if (usernameStatus === "taken") {
        setError("That username is already taken. Please choose another.");
        return;
      }
      if (usernameStatus === "checking") {
        setError("Please wait while we check username availability.");
        return;
      }
    }

    if (emailStatus === "taken") {
      setError("An account with this email address already exists.");
      return;
    }
    if (emailStatus === "checking") {
      setError("Please wait while we check email availability.");
      return;
    }

    const selectedRole = ROLE_OPTIONS.find((opt) => opt.value === role);

    // Build a payload matching each backend schema's actual fields.
    // Shop has no `username` field; User/Delivery Boy have no `ownerName`.
    // The `role` sent here is `selectedRole.dbRole` ("shop" or
    // "deliveryBoy"), NOT the internal UI `role` state — see ROLE_OPTIONS
    // above for why, and the enum-mismatch warning there.
    const payload =
      role === "shop"
        ? { name, ownerName, email, phone, password, role: selectedRole.dbRole, active: true }
        : { name, username, email, phone, password, role: selectedRole.dbRole, active: true };

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/${selectedRole.apiPath}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const response = await res.json();
      if (response.result === "Done") {

        navigate("/login");
      } else {
        setError(
          response.reason?.email ||
          response.reason?.username ||
          response.reason?.phone ||
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
    // available: { cls: "text-success", icon: "bi-check-circle-fill", msg: "Username is available!" },
    // taken:     { cls: "text-danger",  icon: "bi-x-circle-fill",     msg: "Username is already taken." },
    error:     { cls: "text-warning", icon: "bi-exclamation-circle",msg: "Could not verify. Try again." },
  }[usernameStatus];

  const usernameInputClass = [
    "form-control",
    validated && !username ? "is-invalid" : "",
    usernameStatus === "taken"     ? "is-invalid"  : "",
    usernameStatus === "available" ? "is-valid"    : "",
  ].filter(Boolean).join(" ");

  // ── Email feedback helpers ────────────────────────────────────────────────
  const emailFeedback = {
    idle:      null,
    checking:  { cls: "text-muted",   icon: "bi-arrow-repeat spin", msg: "Checking availability…" },
    // available: { cls: "text-success", icon: "bi-check-circle-fill", msg: "Email is available!" },
    // taken:     { cls: "text-danger",  icon: "bi-x-circle-fill",     msg: "An account with this email already exists." },
    error:     { cls: "text-warning", icon: "bi-exclamation-circle",msg: "Could not verify. Try again." },
  }[emailStatus];

  const emailInputClass = [
    "form-control",
    validated && !email ? "is-invalid" : "",
    emailStatus === "taken"     ? "is-invalid" : "",
    emailStatus === "available" ? "is-valid"   : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <style>{`
        .spin { animation: spin .8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
        .auth-card {
          max-width: 500px !important;
          width: 100% !important;
        }
        .auth-card--wide {
          max-width: 700px !important;
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
        {/* auth-card--wide gives this form (many more fields than login)
            extra breathing room, which the two-column field grid below
            actually puts to use instead of leaving empty space. */}
        <section className="auth-card auth-card--wide">

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
              <p className="text-muted mb-0">Create your account.</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 mb-3 d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {error}
              </div>
            )}

            {/* Role selector */}
            <div className="mb-4">
              <label className="form-label d-block">I am signing up as</label>
              <div className="btn-group w-100" role="group" aria-label="Account type">
                {ROLE_OPTIONS.map((opt) => (
                  <React.Fragment key={opt.value}>
                    <input
                      type="radio"
                      className="btn-check"
                      name="role"
                      id={`role-${opt.value}`}
                      autoComplete="off"
                      checked={role === opt.value}
                      onChange={() => setRole(opt.value)}
                    />
                    <label className="btn btn-outline-primary" htmlFor={`role-${opt.value}`}>
                      <i className={`bi ${opt.icon} me-1`} aria-hidden="true"></i>
                      {opt.label}
                    </label>
                  </React.Fragment>
                ))}
              </div>
              {role === "shop" && (
                <div className="form-text mt-2">
                  You'll set up your shop's menu, hours, and location after signing up.
                </div>
              )}
            </div>

            {/* Full name / shop name + Owner name or Username */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="registerName">
                  {role === "shop" ? "Shop name" : "Full name"}
                </label>
                <input
                  className="form-control"
                  id="registerName"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={role === "shop" ? "e.g. Spice Route" : "e.g. Jane Smith"}
                  required
                />
                <div className="invalid-feedback">This field is required.</div>
              </div>

              {role === "shop" ? (
                <div className="col-md-6">
                  <label className="form-label" htmlFor="registerOwnerName">
                    Owner's name
                  </label>
                  <input
                    className="form-control"
                    id="registerOwnerName"
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="e.g. Jane Smith"
                    required
                  />
                  <div className="invalid-feedback">This field is required.</div>
                </div>
              ) : (
                <div className="col-md-6">
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
              )}
            </div>

            {/* Email + Phone — two columns on wider viewports */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="registerEmail">Email address</label>
                <input
                  className={emailInputClass}
                  id="registerEmail"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  required
                />
                <div className="invalid-feedback">
                  {emailStatus === "taken"
                    ? "An account with this email already exists."
                    : "Enter a valid email."}
                </div>
                {emailStatus === "available" && (
                  <div className="valid-feedback">Email is available!</div>
                )}
                {/* Live status badge (below the input) */}
                {emailFeedback && (
                  <div className={`d-flex align-items-center gap-1 mt-1 small ${emailFeedback.cls}`}>
                    <i className={`bi ${emailFeedback.icon}`}></i>
                    {emailFeedback.msg}
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="registerPhone">Phone number</label>
                <input
                  className={`form-control${validated && phone.length !== 10 ? " is-invalid" : ""}`}
                  id="registerPhone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="10-digit mobile number"
                  pattern="\d{10}"
                  maxLength={10}
                  required
                />
                <div className="invalid-feedback">Enter a valid 10-digit phone number.</div>
              </div>
            </div>

            {/* Password + Confirm Password — two columns on wider viewports */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="registerPassword">Password</label>
                <input
                  className="form-control"
                  id="registerPassword"
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="Min. 8 characters"
                  required
                />
                <div className="invalid-feedback">Min 8 chars, include uppercase, lowercase and a number.</div>
              </div>

              <div className="col-md-6">
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
              disabled={
                usernameStatus === "checking" || usernameStatus === "taken" ||
                emailStatus === "checking"    || emailStatus === "taken"
              }
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