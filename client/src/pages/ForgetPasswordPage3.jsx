import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import HeroSection from '../Components/HeroSection'

export default function () {
    let navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false);
    let [data, setData] = useState({
        password: "",
        cpassword: ""
    })
    let [errorMessage, setErrorMessage] = useState()

    function getInputData(e) {
        let { name, value } = e.target
        setErrorMessage("")
        setData((old) => {
            return {
                ...old,
                [name]: value
            }
        })
    }

    async function postData(e) {
        e.preventDefault()
        if (data.password === data.cpassword) {
            try {
                let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/forgetPassword-3`, {
                    method: "POST",
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({ username: localStorage.getItem("reset-password-username"), password: data.password })
                })
                response = await response.json()
                if (response.result === "Done") {
                    localStorage.removeItem("reset-password-username")
                    navigate("/login")
                }
                else
                    setErrorMessage(response.reason)
            } catch (error) {
                alert("Internal Server Error")
            }
        }
        else {
            setErrorMessage("Password and Confirm Password Doesn't Matched")
        }
    }
    return (
        <>
            <HeroSection title=" Reset Password" />
            <div className="container my-5 d-flex justify-content-center p-5">
                <div className="card p-4 shadow-lg" style={{ maxWidth: "450px", width: "100%" }}>
                    <h5 className="text-light bg-primary text-center py-2 rounded">Reset Password</h5>
                    <form onSubmit={postData}>
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
                                    className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer"
                                    style={{ cursor: "pointer" }} onClick={() => { setShowPassword(!showPassword) }}
                                ><i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"} fs-5`}></i></span>
                            </div>
                            {errorMessage && <p className="text-danger small mt-1">{errorMessage}</p>}
                        </div>
                        <div className="my-3 position-relative">
                            <label className="fw-bold">Confirm Password</label>
                            <div className="position-relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="cpassword"
                                    onChange={getInputData}
                                    placeholder="Enter Password"
                                    className={`form-control border-2 pe-5 ${errorMessage ? "border-danger" : "border-primary"}`}
                                />
                                <span
                                    className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer"
                                    style={{ cursor: "pointer" }} onClick={() => { setShowPassword(!showPassword) }}
                                ><i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"} fs-5`}></i></span>
                            </div>
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="form-check my-3">
                            <input type="checkbox" className="form-check-input" id="rememberMe" />
                            <label className="form-check-label ms-2" htmlFor="rememberMe">Remember Me</label>
                        </div>

                        {/* Login Button - Centered */}
                        <div className="d-flex justify-content-center my-3">
                            <button type="submit" className="btn btn-primary text-light w-100">Reset</button>
                        </div>
                    </form>
                </div>
            </div>

        </>
    )
}
