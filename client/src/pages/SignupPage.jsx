import React, { useState } from 'react';
import HeroSection from '../Components/HeroSection';
import formValidator from '../FormValidator/formValidator';
import { Link, useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .auth-root {
    min-height: 100vh;
    background: #0a0a0f;
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
    background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .auth-card {
    width: 100%;
    max-width: 560px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(201,168,76,0.15);
    border-radius: 4px;
    padding: 48px 44px;
    position: relative;
    backdrop-filter: blur(20px);
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
  .auth-brand {
    text-align: center;
    margin-bottom: 36px;
  }
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
    color: #f0ede6;
    letter-spacing: 0.5px;
    margin: 0 0 6px;
    line-height: 1.2;
  }
  .auth-title em { font-style: italic; color: #c9a84c; }
  .auth-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 300;
    color: rgba(240,237,230,0.4);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin: 0;
  }
  .auth-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 500px) { .auth-grid { grid-template-columns: 1fr; } }
  .auth-field { margin-bottom: 20px; }
  .auth-label {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(240,237,230,0.5);
    margin-bottom: 8px;
  }
  .auth-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 2px;
    padding: 13px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 300;
    color: #f0ede6;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }
  .auth-input::placeholder { color: rgba(240,237,230,0.2); }
  .auth-input:focus {
    border-color: rgba(201,168,76,0.5);
    background: rgba(201,168,76,0.04);
  }
  .auth-input.error { border-color: rgba(220,80,80,0.4); }
  .auth-field-error {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: #ff8080;
    margin-top: 5px;
  }
  .auth-input-wrap { position: relative; }
  .auth-input-wrap .auth-input { padding-right: 48px; }
  .auth-eye {
    position: absolute;
    right: 14px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    color: rgba(240,237,230,0.3);
    cursor: pointer;
    padding: 4px;
    transition: color 0.2s;
  }
  .auth-eye:hover { color: #c9a84c; }
  .auth-check-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 300;
    color: rgba(240,237,230,0.4);
    cursor: pointer;
    margin-bottom: 24px;
  }
  .auth-check { width: 14px; height: 14px; accent-color: #c9a84c; cursor: pointer; }
  .auth-btn-primary {
    width: 100%;
    background: #c9a84c;
    color: #0a0a0f;
    border: none;
    border-radius: 2px;
    padding: 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    margin-bottom: 16px;
  }
  .auth-btn-primary:hover { background: #dbb85a; transform: translateY(-1px); }
  .auth-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }
  .auth-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
  .auth-divider-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    color: rgba(240,237,230,0.25);
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .auth-social { display: flex; gap: 10px; margin-bottom: 28px; }
  .auth-btn-social {
    flex: 1;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 2px;
    padding: 11px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: rgba(240,237,230,0.5);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: border-color 0.2s, color 0.2s;
  }
  .auth-btn-social:hover { border-color: rgba(201,168,76,0.3); color: #c9a84c; }
  .auth-links { display: flex; justify-content: space-between; align-items: center; }
  .auth-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 300;
    color: rgba(240,237,230,0.35);
    text-decoration: none;
    letter-spacing: 0.5px;
    transition: color 0.2s;
    border-bottom: 1px solid transparent;
  }
  .auth-link:hover { color: #c9a84c; border-bottom-color: rgba(201,168,76,0.4); }
`;

export default function SignupPage() {
    const navigate = useNavigate();
    const [data, setData] = useState({ name: "", username: "", email: "", phone: "", password: "", cpassword: "" });
    const [errorMessage, setErrorMessage] = useState({
        name: "Full Name is required",
        username: "Username is required",
        email: "Email is required",
        phone: "Phone number is required",
        password: "Password is required"
    });
    const [show, setShow] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    function getInputData(e) {
        const { name, value } = e.target;
        setErrorMessage(old => ({ ...old, [name]: formValidator(e) }));
        setData(old => ({ ...old, [name]: value }));
    }

    async function postData(e) {
        e.preventDefault();
        if (data.password === data.cpassword) {
            const error = Object.values(errorMessage).find(x => x !== "");
            if (error) { setShow(true); return; }
            try {
                let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user`, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ name: data.name, username: data.username, email: data.email, phone: data.phone, password: data.password, role: "Buyer", active: true })
                });
                response = await response.json();
                if (response.result === "Done") navigate("/login");
                else {
                    setShow(true);
                    setErrorMessage(old => ({ ...old, username: response.reason?.username ?? "", email: response.reason?.email ?? "" }));
                }
            } catch { alert("Internal Server Error"); }
        } else {
            setShow(true);
            setErrorMessage(old => ({ ...old, password: "Passwords do not match" }));
        }
    }

    return (
        <>
            <style>{styles}</style>
            <HeroSection title="Create Account" />
            <div className="auth-root">
                <div className="auth-card">
                    <div className="auth-brand">
                        <div className="auth-brand-mark">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2">
                                <path d="M10 2l2 6h6l-5 3.6 1.9 5.9L10 14l-4.9 3.5L7 11.6 2 8h6z"/>
                            </svg>
                        </div>
                        <h1 className="auth-title">Create <em>Account</em></h1>
                        <p className="auth-subtitle">Join us today</p>
                    </div>

                    <form onSubmit={postData}>
                        <div className="auth-grid">
                            <div className="auth-field">
                                <label className="auth-label">Full Name</label>
                                <input type="text" name="name" onChange={getInputData} placeholder="John Doe"
                                    className={`auth-input${show && errorMessage.name ? " error" : ""}`} />
                                {show && errorMessage.name && <p className="auth-field-error">{errorMessage.name}</p>}
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">Username</label>
                                <input type="text" name="username" onChange={getInputData} placeholder="johndoe"
                                    className={`auth-input${show && errorMessage.username ? " error" : ""}`} />
                                {show && errorMessage.username && <p className="auth-field-error">{errorMessage.username}</p>}
                            </div>
                        </div>

                        <div className="auth-grid">
                            <div className="auth-field">
                                <label className="auth-label">Email Address</label>
                                <input type="email" name="email" onChange={getInputData} placeholder="john@example.com"
                                    className={`auth-input${show && errorMessage.email ? " error" : ""}`} />
                                {show && errorMessage.email && <p className="auth-field-error">{errorMessage.email}</p>}
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">Phone Number</label>
                                <input type="number" name="phone" onChange={getInputData} placeholder="+91 00000 00000"
                                    className={`auth-input${show && errorMessage.phone ? " error" : ""}`} />
                                {show && errorMessage.phone && <p className="auth-field-error">{errorMessage.phone}</p>}
                            </div>
                        </div>

                        <div className="auth-grid">
                            <div className="auth-field">
                                <label className="auth-label">Password</label>
                                <div className="auth-input-wrap">
                                    <input type={showPassword ? "text" : "password"} name="password" onChange={getInputData} placeholder="••••••••"
                                        className={`auth-input${show && errorMessage.password ? " error" : ""}`} />
                                    <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                                        <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                                    </button>
                                </div>
                                {show && errorMessage.password && <p className="auth-field-error">{errorMessage.password}</p>}
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">Confirm Password</label>
                                <div className="auth-input-wrap">
                                    <input type={showConfirmPassword ? "text" : "password"} name="cpassword" onChange={getInputData} placeholder="••••••••"
                                        className={`auth-input${show && errorMessage.password ? " error" : ""}`} />
                                    <button type="button" className="auth-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <i className={`fa ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <label className="auth-check-label">
                            <input type="checkbox" className="auth-check" />
                            I agree to the Terms & Privacy Policy
                        </label>

                        <button type="submit" className="auth-btn-primary">Create Account</button>

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
                            <span style={{fontSize:'11px', color:'rgba(240,237,230,0.2)', fontFamily:"'DM Sans',sans-serif"}}>Already have an account?</span>
                            <Link to="/login" className="auth-link">Sign in →</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}