import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const navLinks = [
  { to: "/",             icon: "bi-speedometer2",   label: "Dashboard"     },
  { to: "/banner", icon: "bi-layer-backward", label: "Banner" },
  { to: "/maincategory", icon: "bi-layer-backward", label: "Main Category" },
  { to: "/subcategory",  icon: "bi-diagram-3",      label: "Sub Category"  },
  { to: "/brand",        icon: "bi-patch-check",    label: "Brands"        },
  { to: "/product",      icon: "bi-box-seam",       label: "Products"      },
  { to: "/checkout",     icon: "bi-bag-check",      label: "Orders"        },
  { to: "/testimonial",  icon: "bi-chat-quote",     label: "Testimonial"   },
  { to: "/newsletter",   icon: "bi-envelope-paper", label: "Newsletter"    },
  { to: "/contactUs",    icon: "bi-headset",        label: "Queries"       },
];

export default function Sidebar({ onLinkClick }) {
  const navigate = useNavigate();
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

  const name = data?.name || localStorage.getItem("name") || "Admin";

  return (
    <aside className="admin-sidebar" id="adminSidebar" aria-label="Main navigation">
      <div className="sidebar-header">
        <NavLink className="brand-mark" to="/" aria-label="Dashboard">
          <span className="brand-icon">
            <i className="bi bi-grid-1x2-fill" aria-hidden="true"></i>
          </span>
          <span className="brand-copy">
            <span className="brand-title">adminHMD</span>
            <span className="brand-subtitle">Admin Template</span>
          </span>
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        {navLinks.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            onClick={() => {
              if (!window.matchMedia("(min-width: 992px)").matches) {
                onLinkClick?.();
              }
            }}
          >
            <span className="nav-icon">
              <i className={`bi ${icon}`} aria-hidden="true"></i>
            </span>
            <span className="nav-text">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <img
          className="avatar-img avatar-md sidebar-user-avatar"
          src={data?.pic ? `${data.pic}` : "https://i.pravatar.cc/100"}
          alt={name}
        />
        <strong>{name}</strong>
        <small>Active Workspace</small>
      </div>

      <div className="sidebar-footer">
        <span className="status-dot"></span>
        <span className="sidebar-footer-text">System running smoothly</span>
      </div>
    </aside>
  );
}