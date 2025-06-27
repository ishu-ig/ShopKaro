import React, { useState } from 'react'
import HeroSection from '../Components/HeroSection'
import formValidator from '../FormValidator/formValidator'
import { Link, useNavigate } from 'react-router-dom'

export default function SignupPage() {
    let navigate = useNavigate()
    let [data, setData] = useState({
        name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        cpassword: ""
    })
    let [errorMessage, setErrorMessage] = useState({
        name: "Full Name Feild Is Mendatory",
        username: "User Name Feild Is Mendatory",
        email: "Email Address Feild Is Mendatory",
        phone: "Phone Number Feild is Mendatory",
        password: "Password Feild Is Mendatory"
    })
    let [show, setShow] = useState(false)
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    function getInputData(e) {
        let { name, value } = e.target
        setErrorMessage((old) => {
            return {
                ...old,
                [name]: formValidator(e)
            }
        })
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
            let error = Object.values(errorMessage).find((x) => x !== "")
            if (error)
                setShow(true)
            else {
                try {
                    let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user`, {
                        method: "POST",
                        headers: {
                            "content-type": "application/json"
                        },
                        body: JSON.stringify({
                            name: data.name,
                            username: data.username,
                            email: data.email,
                            phone: data.phone,
                            password: data.password,
                            role: "Buyer",
                            active: true
                        })
                    })
                    response = await response.json()
                    console.log(response)
                    if (response.result === "Done") {
                        navigate("/login")
                    }
                    else {
                        setShow(true)
                        setErrorMessage((old) => {
                            return {
                                ...old,
                                'username': response.reason?.username ?? "",
                                'email': response.reason?.email ?? ""
                            }
                        })
                    }
                } catch (error) {
                    alert("Internal Server Error")
                }
            }
        }
        else {
            setShow(true)
            setErrorMessage((old) => {
                return {
                    ...old,
                    'password': 'Password and Confirm Password Does Not Matched'
                }
            })
        }
    }

    return (
        <>
            <HeroSection title="Signup - Create Your Account" />
            <div className="container-fluid my-3">
                <div className="row" style={{marginBottom:"80px"}}>
                    <div className="col-md-6 col-sm-8 col-10 card shadow-lg p-4 my-5 m-auto" >
                        <h5 className='text-light bg-primary text-center p-2'>Create Your Account</h5>
                        <form onSubmit={postData}>
                            {/* Username/Email Field */}
                            <div className="row">
                                <div className=" col-md-6 my-3">
                                    <label className="fw-bold">Name</label>
                                    <input type="text" name="name" placeholder="Your Name" onChange={getInputData} className={`form-control border-2 ${show && errorMessage.name ? "border-danger" : "border-primary"}`} />
                                    {show && errorMessage.name && <p className="text-danger text-capitalize small mt-1">{errorMessage.name}</p>}
                                </div>
                                <div className=" col-md-6 my-3">
                                    <label className="fw-bold">UserName</label>
                                    <input type="text" name="username" placeholder="Username" onChange={getInputData} className={`form-control border-2 ${show && errorMessage.username ? "border-danger" : "border-primary"}`} />
                                    {show && errorMessage.username && <p className="text-danger text-capitalize small mt-1">{errorMessage.username}</p>}
                                </div>
                            </div>
                            <div className="row">
                                <div className=" col-md-6 my-3">
                                    <label className="fw-bold">Email</label>
                                    <input type="email" name="email" placeholder="Email Address" onChange={getInputData} className={`form-control border-2 ${show && errorMessage.email ? "border-danger" : "border-primary"}`} />
                                    {show && errorMessage.email && <p className="text-danger text-capitalize small mt-1">{errorMessage.email}</p>}
                                </div>
                                <div className=" col-md-6 my-3">
                                    <label className="fw-bold">Contact Number</label>
                                    <input type="number" name="phone" placeholder="Phone Number" onChange={getInputData} className={`form-control border-2 ${show && errorMessage.phone ? "border-danger" : "border-primary"}`} />
                                    {show && errorMessage.phone && <p className="text-danger text-capitalize small mt-1">{errorMessage.phone}</p>}
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="row">
                                <div className=" col-md-6 my-3 position-relative">
                                    <label className="fw-bold">Password</label>
                                    <div className="position-relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            onChange={getInputData}
                                            placeholder="Enter Password"
                                            className={`form-control border-2 pe-5 ${show && errorMessage.password ? "border-danger" : "border-primary"}`}
                                        />
                                        <span
                                            className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer"
                                            style={{ cursor: "pointer" }} onClick={() => { setShowPassword(!showPassword) }}
                                        ><i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"} fs-5`}></i></span>
                                    </div>
                                    {show && errorMessage.password && <p className="text-danger text-capitalize small mt-1">{errorMessage.password}</p>}
                                </div>
                                <div className="col-md-6 my-3 position-relative">
                                    <label className="fw-bold">Confirm Password</label>
                                    <div className="position-relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="cpassword"
                                            onChange={getInputData}
                                            placeholder="Enter Password"
                                            className={`form-control border-2 pe-5 ${show && errorMessage.password ? "border-danger" : "border-primary"}`}
                                        />
                                        <span
                                            className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer"
                                            style={{ cursor: "pointer" }} onClick={() => { setShowConfirmPassword(!showConfirmPassword) }}
                                        ><i className={`fa ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} fs-5`}></i></span>
                                    </div>
                                </div>
                            </div>


                            {/* Remember Me Checkbox */}
                            <div className="form-check my-3">
                                <input type="checkbox" className="form-check-input" id="rememberMe" />
                                <label className="form-check-label ms-2" htmlFor="rememberMe">Remember Me</label>
                            </div>

                            {/* Login Button - Centered */}
                            <div className="d-flex justify-content-center my-3">
                                <button type="submit" className="btn btn-primary text-light w-100">Sign Up</button>
                            </div>

                            {/* Social Login Buttons - Centered */}
                            <div className="d-flex justify-content-center gap-3">
                                <button className="btn btn-outline-primary d-flex align-items-center">
                                    <i className="fab fa-google me-2"></i> Google
                                </button>
                                <button className="btn btn-outline-primary d-flex align-items-center">
                                    <i className="fab fa-facebook me-2"></i> Facebook
                                </button>
                            </div>
                            <div className="my-3 d-flex justify-content-between">
                                <Link to="#" className="text-decoration-none text-primary link-hover">Forgot Password?</Link>
                                <Link to="/login" className="text-decoration-none text-primary link-hover">Already Have Account? Login</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
