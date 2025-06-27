import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
    let navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    let [data, setData] = useState({ username: "", password: "" });
    let [errorMessage, setErrorMessage] = useState("");

    function getInputData(e) {
        let { name, value } = e.target;
        setErrorMessage("");
        setData((old) => ({ ...old, [name]: value }));
    }

    async function postData(e) {
        e.preventDefault();
        try {
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/login`, {
                method: "POST",
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ username: data.username, password: data.password })
            })
            response = await response.json()
            if (response.result === "Done" && response.data.active === false) {
                setErrorMessage("Your Account is Not Active . Please Contact Us For More Details And To Activate Your Discount")
            }
            else if (response.result === "Done") {
                if (response.data.role === "Admin" || response.data.role === "Super Admin") {
                    localStorage.setItem("login", true)
                    localStorage.setItem("name", response.data.name)
                    localStorage.setItem("userid", response.data._id)
                    localStorage.setItem("role", response.data.role)
                    localStorage.setItem("token", response.token)
                    if (response.data.address === "" || response.data.state === "" || response.data.pin === "" || response.data.phone === "" || response.data.name === "" || response.data.city === "")
                        navigate("/profile")
                    else
                        navigate("/")
                }
                else {
                    setErrorMessage("Your Are Not A valid Person To Authorize This Pannel")
                    localStorage.setItem("login", false)
                }

            }
            else
                setErrorMessage("Invalid Username/Email or password")
        } catch (error) {
            alert("Internal Server Error")
        }
    }

    return (
        <div className="d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: "#f4f6f9" }}>
            <div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%", backgroundColor: "#ffffff" }}>
                <h5 className="text-light bg-primary text-center py-2 rounded">Login</h5>
                <form onSubmit={postData}>
                    {/* Username/Email Field */}
                    <div className="my-3">
                        <label className="fw-bold">Username/Email</label>
                        <input
                            type="text"
                            name="username"
                            onChange={getInputData}
                            placeholder="Enter Username/Email"
                            className={`form-control border-2 ${errorMessage ? "border-danger" : "border-primary"}`}
                        />
                    </div>
                    {/* Password Field */}
                    <div className="my-3 position-relative">
                        <label className="fw-bold">Password</label>
                        <div className="position-relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                onChange={getInputData}
                                placeholder="Enter Password"
                                className={`form-control border-2 pe-5 ${errorMessage ? "border-danger" : "border-primary"}`}
                            />
                            <span
                                className="position-absolute top-50 end-0 translate-middle-y me-3"
                                style={{ cursor: "pointer" }}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"} fs-5`}></i>
                            </span>
                        </div>
                    </div>
                    {errorMessage && (
                        <div className="alert alert-danger mt-3">
                            {errorMessage}
                        </div>
                    )}
                    {/* Remember Me Checkbox */}
                    <div className="form-check my-3">
                        <input type="checkbox" className="form-check-input" id="rememberMe" />
                        <label className="form-check-label ms-2" htmlFor="rememberMe">Remember Me</label>
                    </div>

                    {/* Login Button */}
                    <div className="d-flex justify-content-center my-3">
                        <button type="submit" className="btn btn-primary text-light w-100">Login</button>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="d-flex justify-content-center gap-3">
                        <button className="btn btn-outline-primary d-flex align-items-center">
                            <i className="fab fa-google me-2"></i> Google
                        </button>
                        <button className="btn btn-outline-primary d-flex align-items-center">
                            <i className="fab fa-facebook me-2"></i> Facebook
                        </button>
                    </div>

                    {/* Forgot Password & Signup Links */}
                    <div className="my-3 d-flex justify-content-center">
                        <Link to="/forgetPassword-1" className="text-decoration-none text-primary">Forgot Password?</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
