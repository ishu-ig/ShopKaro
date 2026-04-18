import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../Components/HeroSection';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  .auth-root {
    min-height: 100vh; background: #0a0a0f;
    display: flex; align-items: center; justify-content: center;
    padding: 60px 20px 100px; position: relative; overflow: hidden;
  }
  .auth-root::before {
    content: ''; position: absolute; top: -200px; right: -200px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .auth-card {
    width: 100%; max-width: 420px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(201,168,76,0.15);
    border-radius: 4px; padding: 48px 44px; position: relative;
    animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes cardIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  .auth-card::before {
    content: ''; position: absolute; top: 0; left: 44px; right: 44px;
    height: 1px; background: linear-gradient(90deg, transparent, #c9a84c, transparent);
  }
  .auth-brand { text-align: center; margin-bottom: 36px; }
  .auth-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 52px; height: 52px; border: 1px solid rgba(201,168,76,0.35);
    border-radius: 50%; margin-bottom: 16px; color: #c9a84c;
  }
  .auth-step-badge {
    display: inline-block; font-family: 'DM Sans', sans-serif; font-size: 10px;
    letter-spacing: 3px; text-transform: uppercase; color: #c9a84c;
    background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2);
    padding: 4px 12px; border-radius: 20px; margin-bottom: 14px;
  }
  .auth-title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.9rem;
    font-weight: 300; color: #f0ede6; margin: 0 0 8px; line-height: 1.2;
  }
  .auth-title em { font-style: italic; color: #c9a84c; }
  .auth-desc {
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 300;
    color: rgba(240,237,230,0.35); line-height: 1.7; margin: 0;
  }
  .auth-field { margin-bottom: 20px; }
  .auth-label {
    display: block; font-family: 'DM Sans', sans-serif; font-size: 10px;
    font-weight: 500; letter-spacing: 2px; text-transform: uppercase;
    color: rgba(240,237,230,0.5); margin-bottom: 8px;
  }
  .auth-input-wrap { position: relative; }
  .auth-input {
    width: 100%; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 2px;
    padding: 13px 48px 13px 16px; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 300; color: #f0ede6; outline: none;
    transition: border-color 0.2s, background 0.2s; box-sizing: border-box;
  }
  .auth-input::placeholder { color: rgba(240,237,230,0.2); }
  .auth-input:focus { border-color: rgba(201,168,76,0.5); background: rgba(201,168,76,0.04); }
  .auth-input.error { border-color: rgba(220,80,80,0.4); }
  .auth-eye {
    position: absolute; right: 14px; top: 50%;
    transform: translateY(-50%); background: none; border: none;
    color: rgba(240,237,230,0.3); cursor: pointer; padding: 4px;
    transition: color 0.2s;
  }
  .auth-eye:hover { color: #c9a84c; }
  .auth-strength {
    display: flex; gap: 4px; margin-top: 8px;
  }
  .auth-strength-bar {
    flex: 1; height: 2px; border-radius: 2px;
    background: rgba(255,255,255,0.08); transition: background 0.3s;
  }
  .auth-strength-bar.weak { background: #ff6b6b; }
  .auth-strength-bar.medium { background: #f7b731; }
  .auth-strength-bar.strong { background: #27a85a; }
  .auth-error {
    background: rgba(220,80,80,0.08); border: 1px solid rgba(220,80,80,0.2);
    border-radius: 2px; padding: 10px 14px; margin-bottom: 20px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; color: #ff8080;
  }
  .auth-btn-primary {
    width: 100%; background: #c9a84c; color: #0a0a0f; border: none;
    border-radius: 2px; padding: 14px; font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase;
    cursor: pointer; transition: background 0.2s, transform 0.15s; margin-bottom: 0;
  }
  .auth-btn-primary:hover { background: #dbb85a; transform: translateY(-1px); }
  .auth-steps {
    display: flex; align-items: center; gap: 6px;
    justify-content: center; margin-top: 28px;
  }
  .auth-step-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.1); transition: all 0.2s; }
  .auth-step-dot.active { background: #c9a84c; width: 20px; border-radius: 3px; }
  .auth-step-dot.done { background: rgba(201,168,76,0.4); }
`;

function getStrength(pwd) {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
}

export default function ForgetPasswordPage3() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [data, setData] = useState({ password: "", cpassword: "" });
    const [errorMessage, setErrorMessage] = useState();

    function getInputData(e) {
        const { name, value } = e.target;
        setErrorMessage("");
        setData(old => ({ ...old, [name]: value }));
    }

    async function postData(e) {
        e.preventDefault();
        if (data.password !== data.cpassword) {
            setErrorMessage("Passwords do not match");
            return;
        }
        try {
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/forgetPassword-3`, {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ username: localStorage.getItem("reset-password-username"), password: data.password })
            });
            response = await response.json();
            if (response.result === "Done") {
                localStorage.removeItem("reset-password-username");
                navigate("/login");
            } else setErrorMessage(response.reason);
        } catch { alert("Internal Server Error"); }
    }

    const strength = getStrength(data.password);
    const strengthClass = strength <= 1 ? "weak" : strength <= 2 ? "medium" : "strong";

    return (
        <>
            <style>{styles}</style>
            <HeroSection title="Reset Password" />
            <div className="auth-root">
                <div className="auth-card">
                    <div className="auth-brand">
                        <div className="auth-icon">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.2">
                                <path d="M9 12l2 2 4-4"/>
                                <path d="M21 11c0 5.52-4.48 10-10 10S1 16.52 1 11 5.48 1 11 1s10 4.48 10 10z"/>
                            </svg>
                        </div>
                        <div className="auth-step-badge">Step 3 of 3</div>
                        <h1 className="auth-title">New <em>Password</em></h1>
                        <p className="auth-desc">Choose a strong, unique password for your account.</p>
                    </div>

                    <form onSubmit={postData}>
                        <div className="auth-field">
                            <label className="auth-label">New Password</label>
                            <div className="auth-input-wrap">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    onChange={getInputData}
                                    placeholder="••••••••"
                                    className={`auth-input${errorMessage ? " error" : ""}`}
                                />
                                <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                                    <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                                </button>
                            </div>
                            {data.password && (
                                <div className="auth-strength">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className={`auth-strength-bar${strength >= i ? ` ${strengthClass}` : ""}`} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Confirm Password</label>
                            <div className="auth-input-wrap">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    name="cpassword"
                                    onChange={getInputData}
                                    placeholder="••••••••"
                                    className={`auth-input${errorMessage ? " error" : ""}`}
                                />
                                <button type="button" className="auth-eye" onClick={() => setShowConfirm(!showConfirm)}>
                                    <i className={`fa ${showConfirm ? "fa-eye-slash" : "fa-eye"}`} />
                                </button>
                            </div>
                        </div>

                        {errorMessage && <div className="auth-error">{errorMessage}</div>}

                        <button type="submit" className="auth-btn-primary">Reset Password</button>
                    </form>

                    <div className="auth-steps">
                        <div className="auth-step-dot done" />
                        <div className="auth-step-dot done" />
                        <div className="auth-step-dot active" />
                    </div>
                </div>
            </div>
        </>
    );
}