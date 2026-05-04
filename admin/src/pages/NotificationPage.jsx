import React, { useState } from 'react';

const SAMPLE_NOTIFICATIONS = [
    {
        id: 1, type: "order", read: false,
        title: "New Order Received",
        message: "Order #ORD-8821 has been placed by Rahul Sharma for ₹4,250. Awaiting confirmation.",
        time: "2 min ago", timestamp: "Today, 10:42 AM",
        icon: "fa-bag-shopping", color: "#4F8EF7",
    },
    {
        id: 2, type: "user", read: false,
        title: "New User Registered",
        message: "Priya Mehta just signed up and completed her profile. Role assigned: Customer.",
        time: "18 min ago", timestamp: "Today, 10:26 AM",
        icon: "fa-user-plus", color: "#38EFC3",
    },
    {
        id: 3, type: "alert", read: false,
        title: "Low Stock Alert",
        message: "Product 'Wireless Headphones X200' has only 3 units remaining. Consider restocking.",
        time: "1 hr ago", timestamp: "Today, 09:44 AM",
        icon: "fa-triangle-exclamation", color: "#F7C35F",
    },
    {
        id: 4, type: "payment", read: true,
        title: "Payment Successful",
        message: "Payment of ₹12,800 received from Aakash Industries via UPI. Invoice #INV-3391 generated.",
        time: "3 hr ago", timestamp: "Today, 07:30 AM",
        icon: "fa-circle-check", color: "#38EF91",
    },
    {
        id: 5, type: "alert", read: true,
        title: "Login from New Device",
        message: "A sign-in was detected from Chrome on Windows in Mumbai, India. If this wasn't you, secure your account.",
        time: "Yesterday", timestamp: "Yesterday, 11:15 PM",
        icon: "fa-shield-halved", color: "#F75F5F",
    },
    {
        id: 6, type: "order", read: true,
        title: "Order Delivered",
        message: "Order #ORD-8814 has been successfully delivered to Sneha Patel. Customer notified via email.",
        time: "Yesterday", timestamp: "Yesterday, 6:02 PM",
        icon: "fa-truck", color: "#4F8EF7",
    },
    {
        id: 7, type: "system", read: true,
        title: "System Backup Complete",
        message: "Scheduled database backup completed successfully. Next backup is in 24 hours.",
        time: "2 days ago", timestamp: "Mon, 9:00 AM",
        icon: "fa-server", color: "#8896B3",
    },
    {
        id: 8, type: "user", read: true,
        title: "Admin Role Updated",
        message: "Super Admin granted Admin privileges to user 'Vikram Singh'. Changes are effective immediately.",
        time: "2 days ago", timestamp: "Mon, 8:15 AM",
        icon: "fa-user-shield", color: "#38EFC3",
    },
];

const FILTERS = ["All", "Unread", "Orders", "Users", "Alerts", "Payments", "System"];
const filterMap = { All: null, Unread: "unread", Orders: "order", Users: "user", Alerts: "alert", Payments: "payment", System: "system" };

export default function NotificationPage() {
    const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
    const [activeFilter, setActiveFilter] = useState("All");
    const [animatingId, setAnimatingId] = useState(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const filtered = notifications.filter(n => {
        const f = filterMap[activeFilter];
        if (!f) return true;
        if (f === "unread") return !n.read;
        return n.type === f;
    });

    function markRead(id) {
        setAnimatingId(id);
        setTimeout(() => {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setAnimatingId(null);
        }, 300);
    }

    function markAllRead() {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }

    function deleteNotif(id) {
        setAnimatingId(id);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
            setAnimatingId(null);
        }, 300);
    }

    return (
        <>
            <style>{`
                .nf-page {
                    width: 100%;
                    animation: nfFadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
                }

                @keyframes nfFadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Header ── */
                .nf-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 24px;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .nf-header-left { display: flex;  gap: 14px; }

                .nf-header-icon {
                    width: 46px; height: 46px;
                    background: linear-gradient(135deg, var(--accent), #3a7de0);
                    border-radius: 13px;
                    display: flex; align-items: center; justify-content: center;
                    color: #fff; font-size: 18px;
                    box-shadow: 0 6px 20px rgba(79,142,247,0.38);
                    flex-shrink: 0;
                    position: relative;
                }

                .nf-header-icon .nf-live-dot {
                    position: absolute;
                    top: -3px; right: -3px;
                    width: 11px; height: 11px;
                    background: var(--accent-success);
                    border-radius: 50%;
                    border: 2px solid var(--bg-base);
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(56,239,145,0.5); }
                    50%       { box-shadow: 0 0 0 5px rgba(56,239,145,0); }
                }

                .nf-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--text-primary);
                    letter-spacing: -0.02em;
                    margin: 0;
                }

                .nf-subtitle {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin: 3px 0 0;
                }

                .nf-unread-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: rgba(79,142,247,0.15);
                    border: 1px solid var(--border-accent);
                    color: var(--accent);
                    font-size: 11px;
                    font-weight: 700;
                    padding: 3px 10px;
                    border-radius: 20px;
                    margin-top: 4px;
                    letter-spacing: 0.05em;
                }

                .nf-mark-all-btn {
                    display: flex; align-items: center; gap: 7px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 9px;
                    color: var(--text-secondary);
                    font-size: 12.5px;
                    font-weight: 600;
                    padding: 9px 16px;
                    cursor: pointer;
                    transition: var(--transition);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    white-space: nowrap;
                    align-self: flex-start;
                }

                .nf-mark-all-btn:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                    border-color: rgba(255,255,255,0.15);
                }

                /* ── Filter tabs ── */
                .nf-filters {
                    display: flex;
                    gap: 6px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }

                .nf-filter-btn {
                    padding: 6px 14px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-secondary);
                    font-size: 12.5px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .nf-filter-btn:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                }

                .nf-filter-btn.active {
                    background: var(--accent-glow);
                    border-color: var(--border-accent);
                    color: var(--accent);
                }

                /* ── Notification list card ── */
                .nf-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    overflow: hidden;
                }

                /* ── Individual item ── */
                .nf-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 18px 22px;
                    border-bottom: 1px solid var(--border);
                    transition: background 0.2s, opacity 0.3s, transform 0.3s;
                    position: relative;
                    cursor: default;
                }

                .nf-item:last-child { border-bottom: none; }

                .nf-item:hover { background: var(--bg-hover); }

                .nf-item.unread {
                    background: rgba(79,142,247,0.04);
                }

                .nf-item.animating {
                    opacity: 0;
                    transform: translateX(12px);
                }

                /* Unread left bar */
                .nf-item.unread::before {
                    content: '';
                    position: absolute;
                    left: 0; top: 0; bottom: 0;
                    width: 3px;
                    background: linear-gradient(180deg, var(--accent), var(--accent-2));
                    border-radius: 0 2px 2px 0;
                }

                /* Icon circle */
                .nf-icon-wrap {
                    width: 42px; height: 42px;
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 15px;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                /* Item body */
                .nf-body { flex: 1; min-width: 0; }

                .nf-item-top {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 10px;
                    margin-bottom: 5px;
                }

                .nf-item-title {
                    font-size: 13.5px;
                    font-weight: 700;
                    color: var(--text-primary);
                    line-height: 1.3;
                    display: flex;
                    align-items: center;
                    gap: 7px;
                }

                .nf-dot {
                    width: 7px; height: 7px;
                    border-radius: 50%;
                    background: var(--accent);
                    flex-shrink: 0;
                    display: inline-block;
                }

                .nf-time {
                    font-size: 11.5px;
                    color: var(--text-muted);
                    white-space: nowrap;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                .nf-item-msg {
                    font-size: 13px;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin-bottom: 10px;
                }

                .nf-item-footer {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .nf-timestamp {
                    font-size: 11px;
                    color: var(--text-muted);
                    display: flex; align-items: center; gap: 5px;
                }

                .nf-timestamp i { font-size: 10px; }

                .nf-action-btn {
                    background: none;
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    color: var(--text-muted);
                    font-size: 11px;
                    font-weight: 600;
                    padding: 3px 10px;
                    cursor: pointer;
                    transition: var(--transition);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    display: flex; align-items: center; gap: 5px;
                }

                .nf-action-btn.mark {
                    color: var(--accent);
                    border-color: var(--border-accent);
                    background: var(--accent-glow);
                }

                .nf-action-btn.mark:hover {
                    background: rgba(79,142,247,0.25);
                }

                .nf-action-btn.del:hover {
                    border-color: rgba(247,95,95,0.4);
                    color: var(--accent-danger);
                    background: rgba(247,95,95,0.08);
                }

                /* ── Empty state ── */
                .nf-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 64px 24px;
                    gap: 14px;
                    text-align: center;
                }

                .nf-empty-icon {
                    width: 64px; height: 64px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 24px;
                    color: var(--text-muted);
                }

                .nf-empty h5 {
                    font-family: 'Syne', sans-serif;
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                }

                .nf-empty p {
                    font-size: 13px;
                    color: var(--text-muted);
                    margin: 0;
                    max-width: 280px;
                }

                /* ── Summary row ── */
                .nf-summary {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .nf-stat-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 14px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .nf-stat-icon {
                    width: 36px; height: 36px;
                    border-radius: 9px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .nf-stat-num {
                    font-family: 'Syne', sans-serif;
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--text-primary);
                    line-height: 1;
                }

                .nf-stat-label {
                    font-size: 11px;
                    color: var(--text-muted);
                    margin-top: 2px;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    font-weight: 600;
                }

                @media (max-width: 600px) {
                    .nf-summary { grid-template-columns: repeat(2, 1fr); }
                    .nf-item { padding: 14px 16px; }
                    .nf-filters { gap: 4px; }
                    .nf-filter-btn { padding: 5px 10px; font-size: 12px; }
                }
            `}</style>

            <div className="nf-page">

                {/* Header */}
                <div className="nf-header">
                    <div className="nf-header-left">
                        <div className="nf-header-icon">
                            <i className="fas fa-bell"></i>
                            <span className="nf-live-dot"></span>
                        </div>
                        <div>
                            <h4 className="nf-title text-light bg-primary p-3 ps-3" style={{borderRadius:"10px"}}>Notifications</h4>
                            <p className="nf-subtitle">Stay updated with your latest activity</p>
                            {unreadCount > 0 && (
                                <span className="nf-unread-badge">
                                    <i className="fas fa-circle" style={{ fontSize: "6px" }}></i>
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button className="nf-mark-all-btn" onClick={markAllRead}>
                            <i className="fas fa-check-double"></i> Mark all as read
                        </button>
                    )}
                </div>

                {/* Summary stats */}
                <div className="nf-summary">
                    {[
                        { label: "Total", count: notifications.length, icon: "fa-bell", bg: "rgba(79,142,247,0.12)", color: "#4F8EF7" },
                        { label: "Unread", count: unreadCount, icon: "fa-circle-dot", bg: "rgba(247,195,95,0.12)", color: "#F7C35F" },
                        { label: "Orders", count: notifications.filter(n => n.type === "order").length, icon: "fa-bag-shopping", bg: "rgba(56,239,195,0.12)", color: "#38EFC3" },
                        { label: "Alerts", count: notifications.filter(n => n.type === "alert").length, icon: "fa-triangle-exclamation", bg: "rgba(247,95,95,0.12)", color: "#F75F5F" },
                    ].map(s => (
                        <div className="nf-stat-card" key={s.label}>
                            <div className="nf-stat-icon" style={{ background: s.bg }}>
                                <i className={`fas ${s.icon}`} style={{ color: s.color }}></i>
                            </div>
                            <div>
                                <div className="nf-stat-num">{s.count}</div>
                                <div className="nf-stat-label">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="nf-filters">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            className={`nf-filter-btn ${activeFilter === f ? "active" : ""}`}
                            onClick={() => setActiveFilter(f)}
                        >
                            {f}
                            {f === "Unread" && unreadCount > 0 && (
                                <span style={{
                                    marginLeft: "5px", background: "var(--accent)",
                                    color: "#fff", borderRadius: "10px",
                                    padding: "1px 6px", fontSize: "10px", fontWeight: 700
                                }}>{unreadCount}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Notification list */}
                <div className="nf-card">
                    {filtered.length === 0 ? (
                        <div className="nf-empty">
                            <div className="nf-empty-icon"><i className="fas fa-bell-slash"></i></div>
                            <h5>All caught up!</h5>
                            <p>No notifications in this category right now.</p>
                        </div>
                    ) : (
                        filtered.map((n, i) => (
                            <div
                                key={n.id}
                                className={`nf-item ${!n.read ? "unread" : ""} ${animatingId === n.id ? "animating" : ""}`}
                                style={{ animationDelay: `${i * 0.04}s` }}
                            >
                                {/* Icon */}
                                <div className="nf-icon-wrap" style={{
                                    background: `${n.color}18`,
                                    border: `1px solid ${n.color}30`
                                }}>
                                    <i className={`fas ${n.icon}`} style={{ color: n.color }}></i>
                                </div>

                                {/* Body */}
                                <div className="nf-body">
                                    <div className="nf-item-top">
                                        <div className="nf-item-title">
                                            {!n.read && <span className="nf-dot"></span>}
                                            {n.title}
                                        </div>
                                        <span className="nf-time">{n.time}</span>
                                    </div>
                                    <p className="nf-item-msg">{n.message}</p>
                                    <div className="nf-item-footer">
                                        <span className="nf-timestamp">
                                            <i className="far fa-clock"></i>
                                            {n.timestamp}
                                        </span>
                                        {!n.read && (
                                            <button className="nf-action-btn mark" onClick={() => markRead(n.id)}>
                                                <i className="fas fa-check"></i> Mark read
                                            </button>
                                        )}
                                        <button className="nf-action-btn del" onClick={() => deleteNotif(n.id)}>
                                            <i className="fas fa-xmark"></i> Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </>
    );
}