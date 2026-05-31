import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  let navigate = useNavigate();
  let [data, setData] = useState([]);
  let [scrolled, setScrolled] = useState(false);
  let [drawerOpen, setDrawerOpen] = useState(false);

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  // Close drawer on route change / outside click via Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

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

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/shop", label: "Shop" },
    { path: "/feature", label: "Features" },
    { path: "/testimonial", label: "Testimonials" },
    { path: "/contactus", label: "Contact" },
  ];

  const dropdownItems = [
    { to: "/profile", icon: "user", label: "My Profile" },
    { to: "/cart", icon: "shopping-cart", label: "Cart" },
    { to: "/order", icon: "list-alt", label: "Orders" },
    { to: "/checkout", icon: "credit-card", label: "Checkout" },
    { to: "/support", icon: "headphones", label: "Support" },
  ];

  const avatarSrc = data.pic
    ? `${process.env.REACT_APP_BACKEND_SERVER}/${data.pic}`
    : "/img/noimage.jpg";

  return (
    <>
      <style>{`
        /* ── Sticky wrapper ── */
        .sk-sticky {
          position: sticky;
          top: 0;
          z-index: 1050;
        }

        /* ── Top bar ── */
        .sk-topbar {
          background: var(--sk-dark, #1a1a2e);
          color: #aaa;
          font-size: 13px;
          padding: 6px 0;
        }
        .sk-topbar a { color: #aaa; text-decoration: none; }
        .sk-topbar a:hover { color: var(--sk-gold, #f0a500); }
        .sk-topbar .social-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,.08); color: #aaa;
          transition: background .2s, color .2s;
        }
        .sk-topbar .social-btn:hover { background: var(--sk-gold,#f0a500); color: #fff; }

        /* ── Main navbar ── */
        .sk-navbar {
          background: #fff;
          border-bottom: 1px solid #eee;
          transition: box-shadow .3s;
        }
        .sk-navbar.scrolled { box-shadow: 0 2px 16px rgba(0,0,0,.1); }

        .sk-brand { font-size: 1.5rem; font-weight: 800; color: #1a1a2e; text-decoration: none; }
        .sk-brand span { color: var(--sk-gold, #f0a500); }

        .sk-nav-link {
          display: block; padding: 6px 14px; font-size: 14px; font-weight: 500;
          color: #444; text-decoration: none; border-radius: 6px;
          transition: color .2s, background .2s;
        }
        .sk-nav-link:hover, .sk-nav-link.active { color: var(--sk-gold, #f0a500); }

        .sk-icon-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 50%;
          color: #444; text-decoration: none; font-size: 16px;
          transition: background .2s, color .2s;
        }
        .sk-icon-btn:hover { background: #f5f5f5; color: var(--sk-gold, #f0a500); }

        .sk-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          object-fit: cover; border: 2px solid var(--sk-gold, #f0a500);
        }

        /* Desktop dropdown */
        .sk-dropdown {
          min-width: 220px; border: 1px solid #eee;
          border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.1);
          padding: 0; overflow: hidden;
        }
        .sk-dropdown-header {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px; background: #fafafa; border-bottom: 1px solid #eee;
        }
        .sk-dropdown-header img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
        .sk-dropdown-header .user-name { font-size: 14px; font-weight: 600; color: #1a1a2e; }
        .sk-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; font-size: 14px; color: #444;
          text-decoration: none; transition: background .15s, color .15s;
        }
        .sk-dropdown-item:hover { background: #f9f9f9; color: var(--sk-gold, #f0a500); }
        .sk-dropdown-item.danger:hover { color: #e53e3e; }
        .sk-dropdown-item.success:hover { color: #38a169; }

        /* ── Hamburger button ── */
        .sk-toggler {
          background: none; border: none; cursor: pointer;
          width: 40px; height: 40px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 5px; padding: 4px;
        }
        .sk-toggler span,
        .sk-toggler::before,
        .sk-toggler::after {
          content: '';
          display: block;
          width: 22px; height: 2px;
          background: #1a1a2e;
          border-radius: 2px;
          transition: transform .3s, opacity .3s;
        }
        .sk-toggler[aria-expanded="true"] span { opacity: 0; }
        .sk-toggler[aria-expanded="true"]::before { transform: translateY(7px) rotate(45deg); }
        .sk-toggler[aria-expanded="true"]::after  { transform: translateY(-7px) rotate(-45deg); }

        /* ── Side Drawer ── */
        .sk-drawer-overlay {
          position: fixed; inset: 0; z-index: 1200;
          background: rgba(0,0,0,.45);
          opacity: 0; visibility: hidden;
          transition: opacity .3s, visibility .3s;
        }
        .sk-drawer-overlay.open { opacity: 1; visibility: visible; }

        .sk-drawer {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 280px; z-index: 1300;
          background: #fff;
          box-shadow: 4px 0 24px rgba(0,0,0,.15);
          display: flex; flex-direction: column;
          transform: translateX(-100%);
          transition: transform .3s cubic-bezier(.4,0,.2,1);
          overflow-y: auto;
        }
        .sk-drawer.open { transform: translateX(0); }

        .sk-drawer-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px; border-bottom: 1px solid #eee;
        }
        .sk-drawer-close {
          background: none; border: none; font-size: 22px;
          cursor: pointer; color: #888; line-height: 1;
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          border-radius: 50%; transition: background .2s;
        }
        .sk-drawer-close:hover { background: #f0f0f0; color: #333; }

        .sk-drawer-user {
          display: flex; align-items: center; gap: 12px;
          padding: 18px 20px; border-bottom: 1px solid #f0f0f0;
          background: #fafafa;
        }
        .sk-drawer-user img { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid var(--sk-gold,#f0a500); }
        .sk-drawer-user .name { font-size: 15px; font-weight: 600; color: #1a1a2e; }
        .sk-drawer-user .role { font-size: 12px; color: #999; }

        .sk-drawer nav { padding: 12px 0; }
        .sk-drawer-link {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 20px; font-size: 14px; font-weight: 500;
          color: #444; text-decoration: none;
          transition: background .15s, color .15s;
        }
        .sk-drawer-link:hover, .sk-drawer-link.active { background: #fff8ee; color: var(--sk-gold,#f0a500); }
        .sk-drawer-link i { width: 20px; text-align: center; font-size: 15px; }

        .sk-drawer-divider { border: none; border-top: 1px solid #f0f0f0; margin: 4px 0; }

        .sk-drawer-actions {
          display: flex; gap: 8px;
          padding: 16px 20px; border-top: 1px solid #eee; margin-top: auto;
        }
        .sk-drawer-actions a, .sk-drawer-actions button {
          flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 500;
          text-decoration: none; border: 1px solid #eee; background: #fafafa; color: #444;
          cursor: pointer; transition: background .15s, color .15s;
        }
        .sk-drawer-actions a:hover, .sk-drawer-actions button:hover { background: #fff8ee; color: var(--sk-gold,#f0a500); border-color: var(--sk-gold,#f0a500); }
        .sk-drawer-actions .logout-btn { background: #fff5f5; border-color: #fecaca; color: #e53e3e; }
        .sk-drawer-actions .logout-btn:hover { background: #e53e3e; color: #fff; }
      `}</style>

      {/* ── Sticky wrapper ── */}
      <div className="sk-sticky">

        {/* Top bar */}
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

        {/* Main navbar */}
        <nav className={`sk-navbar ${scrolled ? "scrolled" : ""}`}>
          <div className="container">
            <div className="d-flex align-items-center justify-content-between py-2">

              {/* Brand */}
              <Link to="/" className="sk-brand">
                Shop<span>Karo</span>
              </Link>

              {/* Desktop nav links */}
              <ul className="d-none d-lg-flex list-unstyled mb-0 align-items-center gap-0">
                {navLinks.map(({ path, label }) => (
                  <li key={path}>
                    <NavLink
                      to={path}
                      end={path === "/"}
                      className={({ isActive }) => `sk-nav-link ${isActive ? "active" : ""}`}
                    >
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              {/* Desktop right icons */}
              <div className="d-none d-lg-flex align-items-center gap-2">
                <Link to="/wishlist" className="sk-icon-btn" title="Wishlist">
                  <i className="fa fa-heart"></i>
                </Link>
                <Link to="/cart" className="sk-icon-btn" title="Cart">
                  <i className="fa fa-shopping-cart"></i>
                </Link>

                {/* Profile dropdown */}
                <div className="dropdown">
                  <button
                    className="btn p-0 border-0 bg-transparent dropdown-toggle d-flex align-items-center gap-2"
                    data-bs-toggle="dropdown"
                  >
                    <img src={avatarSrc} className="sk-avatar" alt="User" />
                  </button>
                  <ul className="dropdown-menu sk-dropdown dropdown-menu-end">
                    <div className="sk-dropdown-header">
                      <img src={avatarSrc} alt="User" />
                      <span className="user-name">{localStorage.getItem("name") || "Guest User"}</span>
                    </div>
                    {dropdownItems.map((item) => (
                      <li key={item.to}>
                        <Link to={item.to} className="sk-dropdown-item">
                          <i className={`fa fa-${item.icon}`}></i> {item.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      {localStorage.getItem("login") ? (
                        <button
                          className="sk-dropdown-item danger w-100 text-start border-0 bg-transparent"
                          onClick={logout}
                        >
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

              {/* Mobile hamburger */}
              <button
                className="sk-toggler d-lg-none"
                type="button"
                aria-expanded={drawerOpen}
                aria-label="Toggle menu"
                onClick={() => setDrawerOpen(true)}
              >
                <span></span>
              </button>

            </div>
          </div>
        </nav>
      </div>

      {/* ── Side Drawer (mobile) ── */}

      {/* Overlay */}
      <div
        className={`sk-drawer-overlay ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className={`sk-drawer ${drawerOpen ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigation menu">

        {/* Header */}
        <div className="sk-drawer-head">
          <Link to="/" className="sk-brand" onClick={() => setDrawerOpen(false)}>
            Shop<span>Karo</span>
          </Link>
          <button className="sk-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            &times;
          </button>
        </div>

        {/* User info */}
        <div className="sk-drawer-user">
          <img src={avatarSrc} alt="User" />
          <div>
            <div className="name">{localStorage.getItem("name") || "Guest User"}</div>
            <div className="role">Member</div>
          </div>
        </div>

        {/* Nav links */}
        <nav>
          {navLinks.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) => `sk-drawer-link ${isActive ? "active" : ""}`}
              onClick={() => setDrawerOpen(false)}
            >
              <i className={`fa fa-${
                path === "/" ? "home" :
                path === "/about" ? "info-circle" :
                path === "/shop" ? "store" :
                path === "/feature" ? "star" :
                path === "/testimonial" ? "comments" : "envelope"
              }`}></i>
              {label}
            </NavLink>
          ))}

          <hr className="sk-drawer-divider" />

          {dropdownItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="sk-drawer-link"
              onClick={() => setDrawerOpen(false)}
            >
              <i className={`fa fa-${item.icon}`}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="sk-drawer-actions">
          <Link to="/wishlist" onClick={() => setDrawerOpen(false)}>
            <i className="fa fa-heart"></i> Wishlist
          </Link>
          <Link to="/cart" onClick={() => setDrawerOpen(false)}>
            <i className="fa fa-shopping-cart"></i> Cart
          </Link>
          {localStorage.getItem("login") ? (
            <button className="logout-btn" onClick={() => { setDrawerOpen(false); logout(); }}>
              <i className="fa fa-sign-out"></i> Logout
            </button>
          ) : (
            <Link to="/login" onClick={() => setDrawerOpen(false)}>
              <i className="fa fa-sign-in-alt"></i> Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}