import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const checklist = [
    { dot: "bg-success", title: "Review details", body: "Confirm name and contact info are correct."   },
    { dot: "bg-primary", title: "Check role",     body: "Recruiter edits are limited to status only." },
    { dot: "bg-warning", title: "Save changes",   body: "Changes take effect immediately."            },
];

function formValidator(e) {
    if (!e.target.value.trim()) return `${e.target.name} field is mandatory`;
    return "";
}

export default function AdminUpdateUser() {
    let { _id } = useParams();

    let [data, setData] = useState({
        _id: "",
        name: "",
        username: "",
        email: "",
        phone: "",
        role: "Admin",
        active: true
    });
    let [error, setError] = useState({
        name: "",
        username: "",
        email: "",
        phone: ""
    });
    let [show, setShow] = useState(false);
    let navigate = useNavigate();

    // Determine if the user being edited is a Recruiter
    const isRecruiter = data.role === "Recruiter";

    async function getAPIData() {
        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/${_id}`, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                "authorization": localStorage.getItem("token")
            }
        })
        response = await response.json()
        if (response.data) setData({ ...response.data })
    }

    function getInputData(e) {
        let { name, value } = e.target;

        // For Recruiter, only allow changing the active field
        if (isRecruiter && name !== "active") return;

        if (name !== "active" && name !== "role") {
            setError((old) => ({
                ...old,
                [name]: formValidator(e)
            }));
        }
        setData((old) => ({
            ...old,
            [name]: name === "active" ? (value === "1" ? true : false) : value
        }));
    }

    async function postSubmit(e) {
        e.preventDefault();
        let errorItem = Object.values(error).find(x => x !== "");
        if (errorItem) {
            setShow(true);
            return;
        }
        let item = isRecruiter
            ? { _id: data._id, active: data.active }           // Recruiter: only send active
            : { _id: data._id, name: data.name, username: data.username, email: data.email, phone: data.phone, role: data.role, active: data.active }

        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/${_id}`, {
            method: "PUT",
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

    useEffect(() => {
        getAPIData();
    }, []);

    return (
        <main className="dashboard-content">
            <div className="container-fluid px-3 px-lg-4 py-4">

                {/* Page heading */}
                <div className="page-heading">
                    <div className="page-heading-copy">
                        <span className="page-icon">
                            <i className="bi bi-pencil-square" aria-hidden="true"></i>
                        </span>
                        <div>
                            <p className="eyebrow mb-1">Management</p>
                            <h1 className="h3 mb-1">Update User</h1>
                            <p className="text-muted mb-0">
                                {isRecruiter
                                    ? "Recruiter accounts — only status can be changed."
                                    : "Edit user details, role, and status."}
                            </p>
                        </div>
                    </div>
                    <div className="heading-actions">
                        <Link className="btn btn-outline-secondary btn-sm" to="/user">
                            <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to Users
                        </Link>
                    </div>
                </div>

                {/* Recruiter restriction banner */}
                {isRecruiter && (
                    <div className="alert alert-info d-flex align-items-center gap-2 mb-3" role="alert">
                        <i className="bi bi-info-circle-fill"></i>
                        <span>This is a <strong>Recruiter</strong> account. Only the <strong>Status</strong> field can be modified.</span>
                    </div>
                )}

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
                                        {isRecruiter
                                            ? "Only the status field is editable for Recruiter accounts."
                                            : "Update the details for this user."}
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
                                        disabled={isRecruiter}
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
                                        disabled={isRecruiter}
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
                                        disabled={isRecruiter}
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
                                        disabled={isRecruiter}
                                        required
                                    />
                                    {show && error.phone && (
                                        <div className="text-danger small mt-1">{error.phone}</div>
                                    )}
                                </div>

                                {/* Role — only editable for non-Recruiter, and only Admin/SuperAdmin options */}
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="role">Role</label>
                                    <select
                                        className="form-select"
                                        id="role"
                                        name="role"
                                        value={data.role}
                                        onChange={getInputData}
                                        disabled={isRecruiter}
                                    >
                                        {isRecruiter
                                            ? <option value="Recruiter">Recruiter</option>
                                            : <>
                                                <option value="Admin">Admin</option>
                                                <option value="SuperAdmin">Super Admin</option>
                                              </>
                                        }
                                    </select>
                                </div>

                                {/* Active — always editable */}
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

                            </div>

                            {/* Actions */}
                            <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                                <Link className="btn btn-outline-secondary" to="/user">Cancel</Link>
                                <button className="btn btn-primary" type="button" onClick={postSubmit}>
                                    <i className="bi bi-check-circle" aria-hidden="true"></i> Update User
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Checklist */}
                    <div className="col-12 col-xl-4">
                        <div className="panel h-100">
                            <h2 className="h5 mb-3 section-title">
                                <i className="bi bi-list-check" aria-hidden="true"></i>
                                <span>Update Checklist</span>
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
    )
}