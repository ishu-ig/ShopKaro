import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

// FIX: same three-role mapping pattern as before, kept local to this file
// on purpose. "Admin" / "DeliveryBoy" -> /api/user / /api/deliveryBoy,
// "shop" -> /api/shop. (Renamed from "resturent" to "shop" to match the
// updated Product/Shop schema.)
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

export default function Sidebar({ onLinkClick }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  const rawRole = localStorage.getItem("role"); // exact casing: "Admin" | "DeliveryBoy" | "shop"
  const userId = localStorage.getItem("userid");

  // Nav-link lookup keys are the lowercased form of each of the three real
  // roles, matched against `role` below (which is always lowercased first).
  const role = (rawRole || "").toLowerCase();

  const navLinksByRole = {
    admin: [
      { to: "/", icon: "bi-speedometer2", label: "Dashboard" },
      { to: "/banner", icon: "bi-images", label: "Banners" },
      { to: "/maincategory", icon: "bi-grid-3x3-gap", label: "Main Categories" },
      { to: "/subcategory", icon: "bi-diagram-3", label: "Sub Categories" },
      { to: "/brand", icon: "bi-patch-check", label: "Brands" },
      { to: "/shop", icon: "bi-shop", label: "Shops" },
      { to: "/product", icon: "bi-box-seam", label: "Products" },
      { to: "/checkout", icon: "bi-cart-check", label: "Orders" },
      { to: "/booking", icon: "bi-calendar-check", label: "Bookings" },
      { to: "/testimonial", icon: "bi-chat-square-quote", label: "Testimonials" },
      { to: "/newsletter", icon: "bi-envelope-paper", label: "Newsletter" },
      { to: "/user", icon: "bi-people", label: "Users" },
      { to: "/deliveryBoy", icon: "bi-people", label: "Delivery Boy" },
      { to: "/contactUs", icon: "bi-headset", label: "Contact Queries" },
      { to: `/shop/setting`, icon: "bi-person-circle", label: "Account Setting" },
    ],

    shop: [
      { to: `/shop/${userId}`, icon: "bi-speedometer2", label: "Dashboard" },
      { to: `/shopMaincategory/shop/${userId}`, icon: "bi-grid-3x3-gap", label: "Main Categories" },
      { to: `/shopSubcategory/shop/${userId}`, icon: "bi-diagram-3", label: "Sub Categories" },
      { to: `/shopProduct/shop/${userId}`, icon: "bi-box-seam", label: "Products" },
      { to: `/shopCheckout/shop/${userId}`, icon: "bi-cart-check", label: "Orders" },
      { to: `/shop/setting`, icon: "bi-person-circle", label: "Account Setting" },
    ],

    deliveryboy: [
      { to: `/deliveryBoy/${userId}/dashboard`, icon: "bi-speedometer2", label: "Dashboard" },
      { to: `/deliveryBoy/${userId}/orders`, icon: "bi-bag-check", label: "Assigned Orders" },
      { to: `/deliveryBoy/${userId}/history`, icon: "bi-clock-history", label: "Order History" },
      { to: `/shop/setting`, icon: "bi-person-circle", label: "Account Setting" },
    ],
  };

  const navLinks = navLinksByRole[role] || [];

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