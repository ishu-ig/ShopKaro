import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfilePage({ title }) {
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json", "Authorization": localStorage.getItem("token") }
                });
                response = await response.json();
                if (response.data) setData(response.data);
                else navigate("/login");
            } catch {
                navigate("/login");
            }
        })();
    }, [navigate]);

    if (!data) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px", color: "var(--text-muted)", fontSize: "14px" }}>
            <span className="spinner-border spinner-border-sm" style={{ color: "var(--accent)" }}></span>
            Loading profile...
        </div>
    );

    const fields = [
        { label: "Full Name", value: data.name, icon: "fa-user" },
        { label: "Username", value: data.username, icon: "fa-at" },
        { label: "Email", value: data.email, icon: "fa-envelope" },
        { label: "Phone", value: data.phone, icon: "fa-phone" },
        { label: "Address", value: data.address, icon: "fa-location-dot" },
        { label: "State", value: data.state, icon: "fa-map" },
        { label: "City", value: data.city, icon: "fa-city" },
        { label: "Pin Code", value: data.pin, icon: "fa-hashtag" },
    ];

    const isCheckout = title === "Checkout";

    return (
        <>
            <style>{`
                .pp-page {
                    padding: 32px 24px 80px;
                    max-width: 960px;
                    margin: 0 auto;
                    animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* Page header bar */
                .pp-topbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-card) 100%);
                    border: 1px solid var(--border);
                    border-top: 2px solid var(--accent);
                    border-radius: 14px;
                    padding: 18px 24px;
                    margin-bottom: 24px;
                }

                .pp-topbar-left {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .pp-role-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: var(--accent-glow);
                    border: 1px solid var(--border-accent);
                    border-radius: 20px;
                    padding: 5px 12px;
                    font-size: 11.5px;
                    font-weight: 700;
                    color: var(--accent);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .pp-topbar-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--text-primary);
                    letter-spacing: -0.01em;
                }

                /* Main grid layout */
                .pp-layout {
                    display: grid;
                    grid-template-columns: ${isCheckout ? "1fr" : "240px 1fr"};
                    gap: 20px;
                    align-items: start;
                }

                /* Avatar card */
                .pp-avatar-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 28px 20px;
                    text-align: center;
                    position: sticky;
                    top: 80px;
                }

                .pp-avatar-img {
                    width: 110px;
                    height: 110px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid var(--border-accent);
                    box-shadow: 0 0 0 6px var(--accent-glow), 0 12px 28px rgba(0,0,0,0.4);
                    display: block;
                    margin: 0 auto 16px;
                }

                .pp-avatar-name {
                    font-family: 'Syne', sans-serif;
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                }

                .pp-avatar-email {
                    font-size: 12px;
                    color: var(--text-muted);
                    margin-bottom: 20px;
                    word-break: break-all;
                }

                .pp-avatar-divider {
                    height: 1px;
                    background: var(--border);
                    margin-bottom: 16px;
                }

                .pp-avatar-stat {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 12.5px;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                    text-align: left;
                }

                .pp-avatar-stat i {
                    width: 16px;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 12px;
                }

                /* Info card */
                .pp-info-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    overflow: hidden;
                }

                .pp-info-header {
                    padding: 18px 24px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: var(--bg-card);
                }

                .pp-info-header-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pp-info-header-title i { color: var(--accent); font-size: 13px; }

                /* Field rows */
                .pp-field-list {
                    padding: 8px 0;
                }

                .pp-field-row {
                    display: grid;
                    grid-template-columns: 180px 1fr;
                    align-items: center;
                    padding: 14px 24px;
                    border-bottom: 1px solid var(--border);
                    transition: background 0.15s;
                }

                .pp-field-row:last-child { border-bottom: none; }

                .pp-field-row:hover { background: var(--bg-hover); }

                .pp-field-key {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                    color: var(--text-secondary);
                }

                .pp-field-key i {
                    width: 16px;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 12px;
                }

                .pp-field-value {
                    font-size: 13.5px;
                    color: var(--text-primary);
                    line-height: 1.5;
                }

                .pp-field-empty {
                    font-size: 13px;
                    color: var(--text-muted);
                    font-style: italic;
                }

                /* Update button */
                .pp-update-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: calc(100% - 48px);
                    margin: 20px 24px;
                    padding: 12px 20px;
                    background: linear-gradient(135deg, var(--accent) 0%, #3a7de0 100%);
                    border: none;
                    border-radius: 10px;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 700;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    text-decoration: none;
                    transition: var(--transition);
                    box-shadow: 0 6px 20px rgba(79,142,247,0.3);
                }

                .pp-update-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 28px rgba(79,142,247,0.45);
                    color: #fff;
                }

                @media (max-width: 640px) {
                    .pp-layout { grid-template-columns: 1fr; }
                    .pp-field-row { grid-template-columns: 1fr; gap: 4px; padding: 12px 20px; }
                    .pp-avatar-card { position: static; }
                }
            `}</style>

            <div className="pp-page">
                {/* Top bar */}
                <div className="pp-topbar">
                    <div className="pp-topbar-left">
                        <div className="pp-role-badge">
                            <i className="fas fa-shield-halved"></i>
                            {data.role}
                        </div>
                        <span className="pp-topbar-title">My Profile</span>
                    </div>
                    {!isCheckout && (
                        <Link to="/update-profile" className="pp-update-btn" style={{ width: "auto", margin: 0, padding: "9px 18px", fontSize: "13px" }}>
                            <i className="fas fa-pen-to-square"></i> Edit Profile
                        </Link>
                    )}
                </div>

                <div className="pp-layout">
                    {/* Avatar card */}
                    {!isCheckout && (
                        <div className="pp-avatar-card">
                            <img
                                src={data.pic ? `${process.env.REACT_APP_BACKEND_SERVER}/${data.pic}` : "/img/noimage.jpg"}
                                alt="Profile"
                                className="pp-avatar-img"
                            />
                            <div className="pp-avatar-name">{data.name || "—"}</div>
                            <div className="pp-avatar-email">{data.email || "—"}</div>
                            <div className="pp-avatar-divider"></div>
                            <div className="pp-avatar-stat"><i className="fas fa-at"></i> {data.username || "—"}</div>
                            <div className="pp-avatar-stat"><i className="fas fa-phone"></i> {data.phone || "Not set"}</div>
                            <div className="pp-avatar-stat"><i className="fas fa-city"></i> {data.city || "Not set"}</div>
                        </div>
                    )}

                    {/* Info card */}
                    <div className="pp-info-card">
                        <div className="pp-info-header">
                            <div className="pp-info-header-title">
                                <i className="fas fa-id-card"></i> Account Information
                            </div>
                        </div>

                        <div className="pp-field-list">
                            {fields.map(({ label, value, icon }) => (
                                <div className="pp-field-row" key={label}>
                                    <div className="pp-field-key">
                                        <i className={`fas ${icon}`}></i>
                                        {label}
                                    </div>
                                    <div className={value ? "pp-field-value" : "pp-field-empty"}>
                                        {value || "Not provided"}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* {!isCheckout && (
                            <Link to="/update-profile" className="pp-update-btn">
                                <i className="fas fa-pen-to-square"></i> Update Profile
                            </Link>
                        )} */}
                    </div>
                </div>
            </div>
        </>
    );
}