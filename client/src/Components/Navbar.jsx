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
    { path: "/", label: "Home", icon: "home" },
    { path: "/about", label: "About", icon: "info-circle" },
    { path: "/shop", label: "Shop", icon: "store" },
    { path: "/feature", label: "Features", icon: "star" },
    { path: "/testimonial", label: "Testimonials", icon: "comment-alt" },
    { path: "/contactus", label: "Contact", icon: "envelope" },
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap');

        :root {
          --sk-gold: #c9a227;
          --sk-gold-bright: #e8c873;
          --sk-dark: #14142a;
          --sk-darker: #0b0b16;
          --sk-navy-light: #1d1d3a;
          --sk-ivory: #f4f0e6;
          --sk-muted: #9c97ad;
          --sk-line: #292946;
        }

        /* ---------- TOP BAR ---------- */
        .sk-topbar {
          background: var(--sk-darker);
          color: var(--sk-muted);
          font-size: 12px;
          letter-spacing: .02em;
          padding: 7px 0;
          border-bottom: 1px solid rgba(201,162,39,.12);
        }
        .sk-topbar a { color: var(--sk-muted); text-decoration: none; transition: color .2s; }
        .sk-topbar a:hover { color: var(--sk-gold-bright); }
        .sk-topbar-sep { color: var(--sk-gold); opacity: .5; margin: 0 14px; font-size: 10px; }
        .sk-topbar .social-btn {
          width: 27px; height: 27px; border-radius: 50%;
          border: 1px solid var(--sk-line);
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--sk-muted); text-decoration: none; font-size: 11px;
          transition: all .25s cubic-bezier(.4,0,.2,1);
        }
        .sk-topbar .social-btn:hover {
          border-color: var(--sk-gold);
          color: var(--sk-darker);
          background: var(--sk-gold);
          transform: translateY(-1px);
        }

        /* ---------- MAIN NAVBAR ---------- */
        .sk-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 1000;
          background: var(--sk-dark);
          border-bottom: 1px solid var(--sk-line);
          transition: background-color .35s, box-shadow .35s, backdrop-filter .35s;
        }
        .sk-navbar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--sk-gold) 50%, transparent);
          opacity: .8;
        }
        .sk-navbar.scrolled {
          background: rgba(14,14,28,.82);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 8px 30px rgba(0,0,0,.45);
        }

        .sk-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 27px; font-weight: 600;
          color: var(--sk-ivory); text-decoration: none;
          letter-spacing: .015em;
          display: inline-flex; align-items: center;
        }
        .sk-brand-mark {
          width: 7px; height: 7px;
          background: var(--sk-gold);
          transform: rotate(45deg);
          display: inline-block;
          margin-right: 11px;
          box-shadow: 0 0 8px rgba(201,162,39,.6);
        }
        .sk-brand-gold { color: var(--sk-gold); font-style: italic; }

        .sk-nav-link {
          color: var(--sk-muted); text-decoration: none;
          font-family: 'Manrope', sans-serif;
          font-size: 12.5px; font-weight: 600;
          text-transform: uppercase; letter-spacing: .11em;
          padding: 9px 16px; border-radius: 6px;
          transition: color .25s; position: relative;
        }
        .sk-nav-link::after {
          content: ''; position: absolute;
          bottom: 3px; left: 16px; right: 16px;
          height: 2px; background: linear-gradient(90deg, var(--sk-gold), var(--sk-gold-bright));
          border-radius: 2px; opacity: 0; transform: scaleX(.5); transform-origin: center;
          transition: opacity .25s, transform .25s;
        }
        .sk-nav-link:hover { color: var(--sk-ivory); }
        .sk-nav-link:hover::after { opacity: .6; transform: scaleX(1); }
        .sk-nav-link.active { color: var(--sk-gold-bright); }
        .sk-nav-link.active::after { opacity: 1; transform: scaleX(1); }

        .sk-icon-btn {
          width: 38px; height: 38px; border-radius: 9px;
          border: none; background: transparent;
          color: var(--sk-muted); cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 15px; transition: all .22s cubic-bezier(.4,0,.2,1); text-decoration: none;
        }
        .sk-icon-btn:hover {
          background: rgba(201,162,39,.14); color: var(--sk-gold-bright);
          transform: translateY(-1px);
        }

        .sk-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          border: 2px solid var(--sk-gold);
          object-fit: cover; cursor: pointer;
          transition: box-shadow .25s;
        }
        .sk-avatar:hover { box-shadow: 0 0 0 3px rgba(201,162,39,.22); }

        /* Desktop dropdown */
        .sk-dropdown {
          background: var(--sk-navy-light); border: 1px solid var(--sk-line);
          border-radius: 12px; overflow: hidden;
          min-width: 215px; padding: 0; margin: 0; list-style: none;
          box-shadow: 0 16px 40px rgba(0,0,0,.5);
          position: relative;
        }
        .sk-dropdown::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--sk-gold), transparent);
        }
        .sk-dropdown li { list-style: none; margin: 0; padding: 0; }
        .sk-dropdown-header {
          padding: 15px 16px; background: rgba(201,162,39,.08);
          border-bottom: 1px solid var(--sk-line);
          display: flex; align-items: center; gap: 10px;
        }
        .sk-dropdown-header img { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--sk-gold); object-fit: cover; }
        .sk-dropdown-header .user-name { font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 700; color: var(--sk-ivory); }
        .sk-dropdown-item {
          display: flex; align-items: center; gap: 11px;
          padding: 11px 16px; color: var(--sk-muted);
          font-family: 'Manrope', sans-serif;
          text-decoration: none; font-size: 13px;
          transition: all .2s; width: 100%;
        }
        .sk-dropdown-item i { width: 14px; color: var(--sk-gold); }
        .sk-dropdown-item:hover { background: rgba(255,255,255,.05); color: var(--sk-ivory); }
        .sk-dropdown-item.danger { color: #e8746a; }
        .sk-dropdown-item.danger i { color: #e8746a; }
        .sk-dropdown-item.danger:hover { background: rgba(231,76,60,.1); }
        .sk-dropdown-item.success { color: #4fd383; }
        .sk-dropdown-item.success i { color: #4fd383; }

        /* ---------- MOBILE QUICK ICONS (left of hamburger) ---------- */
        .sk-mobile-icons {
          display: none;
          align-items: center;
          gap: 2px;
        }

        /* ---------- HAMBURGER ---------- */
        .sk-hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer;
          padding: 9px; border-radius: 9px;
          transition: background .2s;
        }
        .sk-hamburger:hover { background: rgba(201,162,39,.12); }
        .sk-hamburger span {
          display: block; width: 21px; height: 2px;
          background: var(--sk-ivory); border-radius: 2px;
          transition: all .3s cubic-bezier(.4,0,.2,1);
        }
        .sk-hamburger.open span { background: var(--sk-gold); }
        .sk-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px,5px); }
        .sk-hamburger.open span:nth-child(2) { opacity: 0; }
        .sk-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px,-5px); }

        /* ---------- OVERLAY ---------- */
        .sk-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(6,6,12,.65);
          backdrop-filter: blur(2px);
          z-index: 9998;
        }
        .sk-overlay.open { display: block; }

        .sk-drawer {
          position: fixed;
          top: 0;
          right: -300px;
          width: 285px;
          height: 100vh;
          background: var(--sk-dark);
          border-left: 1px solid var(--sk-line);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          transition: right .35s cubic-bezier(.4,0,.2,1);
        }
        .sk-drawer.open { right: 0; }

        .sk-drawer-header {
          padding: 18px 20px;
          border-bottom: 1px solid var(--sk-line);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sk-drawer-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 21px; font-weight: 600; color: var(--sk-ivory);
          display: inline-flex; align-items: center;
        }
        .sk-drawer-brand .sk-brand-mark { margin-right: 9px; }

        .sk-drawer-close {
          background: none;
          border: none;
          color: var(--sk-muted);
          font-size: 18px;
          width: 34px; height: 34px;
          border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all .2s;
        }
        .sk-drawer-close:hover { background: rgba(201,162,39,.14); color: var(--sk-gold-bright); }

        .sk-drawer-user {
          padding: 20px; border-bottom: 1px solid var(--sk-line);
          display: flex; align-items: center; gap: 13px;
        }
        .sk-drawer-user img { width: 46px; height: 46px; border-radius: 50%; border: 2px solid var(--sk-gold); object-fit: cover; }
        .sk-drawer-user-name { font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 700; color: var(--sk-ivory); }
        .sk-drawer-user-sub { font-family: 'Manrope', sans-serif; font-size: 11.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--sk-gold); margin-top: 2px; }

        .sk-drawer-nav { flex: 1; overflow-y: auto; padding: 10px 0; }
        .sk-drawer-nav a {
          display: flex; align-items: center; gap: 13px;
          padding: 12px 20px;
          color: var(--sk-muted); text-decoration: none;
          font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 500;
          border-left: 3px solid transparent; transition: all .2s;
        }
        .sk-drawer-nav a i { width: 16px; text-align: center; color: var(--sk-gold); font-size: 13px; }
        .sk-drawer-nav a:hover { background: rgba(255,255,255,.04); color: var(--sk-ivory); border-left-color: var(--sk-gold); }
        .sk-drawer-nav a.active { color: var(--sk-gold-bright); background: rgba(201,162,39,.08); border-left-color: var(--sk-gold); font-weight: 600; }
        .sk-drawer-nav .drawer-divider {
          height: 1px; background: var(--sk-line); margin: 10px 20px;
        }

        .sk-drawer-footer { padding: 18px 20px; border-top: 1px solid var(--sk-line); }
        .btn-drawer-logout {
          width: 100%; padding: 11px;
          background: rgba(201,162,39,.1);
          color: var(--sk-gold-bright);
          font-family: 'Manrope', sans-serif; font-weight: 600;
          border: 1px solid rgba(201,162,39,.3);
          border-radius: 9px; font-size: 13px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          letter-spacing: .03em;
          transition: all .2s;
        }
        .btn-drawer-logout:hover { background: rgba(201,162,39,.2); transform: translateY(-1px); }

        /* ---------- ACCESSIBILITY ---------- */
        .sk-nav-link:focus-visible,
        .sk-icon-btn:focus-visible,
        .sk-hamburger:focus-visible,
        .sk-drawer-close:focus-visible,
        .sk-brand:focus-visible,
        .sk-dropdown-item:focus-visible,
        .sk-drawer-nav a:focus-visible {
          outline: 2px solid var(--sk-gold-bright);
          outline-offset: 3px;
          border-radius: 6px;
        }

        @media (max-width: 991px) {
          .sk-nav-links-desktop, .sk-nav-right-desktop { display: none !important; }
          .sk-hamburger { display: flex !important; }
          .sk-mobile-icons { display: flex !important; }
        }
        @media (min-width: 992px) {
          .sk-hamburger, .sk-overlay, .sk-drawer, .sk-mobile-icons { display: none !important; }
        }
      `}</style>

      {/* Top Bar */}
      <div className="sk-topbar d-none d-md-block">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Link to="mailto:vishankchauhan@gmail.com" target="_blank">
                <i className="fas fa-envelope me-2" style={{ color: "var(--sk-gold)" }}></i>
                <span className="d-none d-lg-inline">vishankchauhan@gmail.com</span>
              </Link>
              <span className="sk-topbar-sep d-none d-lg-inline">&#9670;</span>
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
            <Link to="/" className="sk-brand">
              <span className="sk-brand-mark" aria-hidden="true"></span>
              Shop<span className="sk-brand-gold">Karo</span>
            </Link>

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
                    src={data.pic ? data.pic : "/img/noimage.jpg"}
                    className="sk-avatar" alt="User"
                  />
                </button>
                <ul className="dropdown-menu sk-dropdown dropdown-menu-end">
                  <li className="sk-dropdown-header">
                    <img
                      src={data.pic ? data.pic : "/img/noimage.jpg"}
                      alt="User"
                    />
                    <span className="user-name">{localStorage.getItem("name") || "Guest User"}</span>
                  </li>
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

            {/* Mobile quick icons + Hamburger */}
            <div className="d-flex align-items-end gap-1">
              {/* Mobile quick icons (left of hamburger) */}
              <div className="sk-mobile-icons">
                <Link to="/wishlist" className="sk-icon-btn" title="Wishlist">
                  <i className="fa fa-heart"></i>
                </Link>
                <Link to="/cart" className="sk-icon-btn" title="Cart">
                  <i className="fa fa-shopping-cart"></i>
                </Link>
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
        </div>
      </nav>

      {/* Overlay */}
      <div className={`sk-overlay ${drawerOpen ? "open" : ""}`} onClick={closeDrawer} />

      {/* Side Drawer */}
      <div className={`sk-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="sk-drawer-header">
          <span className="sk-drawer-brand">
            <span className="sk-brand-mark" aria-hidden="true"></span>
            Shop<span className="sk-brand-gold">Karo</span>
          </span>
          <button className="sk-drawer-close" onClick={closeDrawer} aria-label="Close menu">
            <i className="fa fa-times"></i>
          </button>
        </div>

        <div className="sk-drawer-user">
          <img
            src={data.pic ? data.pic : "/img/noimage.jpg"}
            alt="User"
          />
          <div>
            <div className="sk-drawer-user-name">{localStorage.getItem("name") || "Guest User"}</div>
            <div className="sk-drawer-user-sub">ShopKaro Member</div>
          </div>
        </div>

        <nav className="sk-drawer-nav">
          {navLinks.map(({ path, label, icon }) => (
            <NavLink
              key={path} to={path}
              className={({ isActive }) => isActive ? "active" : ""}
              end={path === "/"}
              onClick={closeDrawer}
            >
              <i className={`fa fa-${icon}`}></i> {label}
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