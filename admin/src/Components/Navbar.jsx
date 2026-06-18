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

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();                        // ✅ was missing
    const [data, setData] = useState(null);
  
    useEffect(() => {
      (async () => {
        try {
          let response = await fetch(
            `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
            { headers: { Authorization: localStorage.getItem("token") } }
          );
          response = await response.json();
          if (response.data) setData(response.data);
          else navigate("/login");
        } catch {
          navigate("/login");
        }
      })();
    }, [navigate]);
 

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

        <form className="d-none d-md-flex ms-3 flex-grow-1" role="search">
          <input
            className="form-control search-input"
            type="search"
            placeholder="Search users, orders, reports"
            aria-label="Search"
          />
        </form>

        <div className="navbar-actions ms-auto">

          {/* Theme toggle — handled entirely in React, no data-theme-toggle attr needed */}
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
            <div className="dropdown-menu dropdown-menu-end notification-menu">
              <div className="dropdown-header fw-bold text-body">Notifications</div>
              {notifications.map(({ to, title, time }) => (
                <Link key={title} className="dropdown-item" to={to}>
                  <span className="notification-title">{title}</span>
                  <span className="notification-time">{time}</span>
                </Link>
              ))}
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
              <img
                className="avatar-img avatar-sm"
                src={
                        data?.pic
                            ? `${data.pic}`
                            : "https://i.pravatar.cc/100"
                    }
                alt="Admin"
              />
              <span className="profile-name d-none d-sm-inline">
                {localStorage.getItem("name") || "Admin Hasan"}
              </span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
              <li><Link className="dropdown-item" to="/settings">Account settings</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button
                  className="dropdown-item text-danger w-100 text-start border-0 bg-transparent"
                  onClick={logout}
                >
                  Sign out
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