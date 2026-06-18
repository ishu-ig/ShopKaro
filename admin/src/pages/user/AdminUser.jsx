/* global $ */
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

export default function AdminUser() {
    let [UserStateData, setUserStateData] = useState([])
    let [search, setSearch] = useState("")

    // Derived stats
    const totalUsers    = UserStateData.length
    const activeCount   = UserStateData.filter(u => u.active).length
    const inactiveCount = UserStateData.filter(u => !u.active).length
    const roleCount     = [...new Set(UserStateData.map(u => u.role))].length

    let filteredData = UserStateData.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.username.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase())
    )

    async function deleteRecord(_id) {
        if (window.confirm("Are you sure you want to delete this user?")) {
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/${_id}`, {
                method: "DELETE",
                headers: { "content-type": "application/json", "authorization": localStorage.getItem("token") }
            })
            response = await response.json()
            getAPIData()
        }
    }

    async function updateRecord(_id) {
        if (window.confirm("Are you sure you want to toggle this user's status?")) {
            let item = UserStateData.find(x => x._id === _id)
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/${_id}`, {
                method: "PUT",
                headers: { "content-type": "application/json", "authorization": localStorage.getItem("token") },
                body: JSON.stringify({ ...item, active: !item?.active })
            })
            response = await response.json()
            getAPIData()
        }
    }

    async function getAPIData() {
        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user`, {
            method: "GET",
            headers: { "content-type": "application/json", "authorization": localStorage.getItem("token") }
        })
        response = await response.json()
        setUserStateData(response.data)
        let time = setTimeout(() => {
            if (window.$ && !window.$.fn.DataTable.isDataTable('#DataTable')) {
                window.$('#DataTable').DataTable()
            }
        }, 500)
        return time
    }

    useEffect(() => {
        let time = getAPIData()
        return () => clearTimeout(time)
    }, [])

    // Avatar initials + color
    const getInitials = name =>
        name ? name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() : "?"

    const avatarColor = name => {
        const colors = ["#0d6efd","#198754","#0dcaf0","#ffc107","#dc3545","#6f42c1","#fd7e14","#20c997"]
        let hash = 0
        for (let c of (name || "")) hash = c.charCodeAt(0) + ((hash << 5) - hash)
        return colors[Math.abs(hash) % colors.length]
    }

    return (
        <>
            <style>{`
                /* ── Action pill strip ── */
                .act-strip {
                    display: inline-flex;
                    align-items: center;
                    gap: 2px;
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 3px;
                }
                .act-btn {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 30px; height: 30px; border-radius: 6px;
                    border: none; background: transparent; cursor: pointer;
                    font-size: 0.88rem; color: #6c757d;
                    transition: background .13s, color .13s, transform .1s;
                    text-decoration: none; position: relative;
                }
                .act-btn:hover { transform: scale(1.1); }
                .act-btn-edit:hover   { background: #cfe2ff; color: #0d6efd; }
                .act-btn-on:hover     { background: #d1e7dd; color: #198754; }
                .act-btn-off:hover    { background: #fff3cd; color: #856404; }
                .act-btn-del:hover    { background: #f8d7da; color: #dc3545; }
                .act-sep {
                    width: 1px; height: 16px;
                    background: #dee2e6; flex-shrink: 0;
                }
                /* Tooltip */
                .act-btn::after {
                    content: attr(data-tip);
                    position: absolute; bottom: calc(100% + 6px); left: 50%;
                    transform: translateX(-50%);
                    background: #212529; color: #fff;
                    font-size: 0.67rem; font-weight: 600;
                    padding: 3px 7px; border-radius: 4px; white-space: nowrap;
                    pointer-events: none; z-index: 20;
                    opacity: 0; transition: opacity .12s;
                }
                .act-btn:hover::after { opacity: 1; }

                /* ── Metric cards ── */
                .metric-card {
                    border-radius: 12px;
                    border: 1px solid rgba(0,0,0,.08);
                    padding: 18px 20px 14px;
                    position: relative; overflow: hidden;
                    transition: transform .15s, box-shadow .15s;
                    box-shadow: 0 1px 4px rgba(0,0,0,.06);
                }
                .metric-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,.10);
                }
                .metric-top {
                    display: flex; align-items: center;
                    justify-content: space-between; margin-bottom: 10px;
                }
                .metric-label {
                    font-size: 0.7rem; font-weight: 700; letter-spacing: .08em;
                    text-transform: uppercase; opacity: .75;
                }
                .metric-icon {
                    width: 34px; height: 34px; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1rem; background: rgba(255,255,255,.3);
                }
                .metric-value {
                    font-size: 1.9rem; font-weight: 700; line-height: 1; margin-bottom: 4px;
                }
                .metric-meta {
                    font-size: 0.75rem; opacity: .75; display: flex; gap: 4px;
                }

                /* Avatar */
                .user-avatar {
                    width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
                    display: inline-flex; align-items: center; justify-content: center;
                    font-size: 0.7rem; font-weight: 700; color: #fff;
                }
                .user-name-cell { font-weight: 600; font-size: 0.875rem; }
                .user-email-cell { font-size: 0.75rem; color: #6c757d; }
                .user-username { font-size: 0.78rem; color: #6c757d; font-family: monospace; }
            `}</style>

            <main className="dashboard-content">
                <div className="container-fluid px-3 px-lg-4 py-4">

                    {/* ── Page heading ── */}
                    <div className="page-heading">
                        <div className="page-heading-copy">
                            <span className="page-icon">
                                <i className="bi bi-people" aria-hidden="true"></i>
                            </span>
                            <div>
                                <p className="eyebrow mb-1">Management</p>
                                <h1 className="h3 mb-1">Users</h1>
                                <p className="text-muted mb-0">Review and manage admin and super admin users.</p>
                            </div>
                        </div>
                        <div className="heading-actions">
                            <Link className="btn btn-primary btn-sm" to="/user/Create">
                                <i className="bi bi-plus-circle" aria-hidden="true"></i> Add User
                            </Link>
                        </div>
                    </div>

                    {/* ── Summary metric cards ── */}
                    <section className="row g-3 mt-2 mb-1" aria-label="User summary">
                        <div className="col-12 col-sm-6 col-xl-3">
                            <article className="metric-card text-white">
                                <div className="metric-top">
                                    <span className="metric-label">Total Users</span>
                                    <span className="metric-icon"><i className="bi bi-people-fill"></i></span>
                                </div>
                                <div className="metric-value">{totalUsers}</div>
                                <div className="metric-meta"><span>registered</span><span>accounts</span></div>
                            </article>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                            <article className="metric-card text-white ">
                                <div className="metric-top">
                                    <span className="metric-label">Active</span>
                                    <span className="metric-icon"><i className="bi bi-check-circle-fill"></i></span>
                                </div>
                                <div className="metric-value">{activeCount}</div>
                                <div className="metric-meta"><span>enabled</span><span>accounts</span></div>
                            </article>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                            <article className="metric-card ">
                                <div className="metric-top">
                                    <span className="metric-label">Inactive</span>
                                    <span className="metric-icon"><i className="bi bi-pause-circle-fill"></i></span>
                                </div>
                                <div className="metric-value">{inactiveCount}</div>
                                <div className="metric-meta"><span>suspended</span><span>accounts</span></div>
                            </article>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                            <article className="metric-card text-white">
                                <div className="metric-top">
                                    <span className="metric-label">Roles</span>
                                    <span className="metric-icon"><i className="bi bi-diagram-3-fill"></i></span>
                                </div>
                                <div className="metric-value">{roleCount}</div>
                                <div className="metric-meta"><span>unique</span><span>roles in use</span></div>
                            </article>
                        </div>
                    </section>

                    {/* ── Table panel ── */}
                    <section className="panel mt-3">
                        <div className="panel-header">
                            <div>
                                <h2 className="h5 mb-1 section-title">
                                    <i className="bi bi-table" aria-hidden="true"></i>
                                    <span>User List</span>
                                </h2>
                                <p className="text-muted mb-0">
                                    Search, review, and manage users.
                                    <span className="ms-2 badge text-bg-secondary">{filteredData.length} / {totalUsers}</span>
                                </p>
                            </div>
                            {/* Search */}
                            <div className="ms-auto" style={{ minWidth: 220 }}>
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-white">
                                        <i className="bi bi-search text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Search users..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                    {search && (
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() => setSearch("")}
                                            title="Clear search"
                                        >
                                            <i className="bi bi-x"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table align-middle mb-0" id="DataTable">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">User</th>
                                        <th scope="col">Username</th>
                                        <th scope="col">Phone</th>
                                        <th scope="col">Company</th>
                                        <th scope="col">Role</th>
                                        <th scope="col">Status</th>
                                        <th scope="col" className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (
                                        filteredData.map((item, index) => (
                                            <tr key={item._id}>
                                                <td className="text-muted" style={{ fontSize: '0.8rem' }}>{index + 1}</td>

                                                {/* User: avatar + name + email stacked */}
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span
                                                            className="user-avatar"
                                                            style={{ background: avatarColor(item.name) }}
                                                        >
                                                            {item.pic
                                                                ? <img src={item.pic} alt={item.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                                : getInitials(item.name)
                                                            }
                                                        </span>
                                                        <div>
                                                            <div className="user-name-cell">{item.name}</div>
                                                            <div className="user-email-cell">{item.email}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="user-username">@{item.username}</span>
                                                </td>

                                                <td className="text-muted" style={{ fontSize: '0.83rem' }}>
                                                    {item.phone || <span className="text-muted opacity-50">—</span>}
                                                </td>

                                                <td className="text-muted" style={{ fontSize: '0.83rem' }}>
                                                    {item.company && item.company !== 'true'
                                                        ? item.company
                                                        : <span className="text-muted opacity-50">—</span>
                                                    }
                                                </td>

                                                <td>
                                                    <span className={`badge ${
                                                        item.role === "Super Admin" ? "text-bg-danger"
                                                        : item.role === "Admin"     ? "text-bg-primary"
                                                        : item.role === "Recruiter" ? "text-bg-success"
                                                        : "text-bg-warning"
                                                    }`}>
                                                        {item.role}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className={`badge ${item.active ? 'text-bg-success' : 'text-bg-secondary'}`}>
                                                        {item.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>

                                                {/* ── Action pill strip ── */}
                                                <td className="text-end">
                                                    <div className="act-strip">
                                                        {/* Edit */}
                                                        <Link
                                                            className="act-btn act-btn-edit"
                                                            to={`/user/Update/${item._id}`}
                                                            data-tip="Edit"
                                                        >
                                                            <i className="bi bi-pencil-square"></i>
                                                        </Link>

                                                        <span className="act-sep"></span>

                                                        {/* Toggle */}
                                                        <button
                                                            className={`act-btn ${item.active ? 'act-btn-off' : 'act-btn-on'}`}
                                                            onClick={() => updateRecord(item._id)}
                                                            data-tip={item.active ? 'Deactivate' : 'Activate'}
                                                        >
                                                            <i className={`bi ${item.active ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
                                                        </button>

                                                        <span className="act-sep"></span>

                                                        {/* Delete */}
                                                        <button
                                                            className="act-btn act-btn-del"
                                                            onClick={() => deleteRecord(item._id)}
                                                            data-tip="Delete"
                                                        >
                                                            <i className="bi bi-trash3-fill"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center text-muted py-5">
                                                <div style={{ fontSize: '2rem', opacity: .3, marginBottom: 8 }}>
                                                    <i className="bi bi-people"></i>
                                                </div>
                                                {search ? `No users found for "${search}"` : "No users available."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                </div>
            </main>
        </>
    )
}