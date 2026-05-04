import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [data, setData] = useState({ username: "", password: "" });
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    function getInputData(e) {
        const { name, value } = e.target;
        setErrorMessage("");
        setData((old) => ({ ...old, [name]: value }));
    }

    async function postData(e) {
        e.preventDefault();
        setLoading(true);
        try {
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/login`, {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ username: data.username, password: data.password })
            });
            response = await response.json();

            if (response.result === "Done" && response.data.active === false) {
                setErrorMessage("Your account is inactive. Please contact support.");
            } else if (response.result === "Done") {
                if (response.data.role === "Admin" || response.data.role === "Super Admin") {
                    localStorage.setItem("login", true);
                    localStorage.setItem("name", response.data.name);
                    localStorage.setItem("userid", response.data._id);
                    localStorage.setItem("role", response.data.role);
                    localStorage.setItem("token", response.token);
                    const incomplete = ["address", "state", "pin", "phone", "name", "city"]
                        .some(f => !response.data[f]);
                    navigate(incomplete ? "/profile" : "/");
                } else {
                    setErrorMessage("You are not authorized to access this panel.");
                    localStorage.setItem("login", false);
                }
            } else {
                setErrorMessage("Invalid username/email or password.");
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
                .login-page {
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

                /* Ambient glow blobs */
                .login-page::before {
                    content: '';
                    position: fixed;
                    width: 600px; height: 600px;
                    background: radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%);
                    top: -100px; left: -150px;
                    border-radius: 50%;
                    pointer-events: none;
                }
                .login-page::after {
                    content: '';
                    position: fixed;
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(56,239,195,0.06) 0%, transparent 70%);
                    bottom: -100px; right: -100px;
                    border-radius: 50%;
                    pointer-events: none;
                }

                .login-split {
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
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* Left decorative panel */
                .login-brand-panel {
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

                .login-brand-panel::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: 
                        radial-gradient(ellipse at 20% 20%, rgba(79,142,247,0.15) 0%, transparent 60%),
                        radial-gradient(ellipse at 80% 80%, rgba(56,239,195,0.1) 0%, transparent 60%);
                }

                /* Decorative grid lines */
                .login-brand-panel::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(79,142,247,0.06) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(79,142,247,0.06) 1px, transparent 1px);
                    background-size: 32px 32px;
                }

                .brand-content { position: relative; z-index: 1; }

                .brand-icon-wrap {
                    width: 56px; height: 56px;
                    background: linear-gradient(135deg, var(--accent), var(--accent-2));
                    border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 22px; color: #fff;
                    box-shadow: 0 8px 24px rgba(79,142,247,0.4);
                    margin-bottom: 28px;
                }

                .brand-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 28px;
                    font-weight: 800;
                    color: var(--text-primary);
                    line-height: 1.2;
                    margin-bottom: 14px;
                    letter-spacing: -0.02em;
                }

                .brand-title span {
                    background: linear-gradient(90deg, var(--accent), var(--accent-2));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .brand-desc {
                    font-size: 13.5px;
                    color: var(--text-secondary);
                    line-height: 1.7;
                }

                .brand-stats {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .stat-pill {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 10px 14px;
                    font-size: 12.5px;
                    color: var(--text-secondary);
                }

                .stat-pill i {
                    color: var(--accent);
                    font-size: 13px;
                    width: 16px;
                    text-align: center;
                }

                /* Right form panel */
                .login-form-panel {
                    flex: 1;
                    background: var(--bg-surface);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 52px 48px;
                }

                .login-heading {
                    font-family: 'Syne', sans-serif;
                    font-size: 22px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                    letter-spacing: -0.01em;
                }

                .login-subheading {
                    font-size: 13.5px;
                    color: var(--text-secondary);
                    margin-bottom: 32px;
                }

                .lf-label {
                    display: block;
                    font-size: 11.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-secondary);
                    margin-bottom: 7px;
                }

                .lf-input-wrap {
                    position: relative;
                    margin-bottom: 18px;
                }

                .lf-input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    font-size: 13px;
                    z-index: 2;
                    transition: color 0.2s;
                }

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

                .lf-input:focus + .lf-input-icon,
                .lf-input-wrap:focus-within .lf-input-icon {
                    color: var(--accent);
                }

                .lf-input::placeholder { color: var(--text-muted) !important; }

                .lf-input.is-error { border-color: rgba(247,95,95,0.45) !important; }

                .lf-eye-btn {
                    position: absolute;
                    right: 12px; top: 50%;
                    transform: translateY(-50%);
                    background: none; border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 4px 6px;
                    font-size: 13px;
                    transition: color 0.2s;
                    line-height: 1;
                }

                .lf-eye-btn:hover { color: var(--accent); }

                .lf-error-box {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    background: rgba(247,95,95,0.08);
                    border: 1px solid rgba(247,95,95,0.25);
                    border-radius: 10px;
                    padding: 11px 14px;
                    font-size: 13px;
                    color: #FCA5A5;
                    margin-bottom: 18px;
                    animation: shake 0.35s ease;
                }

                @keyframes shake {
                    0%,100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }

                .lf-meta-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 24px;
                }

                .lf-remember {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    user-select: none;
                }

                .lf-remember input[type="checkbox"] {
                    width: 15px; height: 15px;
                    accent-color: var(--accent);
                    cursor: pointer;
                }

                .lf-forgot {
                    font-size: 13px;
                    color: var(--accent);
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .lf-forgot:hover { color: var(--accent-2); }

                .lf-submit-btn {
                    width: 100%;
                    padding: 12px 20px;
                    background: linear-gradient(135deg, var(--accent) 0%, #3a7de0 100%);
                    border: none;
                    border-radius: 10px;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 700;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    cursor: pointer;
                    transition: var(--transition);
                    box-shadow: 0 6px 20px rgba(79,142,247,0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    letter-spacing: 0.01em;
                    margin-bottom: 24px;
                }

                .lf-submit-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 28px rgba(79,142,247,0.5);
                }

                .lf-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

                .lf-divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .lf-divider-line {
                    flex: 1;
                    height: 1px;
                    background: var(--border);
                }

                .lf-divider-text {
                    font-size: 11px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    white-space: nowrap;
                }

                .lf-social-row {
                    display: flex;
                    gap: 12px;
                }

                .lf-social-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    color: var(--text-secondary);
                    font-size: 13px;
                    font-weight: 600;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .lf-social-btn:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                    border-color: rgba(255,255,255,0.15);
                }

                @media (max-width: 700px) {
                    .login-brand-panel { display: none; }
                    .login-form-panel { padding: 40px 28px; }
                    .login-split { max-width: 440px; }
                }
            `}</style>

            <div className="login-page">
                <div className="login-split">
                    {/* Left brand panel */}
                    <div className="login-brand-panel">
                        <div className="brand-content">
                            <div className="brand-icon-wrap">
                                <i className="fas fa-layer-group"></i>
                            </div>
                            <div className="brand-title">
                                Admin<br /><span>Control Panel</span>
                            </div>
                            <p className="brand-desc">
                                Manage your platform with powerful tools built for performance and clarity.
                            </p>
                        </div>
                        <div className="brand-stats">
                            <div className="stat-pill">
                                <i className="fas fa-shield-halved"></i>
                                Role-based access control
                            </div>
                            <div className="stat-pill">
                                <i className="fas fa-bolt"></i>
                                Real-time dashboard
                            </div>
                            <div className="stat-pill">
                                <i className="fas fa-lock"></i>
                                Encrypted & secure
                            </div>
                        </div>
                    </div>

                    {/* Right form panel */}
                    <div className="login-form-panel">
                        <div className="login-heading">Welcome back</div>
                        <div className="login-subheading">Sign in to your admin account</div>

                        <form onSubmit={postData}>
                            {/* Username */}
                            <label className="lf-label">Username / Email</label>
                            <div className="lf-input-wrap">
                                <input
                                    type="text"
                                    name="username"
                                    onChange={getInputData}
                                    placeholder="Enter your username or email"
                                    required
                                    className={`lf-input ${errorMessage ? "is-error" : ""}`}
                                />
                                <span className="lf-input-icon"><i className="fas fa-user"></i></span>
                            </div>

                            {/* Password */}
                            <label className="lf-label">Password</label>
                            <div className="lf-input-wrap">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    onChange={getInputData}
                                    placeholder="Enter your password"
                                    required
                                    className={`lf-input ${errorMessage ? "is-error" : ""}`}
                                    style={{ paddingRight: "44px" }}
                                />
                                <span className="lf-input-icon"><i className="fas fa-lock"></i></span>
                                <button type="button" className="lf-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>

                            {/* Error */}
                            {errorMessage && (
                                <div className="lf-error-box">
                                    <i className="fas fa-circle-exclamation"></i>
                                    {errorMessage}
                                </div>
                            )}

                            {/* Remember + Forgot */}
                            <div className="lf-meta-row">
                                <label className="lf-remember">
                                    <input type="checkbox" />
                                    Remember me
                                </label>
                                <Link to="/forgetPassword-1" className="lf-forgot">Forgot password?</Link>
                            </div>

                            {/* Submit */}
                            <button type="submit" className="lf-submit-btn" disabled={loading}>
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm"></span> Signing in...</>
                                ) : (
                                    <>Sign In <i className="fas fa-arrow-right"></i></>
                                )}
                            </button>
                        </form>

                        <div className="lf-divider">
                            <div className="lf-divider-line"></div>
                            <span className="lf-divider-text">or continue with</span>
                            <div className="lf-divider-line"></div>
                        </div>

                        <div className="lf-social-row">
                            <button className="lf-social-btn">
                                <i className="fab fa-google"></i> Google
                            </button>
                            <button className="lf-social-btn">
                                <i className="fab fa-facebook"></i> Facebook
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}