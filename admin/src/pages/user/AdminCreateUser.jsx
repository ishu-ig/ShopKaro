import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const checklist = [
    { dot: "bg-success", title: "Assign role",  body: "Only Admin or Super Admin roles can be created." },
    { dot: "bg-primary", title: "Set username", body: "Username must be unique across all users."        },
    { dot: "bg-warning", title: "Send invite",  body: "Users receive activation by email."              },
];

function formValidator(e) {
    if (!e.target.value.trim()) return `${e.target.name} field is mandatory`;
    return "";
}

export default function AdminCreateUser() {
    let [data, setData] = useState({
        name: "",
        username: "",
        email: "",
        phone: "",
        role: "Admin",
        password: "",
        cpassword: "",
        active: true
    })
    let [error, setError] = useState({
        name: "Name field is mandatory",
        username: "Username field is mandatory",
        email: "Email address field is mandatory",
        phone: "Phone number field is mandatory",
        password: "Password field is mandatory"
    })
    let [show, setShow] = useState(false)
    let navigate = useNavigate()

    function getInputData(e) {
        let { name, value } = e.target

        if (name !== "active" && name !== "role" && name !== "cpassword") {
            setError((old) => ({
                ...old,
                [name]: formValidator(e)
            }))
        }
        setData((old) => ({
            ...old,
            [name]: name === "active" ? (value === "1" ? true : false) : value
        }))
    }

    async function postData(e) {
        e.preventDefault()
        if (data.password !== data.cpassword) {
            setShow(true)
            setError((old) => ({
                ...old,
                password: "Password and Confirm Password do not match"
            }))
            return
        }
        let errorItem = Object.values(error).find(x => x !== "")
        if (errorItem) {
            setShow(true)
            return
        }
        let item = {
            name: data.name,
            username: data.username,
            email: data.email,
            phone: data.phone,
            role: data.role,
            password: data.password,
            active: data.active
        }
        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "authorization": localStorage.getItem("token")
            },
            body: JSON.stringify(item)
        })
        response = await response.json()
        if (response.result === "Done") {
            navigate("/user")
        } else {
            setShow(true)
            setError((old) => ({
                ...old,
                "username": response.reason?.username ?? "",
                "email": response.reason?.email ?? "",
            }))
        }
    }

    return (
        <main className="dashboard-content">
            <div className="container-fluid px-3 px-lg-4 py-4">

                {/* Page heading */}
                <div className="page-heading">
                    <div className="page-heading-copy">
                        <span className="page-icon">
                            <i className="bi bi-person-plus" aria-hidden="true"></i>
                        </span>
                        <div>
                            <p className="eyebrow mb-1">Management</p>
                            <h1 className="h3 mb-1">Add User</h1>
                            <p className="text-muted mb-0">
                                Create a new Admin or Super Admin user.
                            </p>
                        </div>
                    </div>
                    <div className="heading-actions">
                        <Link className="btn btn-outline-secondary btn-sm" to="/user">
                            <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to Users
                        </Link>
                    </div>
                </div>

                {show && (
                    <div className="alert alert-danger alert-dismissible" role="alert">
                        {Object.values(error).find(x => x !== "")}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShow(false)}
                            aria-label="Close"
                        />
                    </div>
                )}

                <section className="row g-3">

                    {/* Form */}
                    <div className="col-12 col-xl-8">
                        <div className="panel">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-person-badge" aria-hidden="true"></i>
                                        <span>User Information</span>
                                    </h2>
                                    <p className="text-muted mb-0">
                                        Fill in the details to create a new user.
                                    </p>
                                </div>
                            </div>

                            <div className="row g-3">

                                {/* Name */}
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="name">Full Name</label>
                                    <input
                                        className="form-control"
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={getInputData}
                                        required
                                    />
                                    {show && error.name && (
                                        <div className="text-danger small mt-1">{error.name}</div>
                                    )}
                                </div>

                                {/* Username */}
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="username">Username</label>
                                    <input
                                        className="form-control"
                                        id="username"
                                        type="text"
                                        name="username"
                                        value={data.username}
                                        onChange={getInputData}
                                        required
                                    />
                                    {show && error.username && (
                                        <div className="text-danger small mt-1">{error.username}</div>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="email">Email Address</label>
                                    <input
                                        className="form-control"
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={getInputData}
                                        required
                                    />
                                    {show && error.email && (
                                        <div className="text-danger small mt-1">{error.email}</div>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="phone">Phone Number</label>
                                    <input
                                        className="form-control"
                                        id="phone"
                                        type="text"
                                        name="phone"
                                        value={data.phone}
                                        onChange={getInputData}
                                        required
                                    />
                                    {show && error.phone && (
                                        <div className="text-danger small mt-1">{error.phone}</div>
                                    )}
                                </div>

                                {/* Role — only Admin or SuperAdmin */}
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="role">Role</label>
                                    <select
                                        className="form-select"
                                        id="role"
                                        name="role"
                                        value={data.role}
                                        onChange={getInputData}
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="SuperAdmin">Super Admin</option>
                                    </select>
                                </div>

                                {/* Active */}
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="active">Status</label>
                                    <select
                                        className="form-select"
                                        id="active"
                                        name="active"
                                        value={data.active ? "1" : "0"}
                                        onChange={getInputData}
                                    >
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>

                                {/* Password */}
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="password">Password</label>
                                    <input
                                        className="form-control"
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        onChange={getInputData}
                                        required
                                    />
                                    {show && error.password && (
                                        <div className="text-danger small mt-1">{error.password}</div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="cpassword">Confirm Password</label>
                                    <input
                                        className="form-control"
                                        id="cpassword"
                                        type="password"
                                        name="cpassword"
                                        value={data.cpassword}
                                        onChange={getInputData}
                                        required
                                    />
                                </div>

                            </div>

                            {/* Actions */}
                            <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                                <Link className="btn btn-outline-secondary" to="/user">Cancel</Link>
                                <button className="btn btn-primary" type="button" onClick={postData}>
                                    <i className="bi bi-check-circle" aria-hidden="true"></i> Create User
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Checklist */}
                    <div className="col-12 col-xl-4">
                        <div className="panel h-100">
                            <h2 className="h5 mb-3 section-title">
                                <i className="bi bi-list-check" aria-hidden="true"></i>
                                <span>Setup Checklist</span>
                            </h2>
                            <div className="activity-list">
                                {checklist.map(({ dot, title, body }) => (
                                    <div key={title} className="activity-item">
                                        <span className={`activity-dot ${dot}`}></span>
                                        <div>
                                            <p className="mb-1 fw-semibold">{title}</p>
                                            <p className="text-muted small mb-0">{body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </section>
            </div>
        </main>
    );
}