import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const notifications = [
  { to: "/users",    title: "New user registered",       time: "4 minutes ago"  },
  { to: "/charts",   title: "Revenue target reached",    time: "32 minutes ago" },
  { to: "/settings", title: "Security review completed", time: "1 hour ago"     },
];

const THEME_KEY = "adminHMD.colorTheme";

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-bs-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

// Same three-role mapping as Sidebar.jsx / ProfilePage.jsx, kept local to
// this file on purpose. "Admin" -> /api/user, "DeliveryBoy" -> /api/deliveryBoy,
// "shop" -> /api/shop.
function apiPathForRole(role) {
  switch (role) {
    case "Admin":
      return "user";
    case "DeliveryBoy":
      return "deliveryBoy";

    case "shop":
      return "shop";

    default:
      return null;
  }
}

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  const rawRole = localStorage.getItem("role"); // exact casing: "Admin" | "DeliveryBoy" | "shop"
  const userId = localStorage.getItem("userid");

  useEffect(() => {
    (async () => {
      try {
        if (!rawRole || !userId) {
          navigate("/login");
          return;
        }

        let response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/${apiPathForRole(rawRole)}/${userId}`,
          { headers: { Authorization: localStorage.getItem("token") } }
        );
        response = await response.json();
        if (response.data) setData(response.data);
        else navigate("/login");
      } catch {
        navigate("/login");
      }
    })();
  }, [navigate, rawRole, userId]);

  // Apply saved / preferred theme on first render
  useEffect(() => {
    applyTheme(getPreferredTheme());
  }, []);

  function handleThemeToggle() {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  }

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  const name = data?.name || localStorage.getItem("name") || "Admin";

  return (
    <nav className="navbar admin-navbar navbar-expand bg-white">
      <div className="container-fluid px-3 px-lg-4">

        {/* Hamburger — calls toggleSidebar from App */}
        <button
          className="sidebar-toggle"
          type="button"
          onClick={toggleSidebar}
          aria-controls="adminSidebar"
          aria-label="Toggle sidebar"
        >
          <span /><span /><span />
        </button>

        {/* Search input with keyboard shortcut hint */}
        <div className="d-none d-md-flex align-items-center ms-3 flex-grow-1 search-wrapper">
          <i className="bi bi-search search-icon" aria-hidden="true"></i>
          <input
            className="form-control search-input"
            type="search"
            placeholder="Search orders, products, customers, categories..."
            aria-label="Search"
          />
          <kbd className="search-shortcut d-none d-lg-inline-block">⌘K</kbd>
        </div>

        <div className="navbar-actions ms-auto">
          {/* Status Indicator */}
          <div className="system-pill d-none d-xl-flex align-items-center gap-2 me-1">
            <span className="live-pulse"></span>
            <span className="system-pill-text">ShopKaro Live</span>
          </div>

          {/* Theme toggle */}
          <button
            className="icon-button theme-toggle"
            type="button"
            onClick={handleThemeToggle}
            aria-label="Switch color theme"
            title="Switch color theme"
          >
            <ThemeIcon />
          </button>

          {/* Notifications */}
          <div className="dropdown">
            <button
              className="icon-button"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Notifications"
            >
              <span className="notification-dot"></span>
              <i className="bi bi-bell" aria-hidden="true"></i>
            </button>
            <div className="dropdown-menu dropdown-menu-end notification-menu p-0 shadow-lg">
              <div className="dropdown-header px-3 py-2 d-flex align-items-center justify-content-between border-bottom">
                <span className="fw-bold text-body">Notifications</span>
                <span className="badge bg-primary-subtle text-primary rounded-pill font-size-xs">3 new</span>
              </div>
              <div className="notification-list py-1">
                {notifications.map(({ to, title, time }, idx) => (
                  <Link key={title} className="dropdown-item px-3 py-2 border-bottom border-light-subtle d-flex align-items-start gap-2" to={to}>
                    <div className={`notification-icon-wrap rounded-circle ${idx === 0 ? 'bg-primary-subtle text-primary' : idx === 1 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                      <i className={`bi ${idx === 0 ? 'bi-person-plus-fill' : idx === 1 ? 'bi-graph-up-arrow' : 'bi-shield-check'}`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="notification-title fw-semibold text-truncate">{title}</div>
                      <div className="notification-time text-muted">{time}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="p-2 text-center border-top">
                <Link to="/contactUs" className="text-decoration-none text-primary small fw-semibold">
                  View all activity <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="dropdown">
            <button
              className="profile-button dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div className="profile-avatar-container position-relative">
                <img
                  className="avatar-img avatar-sm"
                  src={
                    data?.pic
                      ? `${data.pic}`
                      : "https://i.pravatar.cc/100"
                  }
                  alt={name}
                />
                <span className="avatar-status-dot"></span>
              </div>
              <div className="d-none d-sm-flex flex-column text-start ms-1 me-1 line-height-tight">
                <span className="profile-name fw-bold">{name}</span>
                <span className="profile-role text-muted">{rawRole || "Admin"}</span>
              </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-lg profile-dropdown-menu">
              <li className="dropdown-header px-3 py-2">
                <div className="fw-bold text-body">{name}</div>
                <small className="text-muted">{rawRole === "shop" ? "Merchant Account" : rawRole === "DeliveryBoy" ? "Delivery Partner" : "Super Administrator"}</small>
              </li>
              <li><hr className="dropdown-divider my-1" /></li>
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to={`/${rawRole}/${userId}/profile`}>
                  <i className="bi bi-person text-primary"></i>
                  <span>My Profile</span>
                </Link>
              </li>
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to={`/${rawRole}/setting`}>
                  <i className="bi bi-gear text-secondary"></i>
                  <span>Account Settings</span>
                </Link>
              </li>
              <li><hr className="dropdown-divider my-1" /></li>
              <li>
                <button
                  className="dropdown-item text-danger d-flex align-items-center gap-2 py-2 w-100 text-start border-0 bg-transparent"
                  onClick={logout}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Sign Out</span>
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </nav>
  );
}

// Reads the current theme from <html> and renders the correct icon
function ThemeIcon() {
  const [theme, setTheme] = React.useState(
    () => document.documentElement.getAttribute("data-theme") || "light"
  );

  useEffect(() => {
    // Watch for external changes (e.g. main.js or system preference)
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <i
      className={theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars"}
      aria-hidden="true"
    />
  );
}