import React, { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Close drawer on route change or overlay click
  const closeDrawer = () => setDrawerOpen(false);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/shop", label: "Shop" },
    { path: "/feature", label: "Features" },
    { path: "/testimonial", label: "Testimonials" },
    { path: "/contactus", label: "Contact" },
  ];

  const dropdownLinks = [
    { to: "/profile", icon: "user", label: "My Profile" },
    { to: "/cart", icon: "shopping-cart", label: "Cart" },
    { to: "/order", icon: "list-alt", label: "Orders" },
    { to: "/checkout", icon: "credit-card", label: "Checkout" },
    { to: "/support", icon: "headphones", label: "Support" },
  ];

  return (
    <>
      <style>{`
        :root {
          --sk-gold: #c9a227;
          --sk-dark: #1a1a2e;
          --sk-darker: #12121f;
        }

        /* ---------- TOP BAR ---------- */
        .sk-topbar {
          background: var(--sk-darker);
          color: #aaa;
          font-size: 12px;
          padding: 6px 0;
        }
        .sk-topbar a { color: #aaa; text-decoration: none; }
        .sk-topbar a:hover { color: var(--sk-gold); }
        .sk-topbar .social-btn {
          width: 26px; height: 26px; border-radius: 50%;
          border: 1px solid #333;
          display: inline-flex; align-items: center; justify-content: center;
          color: #aaa; text-decoration: none; font-size: 11px;
          transition: all .2s;
        }
        .sk-topbar .social-btn:hover { border-color: var(--sk-gold); color: var(--sk-gold); }

        /* ---------- MAIN NAVBAR ---------- */
        .sk-navbar {
          background: var(--sk-dark);
          position: sticky; top: 0; z-index: 100;
          border-bottom: 1px solid #2a2a40;
          transition: box-shadow .3s;
        }
        .sk-navbar.scrolled { box-shadow: 0 2px 20px rgba(0,0,0,.4); }

        .sk-brand { font-size: 22px; font-weight: 700; color: #fff; text-decoration: none; }
        .sk-brand span { color: var(--sk-gold); }

        .sk-nav-link {
          color: #ccc; text-decoration: none;
          font-size: 14px; padding: 6px 14px; border-radius: 6px;
          transition: color .2s; position: relative;
        }
        .sk-nav-link::after {
          content: ''; position: absolute;
          bottom: 2px; left: 14px; right: 14px;
          height: 2px; background: var(--sk-gold);
          border-radius: 2px; opacity: 0; transition: .2s;
        }
        .sk-nav-link:hover { color: #fff; }
        .sk-nav-link.active { color: var(--sk-gold); }
        .sk-nav-link.active::after { opacity: 1; }

        .sk-icon-btn {
          width: 36px; height: 36px; border-radius: 8px;
          border: none; background: transparent;
          color: #ccc; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 16px; transition: all .2s; text-decoration: none;
        }
        .sk-icon-btn:hover { background: rgba(201,162,39,.15); color: var(--sk-gold); }

        .sk-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          border: 2px solid var(--sk-gold);
          object-fit: cover; cursor: pointer;
        }

        /* Desktop dropdown */
        .sk-dropdown {
          background: #22223a; border: 1px solid #2a2a40;
          border-radius: 10px; overflow: hidden;
          min-width: 200px; padding: 0;
        }
        .sk-dropdown-header {
          padding: 14px 16px; background: rgba(201,162,39,.08);
          border-bottom: 1px solid #2a2a40;
          display: flex; align-items: center; gap: 10px;
        }
        .sk-dropdown-header img { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--sk-gold); }
        .sk-dropdown-header .user-name { font-size: 13px; font-weight: 600; color: #fff; }
        .sk-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; color: #ccc;
          text-decoration: none; font-size: 13px;
          transition: all .2s; width: 100%;
        }
        .sk-dropdown-item:hover { background: rgba(255,255,255,.05); color: #fff; }
        .sk-dropdown-item.danger { color: #e74c3c; }
        .sk-dropdown-item.danger:hover { background: rgba(231,76,60,.08); }
        .sk-dropdown-item.success { color: #2ecc71; }

        /* ---------- HAMBURGER ---------- */
        .sk-hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 6px;
        }
        .sk-hamburger span {
          display: block; width: 22px; height: 2px;
          background: #ccc; border-radius: 2px; transition: all .3s;
        }
        .sk-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px,5px); }
        .sk-hamburger.open span:nth-child(2) { opacity: 0; }
        .sk-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px,-5px); }

        /* ---------- OVERLAY ---------- */
        .sk-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,.55); z-index: 200;
        }
        .sk-overlay.open { display: block; }

        /* ---------- SIDE DRAWER ---------- */
        .sk-drawer {
          position: fixed; top: 0; right: -300px;
          width: 280px; height: 100vh;
          background: var(--sk-dark); z-index: 300;
          transition: right .3s cubic-bezier(.4,0,.2,1);
          border-left: 1px solid #2a2a40;
          display: flex; flex-direction: column;
        }
        .sk-drawer.open { right: 0; }

        .sk-drawer-header {
          padding: 16px 20px; border-bottom: 1px solid #2a2a40;
          display: flex; align-items: center; justify-content: space-between;
        }
        .sk-drawer-brand { font-size: 20px; font-weight: 700; color: #fff; }
        .sk-drawer-brand span { color: var(--sk-gold); }
        .sk-drawer-close {
          background: none; border: none; color: #aaa;
          font-size: 20px; cursor: pointer;
          width: 32px; height: 32px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          transition: all .2s;
        }
        .sk-drawer-close:hover { background: rgba(255,255,255,.06); color: #fff; }

        .sk-drawer-user {
          padding: 20px; border-bottom: 1px solid #2a2a40;
          display: flex; align-items: center; gap: 12px;
        }
        .sk-drawer-user img { width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--sk-gold); }
        .sk-drawer-user-name { font-size: 14px; font-weight: 600; color: #fff; }
        .sk-drawer-user-sub { font-size: 12px; color: #888; }

        .sk-drawer-nav { flex: 1; overflow-y: auto; padding: 10px 0; }
        .sk-drawer-nav a {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 20px;
          color: #ccc; text-decoration: none; font-size: 14px;
          border-left: 3px solid transparent; transition: all .2s;
        }
        .sk-drawer-nav a:hover { background: rgba(255,255,255,.04); color: #fff; border-left-color: var(--sk-gold); }
        .sk-drawer-nav a.active { color: var(--sk-gold); background: rgba(201,162,39,.07); border-left-color: var(--sk-gold); }
        .sk-drawer-nav .drawer-divider {
          height: 1px; background: #2a2a40; margin: 8px 20px;
        }

        .sk-drawer-footer { padding: 16px 20px; border-top: 1px solid #2a2a40; }
        .sk-drawer-footer-icons { display: flex; gap: 8px; margin-bottom: 12px; }
        .btn-drawer-logout {
          width: 100%; padding: 10px;
          background: rgba(201,162,39,.1);
          color: var(--sk-gold);
          border: 1px solid rgba(201,162,39,.25);
          border-radius: 8px; font-size: 13px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all .2s;
        }
        .btn-drawer-logout:hover { background: rgba(201,162,39,.2); }

        @media (max-width: 991px) {
          .sk-nav-links-desktop, .sk-nav-right-desktop { display: none !important; }
          .sk-hamburger { display: flex !important; }
        }
        @media (min-width: 992px) {
          .sk-hamburger, .sk-overlay, .sk-drawer { display: none !important; }
        }
      `}</style>

      {/* Top Bar */}
      <div className="sk-topbar d-none d-md-block">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-4">
              <Link to="mailto:vishankchauhan@gmail.com" target="_blank">
                <i className="fas fa-envelope me-2" style={{ color: "var(--sk-gold)" }}></i>
                <span className="d-none d-lg-inline">vishankchauhan@gmail.com</span>
              </Link>
              <Link to="tel:+919873848046" target="_blank">
                <i className="fas fa-phone me-2" style={{ color: "var(--sk-gold)" }}></i>
                <span className="d-none d-lg-inline">+91-9873848046</span>
              </Link>
            </div>
            <div className="d-flex gap-2">
              {["facebook-f", "twitter", "instagram", "linkedin-in"].map((icon) => (
                <a key={icon} href="#" className="social-btn">
                  <i className={`fab fa-${icon}`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sk-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between py-2">

            {/* Brand */}
            <Link to="/" className="sk-brand">Shop<span>Karo</span></Link>

            {/* Desktop Nav Links */}
            <ul className="sk-nav-links-desktop d-none d-lg-flex list-unstyled mb-0 align-items-center gap-0">
              {navLinks.map(({ path, label }) => (
                <li key={path}>
                  <NavLink to={path} className={({ isActive }) => `sk-nav-link ${isActive ? "active" : ""}`} end={path === "/"}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Desktop Right Icons */}
            <div className="sk-nav-right-desktop d-none d-lg-flex align-items-center gap-2">
              <Link to="/wishlist" className="sk-icon-btn" title="Wishlist">
                <i className="fa fa-heart"></i>
              </Link>
              <Link to="/cart" className="sk-icon-btn" title="Cart">
                <i className="fa fa-shopping-cart"></i>
              </Link>
              <div className="dropdown">
                <button className="btn p-0 border-0 bg-transparent dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown">
                  <img
                    src={data.pic ? `${process.env.REACT_APP_BACKEND_SERVER}/${data.pic}` : "/img/noimage.jpg"}
                    className="sk-avatar" alt="User"
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
                  {dropdownLinks.map((item) => (
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

            {/* Hamburger (mobile only) */}
            <button
              className={`sk-hamburger ${drawerOpen ? "open" : ""}`}
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div className={`sk-overlay ${drawerOpen ? "open" : ""}`} onClick={closeDrawer} />

      {/* Side Drawer */}
      <div className={`sk-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="sk-drawer-header">
          <span className="sk-drawer-brand">Shop<span>Karo</span></span>
          <button className="sk-drawer-close" onClick={closeDrawer}>
            <i className="fa fa-times"></i>
          </button>
        </div>

        <div className="sk-drawer-user">
          <img
            src={data.pic ? `${process.env.REACT_APP_BACKEND_SERVER}/${data.pic}` : "/img/noimage.jpg"}
            alt="User"
          />
          <div>
            <div className="sk-drawer-user-name">{localStorage.getItem("name") || "Guest User"}</div>
            <div className="sk-drawer-user-sub">ShopKaro Member</div>
          </div>
        </div>

        <nav className="sk-drawer-nav">
          {navLinks.map(({ path, label }) => (
            <NavLink
              key={path} to={path}
              className={({ isActive }) => isActive ? "active" : ""}
              end={path === "/"}
              onClick={closeDrawer}
            >
              {label}
            </NavLink>
          ))}
          <div className="drawer-divider" />
          {dropdownLinks.map((item) => (
            <Link key={item.to} to={item.to} onClick={closeDrawer}>
              <i className={`fa fa-${item.icon}`}></i> {item.label}
            </Link>
          ))}
        </nav>

        <div className="sk-drawer-footer">
          <div className="sk-drawer-footer-icons">
            <Link to="/wishlist" className="sk-icon-btn" onClick={closeDrawer} title="Wishlist">
              <i className="fa fa-heart"></i>
            </Link>
            <Link to="/cart" className="sk-icon-btn" onClick={closeDrawer} title="Cart">
              <i className="fa fa-shopping-cart"></i>
            </Link>
          </div>
          {localStorage.getItem("login") ? (
            <button className="btn-drawer-logout" onClick={logout}>
              <i className="fa fa-sign-out"></i> Logout
            </button>
          ) : (
            <Link to="/login" className="btn-drawer-logout" style={{ textDecoration: "none" }} onClick={closeDrawer}>
              <i className="fa fa-sign-in-alt"></i> Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}