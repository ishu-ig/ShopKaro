import React, { useState, useRef } from 'react';
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
  .auth-otp-wrap {
    display: flex; gap: 10px; justify-content: center; margin-bottom: 24px;
  }
  .auth-otp-input {
    width: 52px; height: 58px; text-align: center;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 4px; font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem; font-weight: 400; color: #f0ede6; outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .auth-otp-input:focus { border-color: #c9a84c; background: rgba(201,168,76,0.06); }
  .auth-otp-input.error { border-color: rgba(220,80,80,0.5); }
  .auth-error {
    background: rgba(220,80,80,0.08); border: 1px solid rgba(220,80,80,0.2);
    border-radius: 2px; padding: 10px 14px; margin-bottom: 20px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; color: #ff8080;
    text-align: center;
  }
  .auth-btn-primary {
    width: 100%; background: #c9a84c; color: #0a0a0f; border: none;
    border-radius: 2px; padding: 14px; font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase;
    cursor: pointer; transition: background 0.2s, transform 0.15s;
  }
  .auth-btn-primary:hover { background: #dbb85a; transform: translateY(-1px); }
  .auth-resend {
    text-align: center; margin-top: 20px;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    color: rgba(240,237,230,0.3);
  }
  .auth-resend button {
    background: none; border: none; color: #c9a84c;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    cursor: pointer; padding: 0; margin-left: 4px; text-decoration: underline;
  }
  .auth-steps {
    display: flex; align-items: center; gap: 6px;
    justify-content: center; margin-top: 28px;
  }
  .auth-step-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.1); transition: all 0.2s; }
  .auth-step-dot.active { background: #c9a84c; width: 20px; border-radius: 3px; }
  .auth-step-dot.done { background: rgba(201,168,76,0.4); }
`;

export default function ForgetPasswordPage2() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [errorMessage, setErrorMessage] = useState();
    const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    function handleOtpChange(i, value) {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[i] = value.slice(-1);
        setOtp(newOtp);
        if (value && i < 5) refs[i + 1].current.focus();
    }

    function handleKeyDown(i, e) {
        if (e.key === "Backspace" && !otp[i] && i > 0) refs[i - 1].current.focus();
    }

    async function postData(e) {
        e.preventDefault();
        const otpString = otp.join("");
        try {
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/forgetPassword-2`, {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ username: localStorage.getItem("reset-password-username"), otp: otpString })
            });
            response = await response.json();
            if (response.result === "Done") navigate("/forgetPassword-3");
            else setErrorMessage(response.reason || "Invalid OTP. Please try again.");
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
                                <path d="M4 4l14 0M4 11h14M4 18h7"/>
                                <circle cx="17" cy="17" r="3.5"/>
                                <path d="M15.5 17l1 1 2-2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="auth-step-badge">Step 2 of 3</div>
                        <h1 className="auth-title">Verify <em>OTP</em></h1>
                        <p className="auth-desc">Enter the 6-digit code sent to your registered email address.</p>
                    </div>

                    <form onSubmit={postData}>
                        <div className="auth-otp-wrap">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={refs[i]}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    className={`auth-otp-input${errorMessage ? " error" : ""}`}
                                />
                            ))}
                        </div>

                        {errorMessage && <div className="auth-error">{errorMessage}</div>}

                        <button type="submit" className="auth-btn-primary">Verify Code</button>

                        <div className="auth-resend">
                            Didn't receive it?
                            <button type="button" onClick={() => window.location.reload()}>Resend OTP</button>
                        </div>
                    </form>

                    <div className="auth-steps">
                        <div className="auth-step-dot done" />
                        <div className="auth-step-dot active" />
                        <div className="auth-step-dot" />
                    </div>
                </div>
            </div>
        </>
    );
}