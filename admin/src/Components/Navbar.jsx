import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminNavbar({ toggleSidebar }) {
    const navigate = useNavigate();

    function logout() {
        localStorage.clear();
        navigate("/login");
    }

    return (
        <nav className="navbar sticky-top">
            <div className="container-fluid d-flex align-items-center gap-3">
                {/* Sidebar Toggle */}
                <button className="sidebar-toggle" onClick={toggleSidebar} title="Toggle Sidebar">
                    <i className="fas fa-bars"></i>
                </button>

                {/* Brand */}
                <Link className="navbar-brand" to="/">
                    Ecom<span>Admin</span>
                </Link>

                {/* Desktop Nav */}
                <div className="ms-auto d-none d-lg-flex align-items-center gap-1">
                    <Link className="nav-link" to="/notifications">
                        <i className="fas fa-bell"></i>
                        Notifications
                        <span className="nav-badge">3</span>
                    </Link>
                    <Link className="nav-link" to="/profile">
                        <i className="fas fa-user-circle"></i>
                        Profile
                    </Link>
                    <button onClick={logout} className="btn-logout">
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>

                {/* Mobile Dropdown */}
                <div className="dropdown d-lg-none ms-auto">
                    <button
                        className="btn btn-outline-dark dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <i className="fas fa-ellipsis-v"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                            <Link className="dropdown-item" to="/notifications">
                                <i className="fas fa-bell"></i> Notifications
                            </Link>
                        </li>
                        <li>
                            <Link className="dropdown-item" to="/profile">
                                <i className="fas fa-user-circle"></i> Profile
                            </Link>
                        </li>
                        <li><hr className="dropdown-divider" style={{ borderColor: "rgba(255,255,255,0.07)" }} /></li>
                        <li>
                            <button className="dropdown-item text-danger" onClick={logout}>
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}