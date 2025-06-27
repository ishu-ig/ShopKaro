import React, { useState } from 'react';
import HeroSection from '../Components/HeroSection';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
    let navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [data, setData] = useState({
        username: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState("");

    function getInputData(e) {
        let { name, value } = e.target;
        setErrorMessage("");
        setData((old) => ({
            ...old,
            [name]: value,
        }));
    }

    async function postData(e) {
        e.preventDefault();
        try {
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/login`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ username: data.username, password: data.password }),
            });
            response = await response.json();
            if (response.result === "Done" && response.data.active === false) {
                setErrorMessage("Your account is not active. Please contact us to activate your account.");
            } else if (response.result === "Done" && response.data.role === "Buyer") {
                localStorage.setItem("login", true);
                localStorage.setItem("name", response.data.name);
                localStorage.setItem("userid", response.data._id);
                localStorage.setItem("role", response.data.role);
                localStorage.setItem("token", response.token);
                navigate("/profile");
            } else if (response.result === "Done" && (response.data.role === "Admin" || response.data.role === "Super Admin")) {
                setErrorMessage("You cannot log in as an admin or super admin.");
            } else {
                setErrorMessage("Invalid username/email or password.");
            }
        } catch (error) {
            alert("Internal server error.");
        }
    }

    return (
        <>
            <HeroSection title="Login - Create Your Account" />
            <div className="container-fluid my-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div className="card shadow-lg p-4">
                            <h5 className="text-center text-light bg-primary p-2 rounded">Login to Your Account</h5>
                            <form onSubmit={postData}>
                                {/* Username/Email Field */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Username/Email</label>
                                    <input
                                        type="text"
                                        name="username"
                                        onChange={getInputData}
                                        placeholder="Enter username/email"
                                        className={`form-control ${errorMessage ? "is-invalid" : ""}`}
                                    />
                                </div>

                                {/* Password Field */}
                                <div className="mb-3 position-relative">
                                    <label className="form-label fw-bold">Password</label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            onChange={getInputData}
                                            placeholder="Enter password"
                                            className={`form-control ${errorMessage ? "is-invalid" : ""}`}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {errorMessage && (
                                    <div className="alert alert-danger mt-3">
                                        {errorMessage}
                                    </div>
                                )}

                                {/* Remember Me Checkbox */}
                                <div className="form-check mb-3">
                                    <input type="checkbox" className="form-check-input" id="rememberMe" />
                                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                                </div>

                                {/* Login Button */}
                                <div className="d-grid mb-3">
                                    <button type="submit" className="btn btn-primary">
                                        Login
                                    </button>
                                </div>

                                {/* Social Login Buttons */}
                                <div className="d-grid gap-2 mb-3">
                                    <button className="btn btn-outline-primary d-flex align-items-center justify-content-center">
                                        <i className="fab fa-google me-2"></i> Login with Google
                                    </button>
                                    <button className="btn btn-outline-primary d-flex align-items-center justify-content-center">
                                        <i className="fab fa-facebook me-2"></i> Login with Facebook
                                    </button>
                                </div>

                                {/* Forgot Password and Signup Links */}
                                <div className="d-flex justify-content-between">
                                    <Link to="/forgetPassword-1" className="text-decoration-none text-primary">
                                        Forgot password?
                                    </Link>
                                    <Link to="/signup" className="text-decoration-none text-primary">
                                        Don't have an account? Sign up
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{marginBottom:"100px"}}></div>
        </>
    );
}