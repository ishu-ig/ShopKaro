import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function AdminSidebar({ isExpanded }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(null);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // 🔥 Fetch logged-in user data
  useEffect(() => {
    (async () => {
      try {
        let response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          },
        );

        response = await response.json();

        if (response.data) setData(response.data);
        else navigate("/login");
      } catch {
        navigate("/login");
      }
    })();
  }, [navigate]);

  return (
    <div id="sidebar" className={isExpanded ? "expanded" : ""}>
      <div className="sidebar-header">
        <img
          src={
            data?.pic
              ? `${process.env.REACT_APP_BACKEND_SERVER}/${data.pic}`
              : "https://i.pravatar.cc/100"
          }
          alt="Admin"
          className="admin-avatar"
        />

        <span className="admin-name">
          {data?.name || localStorage.getItem("name") || "Admin"}
        </span>

        <span className="admin-role">
          {localStorage.getItem("role") || "Administrator"}
        </span>
      </div>

      <ul className="sidebar-nav">
        <li>
          <Link
            to="/"
            className={`sidebar-link text-light ${isActive("/dashboard") ? "active" : ""}`}
          >
            <i className="fa fa-home"></i>
            <span>Dashboard</span>
          </Link>
        </li>

        <li>
          <Link
            to="/maincategory"
            className={`sidebar-link text-light ${isActive("/maincategory") ? "active" : ""}`}
          >
            <i className="fa fa-list"></i>
            <span>Maincategory</span>
          </Link>
        </li>

        <li>
          <Link
            to="/subcategory"
            className={`sidebar-link text-light ${isActive("/subcategory") ? "active" : ""}`}
          >
            <i className="fa fa-list"></i>
            <span>Subcategory</span>
          </Link>
        </li>

        <li>
          <Link
            to="/product"
            className={`sidebar-link text-light ${isActive("/product") ? "active" : ""}`}
          >
            <i className="fa fa-list"></i>
            <span>Products</span>
          </Link>
        </li>
        <li>
          <Link
            to="/checkout"
            className={`sidebar-link text-light ${isActive("/checkout") ? "active" : ""}`}
          >
            <i className="fa fa-shopping-cart"></i>
            <span>Checkout</span>
          </Link>
        </li>
        <li>
          <Link
            to="/user"
            className={`sidebar-link text-light ${isActive("/user") ? "active" : ""}`}
          >
            <i className="fa fa-users"></i>
            <span>User</span>
          </Link>
        </li>
        <li>
          <Link
            to="/testimonial"
            className={`sidebar-link text-light ${isActive("/testimonial") ? "active" : ""}`}
          >
            <i className="fa fa-star"></i>
            <span>Testmonial</span>
          </Link>
        </li>

        <li>
          <Link
            to="/newsletter"
            className={`sidebar-link text-light ${isActive("/newsletter") ? "active" : ""}`}
          >
            <i className="fa fa-envelope"></i>
            <span>Newsletter</span>
          </Link>
        </li>

        <li>
          <Link
            to="/contactus"
            className={`sidebar-link text-light ${isActive("/contactus") ? "active" : ""}`}
          >
            <i className="fa fa-phone"></i>
            <span>ContactUs</span>
          </Link>
        </li>

        <li>
          <Link
            to="/settings"
            className={`sidebar-link text-light ${isActive("/settings") ? "active" : ""}`}
          >
            <i className="fa fa-cog"></i>
            <span>Settings</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
