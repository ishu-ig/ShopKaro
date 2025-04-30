import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroSection from '../Components/HeroSection'

export default function ForgetPasswordPage1() {
    let navigate = useNavigate()
    let [username, setUsername] = useState("")
    let [errorMessage, setErrorMessage] = useState()

    function getInputData(e) {
        setUsername(e.target.value)
    }

    async function postData(e) {
        e.preventDefault()
        try {
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/forgetPassword-1`, {
                method: "POST",
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ username: username, })
            })
            response = await response.json()
            if (response.result === "Done") {
                localStorage.setItem("reset-password-username", username)
                navigate("/forgetPassword-2")
            }
            else
                setErrorMessage("User Not Found")

        } catch (error) {
            alert("Internal Server Error")
        }
    }
    return (
        <>
            <HeroSection title=" Reset Password" />
            <div className="container my-5 d-flex justify-content-center p-5">
                <div className="card p-4 shadow-lg" style={{ maxWidth: "450px", width: "100%" }}>
                    <h5 className="text-light bg-primary text-center py-2 rounded">Reset Passowrd</h5>
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
                            {errorMessage && <p className="text-danger small mt-1">{errorMessage}</p>}
                        </div>

                        
                        {/* Login Button - Centered */}
                        <div className="d-flex justify-content-center my-3">
                            <button type="submit" className="btn btn-primary text-light w-100">Send OTP</button>
                        </div>
                    </form>
                </div>
            </div>

        </>
    )
}
