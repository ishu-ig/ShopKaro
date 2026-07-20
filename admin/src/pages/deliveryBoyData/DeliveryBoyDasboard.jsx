import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, Legend,
    AreaChart, Area,
} from "recharts";

import { getCheckout } from "../../Redux/ActionCreators/CheckoutActionCreators";

// Flat rate earned per successfully delivered order — keep in sync with
// the same constant in AssignedOrder.jsx / OrderHistory.jsx.
const DELIVERY_EARNING_PER_ORDER = 30;

// ── Sample fallback (shown only when this delivery boy has zero assigned
// orders yet, so the dashboard isn't just a wall of empty charts) ──────────
const SAMPLE = {
    checkouts: [
        { user: { name: "Rahul Sharma"  }, paymentMode: "UPI",  total: 478, orderStatus: "Delivered",        paymentStatus: "Done",    createdAt: "2025-02-10" },
        { user: { name: "Priya Mehta"   }, paymentMode: "COD",  total: 169, orderStatus: "Out for Delivery", paymentStatus: "Pending", createdAt: "2025-03-15" },
        { user: { name: "Aakash Singh"  }, paymentMode: "Card", total: 217, orderStatus: "Packed",           paymentStatus: "Done",    createdAt: "2025-04-01" },
        { user: { name: "Sneha Patel"   }, paymentMode: "UPI",  total: 99,  orderStatus: "Ordered",          paymentStatus: "Pending", createdAt: "2025-04-18" },
        { user: { name: "Vikram Nair"   }, paymentMode: "COD",  total: 299, orderStatus: "Cancelled",        paymentStatus: "Pending", createdAt: "2025-05-02" },
        { user: { name: "Anjali Rao"    }, paymentMode: "UPI",  total: 237, orderStatus: "Delivered",        paymentStatus: "Done",    createdAt: "2025-05-20" },
    ],
};

function unwrap(slice) {
    if (!slice) return [];
    if (Array.isArray(slice)) return slice;
    if (Array.isArray(slice.data)) return slice.data;
    return [];
}

function isToday(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.toDateString() === now.toDateString();
}

// order.deliveryBoy may come back populated ({ _id, name, ... }) or as a
// raw ObjectId/string, depending on whether the backend .populate()s it.
function belongsToDeliveryBoy(order, deliveryBoyId) {
    if (!deliveryBoyId) return false;
    const did = order?.deliveryBoy?._id ?? order?.deliveryBoy;
    return did?.toString() === deliveryBoyId.toString();
}

// ── Tooltip — uses BS CSS vars so it adapts to light/dark theme ───────────────
const DashTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "var(--bs-body-bg, #fff)",
            border: "1px solid var(--bs-border-color)",
            borderRadius: 8, padding: "8px 14px", fontSize: 12,
        }}>
            {label && <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 11 }}>{label}</p>}
            {payload.map((p, i) => (
                <p key={i} style={{ margin: 0, color: p.fill || p.color }}>
                    {p.name}: <strong>
                        {(p.name || "").toLowerCase().includes("earning") || (p.name || "").toLowerCase().includes("total")
                            ? "₹" + Number(p.value).toLocaleString("en-IN")
                            : p.value}
                    </strong>
                </p>
            ))}
        </div>
    );
};

// ── Order status badge helper (matches the status set used across the
// delivery-facing pages: Ordered / Packed / Shipped / Out for Delivery /
// Delivered / Cancelled) ───────────────────────────────────────────────────
function orderBadge(status) {
    return {
        "Ordered":          { cls: "badge text-bg-info",      label: "Ordered"     },
        "Packed":           { cls: "badge text-bg-warning",   label: "Packed"      },
        "Shipped":          { cls: "badge text-bg-warning",   label: "Shipped"     },
        "Out for Delivery": { cls: "badge text-bg-warning",   label: "Dispatched"  },
        "Delivered":        { cls: "badge text-bg-success",   label: "Delivered"   },
        "Cancelled":        { cls: "badge text-bg-danger",    label: "Cancelled"   },
    }[status] || { cls: "badge text-bg-secondary", label: status || "—" };
}

function payBadge(status) {
    return {
        "Done":    "badge text-bg-success",
        "Pending": "badge text-bg-warning",
        "Failed":  "badge text-bg-danger",
    }[status] || "badge text-bg-secondary";
}

export default function DeliveryDashboard() {
     const { _id } = useParams(); // delivery boy's own userid
    const dispatch = useDispatch();
    const [loaded,      setLoaded]      = useState(false);
    const [usingSample, setUsingSample] = useState(false);

    // ── Active / Inactive toggle (top-right of the page heading only) ───────
    // null = not yet loaded from the backend.
    const [activeState,       setActiveState]       = useState(null);
    const [togglingActive,    setTogglingActive]     = useState(false);
    const [activeToggleError, setActiveToggleError]  = useState("");

    // Fetch this delivery boy's own `active` flag once on mount. The rest of
    // this dashboard is driven by redux (checkouts), but `active` isn't part
    // of that slice, so it's pulled directly the same way ProfilePage.jsx does.
    useEffect(() => {
        if (!_id) return;
        (async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_BACKEND_SERVER}/api/deliveryBoy/${_id}`,
                    { headers: { authorization: localStorage.getItem("token") } }
                );
                const json = await response.json();
                if (json.result === "Done") {
                    setActiveState(!!json.data.active);
                }
            } catch (err) {
                console.error(err);
            }
        })();
    }, [_id]);

    async function toggleActiveStatus() {
        if (togglingActive || activeState === null || !_id) return;

        setActiveToggleError("");
        const nextValue = !activeState;
        setTogglingActive(true);

        try {
            const formData = new FormData();
            formData.append("active", nextValue);

            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_SERVER}/api/deliveryBoy/${_id}`,
                {
                    method: "PUT",
                    headers: { authorization: localStorage.getItem("token") },
                    body: formData,
                }
            );

            const json = await response.json();

            if (json.result === "Done") {
                setActiveState(nextValue);
            } else {
                setActiveToggleError("Could not update status.");
            }
        } catch (err) {
            console.error(err);
            setActiveToggleError("Internal Server Error.");
        } finally {
            setTogglingActive(false);
        }
    }

    const CheckoutStateData = useSelector((s) => s.CheckoutStateData);
    useEffect(() => {
        dispatch(getCheckout());
        setTimeout(() => setLoaded(true), 600);
    }, [dispatch]);

    const allOrders = unwrap(CheckoutStateData);
    const myOrders  = allOrders.filter((o) => belongsToDeliveryBoy(o, _id));

    const allEmpty = loaded && myOrders.length === 0;
    useEffect(() => { if (loaded) setUsingSample(allEmpty); }, [allEmpty, loaded]);

    const D = { checkouts: allEmpty ? SAMPLE.checkouts : myOrders };

    // ── Derived numbers ───────────────────────────────────────────────────────
    const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

    const totalAssigned    = D.checkouts.length;
    const deliveredOrders  = D.checkouts.filter((o) => o.orderStatus === "Delivered").length;
    const cancelledOrders  = D.checkouts.filter((o) => o.orderStatus === "Cancelled").length;
    const inProgressOrders = D.checkouts.filter(
        (o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled"
    ).length;
    const todaysOrders     = D.checkouts.filter((o) => isToday(o.createdAt)).length;
    const todaysDelivered  = D.checkouts.filter((o) => o.orderStatus === "Delivered" && isToday(o.createdAt)).length;

    // Flat rate earnings — not a percentage of order value.
    const totalEarnings = deliveredOrders * DELIVERY_EARNING_PER_ORDER;
    const todaysEarnings = todaysDelivered * DELIVERY_EARNING_PER_ORDER;

    const codPending = D.checkouts.filter(
        (o) => o.paymentMode === "COD" && o.paymentStatus === "Pending" && o.orderStatus !== "Cancelled"
    ).length;
    const codCollectAmount = D.checkouts
        .filter((o) => o.paymentMode === "COD" && o.paymentStatus === "Pending" && o.orderStatus !== "Cancelled")
        .reduce((s, o) => s + (o.total || 0), 0);

    // ── Recent orders sorted by date ──────────────────────────────────────────
    const recentOrders = [...D.checkouts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

    // ── Monthly earnings area chart (delivered orders × flat rate per month) ──
    const monthlyMap = {};
    D.checkouts.filter((c) => c.orderStatus === "Delivered" && c.createdAt).forEach((c) => {
        const key = new Date(c.createdAt).toLocaleString("en-IN", { month: "short", year: "2-digit" });
        monthlyMap[key] = (monthlyMap[key] || 0) + DELIVERY_EARNING_PER_ORDER;
    });
    const monthlyEarnings = Object.entries(monthlyMap).slice(-7).map(([month, earnings]) => ({ month, earnings }));

    // ── Order status pie ──────────────────────────────────────────────────────
    const orderStatusPie = [
        { name: "Ordered",          value: D.checkouts.filter((c) => c.orderStatus === "Ordered").length,          fill: "#0dcaf0" },
        { name: "Packed",           value: D.checkouts.filter((c) => c.orderStatus === "Packed").length,           fill: "#ffc107" },
        { name: "Out for Delivery", value: D.checkouts.filter((c) => c.orderStatus === "Out for Delivery").length, fill: "#fd7e14" },
        { name: "Delivered",        value: deliveredOrders,                                                        fill: "#198754" },
        { name: "Cancelled",        value: cancelledOrders,                                                        fill: "#dc3545" },
    ].filter((d) => d.value > 0);

    // ── Delivered vs Cancelled vs In-progress bar ─────────────────────────────
    const outcomeSplit = [
        { name: "Delivered",   count: deliveredOrders,   fill: "#198754" },
        { name: "In Progress", count: inProgressOrders,  fill: "#fd7e14" },
        { name: "Cancelled",   count: cancelledOrders,   fill: "#dc3545" },
    ];

    // ── Quick actions ─────────────────────────────────────────────────────────
    const quickActions = [
        { label: "Assigned Orders", icon: "bi-bag-check",      to: `/delivery/${_id}/orders`,  color: "#0d6efd" },
        { label: "Order History",   icon: "bi-clock-history",  to: `/delivery/${_id}/history`, color: "#6f42c1" },
        { label: "My Profile",      icon: "bi-person-circle",  to: `/delivery/${_id}/profile`, color: "#fd7e14" },
    ];

    // ── Stat cards ────────────────────────────────────────────────────────────
    const statCards = [
        { label: "Assigned Today",  value: todaysOrders,     icon: "bi-calendar-day",  variant: "metric-primary" },
        { label: "In Progress",     value: inProgressOrders, icon: "bi-truck",         variant: "metric-warning" },
        { label: "Delivered",       value: deliveredOrders,  icon: "bi-check-circle",  variant: "metric-success" },
        { label: "Cancelled",       value: cancelledOrders,  icon: "bi-x-circle",      variant: "metric-danger"  },
    ];

    // ── Alert cards ───────────────────────────────────────────────────────────
    const alertCards = [
        { label: "COD to Collect",   value: codPending,           icon: "bi-cash-stack",       color: "text-warning" },
        { label: "COD Amount Due",   value: fmt(codCollectAmount), icon: "bi-wallet2",          color: "text-danger"  },
        { label: "Today's Earnings", value: fmt(todaysEarnings),  icon: "bi-cash-coin",         color: "text-success" },
    ];

    const axisStyle = { fontSize: 11, fill: "var(--bs-secondary-color, #6c757d)" };
    const gridStyle = { stroke: "var(--bs-border-color, rgba(0,0,0,.1))", strokeDasharray: "3 3" };

    return (
        <main className="dashboard-content">
            <div className="container-fluid px-3 px-lg-4 py-4">

                {/* ── Page heading ── */}
                <div className="page-heading mb-4">
                    <div className="page-heading-copy">
                        <span className="page-icon">
                            <i className="bi bi-speedometer2" aria-hidden="true"></i>
                        </span>
                        <div>
                            <p className="eyebrow mb-1">Overview</p>
                            <h1 className="h3 mb-1">Delivery Dashboard</h1>
                            <p className="text-muted mb-0">
                                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>
                    </div>

                    <div className="page-heading-actions d-flex flex-column align-items-end gap-1">
                        <button
                            type="button"
                            className={`btn btn-sm ${activeState ? "btn-success" : "btn-outline-secondary"}`}
                            onClick={toggleActiveStatus}
                            disabled={togglingActive || activeState === null}
                        >
                            {togglingActive ? (
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            ) : (
                                <i className={`bi ${activeState ? "bi-toggle-on" : "bi-toggle-off"} me-1`} aria-hidden="true"></i>
                            )}
                            {activeState === null ? "Loading status…" : activeState ? "Active" : "Inactive"}
                        </button>
                        {activeToggleError && (
                            <span className="text-danger" style={{ fontSize: 11 }}>{activeToggleError}</span>
                        )}
                    </div>
                </div>

                {/* ── Sample banner ── */}
                {usingSample && (
                    <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
                        <i className="bi bi-flask"></i>
                        <span><strong>Preview mode —</strong> showing sample data. No orders assigned to you yet.</span>
                    </div>
                )}

                {/* ── Earnings banner ── */}
                <div className="panel mb-3" style={{ background: "linear-gradient(135deg, var(--bs-primary) 0%, #0a3880 100%)", border: "none" }}>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div>
                            <p className="text-white-50 mb-1" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 700 }}>
                                Total Earnings ({fmt(DELIVERY_EARNING_PER_ORDER)} per delivered order)
                            </p>
                            <p className="text-white mb-0" style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.02em" }}>
                                {fmt(totalEarnings)}
                            </p>
                        </div>
                        <div className="d-flex align-items-center justify-content-center rounded-3"
                            style={{ width: 54, height: 54, background: "rgba(255,255,255,.15)", fontSize: 22, color: "#fff" }}>
                            <i className="bi bi-cash-coin"></i>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap gap-3 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,.15)" }}>
                        {[
                            { icon: "bi-bag-check",        label: `${totalAssigned} Total Assigned`      },
                            { icon: "bi-check-circle",     label: `${deliveredOrders} Delivered`         },
                            { icon: "bi-truck",            label: `${inProgressOrders} In Progress`      },
                            { icon: "bi-x-circle",         label: `${cancelledOrders} Cancelled`         },
                            { icon: "bi-calendar-day",     label: `${todaysOrders} Today`                },
                            { icon: "bi-cash-stack",       label: `Today's Earnings: ${fmt(todaysEarnings)}` },
                        ].map((s, i) => (
                            <span key={i} className="text-white-50 d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
                                <i className={`bi ${s.icon} text-white`}></i> {s.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── Stat cards ── */}
                <section className="row g-3 mb-3">
                    {statCards.map((c, i) => (
                        <div key={i} className="col-12 col-sm-6 col-xl-3">
                            <article className={`metric-card ${c.variant}`}>
                                <div className="metric-top">
                                    <span className="metric-label">{c.label}</span>
                                    <span className="metric-icon"><i className={`bi ${c.icon}`} aria-hidden="true"></i></span>
                                </div>
                                <div className="metric-value">{c.value}</div>
                                <div className="metric-meta"><span className="text-muted">orders</span></div>
                            </article>
                        </div>
                    ))}
                </section>

                {/* ── Alert cards ── */}
                <div className="row g-3 mb-3">
                    {alertCards.map((c, i) => (
                        <div key={i} className="col-12 col-sm-6 col-xl-4">
                            <div className="panel d-flex align-items-center gap-3 py-3">
                                <span className={`fs-4 ${c.color}`}><i className={`bi ${c.icon}`}></i></span>
                                <div>
                                    <div className="fw-bold fs-5">{c.value}</div>
                                    <div className="text-muted small">{c.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Monthly Earnings (area) + Order Status (pie) ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-xl-7">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-graph-up" aria-hidden="true"></i>
                                        <span>Monthly Earnings Trend</span>
                                    </h2>
                                    <p className="text-muted mb-0">Based on delivered orders</p>
                                </div>
                                <span className="badge text-bg-secondary" style={{ fontSize: 11 }}>Last 7 months</span>
                            </div>
                            {monthlyEarnings.length === 0
                                ? <p className="text-muted text-center py-4">No earnings data yet.</p>
                                : <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={monthlyEarnings} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#0d6efd" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid {...gridStyle} />
                                        <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                                        <YAxis tick={axisStyle} axisLine={false} tickLine={false}
                                            tickFormatter={(v) => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)} />
                                        <Tooltip content={<DashTooltip />} />
                                        <Area type="monotone" dataKey="earnings" name="Earnings"
                                            stroke="#0d6efd" strokeWidth={2.5} fill="url(#earnGrad)"
                                            dot={{ fill: "#0d6efd", r: 4, strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: "#6ea8fe" }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            }
                        </div>
                    </div>

                    <div className="col-12 col-xl-5">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-bag-check" aria-hidden="true"></i>
                                        <span>Order Status</span>
                                    </h2>
                                    <p className="text-muted mb-0">All assigned orders</p>
                                </div>
                                <Link to={`/delivery/${_id}/orders`} className="btn btn-light btn-sm">View all</Link>
                            </div>
                            {orderStatusPie.length === 0
                                ? <p className="text-muted text-center py-4">No orders yet.</p>
                                : <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={orderStatusPie} dataKey="value" nameKey="name"
                                            cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                                            paddingAngle={3} strokeWidth={0}>
                                            {orderStatusPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                        </Pie>
                                        <Tooltip content={<DashTooltip />} />
                                        <Legend iconType="circle" iconSize={8}
                                            formatter={(v) => <span style={{ fontSize: 11, color: "var(--bs-secondary-color)" }}>{v}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            }
                        </div>
                    </div>
                </div>

                {/* ── Delivery Outcome Split ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12">
                        <div className="panel">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-bar-chart-line" aria-hidden="true"></i>
                                        <span>Delivery Outcomes</span>
                                    </h2>
                                    <p className="text-muted mb-0">Delivered vs in-progress vs cancelled</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={outcomeSplit} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={54}>
                                    <CartesianGrid {...gridStyle} />
                                    <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<DashTooltip />} />
                                    <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]}>
                                        {outcomeSplit.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ── Recent Orders (rich table) ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12">
                        <div className="panel">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-receipt" aria-hidden="true"></i>
                                        <span>Recent Orders</span>
                                    </h2>
                                    <p className="text-muted mb-0">Latest assignments, sorted by date</p>
                                </div>
                                <Link to={`/delivery/${_id}/orders`} className="btn btn-light btn-sm">View all</Link>
                            </div>
                            <div className="table-responsive mt-2">
                                <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Customer</th>
                                            <th>Pay Mode</th>
                                            <th>Total</th>
                                            <th>Order Status</th>
                                            <th>Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((o, i) => {
                                            const s = orderBadge(o.orderStatus);
                                            return (
                                                <tr key={i}>
                                                    <td className="text-muted" style={{ fontSize: 11 }}>#{i + 1}</td>
                                                    <td className="fw-semibold">{o.user?.name || o.user?.username || "—"}</td>
                                                    <td className="text-muted">{o.paymentMode || "COD"}</td>
                                                    <td className="fw-semibold">{fmt(o.total || 0)}</td>
                                                    <td><span className={s.cls}>{s.label}</span></td>
                                                    <td><span className={payBadge(o.paymentStatus)}>{o.paymentStatus || "Pending"}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12">
                        <div className="panel">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-lightning" aria-hidden="true"></i>
                                        <span>Quick Actions</span>
                                    </h2>
                                </div>
                            </div>

                            <div className="row g-2">
                                {quickActions.map((q, i) => (
                                    <div key={i} className="col-12 col-sm-4">
                                        <Link to={q.to} className="d-flex align-items-center gap-2 p-2 rounded-2 text-decoration-none"
                                            style={{
                                                background: "var(--bs-secondary-bg)",
                                                border: "1px solid var(--bs-border-color)",
                                                borderLeft: `3px solid ${q.color}`,
                                                fontSize: 12, fontWeight: 600,
                                                color: "var(--bs-secondary-color)",
                                                transition: "background .2s",
                                            }}>
                                            <i className={`bi ${q.icon}`} style={{ color: q.color, fontSize: 14 }}></i>
                                            {q.label}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}