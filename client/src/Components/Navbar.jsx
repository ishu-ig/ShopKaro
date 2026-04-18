import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  let navigate = useNavigate();
  let [data, setData] = useState([]);
  let [scrolled, setScrolled] = useState(false);
  let [menuOpen, setMenuOpen] = useState(false);

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        let response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
          {
            method: "GET",
            headers: {
              "content-Type": "application/json",
              authorization: localStorage.getItem("token"),
            },
          }
        );
        response = await response.json();
        if (response.result === "Done") setData(response.data);
        else navigate("/login");
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    })();
  }, []);

  return (
    <>
      <style>{`
        
      `}</style>

      {/* Top Bar */}
      <div className="sk-topbar d-none d-md-block">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-4">
              <Link to="mailto:vishankchauhan@gmail.com" target="_blank">
                <i className="fas fa-envelope me-2" style={{color:'var(--sk-gold)'}}></i>
                <span className="d-none d-lg-inline">vishankchauhan@gmail.com</span>
              </Link>
              <Link to="tel:+919873848046" target="_blank">
                <i className="fas fa-phone me-2" style={{color:'var(--sk-gold)'}}></i>
                <span className="d-none d-lg-inline">+91-9873848046</span>
              </Link>
            </div>
            <div className="d-flex gap-2">
              {["facebook-f","twitter","instagram","linkedin-in"].map(icon => (
                <a key={icon} href="#" className="social-btn">
                  <i className={`fab fa-${icon}`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sk-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between py-1">

            {/* Brand */}
            <Link to="/" className="sk-brand">
              Shop<span>Karo</span>
            </Link>

            {/* Desktop Nav Links */}
            <ul className="d-none d-lg-flex list-unstyled mb-0 align-items-center gap-0">
              {["/","about","shop","feature","testimonial","contactus"].map((path,i) => {
                const labels = ["Home","About","Shop","Features","Testimonials","Contact"];
                return (
                  <li key={path}>
                    <NavLink to={path === "/" ? "/" : `/${path}`} className={({isActive}) => `sk-nav-link ${isActive ? 'active' : ''}`} end={path === "/"}>
                      {labels[i]}
                    </NavLink>
                  </li>
                );
              })}
            </ul>

            {/* Right Icons */}
            <div className="d-none d-lg-flex align-items-center gap-2">
              <Link to="/wishlist" className="sk-icon-btn" title="Wishlist">
                <i className="fa fa-heart"></i>
              </Link>
              <Link to="/cart" className="sk-icon-btn" title="Cart">
                <i className="fa fa-shopping-cart"></i>
              </Link>

              {/* Profile Dropdown */}
              <div className="dropdown">
                <button className="btn p-0 border-0 bg-transparent dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                  <img
                    src={data.pic ? `${process.env.REACT_APP_BACKEND_SERVER}/${data.pic}` : "/img/noimage.jpg"}
                    className="sk-avatar"
                    alt="User"
                  />
                </button>
                <ul className="dropdown-menu sk-dropdown dropdown-menu-end">
                  <div className="sk-dropdown-header">
                    <img
                      src={data.pic ? `${process.env.REACT_APP_BACKEND_SERVER}/${data.pic}` : "/img/noimage.jpg"}
                      alt="User"
                    />
                    <span className="user-name">{localStorage.getItem("name") || "Guest User"}</span>
                  </div>
                  {[
                    { to:"/profile", icon:"user", label:"My Profile" },
                    { to:"/cart", icon:"shopping-cart", label:"Cart" },
                    { to:"/order", icon:"list-alt", label:"Orders" },
                    { to:"/checkout", icon:"credit-card", label:"Checkout" },
                    { to:"/support", icon:"headphones", label:"Support" },
                  ].map(item => (
                    <li key={item.to}>
                      <Link to={item.to} className="sk-dropdown-item">
                        <i className={`fa fa-${item.icon}`}></i> {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    {localStorage.getItem("login") ? (
                      <button className="sk-dropdown-item danger w-100 text-start border-0 bg-transparent" onClick={logout}>
                        <i className="fa fa-sign-out"></i> Logout
                      </button>
                    ) : (
                      <Link to="/login" className="sk-dropdown-item success">
                        <i className="fa fa-sign-in-alt"></i> Login
                      </Link>
                    )}
                  </li>
                </ul>
              </div>
            </div>

            {/* Mobile Toggler */}
            <button className="sk-toggler d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#mobileNav">
              <span></span>
            </button>
          </div>

          {/* Mobile Collapse */}
          <div className="collapse sk-collapse" id="mobileNav">
            <ul className="list-unstyled mb-0">
              {["/","about","shop","feature","testimonial","contactus"].map((path,i) => {
                const labels = ["Home","About","Shop","Features","Testimonials","Contact"];
                return (
                  <li key={path}>
                    <NavLink to={path === "/" ? "/" : `/${path}`} className={({isActive}) => `sk-nav-link ${isActive ? 'active' : ''}`} end={path === "/"}>
                      {labels[i]}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
            <div className="d-flex sk-icons-row">
              <Link to="/wishlist" className="sk-icon-btn"><i className="fa fa-heart"></i></Link>
              <Link to="/cart" className="sk-icon-btn"><i className="fa fa-shopping-cart"></i></Link>
              <Link to="/profile" className="sk-icon-btn"><i className="fa fa-user"></i></Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}