import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function ForgetPasswordPage1() {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false)

    function getInputData(e) {
        setUsername(e.target.value)
        if (errorMessage) setErrorMessage("")
    }

    async function postData(e) {
        e.preventDefault()
        if (!username.trim()) { setErrorMessage("Please enter your username or email"); return }
        setLoading(true)
        try {
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/forgetPassword-1`, {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ username })
            })
            response = await response.json()
            if (response.result === "Done") {
                localStorage.setItem("reset-password-username", username)
                navigate("/forgetPassword-2")
            } else {
                setErrorMessage("No account found with this username or email")
            }
        } catch {
            setErrorMessage("Server error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
        <style>{SHARED_STYLES}</style>
        <div className="fp-page">
            <div className="fp-split">

                {/* ── Left brand panel ── */}
                <div className="fp-brand-panel">
                    <div className="fp-brand-content">
                        <div className="fp-brand-icon">
                            <i className="fas fa-lock-open"></i>
                        </div>
                        <div className="fp-brand-title">
                            Password<br /><span>Recovery</span>
                        </div>
                        <p className="fp-brand-desc">
                            Recover access to your admin account in three quick steps. Your data stays safe throughout the process.
                        </p>
                    </div>
                    <div className="fp-brand-steps">
                        <div className="fp-brand-step active">
                            <div className="fp-brand-step-num">1</div>
                            <div>
                                <div className="fp-brand-step-title">Identify Account</div>
                                <div className="fp-brand-step-desc">Enter your username or email</div>
                            </div>
                        </div>
                        <div className="fp-brand-step-line"></div>
                        <div className="fp-brand-step">
                            <div className="fp-brand-step-num">2</div>
                            <div>
                                <div className="fp-brand-step-title">Verify OTP</div>
                                <div className="fp-brand-step-desc">Enter the code from your email</div>
                            </div>
                        </div>
                        <div className="fp-brand-step-line"></div>
                        <div className="fp-brand-step">
                            <div className="fp-brand-step-num">3</div>
                            <div>
                                <div className="fp-brand-step-title">New Password</div>
                                <div className="fp-brand-step-desc">Set a strong new password</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right form panel ── */}
                <div className="fp-form-panel">
                    <div className="fp-form-heading">Reset Password</div>
                    <div className="fp-form-subheading">Step 1 of 3 — Identify your account</div>

                    <form onSubmit={postData}>
                        <label className="lf-label">Username / Email</label>
                        <div className="lf-input-wrap">
                            <input
                                type="text"
                                value={username}
                                onChange={getInputData}
                                placeholder="Enter your username or email"
                                required
                                autoFocus
                                autoComplete="username"
                                className={`lf-input ${errorMessage ? "is-error" : ""}`}
                            />
                            <span className="lf-input-icon"><i className="fas fa-at"></i></span>
                        </div>

                        {errorMessage && (
                            <div className="lf-error-box">
                                <i className="fas fa-circle-exclamation"></i>
                                {errorMessage}
                            </div>
                        )}

                        <button type="submit" className="lf-submit-btn" disabled={loading}>
                            {loading
                                ? <><span className="spinner-border spinner-border-sm"></span> Sending OTP…</>
                                : <>Send OTP <i className="fas fa-paper-plane"></i></>
                            }
                        </button>
                    </form>

                    <div className="lf-divider">
                        <div className="lf-divider-line"></div>
                        <span className="lf-divider-text">remembered it?</span>
                        <div className="lf-divider-line"></div>
                    </div>

                    <Link to="/login" className="lf-back-btn">
                        <i className="fas fa-arrow-left"></i> Back to Login
                    </Link>
                </div>

            </div>
        </div>
        </>
    )
}

/* ─── Shared styles across all 3 pages ─────────────────────────── */
const SHARED_STYLES = `
/* ── Page wrapper ── */
.fp-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-base);
    position: fixed;
    inset: 0;
    overflow: hidden;
    padding: 20px;
    z-index: 9999;
}
.fp-page::before {
    content: '';
    position: fixed;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%);
    top: -100px; left: -150px;
    border-radius: 50%;
    pointer-events: none;
}
.fp-page::after {
    content: '';
    position: fixed;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(56,239,195,0.06) 0%, transparent 70%);
    bottom: -100px; right: -100px;
    border-radius: 50%;
    pointer-events: none;
}

/* ── Split container ── */
.fp-split {
    display: flex;
    width: 100%;
    max-width: 900px;
    min-height: 560px;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px var(--border);
    position: relative;
    z-index: 1;
    animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes fadeUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
}

/* ── Left brand panel ── */
.fp-brand-panel {
    flex: 0 0 340px;
    background: linear-gradient(145deg, #0d1a3a 0%, #0a1628 50%, #06101e 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 40px;
    position: relative;
    overflow: hidden;
    border-right: 1px solid var(--border);
}
.fp-brand-panel::before {
    content: '';
    position: absolute; inset: 0;
    background:
        radial-gradient(ellipse at 20% 20%, rgba(79,142,247,0.15) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 80%, rgba(56,239,195,0.1) 0%, transparent 60%);
}
.fp-brand-panel::after {
    content: '';
    position: absolute; inset: 0;
    background-image:
        linear-gradient(rgba(79,142,247,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(79,142,247,0.06) 1px, transparent 1px);
    background-size: 32px 32px;
}
.fp-brand-content { position: relative; z-index: 1; }
.fp-brand-icon {
    width: 56px; height: 56px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; color: #fff;
    box-shadow: 0 8px 24px rgba(79,142,247,0.4);
    margin-bottom: 28px;
}
.fp-brand-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800;
    color: var(--text-primary);
    line-height: 1.2; margin-bottom: 14px;
    letter-spacing: -0.02em;
}
.fp-brand-title span {
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
.fp-brand-desc {
    font-size: 13.5px; color: var(--text-secondary); line-height: 1.7;
}

/* ── Left panel step list ── */
.fp-brand-steps {
    position: relative; z-index: 1;
    display: flex; flex-direction: column;
    gap: 0;
}
.fp-brand-step {
    display: flex; align-items: flex-start; gap: 14px;
}
.fp-brand-step-num {
    width: 30px; height: 30px; border-radius: 50%;
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
    color: var(--text-muted);
    flex-shrink: 0;
    transition: all 0.3s;
}
.fp-brand-step.active .fp-brand-step-num {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
    box-shadow: 0 0 0 4px rgba(79,142,247,0.2);
}
.fp-brand-step.done .fp-brand-step-num {
    background: rgba(56,239,145,0.15);
    border-color: var(--accent-success);
    color: var(--accent-success);
}
.fp-brand-step-title {
    font-size: 13px; font-weight: 700;
    color: var(--text-secondary);
    line-height: 1.3;
}
.fp-brand-step.active .fp-brand-step-title { color: var(--text-primary); }
.fp-brand-step.done .fp-brand-step-title   { color: var(--accent-success); }
.fp-brand-step-desc {
    font-size: 11.5px; color: var(--text-muted); margin-top: 2px;
}
.fp-brand-step-line {
    width: 2px; height: 20px;
    background: var(--border);
    border-radius: 2px;
    margin: 5px 0 5px 14px;
}
.fp-brand-step-line.done { background: var(--accent-success); }

/* ── Right form panel ── */
.fp-form-panel {
    flex: 1;
    background: var(--bg-surface);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 52px 48px;
}
.fp-form-heading {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
    letter-spacing: -0.01em;
}
.fp-form-subheading {
    font-size: 13.5px; color: var(--text-secondary);
    margin-bottom: 32px;
}

/* ── Shared form element styles (same names as LoginPage) ── */
.lf-label {
    display: block;
    font-size: 11.5px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--text-secondary);
    margin-bottom: 7px;
}
.lf-input-wrap {
    position: relative;
    margin-bottom: 18px;
}
.lf-input-icon {
    position: absolute;
    left: 14px; top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted); font-size: 13px;
    z-index: 2; transition: color 0.2s;
    pointer-events: none;
}
.lf-input-wrap:focus-within .lf-input-icon { color: var(--accent); }
.lf-input {
    width: 100%;
    background: var(--bg-card) !important;
    border: 1px solid var(--border) !important;
    color: var(--text-primary) !important;
    border-radius: 10px !important;
    font-size: 13.5px;
    padding: 11px 14px 11px 40px !important;
    transition: var(--transition);
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
}
.lf-input:focus {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px var(--accent-glow) !important;
    background: #131929 !important;
}
.lf-input::placeholder { color: var(--text-muted) !important; }
.lf-input.is-error { border-color: rgba(247,95,95,0.45) !important; }

/* password right padding */
.lf-input.has-eye { padding-right: 44px !important; }

.lf-eye-btn {
    position: absolute;
    right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    color: var(--text-muted); cursor: pointer;
    padding: 4px 6px; font-size: 13px;
    transition: color 0.2s; line-height: 1;
}
.lf-eye-btn:hover { color: var(--accent); }

.lf-error-box {
    display: flex; align-items: center; gap: 9px;
    background: rgba(247,95,95,0.08);
    border: 1px solid rgba(247,95,95,0.25);
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 13px; color: #FCA5A5;
    margin-bottom: 18px;
    animation: shake 0.35s ease;
}
@keyframes shake {
    0%,100% { transform: translateX(0); }
    25%  { transform: translateX(-4px); }
    75%  { transform: translateX(4px); }
}

.lf-submit-btn {
    width: 100%;
    padding: 12px 20px;
    background: linear-gradient(135deg, var(--accent) 0%, #3a7de0 100%);
    border: none; border-radius: 10px;
    color: #fff; font-size: 14px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: var(--transition);
    box-shadow: 0 6px 20px rgba(79,142,247,0.35);
    display: flex; align-items: center; justify-content: center; gap: 8px;
    letter-spacing: 0.01em;
    margin-bottom: 24px;
}
.lf-submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(79,142,247,0.5);
}
.lf-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

.lf-divider {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px;
}
.lf-divider-line  { flex: 1; height: 1px; background: var(--border); }
.lf-divider-text  {
    font-size: 11px; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap;
}

/* Back to login button — mirrors lf-social-btn */
.lf-back-btn {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 10px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text-secondary);
    font-size: 13px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: var(--transition);
    text-decoration: none;
}
.lf-back-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
    border-color: rgba(255,255,255,0.15);
}

/* ── OTP boxes (page 2) ── */
.lf-otp-row {
    display: flex; gap: 10px;
    margin-bottom: 18px;
}
.lf-otp-box {
    flex: 1;
    height: 58px;
    text-align: center;
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 700;
    color: var(--text-primary);
    background: var(--bg-card) !important;
    border: 1px solid var(--border) !important;
    border-radius: 10px;
    outline: none;
    transition: all 0.2s;
    caret-color: var(--accent);
}
.lf-otp-box:focus {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px var(--accent-glow) !important;
    background: #131929 !important;
}
.lf-otp-box.filled    { border-color: rgba(79,142,247,0.5) !important; background: rgba(79,142,247,0.06) !important; }
.lf-otp-box.is-error  { border-color: rgba(247,95,95,0.45) !important; }

/* ── Hint box (page 2) ── */
.lf-hint-box {
    display: flex; align-items: center; gap: 10px;
    background: rgba(79,142,247,0.06);
    border: 1px solid rgba(79,142,247,0.2);
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 13px; color: var(--text-secondary);
    margin-bottom: 24px;
}
.lf-hint-box i { color: var(--accent); flex-shrink: 0; }
.lf-hint-box strong { color: var(--text-primary); }

/* ── Resend row (page 2) ── */
.lf-resend-row {
    text-align: center;
    font-size: 13px; color: var(--text-secondary);
    margin-bottom: 24px;
}
.lf-resend-btn {
    background: none; border: none;
    color: var(--accent); font-size: 13px; font-weight: 600;
    cursor: pointer; text-decoration: underline;
    font-family: 'Plus Jakarta Sans', sans-serif; padding: 0;
}
.lf-resend-btn:hover { color: #3a7de0; }

/* ── Password strength (page 3) ── */
.lf-strength-wrap { margin-bottom: 6px; }
.lf-strength-bars { display: flex; gap: 5px; margin-bottom: 4px; }
.lf-strength-bar  { flex: 1; height: 4px; border-radius: 4px; transition: background 0.3s; }
.lf-strength-label { font-size: 11px; font-weight: 700; }

.lf-rules {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 7px 12px; padding: 12px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px; margin-bottom: 18px;
}
.lf-rule {
    font-size: 11.5px; color: var(--text-muted);
    display: flex; align-items: center; gap: 6px;
    transition: color 0.25s;
}
.lf-rule.met { color: var(--accent-success); }
.lf-rule i { font-size: 10px; }

/* ── Match indicator ── */
.lf-match-icon {
    position: absolute; right: 38px; top: 50%;
    transform: translateY(-50%);
    color: var(--accent-success); font-size: 14px;
    pointer-events: none;
}

/* ── Responsive ── */
@media (max-width: 700px) {
    .fp-brand-panel { display: none; }
    .fp-form-panel  { padding: 40px 28px; }
    .fp-split       { max-width: 440px; }
}
@media (max-width: 420px) {
    .lf-otp-box { height: 50px; font-size: 18px; }
    .lf-otp-row { gap: 7px; }
    .lf-rules   { grid-template-columns: 1fr; }
}
`