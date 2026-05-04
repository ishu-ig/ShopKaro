import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// ── Nav structure ─────────────────────────────────────────────────────────────
const NAV_GROUPS = [
    {
        label: "Overview",
        items: [
            { to: "/",            icon: "fa-house",         label: "Dashboard" },
        ],
    },
    {
        label: "Catalogue",
        items: [
            { to: "/maincategory", icon: "fa-th-large",     label: "Main Category" },
            { to: "/subcategory",  icon: "fa-list-ul",      label: "Sub Category" },
            { to: "/product",      icon: "fa-box-open",     label: "Products" },
        ],
    },
    {
        label: "Operations",
        items: [
            { to: "/checkout",     icon: "fa-shopping-cart",label: "Orders" },
            { to: "/user",         icon: "fa-users",        label: "Users" },
        ],
    },
    {
        label: "Engagement",
        items: [
            { to: "/testimonial",  icon: "fa-star",         label: "Testimonials" },
            { to: "/newsletter",   icon: "fa-envelope",     label: "Newsletter" },
            { to: "/contactus",    icon: "fa-headset",      label: "Contact Us" },
        ],
    },
    // {
    //     label: "System",
    //     items: [
    //         { to: "/profile",      icon: "fa-user-circle",  label: "My Profile" },
    //         { to: "/settings",     icon: "fa-cog",          label: "Settings" },
    //     ],
    // },
];

// ── Tooltip wrapper (shows on hover in collapsed mode) ────────────────────────
function NavItem({ item, isExpanded, isActive }) {
    const [showTip, setShowTip] = useState(false);
    const tipRef = useRef(null);

    return (
        <li
            style={{ position: "relative" }}
            onMouseEnter={() => !isExpanded && setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
        >
            <Link
                to={item.to}
                className={`sb2-link ${isActive ? "sb2-link--active" : ""}`}
            >
                <span className="sb2-icon">
                    <i className={`fas ${item.icon}`}></i>
                </span>
                <span className="sb2-label">{item.label}</span>
                {isActive && <span className="sb2-active-dot"></span>}
            </Link>

            {/* Tooltip — only in collapsed mode */}
            {showTip && !isExpanded && (
                <div className="sb2-tooltip" ref={tipRef}>
                    {item.label}
                    <span className="sb2-tooltip-arrow"></span>
                </div>
            )}
        </li>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminSidebar({ isExpanded, onToggle }) {
    const [data,        setData]        = useState(null);
    const [mobileOpen,  setMobileOpen]  = useState(false);
    const location  = useLocation();
    const navigate  = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                let res = await fetch(
                    `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: localStorage.getItem("token"),
                        },
                    }
                );
                res = await res.json();
                if (res.data) setData(res.data);
                else navigate("/login");
            } catch {
                navigate("/login");
            }
        })();
    }, [navigate]);

    // Close mobile drawer on route change
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    function handleLogout() {
        localStorage.clear();
        navigate("/login");
    }

    const isActive = (path) =>
        path === "/"
            ? location.pathname === "/"
            : location.pathname === path || location.pathname.startsWith(path + "/");

    const expanded = isExpanded || mobileOpen;

    return (
        <>
        <style>{`
            /* ── Sidebar shell ─────────────────────────────────────────────── */
            #sidebar {
                display: flex;
                flex-direction: column;
                width: var(--sidebar-width);
                height: 100vh;
                background: var(--bg-surface);
                position: fixed;
                top: 0; left: 0;
                z-index: 1100;
                border-right: 1px solid var(--border);
                transition: width 0.28s cubic-bezier(0.4,0,0.2,1),
                            transform 0.28s cubic-bezier(0.4,0,0.2,1);
                overflow: hidden;
            }

            /* Top accent gradient bar */
            #sidebar::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0;
                height: 2px;
                background: linear-gradient(90deg, var(--accent), var(--accent-2));
                z-index: 2;
            }

            /* Ambient glow inside sidebar */
            #sidebar::after {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 60%;
                background: radial-gradient(ellipse at 50% 0%, rgba(79,142,247,0.07) 0%, transparent 70%);
                pointer-events: none;
                z-index: 0;
            }

            /* Collapsed state (default desktop) */
            #sidebar:not(.expanded) {
                width: var(--sidebar-collapsed);
            }

            /* ── Brand / logo strip at very top ─────────────────────────────── */
            .sb2-brand {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 18px 14px 14px;
                border-bottom: 1px solid var(--border);
                flex-shrink: 0;
                position: relative;
                z-index: 1;
                overflow: hidden;
            }

            .sb2-brand-icon {
                width: 36px; height: 36px;
                background: linear-gradient(135deg, var(--accent), #3a7de0);
                border-radius: 10px;
                display: flex; align-items: center; justify-content: center;
                color: #fff; font-size: 15px;
                flex-shrink: 0;
                box-shadow: 0 4px 14px rgba(79,142,247,0.4);
            }

            .sb2-brand-text {
                overflow: hidden;
                transition: opacity 0.2s ease, width 0.28s ease;
            }

            .sb2-brand-name {
                font-family: 'Syne', sans-serif;
                font-size: 15px; font-weight: 800;
                color: var(--text-primary);
                white-space: nowrap;
                letter-spacing: -0.01em;
            }

            .sb2-brand-sub {
                font-size: 10px; color: var(--accent);
                text-transform: uppercase; letter-spacing: 0.1em;
                font-weight: 700; white-space: nowrap;
            }

            /* Hide brand text when collapsed */
            #sidebar:not(.expanded) .sb2-brand-text { opacity: 0; width: 0; pointer-events: none; }
            #sidebar.expanded   .sb2-brand-text { opacity: 1; width: auto; }

            /* ── Admin profile card ────────────────────────────────────────── */
            .sb2-profile {
                display: flex;
                align-items: center;
                gap: 11px;
                padding: 14px 14px 12px;
                border-bottom: 1px solid var(--border);
                flex-shrink: 0;
                position: relative;
                z-index: 1;
                cursor: pointer;
                transition: background 0.2s;
            }

            .sb2-profile:hover { background: var(--bg-hover); }

            .sb2-avatar-wrap { position: relative; flex-shrink: 0; }

            .sb2-avatar {
                width: 38px; height: 38px;
                border-radius: 10px;
                object-fit: cover;
                border: 2px solid var(--border-accent);
                display: block;
                box-shadow: 0 0 0 3px var(--accent-glow);
                transition: var(--transition);
            }

            /* Online indicator dot */
            .sb2-online {
                position: absolute;
                bottom: -1px; right: -1px;
                width: 10px; height: 10px;
                background: var(--accent-success);
                border: 2px solid var(--bg-surface);
                border-radius: 50%;
            }

            .sb2-profile-info { overflow: hidden; flex: 1; min-width: 0; }

            .sb2-profile-name {
                font-family: 'Syne', sans-serif;
                font-size: 13px; font-weight: 700;
                color: var(--text-primary);
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }

            .sb2-profile-role {
                font-size: 10.5px;
                color: var(--accent);
                text-transform: uppercase;
                letter-spacing: 0.09em;
                font-weight: 700;
            }

            .sb2-profile-chevron {
                font-size: 11px; color: var(--text-muted);
                flex-shrink: 0;
                transition: transform 0.2s;
            }

            /* Hide profile text in collapsed */
            #sidebar:not(.expanded) .sb2-profile-info,
            #sidebar:not(.expanded) .sb2-profile-chevron { display: none; }
            #sidebar:not(.expanded) .sb2-profile { justify-content: center; padding: 12px 10px; }

            /* ── Scrollable nav area ───────────────────────────────────────── */
            .sb2-nav-scroll {
                flex: 1 1 0;
                min-height: 0;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 8px 10px 12px;
                position: relative;
                z-index: 1;
            }

            .sb2-nav-scroll::-webkit-scrollbar { width: 3px; }
            .sb2-nav-scroll::-webkit-scrollbar-track { background: transparent; }
            .sb2-nav-scroll::-webkit-scrollbar-thumb { background: var(--bg-hover); border-radius: 4px; }

            /* ── Group label ───────────────────────────────────────────────── */
            .sb2-group { margin-bottom: 4px; }

            .sb2-group-label {
                display: block;
                font-size: 9.5px;
                text-transform: uppercase;
                letter-spacing: 0.13em;
                color: var(--text-muted);
                padding: 14px 10px 5px;
                font-weight: 700;
                white-space: nowrap;
                transition: opacity 0.2s;
            }

            #sidebar:not(.expanded) .sb2-group-label { opacity: 0; height: 0; padding: 0; overflow: hidden; }
            #sidebar.expanded   .sb2-group-label { opacity: 1; height: auto; }

            /* Tiny divider line in collapsed mode between groups */
            #sidebar:not(.expanded) .sb2-group + .sb2-group::before {
                content: '';
                display: block;
                height: 1px;
                background: var(--border);
                margin: 6px 8px;
            }

            /* Nav list reset */
            .sb2-nav-scroll ul { list-style: none; margin: 0; padding: 0; }

            /* ── Nav link ──────────────────────────────────────────────────── */
            .sb2-link {
                display: flex;
                align-items: center;
                gap: 10px;
                width: 100%;
                padding: 8px 10px;
                border-radius: 9px;
                color: var(--text-secondary);
                font-size: 13px;
                font-weight: 500;
                text-decoration: none;
                transition: background 0.18s, color 0.18s, padding-left 0.2s;
                white-space: nowrap;
                border: 1px solid transparent;
                margin-bottom: 1px;
                position: relative;
            }

            .sb2-link:hover {
                background: var(--bg-hover);
                color: var(--text-primary);
                padding-left: 14px;
            }

            .sb2-link--active {
                background: var(--accent-glow) !important;
                color: var(--accent) !important;
                border-color: var(--border-accent) !important;
                font-weight: 600;
            }

            .sb2-link--active .sb2-icon { color: var(--accent) !important; }

            /* Icon */
            .sb2-icon {
                width: 18px; min-width: 18px;
                text-align: center;
                font-size: 13.5px;
                color: var(--text-muted);
                transition: color 0.18s;
                flex-shrink: 0;
            }

            .sb2-link:hover .sb2-icon { color: var(--accent); }

            /* Label — hidden when collapsed */
            .sb2-label { overflow: hidden; text-overflow: ellipsis; flex: 1; }

            #sidebar:not(.expanded) .sb2-label { display: none; }
            #sidebar:not(.expanded) .sb2-link  { justify-content: center; padding: 9px; gap: 0; }
            #sidebar:not(.expanded) .sb2-link:hover { padding-left: 9px; }
            #sidebar:not(.expanded) .sb2-active-dot { display: none; }

            /* Active dot (right side indicator) */
            .sb2-active-dot {
                width: 6px; height: 6px;
                background: var(--accent);
                border-radius: 50%;
                margin-left: auto;
                flex-shrink: 0;
            }

            /* ── Tooltip ───────────────────────────────────────────────────── */
            .sb2-tooltip {
                position: absolute;
                left: calc(100% + 10px);
                top: 50%;
                transform: translateY(-50%);
                background: var(--bg-card);
                border: 1px solid var(--border-accent);
                color: var(--text-primary);
                font-size: 12px;
                font-weight: 600;
                padding: 6px 12px;
                border-radius: 8px;
                white-space: nowrap;
                pointer-events: none;
                z-index: 2000;
                box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                animation: tipIn 0.15s ease;
            }

            @keyframes tipIn {
                from { opacity:0; transform: translateY(-50%) translateX(-4px); }
                to   { opacity:1; transform: translateY(-50%) translateX(0); }
            }

            .sb2-tooltip-arrow {
                position: absolute;
                right: 100%; top: 50%;
                transform: translateY(-50%);
                border: 5px solid transparent;
                border-right-color: var(--border-accent);
            }

            /* ── Logout button ─────────────────────────────────────────────── */
            .sb2-footer {
                flex-shrink: 0;
                padding: 10px;
                border-top: 1px solid var(--border);
                position: relative;
                z-index: 1;
            }

            .sb2-logout {
                display: flex;
                align-items: center;
                gap: 10px;
                width: 100%;
                padding: 9px 10px;
                border-radius: 9px;
                background: none;
                border: 1px solid transparent;
                color: var(--text-secondary);
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.18s, color 0.18s, border-color 0.18s;
                font-family: 'Plus Jakarta Sans', sans-serif;
                white-space: nowrap;
            }

            .sb2-logout:hover {
                background: rgba(247,95,95,0.1);
                border-color: rgba(247,95,95,0.25);
                color: var(--accent-danger);
            }

            .sb2-logout:hover .sb2-icon { color: var(--accent-danger); }

            #sidebar:not(.expanded) .sb2-logout { justify-content: center; padding: 9px; gap: 0; }
            #sidebar:not(.expanded) .sb2-logout .sb2-label { display: none; }

            /* ── Mobile overlay ────────────────────────────────────────────── */
            .sb2-overlay {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(10,15,30,0.6);
                backdrop-filter: blur(3px);
                z-index: 1099;
                animation: overlayIn 0.2s ease;
            }

            @keyframes overlayIn {
                from { opacity: 0; } to { opacity: 1; }
            }

            /* ── Mobile hamburger (shown only on mobile) ───────────────────── */
            .sb2-mobile-toggle {
                display: none;
                position: fixed;
                top: 14px; left: 14px;
                z-index: 1200;
                width: 40px; height: 40px;
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: 10px;
                align-items: center; justify-content: center;
                cursor: pointer;
                color: var(--text-secondary);
                font-size: 15px;
                transition: var(--transition);
                box-shadow: 0 4px 14px rgba(0,0,0,0.3);
            }

            .sb2-mobile-toggle:hover {
                background: var(--bg-hover);
                color: var(--text-primary);
            }

            /* ── Responsive ────────────────────────────────────────────────── */
            @media (max-width: 992px) {
                /* Sidebar slides off-screen on mobile, opens as drawer */
                #sidebar {
                    transform: translateX(-100%);
                    width: var(--sidebar-width) !important;
                    box-shadow: none;
                }

                #sidebar.expanded {
                    transform: translateX(0);
                    box-shadow: 8px 0 40px rgba(0,0,0,0.5);
                }

                /* Restore all text in mobile drawer */
                #sidebar .sb2-brand-text   { opacity: 1 !important; width: auto !important; }
                #sidebar .sb2-profile-info,
                #sidebar .sb2-profile-chevron { display: block !important; }
                #sidebar .sb2-profile      { justify-content: flex-start !important; padding: 14px !important; }
                #sidebar .sb2-group-label  { opacity: 1 !important; height: auto !important; padding: 14px 10px 5px !important; }
                #sidebar .sb2-group + .sb2-group::before { display: none; }
                #sidebar .sb2-label        { display: block !important; }
                #sidebar .sb2-link         { justify-content: flex-start !important; padding: 8px 10px !important; gap: 10px !important; }
                #sidebar .sb2-link:hover   { padding-left: 14px !important; }
                #sidebar .sb2-active-dot   { display: block !important; }
                #sidebar .sb2-logout       { justify-content: flex-start !important; padding: 9px 10px !important; gap: 10px !important; }
                #sidebar .sb2-logout .sb2-label { display: block !important; }

                .sb2-overlay   { display: block; }
                .sb2-mobile-toggle { display: flex; }
            }
        `}</style>

        {/* Mobile hamburger button */}
        <button className="sb2-mobile-toggle" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
            <i className={`fas ${mobileOpen ? "fa-xmark" : "fa-bars"}`}></i>
        </button>

        {/* Overlay — mobile only */}
        {mobileOpen && (
            <div className="sb2-overlay" onClick={() => setMobileOpen(false)} />
        )}

        {/* Sidebar */}
        <div id="sidebar" className={expanded ? "expanded" : ""}>

            {/* Brand strip */}
            <div className="sb2-brand">
                <div className="sb2-brand-icon">
                    <i className="fas fa-layer-group"></i>
                </div>
                <div className="sb2-brand-text">
                    <div className="sb2-brand-name">AdminPanel</div>
                    <div className="sb2-brand-sub">Control Center</div>
                </div>
            </div>

            {/* Profile card */}
            <Link to="/profile" className="sb2-profile" style={{ textDecoration: "none" }}>
                <div className="sb2-avatar-wrap">
                    <img
                        src={
                            data?.pic
                                ? `${process.env.REACT_APP_BACKEND_SERVER}/${data.pic}`
                                : "/img/noimage.jpg"
                        }
                        alt="Profile"
                        className="sb2-avatar"
                    />
                    <span className="sb2-online"></span>
                </div>
                <div className="sb2-profile-info">
                    <div className="sb2-profile-name">
                        {data?.name || localStorage.getItem("name") || "Admin"}
                    </div>
                    <div className="sb2-profile-role">
                        {data?.role || localStorage.getItem("role") || "Super Admin"}
                    </div>
                </div>
                <i className="fas fa-chevron-right sb2-profile-chevron"></i>
            </Link>

            {/* Scrollable nav */}
            <nav className="sb2-nav-scroll">
                {NAV_GROUPS.map((group) => (
                    <div className="sb2-group" key={group.label}>
                        <span className="sb2-group-label">{group.label}</span>
                        <ul>
                            {group.items.map((item) => (
                                <NavItem
                                    key={item.to}
                                    item={item}
                                    isExpanded={expanded}
                                    isActive={isActive(item.to)}
                                />
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer — Logout */}
            {/* <div className="sb2-footer">
                <button className="sb2-logout" onClick={handleLogout}>
                    <span className="sb2-icon">
                        <i className="fas fa-right-from-bracket"></i>
                    </span>
                    <span className="sb2-label">Logout</span>
                </button>
            </div> */}

        </div>
        </>
    );
}