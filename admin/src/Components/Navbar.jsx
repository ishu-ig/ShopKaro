import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminNavbar({ toggleSidebar }) {
    let navigate = useNavigate();

    function logout() {
        localStorage.clear();
        navigate("/login");
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            <div className="container-fluid">
                {/* Sidebar Toggle Button */}
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    <i className="fas fa-bars"></i>
                </button>

                <Link className="navbar-brand ms-3 fw-bold" to="/">Dashboard</Link>

                <div className="ms-auto d-none d-lg-flex align-items-center">
                    <Link className="nav-link mx-3" to="/notifications">
                        <i className="fas fa-bell"></i> Notifications
                    </Link>
                    <Link className="nav-link mx-3" to="/profile">
                        <i className="fas fa-user"></i> Profile
                    </Link>
                    <button onClick={logout} className="nav-link text-danger mx-3 bg-body btn-outline-light shadow-none">
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>

                {/* Mobile Dropdown Menu */}
                <div className="dropdown d-lg-none ms-auto">
                    <button className="btn btn-outline-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i className="fas fa-bars"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end text-dark">
                        <li>
                            <Link className="dropdown-item" to="/notifications">
                                <i className="fas fa-bell"></i> Notifications
                            </Link>
                        </li>
                        <li>
                            <Link className="dropdown-item" to="/profile">
                                <i className="fas fa-user"></i> Profile
                            </Link>
                        </li>
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
