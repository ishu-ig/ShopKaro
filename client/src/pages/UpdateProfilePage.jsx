import React, { useEffect, useState } from 'react'
import HeroSection from '../Components/HeroSection'

import { useNavigate } from 'react-router-dom'

import formValidator from '../FormValidator/formValidator'
import imageValidator from '../FormValidator/imageValidator'

export default function UpdateProfilePage() {
    let navigate = useNavigate()
    let [data, setData] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pin: "",
        pic: ""
    })
    let [errorMessage, setErrorMessage] = useState({
        name: "",
        phone: "",
        pic: "",
    })
    let [show, setShow] = useState(false)

    function getInputData(e) {
        let name = e.target.name
        // let value = e.target.files ? "product/" + e.target.files[0].name : e.target.value
        let value = e.target.files ?e.target.files[0]: e.target.value

        if (name !== "active") {
            setErrorMessage((old) => {
                return {
                    ...old,
                    [name]: e.target.files ? imageValidator(e) : formValidator(e)
                }
            })
        }
        setData((old) => {
            return {
                ...old,
                [name]: value
            }
        })
    }

    async function postData(e) {
        e.preventDefault()
        let error = Object.values(errorMessage).find((x) => x !== "")
        if (error)
            setShow(true)
        else {
            try {
                let formData = new FormData()
                formData.append("_id", data._id)
                formData.append("name", data.name)
                formData.append("phone", data.phone)
                formData.append("address", data.address)
                formData.append("pin", data.pin)
                formData.append("city", data.city)
                formData.append("state", data.state)
                formData.append("pic", data.pic)

                let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`, {
                    method: "PUT",
                    headers: {
                        // "content-type": "application/json",
                        "authorization": localStorage.getItem("token")
                    },
                    // body: JSON.stringify({ ...data })
                    body:formData
                })
                response = await response.json()
                if (response.result === "Done") 
                        navigate("/profile")
                
                else
                    alert("Something Went Wrong")
            }
            catch (error) {
                alert("Internal Server Error ")
            }
        }

    }
    useEffect(() => {
        (async () => {
            try {
                let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`, {
                    method: "GET",
                    headers: {
                        "content-type": "application/json",
                        "authorization": localStorage.getItem("token")
                    }
                })
                response = await response.json()
                if (response.result === "Done")
                    setData(response.data)
            } catch (error) {
                alert("Internal Server Error")
            }
        })()
    }, [])

    return (
        <>
            <HeroSection title="Update - Update Your Account" />
            <div className="container-fluid my-4">
                <div className="row">
                    <div className="col-md-6 col-sm-8 col-10 card shadow-lg p-4 my-4 m-auto mb-5">
                        <h5 className='text-light bg-primary text-center p-2'>Update Your Account</h5>
                        <form onSubmit={postData}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label>Name*</label>
                                    <input type="text" name="name" value={data.name} placeholder='Full Name' id="" onChange={getInputData} className={`form-control border-3 ${show && errorMessage.name ? "border-danger" : "border-primary"}`} />
                                    {show && errorMessage.name ? <p className='text-danger text-capitalize'>{errorMessage.name}</p> : null}
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label>Phone*</label>
                                    <input type="number" value={data.phone} name="phone" placeholder='Phone Number' id="" onChange={getInputData} className={`form-control border-3 ${show && errorMessage.phone ? "border-danger" : "border-primary"}`} />
                                    {show && errorMessage.phone ? <p className='text-danger text-capitalize'>{errorMessage.phone}</p> : null}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label>Address</label>
                                <textarea name="address" value={data.address} placeholder='Address....' onChange={getInputData} rows={4} className='form-control border-3 border-primary'></textarea>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label>City</label>
                                    <input type="text" name="city" placeholder='City' onChange={getInputData} value={data.city} className='form-control border-3 border-primary'/>
                                </div>
                                <div className="col-md-6">
                                    <label>State</label>
                                    <input type="text" name="state" placeholder='State' onChange={getInputData} value={data.state} className='form-control border-3 border-primary'/>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label>Pin Code</label>
                                    <input type="number" name="pin" placeholder='Pin Code' onChange={getInputData} value={data.pin} className='form-control border-3 border-primary'/>
                                </div>
                                <div className="col-md-6">
                                    <label>Profile Pic</label>
                                    <input type="file" name="pic" onChange={getInputData}  className={`form-control border-3 ${show && errorMessage.pic ? "border-danger" : "border-primary"}`} />
                                    {show && errorMessage.pic ? <p className='text-danger text-capitalize'>{errorMessage.pic}</p> : null}
                                </div>
                            </div>
                            <div className='mb-3'>
                                <button type='submit' className='btn btn-primary text-light w-100'>Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
