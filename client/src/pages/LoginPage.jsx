import React, { useEffect, useRef, useState } from "react";
import HeroSection from "../Components/HeroSection";
import { Link, useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .auth-root {
    min-height: 100vh;
    background: #f7f4ef;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 20px 100px;
    position: relative;
    overflow: hidden;
  }
  .auth-root::before {
    content: '';
    position: absolute;
    top: -200px; right: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%);
    pointer-events: none;
  }
  .auth-card {
    width: 100%;
    max-width: 440px;
    background: #ffffff;
    border: 1px solid rgba(201,168,76,0.18);
    border-radius: 20px;
    padding: 48px 44px;
    position: relative;
    box-shadow: 0 4px 28px rgba(13,27,42,0.08);
    animation: cardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .auth-card::before {
    content: '';
    position: absolute;
    top: 0; left: 44px; right: 44px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #c9a84c, transparent);
  }
  .auth-brand { text-align: center; margin-bottom: 28px; }
  .auth-brand-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px; height: 48px;
    border: 1px solid rgba(201,168,76,0.4);
    border-radius: 50%;
    margin-bottom: 16px;
    color: #c9a84c;
  }
  .auth-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem;
    font-weight: 300;
    color: #0d1b2a;
    letter-spacing: 0.5px;
    margin: 0 0 6px;
    line-height: 1.2;
  }
  .auth-title em { font-style: italic; color: #c9a84c; }
  .auth-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 300;
    color: rgba(13,27,42,0.45);
    letter-spacing: 1px;
    text-transform: none;
    margin: 0;
  }

  /* Method tabs */
  .auth-tabs {
    display: flex;
    background: #faf8f4;
    border: 1.5px solid #e8e0d0;
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 26px;
    gap: 4px;
  }
  .auth-tab-btn {
    flex: 1;
    background: none;
    border: none;
    border-radius: 8px;
    padding: 9px 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.4px;
    color: #999;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .auth-tab-btn.active {
    background: #0d1b2a;
    color: #c9a84c;
  }
  .auth-tab-btn:hover:not(.active) { color: #0d1b2a; }

  .auth-field { margin-bottom: 20px; }
  .auth-label {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(13,27,42,0.55);
    margin-bottom: 8px;
  }
  .auth-input {
    width: 100%;
    background: #faf8f4;
    border: 1.5px solid #e8e0d0;
    border-radius: 10px;
    padding: 13px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #1a1a1a;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }
  .auth-input::placeholder { color: #bbb; }
  .auth-input:focus {
    border-color: #c9a84c;
    background: #ffffff;
  }
  .auth-input.error { border-color: rgba(220,53,69,0.5); }
  .auth-input-wrap { position: relative; }
  .auth-input-wrap .auth-input { padding-right: 48px; }
  .auth-eye {
    position: absolute;
    right: 14px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    color: #999;
    cursor: pointer;
    padding: 4px;
    transition: color 0.2s;
  }
  .auth-eye:hover { color: #c9a84c; }
  .auth-phone-wrap { display: flex; gap: 10px; }
  .auth-phone-prefix {
    flex-shrink: 0;
    width: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #faf8f4;
    border: 1.5px solid #e8e0d0;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #0d1b2a;
  }
  .auth-otp-input {
    letter-spacing: 8px;
    font-size: 20px;
    font-weight: 700;
    text-align: center;
  }
  .auth-error {
    background: rgba(220,53,69,0.08);
    border: 1px solid rgba(220,53,69,0.18);
    border-radius: 10px;
    padding: 10px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: #dc3545;
    margin-bottom: 20px;
  }
  .auth-phone-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #faf8f4;
    border: 1.5px solid #e8e0d0;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 22px;
    font-family: 'DM Sans', sans-serif;
  }
  .auth-phone-display-num { font-size: 14px; font-weight: 600; color: #0d1b2a; }
  .auth-phone-display-change {
    background: none; border: none; padding: 0;
    font-size: 11px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    color: #c9a84c; cursor: pointer;
  }
  .auth-phone-display-change:hover { color: #0d1b2a; }
  .auth-resend-row { display: flex; justify-content: center; margin-bottom: 24px; }
  .auth-resend-text { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #999; }
  .auth-resend-btn {
    background: none; border: none; padding: 0;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 700;
    color: #c9a84c;
    cursor: pointer;
  }
  .auth-resend-btn:hover { color: #0d1b2a; }
  .auth-resend-btn:disabled { color: #ccc; cursor: not-allowed; }
  .auth-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
  }
  .auth-check-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 400;
    color: #666;
    cursor: pointer;
  }
  .auth-check { width: 14px; height: 14px; accent-color: #c9a84c; cursor: pointer; }
  .auth-btn-primary {
    width: 100%;
    background: #c9a84c;
    color: #000;
    border: none;
    border-radius: 10px;
    padding: 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.15s;
    margin-bottom: 16px;
  }
  .auth-btn-primary:hover:not(:disabled) { background: #0d1b2a; color: #c9a84c; transform: translateY(-1px); }
  .auth-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
  .auth-divider { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
  .auth-divider-line { flex: 1; height: 1px; background: #f0ece4; }
  .auth-divider-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    color: #bbb;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .auth-social { display: flex; gap: 10px; margin-bottom: 28px; }
  .auth-btn-social {
    flex: 1;
    background: #faf8f4;
    border: 1.5px solid #e8e0d0;
    border-radius: 10px;
    padding: 11px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: border-color 0.2s, color 0.2s;
  }
  .auth-btn-social:hover { border-color: #c9a84c; color: #0d1b2a; }
  .auth-links { display: flex; justify-content: center; gap: 6px; align-items: center; flex-wrap: wrap; }
  .auth-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #c9a84c;
    text-decoration: none;
    letter-spacing: 0.5px;
    transition: color 0.2s;
    border-bottom: 1px solid transparent;
  }
  .auth-link:hover { color: #0d1b2a; border-bottom-color: rgba(13,27,42,0.3); }
  .auth-links-hint { font-size: 11px; color: #999; font-family: 'DM Sans', sans-serif; }
`;

const RESEND_SECONDS = 30;

export default function LoginPage() {
  const navigate = useNavigate();

  // "otp" | "password"
  const [method, setMethod] = useState("password");

  // ── OTP flow state ──
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  // ── Password flow state ──
  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  // ── Shared state ──
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (resendTimer <= 0) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [resendTimer]);

  function switchMethod(next) {
    setMethod(next);
    setErrorMessage("");
    setStep("phone");
    setOtp("");
    clearInterval(timerRef.current);
    setResendTimer(0);
  }

  function isValidPhone(value) {
    return /^\d{10}$/.test(value); // matches backend's 10-digit check
  }

  // ── OTP: send ──
  async function sendOtp(e) {
    if (e) e.preventDefault();
    setErrorMessage("");
    if (!isValidPhone(phone)) {
      setErrorMessage("Enter a valid 10-digit phone number.");
      return;
    }
    setLoading(true);
    try {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/user/otpSend`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ phone }),
        },
      );
      response = await response.json();
      if (response.result === "Done") {
        setStep("otp");
        setOtp("");
        setResendTimer(RESEND_SECONDS);
      } else {
        setErrorMessage(
          response.reason || "Could not send OTP. Please try again.",
        );
      }
    } catch {
      setErrorMessage("Internal server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── OTP: verify ──
  async function verifyOtp(e) {
    e.preventDefault();
    setErrorMessage("");
    if (!/^\d{4,6}$/.test(otp)) {
      setErrorMessage("Enter the OTP sent to your phone.");
      return;
    }
    setLoading(true);
    try {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/user/validateOtp`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ phone, otp }),
        },
      );
      response = await response.json();
      handleAuthResponse(response);
    } catch {
      setErrorMessage("Internal server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function changePhone() {
    setStep("phone");
    setOtp("");
    setErrorMessage("");
    clearInterval(timerRef.current);
    setResendTimer(0);
  }

  // ── Password login ──
  async function loginWithPassword(e) {
    e.preventDefault();
    setErrorMessage("");
    if (!identifier || !password) {
      setErrorMessage("Enter your username/email and password.");
      return;
    }
    setLoading(true);
    try {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/user/login`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ username: identifier, password }),
        },
      );
      response = await response.json();
      handleAuthResponse(response);
    } catch {
      setErrorMessage("Internal server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Shared success/failure handling for both methods ──
  // NOTE: assumes /api/user/login returns the same { result, data, token }
  // shape as /api/user/validateOtp — adjust here if it doesn't.
  function handleAuthResponse(response) {
    if (response.result === "Done" && response.data.active === false) {
      setErrorMessage("Your account is inactive. Please contact support.");
    } else if (response.result === "Done" && response.data.role === "Buyer") {
      localStorage.setItem("login", true);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("userid", response.data._id);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("token", response.token);
      navigate("/profile");
    } else if (
      response.result === "Done" &&
      (response.data.role === "Admin" || response.data.role === "Super Admin")
    ) {
      setErrorMessage("Admin accounts cannot sign in here.");
    } else {
      setErrorMessage(response.reason || "Invalid credentials.");
    }
  }

  return (
    <>
      <style>{styles}</style>
      <HeroSection title="Welcome Back" />
      <div className="auth-root">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-mark">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <circle cx="10" cy="6" r="3.5" />
                <path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7" />
              </svg>
            </div>
            <h1 className="auth-title">
              Welcome <em>Back</em>
            </h1>
            <p className="auth-subtitle">Sign in to continue</p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn${method === "password" ? " active" : ""}`}
              onClick={() => switchMethod("password")}
            >
              Username / Email
            </button>
            <button
              type="button"
              className={`auth-tab-btn${method === "otp" ? " active" : ""}`}
              onClick={() => switchMethod("otp")}
            >
              Phone + OTP
            </button>
          </div>

          {errorMessage && <div className="auth-error">{errorMessage}</div>}

          {method === "otp" ? (
            step === "phone" ? (
              <form onSubmit={sendOtp}>
                <div className="auth-field">
                  <label className="auth-label">Phone Number</label>
                  <div className="auth-phone-wrap">
                    <span className="auth-phone-prefix">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="98765 43210"
                      className={`auth-input${errorMessage ? " error" : ""}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={loading}
                >
                  {loading ? "Sending OTP…" : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp}>
                <div className="auth-phone-display">
                  <span className="auth-phone-display-num">+91 {phone}</span>
                  <button
                    type="button"
                    className="auth-phone-display-change"
                    onClick={changePhone}
                  >
                    Change
                  </button>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Enter OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="••••••"
                    className={`auth-input auth-otp-input${errorMessage ? " error" : ""}`}
                  />
                </div>

                <div className="auth-resend-row">
                  {resendTimer > 0 ? (
                    <span className="auth-resend-text">
                      Resend OTP in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="auth-resend-btn"
                      onClick={sendOtp}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={loading}
                >
                  {loading ? "Verifying…" : "Verify & Sign In"}
                </button>
              </form>
            )
          ) : (
            <form onSubmit={loginWithPassword}>
              <div className="auth-field">
                <label className="auth-label">Username or Email</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="your@email.com"
                  className={`auth-input${errorMessage ? " error" : ""}`}
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`auth-input${errorMessage ? " error" : ""}`}
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                    />
                  </button>
                </div>
              </div>

              <div className="auth-row">
                <label className="auth-check-label">
                  <input
                    type="checkbox"
                    className="auth-check"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <Link to="/forgetPassword-1" className="auth-link">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="auth-btn-primary"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          )}

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or</span>
            <div className="auth-divider-line" />
          </div>

          <div className="auth-social">
            <button type="button" className="auth-btn-social">
              <i className="fab fa-google" /> Google
            </button>
            <button type="button" className="auth-btn-social">
              <i className="fab fa-facebook" /> Facebook
            </button>
          </div>

          <div className="auth-links">
            <span className="auth-links-hint">New here?</span>
            <Link to="/signup" className="auth-link">
              Create an account →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
