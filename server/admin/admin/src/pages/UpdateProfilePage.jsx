import React, { useEffect, useState } from "react";
import imageValidator from "../FormValidators/imageValidator";
import formValidator from "../FormValidators/formValidator";
import { useNavigate } from "react-router-dom";

export default function UpdateProfilePage() {
    let [data, setData] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pin: "",
        pic: "",
    });
    let [errorMessage, setErrorMessage] = useState({
        name: "",
        phone: "",
        pic: "",
    });

    let [show, setShow] = useState(false);
    let [preview, setPreview] = useState(null); // Image Preview
    let navigate = useNavigate();

    function getInputData(e) {
        let name = e.target.name;
        let value = e.target.files ? e.target.files[0] : e.target.value;
        
        if (name !== "active") {
            setErrorMessage((old) => ({
                ...old,
                [name]: e.target.files ? imageValidator(e) : formValidator(e),
            }));
        }

        setData((old) => ({
            ...old,
            [name]: value,
        }));
    }

    async function postData(e) {
        e.preventDefault();
        let error = Object.values(errorMessage).find((x) => x !== "");
        if (error) {
            setShow(true);
        } else {
            try {
                let formData = new FormData();
                formData.append("_id", data._id);
                formData.append("name", data.name);
                formData.append("phone", data.phone);
                formData.append("address", data.address);
                formData.append("pin", data.pin);
                formData.append("city", data.city);
                formData.append("state", data.state);
                formData.append("pic", data.pic);

                let response = await fetch(
                    `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
                    {
                        method: "PUT",
                        headers: {
                            "authorization": localStorage.getItem("token"),
                        },
                        body: formData,
                    }
                );

                response = await response.json();
                console.log(response)
                if (response.result === "Done") {
                    navigate("/profile");
                } else {
                    alert("Something Went Wrong");
                }
            } catch (error) {
                alert("Internal Server Error");
            }
        }
    }

    useEffect(() => {
        (async () => {
            try {
                let response = await fetch(
                    `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
                    {
                        method: "GET",
                        headers: {
                            "content-type": "application/json",
                            authorization: localStorage.getItem("token"),
                        },
                    }
                );
                response = await response.json();
                if (response.result === "Done") {
                    setData(response.data);
                    if (response.data.pic) {
                        setPreview(`${process.env.REACT_APP_BACKEND_SERVER}/${response.data.pic}`);
                    }
                }
            } catch (error) {
                alert("Internal Server Error");
            }
        })();
    }, []);

    return (
        <div className="container mt-5">
            <div className="card p-4 shadow-lg mx-auto" style={{ maxWidth: "700px" }}>
                <h4 className="text-center text-primary mb-4">Update Profile</h4>

                {/* Profile Picture Preview */}
                <div className="text-center mb-3">
                    <img
                        src={preview || "/img/noimage.jpg"}
                        alt="Profile"
                        className="rounded-circle border border-secondary"
                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                    />
                </div>

                <form onSubmit={postData}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="fw-bold">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={data.name}
                                onChange={getInputData}
                                className={`form-control ${show && errorMessage.name ? "border-danger" : "border-primary"}`}
                                placeholder="Enter your name"
                            />
                            {show && errorMessage.name && <small className="text-danger">{errorMessage.name}</small>}
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="fw-bold">Phone Number</label>
                            <input
                                type="number"
                                name="phone"
                                value={data.phone}
                                onChange={getInputData}
                                className={`form-control ${show && errorMessage.phone ? "border-danger" : "border-primary"}`}
                                placeholder="Enter phone number"
                            />
                            {show && errorMessage.phone && <small className="text-danger">{errorMessage.phone}</small>}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="fw-bold">Address</label>
                        <textarea
                            name="address"
                            value={data.address}
                            onChange={getInputData}
                            className="form-control border-primary"
                            placeholder="Enter your address"
                            rows={3}
                        ></textarea>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="fw-bold">State</label>
                            <input
                                type="text"
                                name="state"
                                value={data.state}
                                onChange={getInputData}
                                className="form-control border-primary"
                                placeholder="Enter state"
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="fw-bold">City</label>
                            <input
                                type="text"
                                name="city"
                                value={data.city}
                                onChange={getInputData}
                                className="form-control border-primary"
                                placeholder="Enter city"
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="fw-bold">Pin Code</label>
                            <input
                                type="number"
                                name="pin"
                                value={data.pin}
                                onChange={getInputData}
                                className="form-control border-primary"
                                placeholder="Enter pin code"
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="fw-bold">Upload Profile Picture</label>
                            <input type="file" name="pic" onChange={getInputData} className="form-control border-primary" />
                        </div>
                    </div>

                    <div className="mt-3">
                        <button type="submit" className="btn btn-primary w-100 py-2">Update Profile</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
