import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'


export default function ForgetPasswordPage2() {
    let navigate = useNavigate()
    let [otp, setOtp] = useState("")
    let [errorMessage, setErrorMessage] = useState()

    function getInputData(e) {
        setOtp(e.target.value)
    }

    async function postData(e) {
        e.preventDefault()
        try {
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/forgetPassword-2`, {
                method: "POST",
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({username : localStorage.getItem("reset-password-username"), otp: otp })
            })
            response = await response.json()
            if (response.result === "Done") {
                navigate("/forgetPassword-3")
            }
            else
                setErrorMessage(response.reason)

        } catch (error) {
            alert("Internal Server Error")
        }
    }
    return (
        <>
            <div className="container my-5 d-flex justify-content-center p-5">
                <div className="card p-4 shadow-lg" style={{ maxWidth: "450px", width: "100%" }}>
                    <h5 className="text-light bg-primary text-center py-2 rounded">Reset Passowrd</h5>
                    <form onSubmit={postData}>
                        {/* otp/Email Field */}
                        <div className="my-3">
                            <label className="fw-bold">OTP*</label>
                            <input
                                type="text"
                                name="otp"
                                onChange={getInputData}
                                placeholder="Enter OTP"
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
