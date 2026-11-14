import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const BASE = process.env.REACT_APP_BACKEND_SERVER || ""
const ROLES = ["user", "deliveryBoy"]
const RESEND_COOLDOWN = 30 // seconds

// ── API helper ────────────────────────────────────────────────────────────────
async function callApi(role, step, body) {
    const res = await fetch(`${BASE}/api/${role}/forgetPassword-${step}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
    })
    return res.json()
}

// ── Password strength helper ──────────────────────────────────────────────────
function getStrength(p) {
    if (!p) return { score: 0, label: "", color: "" }
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    const map = [
        { label: "Too short", color: "var(--admin-danger)" },
        { label: "Weak", color: "var(--admin-danger)" },
        { label: "Fair", color: "var(--admin-warning)" },
        { label: "Good", color: "var(--admin-success)" },
        { label: "Strong", color: "#22c55e" },
    ]
    return { score, ...map[score] }
}

// ── Small shared label ────────────────────────────────────────────────────────
function FieldLabel({ children }) {
    return (
        <label className="form-label fw-semibold fp-label">
            {children}
        </label>
    )
}

// ── Step indicator (left panel) ───────────────────────────────────────────────
function StepList({ step }) {
    const steps = [
        { label: "Identify Account", desc: "Enter your username or email" },
        { label: "Verify OTP", desc: "Enter the code from your email" },
        { label: "New Password", desc: "Set a strong new password" },
    ]
    return (
        <div className="fp-steps">
            {steps.map((s, i) => {
                const done = i + 1 < step
                const active = i + 1 === step
                return (
                    <React.Fragment key={i}>
                        <div className={`fp-step ${active ? "fp-step--active" : ""} ${done ? "fp-step--done" : ""}`}>
                            <div className="fp-step__num">
                                {done
                                    ? <i className="bi bi-check" style={{ fontSize: 11 }}></i>
                                    : i + 1}
                            </div>
                            <div>
                                <div className="fp-step__title">{s.label}</div>
                                <div className="fp-step__desc">{s.desc}</div>
                            </div>
                        </div>
                        {i < 2 && <div className={`fp-step__line ${done ? "fp-step__line--done" : ""}`}></div>}
                    </React.Fragment>
                )
            })}
        </div>
    )
}

// ── Step 1: Identify Account ──────────────────────────────────────────────────
function Step1({ onNext }) {
    const [username, setUsername] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false)

    async function postData(e) {
        e.preventDefault()
        const name = username.trim()
        if (!name) { setErrorMessage("Please enter your username or email."); return }
        if (!BASE) { setErrorMessage("Backend server is not configured."); return }

        setLoading(true)
        try {
            // Try each account type in turn; remember which one matched
            let matchedRole = null
            for (const role of ROLES) {
                const response = await callApi(role, 1, { username: name })
                if (response.result === "Done") {
                    matchedRole = role
                    break
                }
            }

            if (matchedRole) {
                onNext({ username: name, role: matchedRole })
            } else {
                setErrorMessage("No account found with this username or email.")
            }
        } catch {
            setErrorMessage("Server error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fp-form">
            <p className="eyebrow mb-1">Step 1 of 3</p>
            <h2 className="h4 fw-bold mb-1">Identify Account</h2>
            <p className="text-muted mb-4" style={{ fontSize: 13.5 }}>Enter your username or email to receive an OTP.</p>

            <form onSubmit={postData}>
                <div className="mb-3">
                    <FieldLabel>Username / Email</FieldLabel>
                    <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-at"></i></span>
                        <input
                            type="text"
                            className={`form-control ${errorMessage ? "is-invalid" : ""}`}
                            value={username}
                            onChange={e => { setUsername(e.target.value); setErrorMessage("") }}
                            placeholder="Enter your username or email"
                            autoComplete="username"
                            required
                            autoFocus
                        />
                    </div>
                    {errorMessage && <div className="invalid-feedback d-block">{errorMessage}</div>}
                </div>

                <button className="btn btn-primary w-100 mb-4" type="submit" disabled={loading}>
                    {loading
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending OTP…</>
                        : <><i className="bi bi-send me-2"></i>Send OTP</>}
                </button>
            </form>

            <div className="fp-divider"><span>remembered it?</span></div>
            <Link to="/login" className="btn btn-outline-secondary w-100 mt-3">
                <i className="bi bi-arrow-left me-2"></i>Back to Login
            </Link>
        </div>
    )
}

// ── Step 2: Verify OTP ────────────────────────────────────────────────────────
function Step2({ ctx, onNext, onBack }) {
    const EMPTY = ["", "", "", "", "", ""]
    const [otp, setOtp] = useState(EMPTY)
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
    const [resentOk, setResentOk] = useState(false)
    const inputs = useRef([])

    // Cooldown timer (starts right after the first OTP was sent)
    useEffect(() => {
        if (cooldown <= 0) return
        const t = setTimeout(() => setCooldown(c => c - 1), 1000)
        return () => clearTimeout(t)
    }, [cooldown])

    function handleChange(e, idx) {
        const val = e.target.value.replace(/\D/g, "").slice(-1)
        const next = [...otp]
        next[idx] = val
        setOtp(next)
        setErrorMessage("")
        if (val && idx < 5) inputs.current[idx + 1]?.focus()
    }

    function handleKeyDown(e, idx) {
        if (e.key === "Backspace" && !otp[idx] && idx > 0)
            inputs.current[idx - 1]?.focus()
    }

    function handlePaste(e) {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        if (!pasted) return
        const next = [...EMPTY]
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
        setOtp(next)
        setErrorMessage("")
        inputs.current[Math.min(pasted.length, 5)]?.focus()
    }

    async function postData(e) {
        e.preventDefault()
        const otpVal = otp.join("")
        if (otpVal.length < 6) { setErrorMessage("Please enter the complete 6-digit OTP."); return }
        setLoading(true)
        try {
            const response = await callApi(ctx.role, 2, { username: ctx.username, otp: otpVal })
            if (response.result === "Done") {
                // Keep the verified OTP (and a reset token, if backend returns one) for Step 3
                onNext({ otp: otpVal, token: response.token || response.resetToken || "" })
            } else {
                setErrorMessage(response.reason || "Invalid OTP. Please try again.")
                setOtp(EMPTY)
                inputs.current[0]?.focus()
            }
        } catch {
            setErrorMessage("Server error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    async function handleResend() {
        setResending(true)
        setErrorMessage("")
        try {
            const response = await callApi(ctx.role, 1, { username: ctx.username })
            if (response.result === "Done") {
                setResentOk(true)
                setCooldown(RESEND_COOLDOWN)
                setOtp(EMPTY)
                inputs.current[0]?.focus()
                setTimeout(() => setResentOk(false), 4000)
            } else {
                setErrorMessage(response.reason || "Could not resend OTP. Please try again.")
            }
        } catch {
            setErrorMessage("Could not resend OTP. Please try again.")
        } finally {
            setResending(false)
        }
    }

    const otpFilled = otp.join("").length === 6

    return (
        <div className="fp-form">
            <p className="eyebrow mb-1">Step 2 of 3</p>
            <h2 className="h4 fw-bold mb-1">Verify OTP</h2>
            <p className="text-muted mb-3" style={{ fontSize: 13.5 }}>Enter the 6-digit code sent to your email.</p>

            <div className="alert alert-primary py-2 d-flex align-items-center gap-2 mb-4" style={{ fontSize: 13 }}>
                <i className="bi bi-envelope"></i>
                OTP sent to: <strong>{ctx.username}</strong>
            </div>

            <form onSubmit={postData}>
                <FieldLabel>One-Time Password</FieldLabel>
                <div className="fp-otp-row mb-3" onPaste={handlePaste}>
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={el => (inputs.current[i] = el)}
                            type="text"
                            inputMode="numeric"
                            autoComplete={i === 0 ? "one-time-code" : "off"}
                            maxLength={1}
                            value={digit}
                            aria-label={`OTP digit ${i + 1}`}
                            onChange={e => handleChange(e, i)}
                            onKeyDown={e => handleKeyDown(e, i)}
                            onFocus={e => e.target.select()}
                            className={`form-control fp-otp-box ${errorMessage ? "is-invalid" : digit ? "fp-otp-box--filled" : ""}`}
                            autoFocus={i === 0}
                        />
                    ))}
                </div>

                {errorMessage && (
                    <div className="alert alert-danger py-2 d-flex align-items-center gap-2 mb-3" style={{ fontSize: 13 }}>
                        <i className="bi bi-exclamation-triangle-fill"></i>{errorMessage}
                    </div>
                )}

                <div className="text-center mb-4" style={{ fontSize: 13, color: "var(--admin-muted)" }}>
                    {resentOk ? (
                        <span className="text-success"><i className="bi bi-check-circle-fill me-1"></i>OTP resent successfully</span>
                    ) : cooldown > 0 ? (
                        <>Resend OTP in <strong>{cooldown}s</strong></>
                    ) : (
                        <>Didn't receive it?{" "}
                            <button type="button" className="btn btn-link btn-sm p-0 fw-semibold"
                                onClick={handleResend} disabled={resending}>
                                {resending ? "Sending…" : "Resend OTP"}
                            </button>
                        </>
                    )}
                </div>

                <button className="btn btn-primary w-100 mb-4" type="submit" disabled={loading || !otpFilled}>
                    {loading
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Verifying…</>
                        : <><i className="bi bi-shield-check me-2"></i>Verify OTP</>}
                </button>
            </form>

            <div className="fp-divider"><span>wrong account?</span></div>
            <button type="button" className="btn btn-outline-secondary w-100 mt-3" onClick={onBack}>
                <i className="bi bi-arrow-left me-2"></i>Change Account
            </button>
        </div>
    )
}

// ── Step 3: New Password ──────────────────────────────────────────────────────
function Step3({ ctx }) {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [password, setPassword] = useState("")
    const [cpassword, setCpassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false)

    async function postData(e) {
        e.preventDefault()
        if (!password) { setErrorMessage("Please enter a new password."); return }
        if (password.length < 8) { setErrorMessage("Password must be at least 8 characters."); return }
        if (password !== cpassword) { setErrorMessage("Passwords do not match."); return }
        setLoading(true)
        try {
            // OTP and token are sent again so the backend can re-validate them
            const response = await callApi(ctx.role, 3, {
                username: ctx.username,
                password,
                otp: ctx.otp,
                token: ctx.token
            })
            if (response.result === "Done") {
                navigate("/login")
            } else {
                const reason = response.reason
                setErrorMessage((Array.isArray(reason) ? reason[0] : reason) || "Something went wrong.")
            }
        } catch {
            setErrorMessage("Server error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const strength = getStrength(password)
    const passwordsMatch = cpassword && password === cpassword

    const rules = [
        { label: "8+ characters", met: password.length >= 8 },
        { label: "Uppercase letter", met: /[A-Z]/.test(password) },
        { label: "Number", met: /[0-9]/.test(password) },
        { label: "Special char", met: /[^A-Za-z0-9]/.test(password) },
    ]

    return (
        <div className="fp-form">
            <p className="eyebrow mb-1">Step 3 of 3</p>
            <h2 className="h4 fw-bold mb-1">Create New Password</h2>
            <p className="text-muted mb-4" style={{ fontSize: 13.5 }}>Choose a strong password for your account.</p>

            <form onSubmit={postData}>
                {/* New Password */}
                <div className="mb-2">
                    <FieldLabel>New Password</FieldLabel>
                    <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-lock"></i></span>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setErrorMessage("") }}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            required autoFocus
                        />
                        <button type="button" className="input-group-text" style={{ cursor: "pointer" }}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword(v => !v)}>
                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                    </div>
                </div>

                {/* Strength bars */}
                {password && (
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="d-flex gap-1 flex-grow-1">
                            {[1, 2, 3, 4].map(n => (
                                <div key={n} style={{
                                    flex: 1, height: 4, borderRadius: 4,
                                    background: n <= strength.score ? strength.color : "var(--admin-border)",
                                    transition: "background 0.3s"
                                }}></div>
                            ))}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: strength.color, whiteSpace: "nowrap" }}>
                            {strength.label}
                        </span>
                    </div>
                )}

                {/* Confirm Password */}
                <div className="mb-3">
                    <FieldLabel>Confirm Password</FieldLabel>
                    <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                        <input
                            type={showConfirm ? "text" : "password"}
                            className={`form-control ${cpassword && !passwordsMatch ? "is-invalid" : passwordsMatch ? "is-valid" : ""}`}
                            value={cpassword}
                            onChange={e => { setCpassword(e.target.value); setErrorMessage("") }}
                            placeholder="Re-enter new password"
                            autoComplete="new-password"
                            required
                        />
                        <button type="button" className="input-group-text" style={{ cursor: "pointer" }}
                            aria-label={showConfirm ? "Hide confirmation" : "Show confirmation"}
                            onClick={() => setShowConfirm(v => !v)}>
                            <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                    </div>
                    {cpassword && !passwordsMatch && <div className="invalid-feedback d-block">Passwords do not match.</div>}
                    {passwordsMatch && <div className="valid-feedback d-block">Passwords match!</div>}
                </div>

                {/* Rules */}
                {password && (
                    <div className="fp-rules mb-3">
                        {rules.map(r => (
                            <span key={r.label} className={`fp-rule ${r.met ? "fp-rule--met" : ""}`}>
                                <i className={`bi ${r.met ? "bi-check-circle-fill" : "bi-circle"}`}></i>
                                {r.label}
                            </span>
                        ))}
                    </div>
                )}

                {errorMessage && (
                    <div className="alert alert-danger py-2 d-flex align-items-center gap-2 mb-3" style={{ fontSize: 13 }}>
                        <i className="bi bi-exclamation-triangle-fill"></i>{errorMessage}
                    </div>
                )}

                <button className="btn btn-primary w-100 mb-4" type="submit" disabled={loading}>
                    {loading
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Resetting…</>
                        : <><i className="bi bi-check2-circle me-2"></i>Reset Password</>}
                </button>
            </form>

            <div className="fp-divider"><span>remembered it?</span></div>
            <Link to="/login" className="btn btn-outline-secondary w-100 mt-3">
                <i className="bi bi-arrow-left me-2"></i>Back to Login
            </Link>
        </div>
    )
}

// ── Step meta (left panel) ────────────────────────────────────────────────────
const STEP_META = [
    { icon: "bi-lock-open", desc: "Recover access to your account in three quick steps. Your data stays safe throughout." },
    { icon: "bi-envelope-open", desc: "Check your email for the one-time password we sent. Enter it now before it expires." },
    { icon: "bi-key", desc: "Almost done! Set a strong new password to secure your account." },
]

// ── Main component ────────────────────────────────────────────────────────────
export default function ForgetPasswordPage() {
    const [step, setStep] = useState(1)
    // Flow data lives in memory (not localStorage): username, role, verified otp, reset token
    const [ctx, setCtx] = useState({ username: "", role: "user", otp: "", token: "" })
    const meta = STEP_META[step - 1]

    return (
        <>
            <style>{STYLES}</style>
            <div className="fp-page">
                <div className="fp-split">

                    {/* Left brand panel */}
                    <div className="fp-brand">
                        <div>
                            <div className="fp-brand__icon">
                                <i className={`bi ${meta.icon}`}></i>
                            </div>
                            <div className="fp-brand__title">
                                Password<br /><span>Recovery</span>
                            </div>
                            <p className="fp-brand__desc">{meta.desc}</p>
                        </div>
                        <StepList step={step} />
                    </div>

                    {/* Right form panel */}
                    <div className="fp-right">
                        {step === 1 && (
                            <Step1 onNext={data => { setCtx(c => ({ ...c, ...data })); setStep(2) }} />
                        )}
                        {step === 2 && (
                            <Step2
                                ctx={ctx}
                                onNext={data => { setCtx(c => ({ ...c, ...data })); setStep(3) }}
                                onBack={() => setStep(1)}
                            />
                        )}
                        {step === 3 && <Step3 ctx={ctx} />}
                    </div>

                </div>
            </div>
        </>
    )
}

// ── Styles (uses --admin-* variables from style.css) ─────────────────────────
const STYLES = `
.fp-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: var(--admin-bg);
}
.fp-split {
    display: flex;
    width: 100%;
    max-width: 860px;
    min-height: 540px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--admin-border);
    box-shadow: var(--admin-shadow-lg);
    animation: fp-fade 0.45s ease both;
}
@keyframes fp-fade {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
}

.fp-label {
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
}

/* ── Left brand panel ── */
.fp-brand {
    flex: 0 0 300px;
    background: var(--admin-sidebar);
    color: var(--admin-sidebar-text);
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-right: 1px solid var(--admin-sidebar-border);
}
.fp-brand__icon {
    width: 52px; height: 52px;
    border-radius: 10px;
    background: var(--admin-primary);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; color: #fff;
    box-shadow: 0 8px 20px rgba(37,99,235,0.35);
    margin-bottom: 1.25rem;
}
.fp-brand__title {
    font-size: 24px; font-weight: 800;
    color: var(--admin-sidebar-text-strong);
    line-height: 1.2; margin-bottom: 0.75rem;
    letter-spacing: -0.02em;
}
.fp-brand__title span {
    color: var(--admin-primary);
}
.fp-brand__desc {
    font-size: 13px;
    color: var(--admin-sidebar-muted);
    line-height: 1.7;
    margin: 0;
}

/* ── Step list ── */
.fp-steps { display: flex; flex-direction: column; }
.fp-step  { display: flex; align-items: flex-start; gap: 12px; }
.fp-step__num {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
    border: 1px solid var(--admin-sidebar-border);
    color: var(--admin-sidebar-muted);
    background: transparent;
    transition: all 0.25s;
}
.fp-step--active .fp-step__num {
    background: var(--admin-primary);
    border-color: var(--admin-primary);
    color: #fff;
    box-shadow: 0 0 0 4px rgba(37,99,235,0.2);
}
.fp-step--done .fp-step__num {
    background: rgba(34,197,94,0.15);
    border-color: #22c55e;
    color: #22c55e;
}
.fp-step__title {
    font-size: 12.5px; font-weight: 700;
    color: var(--admin-sidebar-muted);
}
.fp-step--active .fp-step__title { color: var(--admin-sidebar-text-strong); }
.fp-step--done   .fp-step__title { color: #22c55e; }
.fp-step__desc   { font-size: 11px; color: var(--admin-sidebar-muted); margin-top: 2px; }
.fp-step__line {
    width: 2px; height: 18px;
    background: var(--admin-sidebar-border);
    border-radius: 2px;
    margin: 4px 0 4px 13px;
}
.fp-step__line--done { background: #22c55e; }

/* ── Right form panel ── */
.fp-right {
    flex: 1;
    background: var(--admin-surface);
    overflow-y: auto;
}
.fp-form {
    padding: 2.5rem 2.5rem;
    max-width: 480px;
}

/* ── OTP inputs ── */
.fp-otp-row { display: flex; gap: 8px; }
.fp-otp-box {
    flex: 1; height: 56px !important;
    text-align: center !important;
    font-size: 20px !important;
    font-weight: 700 !important;
    padding: 0 !important;
    border-radius: 8px !important;
}
.fp-otp-box--filled {
    border-color: var(--admin-primary) !important;
    background: rgba(37,99,235,0.05) !important;
}

/* ── Divider ── */
.fp-divider {
    display: flex; align-items: center; gap: 10px;
    color: var(--admin-muted); font-size: 11px;
    text-transform: uppercase; letter-spacing: 0.08em;
}
.fp-divider::before,
.fp-divider::after {
    content: ''; flex: 1; height: 1px;
    background: var(--admin-border);
}

/* ── Password rules ── */
.fp-rules {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 6px 10px; padding: 10px 12px;
    background: var(--admin-surface-soft);
    border: 1px solid var(--admin-border);
    border-radius: 8px;
}
.fp-rule {
    font-size: 11.5px; color: var(--admin-muted);
    display: flex; align-items: center; gap: 5px;
    transition: color 0.2s;
}
.fp-rule--met { color: var(--admin-success); }
.fp-rule i    { font-size: 10px; }

@media (max-width: 700px) {
    .fp-brand  { display: none; }
    .fp-form   { padding: 2rem 1.5rem; }
}
@media (max-width: 420px) {
    .fp-otp-box { height: 48px !important; font-size: 17px !important; }
    .fp-otp-row { gap: 5px; }
    .fp-rules   { grid-template-columns: 1fr; }
}
`