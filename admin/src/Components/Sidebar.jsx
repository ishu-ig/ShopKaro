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

  const navSectionsByRole = {
    admin: [
      {
        section: "Overview",
        items: [
          { to: "/", icon: "bi-grid-1x2", label: "Dashboard", badge: "Live" },
        ],
      },
      {
        section: "Catalog",
        items: [
          { to: "/product", icon: "bi-box-seam", label: "Products" },
          { to: "/maincategory", icon: "bi-folder", label: "Main Categories" },
          { to: "/subcategory", icon: "bi-diagram-3", label: "Sub Categories" },
          { to: "/brand", icon: "bi-award", label: "Brands" },
          { to: "/banner", icon: "bi-images", label: "Banners" },
        ],
      },
      {
        section: "Sales & Orders",
        items: [
          { to: "/checkout", icon: "bi-bag-check", label: "Orders" },
          // { to: "/booking", icon: "bi-calendar2-check", label: "Bookings" },
          { to: "/shop", icon: "bi-shop", label: "Shops" },
        ],
      },
      {
        section: "Management",
        items: [
          { to: "/admins", icon: "bi-shield-lock", label: "Admins" },
          { to: "/user", icon: "bi-people", label: "Customers" },
          { to: "/deliveryBoy", icon: "bi-bicycle", label: "Delivery Boys" },
        ],
      },
      {
        section: "Engagement",
        items: [
          { to: "/contactUs", icon: "bi-chat-dots", label: "Contact Queries" },
          { to: "/testimonial", icon: "bi-chat-square-quote", label: "Testimonials" },
          { to: "/newsletter", icon: "bi-envelope-paper", label: "Newsletter" },
        ],
      },
      {
        section: "System",
        items: [
          { to: "/shop/setting", icon: "bi-gear", label: "Settings" },
        ],
      },
    ],

    shop: [
      {
        section: "Overview",
        items: [
          { to: `/shop/${userId}`, icon: "bi-grid-1x2", label: "Dashboard" },
        ],
      },
      {
        section: "Catalog",
        items: [
          { to: `/shopProduct/shop/${userId}`, icon: "bi-box-seam", label: "Products" },
          { to: `/shopMaincategory/shop/${userId}`, icon: "bi-folder", label: "Main Categories" },
          { to: `/shopSubcategory/shop/${userId}`, icon: "bi-diagram-3", label: "Sub Categories" },
        ],
      },
      {
        section: "Orders",
        items: [
          { to: `/shopCheckout/shop/${userId}`, icon: "bi-bag-check", label: "Orders" },
        ],
      },
      {
        section: "System",
        items: [
          { to: `/shop/setting`, icon: "bi-gear", label: "Settings" },
        ],
      },
    ],

    deliveryboy: [
      {
        section: "Overview",
        items: [
          { to: `/deliveryBoy/${userId}/dashboard`, icon: "bi-grid-1x2", label: "Dashboard" },
        ],
      },
      {
        section: "Deliveries",
        items: [
          { to: `/deliveryBoy/${userId}/orders`, icon: "bi-bag-check", label: "Assigned Orders" },
          { to: `/deliveryBoy/${userId}/history`, icon: "bi-clock-history", label: "Order History" },
        ],
      },
      {
        section: "System",
        items: [
          { to: `/shop/setting`, icon: "bi-gear", label: "Settings" },
        ],
      },
    ],
  };

  const navSections = navSectionsByRole[role] || [];

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
            <i className="bi bi-cart4" aria-hidden="true"></i>
          </span>
          <span className="brand-copy">
            <span className="brand-title d-flex align-items-center gap-1.5">
              <span>ShopKaro</span>
              <span className="brand-badge">PRO</span>
            </span>
            <span className="brand-subtitle">Control Center</span>
          </span>
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        {navSections.map(({ section, items }) => (
          <div key={section} className="nav-section-group">
            <div className="nav-section-label">{section}</div>
            {items.map(({ to, icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/" || to === `/shop/${userId}` || to === `/deliveryBoy/${userId}/dashboard`}
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
                {badge && <span className="nav-badge ms-auto">{badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-user-container">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar-wrap position-relative">
            <img
              className="avatar-img avatar-md sidebar-user-avatar"
              src={data?.pic ? `${data.pic}` : "https://i.pravatar.cc/100"}
              alt={name}
            />
            <span className="user-online-dot"></span>
          </div>
          <div className="sidebar-user-info">
            <strong className="sidebar-user-name text-truncate">{name}</strong>
            <span className="sidebar-user-role badge bg-primary-subtle text-primary border-0 font-size-xs">
              {rawRole || "Admin"}
            </span>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <span className="status-dot"></span>
        <span className="sidebar-footer-text">ShopKaro v2.4 • Online</span>
      </div>
    </aside>
  );
}