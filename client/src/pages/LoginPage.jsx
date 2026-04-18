import React, { useState } from 'react';
import HeroSection from '../Components/HeroSection';
import { Link, useNavigate } from 'react-router-dom';


export default function LoginPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [data, setData] = useState({ username: "", password: "" });
    const [errorMessage, setErrorMessage] = useState("");

    function getInputData(e) {
        const { name, value } = e.target;
        setErrorMessage("");
        setData(old => ({ ...old, [name]: value }));
    }

    async function postData(e) {
        e.preventDefault();
        try {
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/login`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ username: data.username, password: data.password }),
            });
            response = await response.json();
            if (response.result === "Done" && response.data.active === false) {
                setErrorMessage("Your account is inactive. Please contact support.");
            } else if (response.result === "Done" && response.data.role === "Buyer") {
                localStorage.setItem("login", true);
                localStorage.setItem("name", response.data.name);
                localStorage.setItem("userid", response.data._id);
                localStorage.setItem("role", response.data.role);
                localStorage.setItem("token", response.token);
                navigate("/profile");
            } else if (response.result === "Done" && (response.data.role === "Admin" || response.data.role === "Super Admin")) {
                setErrorMessage("Admin accounts cannot sign in here.");
            } else {
                setErrorMessage("Invalid username or password.");
            }
        } catch {
            alert("Internal server error.");
        }
    }

    return (
        <>
            
            <HeroSection title="Welcome Back" />
            <div className="auth-root">
                <div className="auth-card">
                    <div className="auth-brand">
                        <div className="auth-brand-mark">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2">
                                <circle cx="10" cy="6" r="3.5"/>
                                <path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
                            </svg>
                        </div>
                        <h1 className="auth-title">Welcome <em>Back</em></h1>
                        <p className="auth-subtitle">Sign in to continue</p>
                    </div>

                    <form onSubmit={postData}>
                        <div className="auth-field">
                            <label className="auth-label">Username or Email</label>
                            <input
                                type="text"
                                name="username"
                                onChange={getInputData}
                                placeholder="your@email.com"
                                className={`auth-input${errorMessage ? " error" : ""}`}
                            />
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Password</label>
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
                        </div>

                        {errorMessage && <div className="auth-error">{errorMessage}</div>}

                        <div className="auth-row">
                            <label className="auth-check-label">
                                <input type="checkbox" className="auth-check" />
                                Remember me
                            </label>
                            <Link to="/forgetPassword-1" className="auth-link">Forgot password?</Link>
                        </div>

                        <button type="submit" className="auth-btn-primary">Sign In</button>

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
                            <span style={{fontSize:'11px', color:'rgba(240,237,230,0.2)', fontFamily:"'DM Sans',sans-serif"}}>New here?</span>
                            <Link to="/signup" className="auth-link">Create an account →</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}