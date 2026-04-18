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
  .auth-step {
    display: inline-block;
    font-family: 'DM Sans', sans-serif; font-size: 10px;
    letter-spacing: 3px; text-transform: uppercase;
    color: #c9a84c; background: rgba(201,168,76,0.1);
    border: 1px solid rgba(201,168,76,0.2);
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
  .auth-field { margin-bottom: 24px; }
  .auth-label {
    display: block; font-family: 'DM Sans', sans-serif; font-size: 10px;
    font-weight: 500; letter-spacing: 2px; text-transform: uppercase;
    color: rgba(240,237,230,0.5); margin-bottom: 8px;
  }
  .auth-input {
    width: 100%; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 2px;
    padding: 13px 16px; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 300; color: #f0ede6;
    outline: none; transition: border-color 0.2s, background 0.2s; box-sizing: border-box;
  }
  .auth-input::placeholder { color: rgba(240,237,230,0.2); }
  .auth-input:focus { border-color: rgba(201,168,76,0.5); background: rgba(201,168,76,0.04); }
  .auth-input.error { border-color: rgba(220,80,80,0.4); }
  .auth-error {
    background: rgba(220,80,80,0.08); border: 1px solid rgba(220,80,80,0.2);
    border-radius: 2px; padding: 10px 14px;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    color: #ff8080; margin-bottom: 20px;
  }
  .auth-btn-primary {
    width: 100%; background: #c9a84c; color: #0a0a0f; border: none;
    border-radius: 2px; padding: 14px; font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase;
    cursor: pointer; transition: background 0.2s, transform 0.15s;
  }
  .auth-btn-primary:hover { background: #dbb85a; transform: translateY(-1px); }
  .auth-steps {
    display: flex; align-items: center; gap: 6px;
    justify-content: center; margin-top: 28px;
  }
  .auth-step-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.1); transition: background 0.2s;
  }
  .auth-step-dot.active { background: #c9a84c; width: 20px; border-radius: 3px; }
`;

export default function ForgetPasswordPage1() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [errorMessage, setErrorMessage] = useState();

    async function postData(e) {
        e.preventDefault();
        try {
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/forgetPassword-1`, {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ username })
            });
            response = await response.json();
            if (response.result === "Done") {
                localStorage.setItem("reset-password-username", username);
                navigate("/forgetPassword-2");
            } else setErrorMessage("No account found with that username or email.");
        } catch { alert("Internal Server Error"); }
    }

    return (
        <>
            <style>{styles}</style>
            <HeroSection title="Reset Password" />
            <div className="auth-root">
                <div className="auth-card">
                    <div className="auth-brand">
                        <div className="auth-icon">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.2">
                                <rect x="3" y="10" width="16" height="11" rx="2"/>
                                <path d="M7 10V7a4 4 0 0 1 8 0v3"/>
                                <circle cx="11" cy="15.5" r="1.2" fill="currentColor"/>
                            </svg>
                        </div>
                        <div className="auth-step">Step 1 of 3</div>
                        <h1 className="auth-title">Reset <em>Password</em></h1>
                        <p className="auth-desc">Enter your username or email and we'll send you a verification code.</p>
                    </div>

                    <form onSubmit={postData}>
                        <div className="auth-field">
                            <label className="auth-label">Username or Email</label>
                            <input
                                type="text"
                                name="username"
                                onChange={e => setUsername(e.target.value)}
                                placeholder="your@email.com"
                                className={`auth-input${errorMessage ? " error" : ""}`}
                            />
                            {errorMessage && <div className="auth-error" style={{marginTop: 8}}>{errorMessage}</div>}
                        </div>

                        <button type="submit" className="auth-btn-primary">Send OTP</button>
                    </form>

                    <div className="auth-steps">
                        <div className="auth-step-dot active" />
                        <div className="auth-step-dot" />
                        <div className="auth-step-dot" />
                    </div>
                </div>
            </div>
        </>
    );
}