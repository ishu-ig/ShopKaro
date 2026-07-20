import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, Legend,
    AreaChart, Area,
} from "recharts";

import { getProduct }  from "../../Redux/ActionCreators/ProductActionCreators";
import { getCheckout } from "../../Redux/ActionCreators/CheckoutActionCreators";
import { getShop }     from "../../Redux/ActionCreators/ShopActionCreators";

// ── Sample fallback ────────────────────────────────────────────────────────────
const SAMPLE = {
    products: [
        { name: "Butter Chicken",   resturent: { name: "Spice Garden" }, maincategory: { name: "North Indian" }, availability: true,  basePrice: 399, discount: 5,  finalPrice: 379, rating: 4.6 },
        { name: "Masala Dosa",      resturent: { name: "South Spice"  }, maincategory: { name: "South Indian" }, availability: true,  basePrice: 149, discount: 0,  finalPrice: 149, rating: 4.4 },
        { name: "Hakka Noodles",    resturent: { name: "Dragon Wok"   }, maincategory: { name: "Chinese"      }, availability: true,  basePrice: 219, discount: 10, finalPrice: 197, rating: 4.0 },
        { name: "Paneer Tikka",     resturent: { name: "Curry House"  }, maincategory: { name: "North Indian" }, availability: false, basePrice: 279, discount: 0,  finalPrice: 279, rating: 4.2 },
        { name: "Gulab Jamun",      resturent: { name: "Sweet Treats" }, maincategory: { name: "Desserts"     }, availability: true,  basePrice: 99,  discount: 0,  finalPrice: 99,  rating: 4.8 },
        { name: "Chilli Paneer",    resturent: { name: "Dragon Wok"   }, maincategory: { name: "Chinese"      }, availability: false, basePrice: 249, discount: 5,  finalPrice: 237, rating: 4.1 },
    ],
    checkouts: [
        { user: { name: "Rahul Sharma"  }, paymentMode: "UPI",  subtotal: 478,   shipping: 0,  total: 478,   orderStatus: "Delivered",       paymentStatus: "Done",    createdAt: "2025-02-10" },
        { user: { name: "Priya Mehta"   }, paymentMode: "COD",  subtotal: 149,   shipping: 20, total: 169,   orderStatus: "Processing",      paymentStatus: "Pending", createdAt: "2025-03-15" },
        { user: { name: "Aakash Singh"  }, paymentMode: "Card", subtotal: 197,   shipping: 20, total: 217,   orderStatus: "Out for Delivery",paymentStatus: "Done",    createdAt: "2025-04-01" },
        { user: { name: "Sneha Patel"   }, paymentMode: "UPI",  subtotal: 99,    shipping: 0,  total: 99,    orderStatus: "Order is Placed", paymentStatus: "Pending", createdAt: "2025-04-18" },
        { user: { name: "Vikram Nair"   }, paymentMode: "COD",  subtotal: 279,   shipping: 20, total: 299,   orderStatus: "Cancelled",       paymentStatus: "Pending", createdAt: "2025-05-02" },
        { user: { name: "Anjali Rao"    }, paymentMode: "UPI",  subtotal: 237,   shipping: 0,  total: 237,   orderStatus: "Delivered",       paymentStatus: "Done",    createdAt: "2025-05-20" },
    ],
};

function unwrap(slice) {
    if (!slice) return [];
    if (Array.isArray(slice)) return slice;
    if (Array.isArray(slice.data)) return slice.data;
    return [];
}

function belongsToShop(entity, resturentId) {
    if (!resturentId) return true;
    const rid = entity?.resturent?._id ?? entity?.resturent;
    return rid?.toString() === resturentId.toString();
}

function belongsToShopDeep(entity, resturentId) {
    if (!resturentId) return true;
    if (belongsToShop(entity, resturentId)) return true;

    const itemArrays = [
        entity?.items, entity?.products, entity?.cartItems,
        entity?.orderItems, entity?.cart, entity?.orderedItems,
    ].filter(Array.isArray);

    for (const arr of itemArrays) {
        for (const item of arr) {
            const product = item?.product ?? item?.productId ?? item;
            if (belongsToShop(product, resturentId)) return true;
        }
    }
    return false;
}

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
                        {(p.name || "").toLowerCase().includes("revenue") || (p.name || "").toLowerCase().includes("total")
                            ? "₹" + Number(p.value).toLocaleString("en-IN")
                            : p.value}
                    </strong>
                </p>
            ))}
        </div>
    );
};

function orderBadge(status) {
    return {
        "Order is Placed":  { cls: "badge text-bg-warning",   label: "Placed"      },
        "Processing":       { cls: "badge text-bg-primary",   label: "Processing"  },
        "Out for Delivery": { cls: "badge text-bg-info",      label: "Dispatched"  },
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

export default function ShopDashboard() {
    const { _id } = useParams();
    const dispatch = useDispatch();
    const [loaded,      setLoaded]      = useState(false);
    const [usingSample, setUsingSample] = useState(false);

    const [isOpenState,   setIsOpenState]   = useState(null);
    const [togglingOpen,  setTogglingOpen]  = useState(false);
    const [toggleError,   setToggleError]   = useState("");

    const raw = {
        products:  useSelector(s => s.ProductStateData),
        checkouts: useSelector(s => s.CheckoutStateData),
    };

    const ShopStateData = useSelector((s) => s.ShopStateData);

    useEffect(() => {
        dispatch(getProduct());
        dispatch(getCheckout());
        dispatch(getShop());
        setTimeout(() => setLoaded(true), 600);
    }, []);

    const live = Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, unwrap(v)])
    );

    const allEmpty = loaded && Object.values(live).every(a => a.length === 0);
    useEffect(() => { if (loaded) setUsingSample(allEmpty); }, [allEmpty, loaded]);

    const scopedLive = {
        ...live,
        products:  live.products.filter(p => belongsToShop(p, _id)),
        checkouts: live.checkouts.filter(c => belongsToShopDeep(c, _id)),
    };

    const D = allEmpty ? SAMPLE : scopedLive;

    const resturentList    = unwrap(ShopStateData);
    const currentShop = resturentList.find(r => r._id === _id) || null;
    const maincategoryList = currentShop?.maincategory || [];
    const subcategoryList  = currentShop?.subcategory  || [];

    useEffect(() => {
        if (currentShop && isOpenState === null) {
            setIsOpenState(!!currentShop.isOpen);
        }
    }, [currentShop, isOpenState]);

    async function toggleOpenStatus() {
        if (togglingOpen || isOpenState === null || !_id) return;

        setToggleError("");
        const nextValue = !isOpenState;
        setTogglingOpen(true);

        try {
            const formData = new FormData();
            formData.append("isOpen", nextValue);

            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_SERVER}/api/resturent/${_id}`,
                {
                    method: "PUT",
                    headers: {
                        authorization: localStorage.getItem("token"),
                    },
                    body: formData,
                }
            );

            const json = await response.json();

            if (json.result === "Done") {
                setIsOpenState(nextValue);
                dispatch(getShop());
            } else {
                setToggleError("Could not update status. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setToggleError("Internal Server Error. Please try again.");
        } finally {
            setTogglingOpen(false);
        }
    }

    const fmt = n => "₹" + Number(n).toLocaleString("en-IN");

    const outOfStock = D.products.filter(p => !p.availability).length;
    const inStock     = D.products.filter(p => p.availability).length;

    const totalRevenue        = D.checkouts.filter(o => o.paymentStatus === "Done").reduce((s, o) => s + (o.total || 0), 0);
    const totalRevenuePending = D.checkouts.filter(o => o.paymentStatus === "Pending").reduce((s, o) => s + (o.total || 0), 0);

    const pendingOrders   = D.checkouts.filter(o => o.orderStatus === "Order is Placed").length;
    const pendingPayments = D.checkouts.filter(o => o.paymentStatus === "Pending").length;
    const deliveredOrders = D.checkouts.filter(o => o.orderStatus === "Delivered").length;
    const cancelledOrders = D.checkouts.filter(o => o.orderStatus === "Cancelled").length;

    const recentOrders = [...D.checkouts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

    const unavailableProducts = D.products
        .filter(p => !p.availability)
        .slice(0, 5);

    const monthlyMap = {};
    D.checkouts.filter(c => c.paymentStatus === "Done" && c.createdAt).forEach(c => {
        const key = new Date(c.createdAt).toLocaleString("en-IN", { month: "short", year: "2-digit" });
        monthlyMap[key] = (monthlyMap[key] || 0) + (c.total || 0);
    });
    const monthlyRevenue = Object.entries(monthlyMap).slice(-7).map(([month, revenue]) => ({ month, revenue }));

    const orderStatusPie = [
        { name: "Placed",          value: D.checkouts.filter(c => c.orderStatus === "Order is Placed").length,  fill: "#ffc107" },
        { name: "Processing",      value: D.checkouts.filter(c => c.orderStatus === "Processing").length,       fill: "#0d6efd" },
        { name: "Out for Delivery",value: D.checkouts.filter(c => c.orderStatus === "Out for Delivery").length, fill: "#0dcaf0" },
        { name: "Delivered",       value: deliveredOrders,                                                       fill: "#198754" },
        { name: "Cancelled",       value: cancelledOrders,                                                       fill: "#dc3545" },
    ].filter(d => d.value > 0);

    const revenueSplit = [
        { name: "Orders Collected", revenue: totalRevenue,        fill: "#0d6efd" },
        { name: "Orders Pending",   revenue: totalRevenuePending, fill: "#ffc107" },
    ];

    const availabilityData = [
        { name: "Available",     count: inStock,    fill: "#198754" },
        { name: "Unavailable",   count: outOfStock, fill: "#dc3545" },
    ];

    const contentBars = [
        { label: "Products",    count: D.products.length,       to: "/product",      color: "#0d6efd" },
        { label: "Orders",      count: D.checkouts.length,       to: "/checkout",     color: "#6f42c1" },
        { label: "Main Cat.",   count: maincategoryList.length,  to: `/resturentMaincategory/${_id}`, color: "#198754" },
        { label: "Sub Cat.",    count: subcategoryList.length,   to: `/resturentSubcategory/${_id}`,  color: "#0dcaf0" },
    ];
    const maxBar = Math.max(...contentBars.map(b => b.count), 1);

    const statCards = [
        { label: "Total Products",   value: D.products.length,   icon: "bi-egg-fried",   variant: "metric-primary", to: "/product"   },
        { label: "Total Orders",     value: D.checkouts.length,  icon: "bi-bag-check",   variant: "metric-success", to: "/checkout"  },
    ];

    const categoryCards = [
        { label: "Main Categories", value: maincategoryList.length, icon: "bi-diagram-3", color: "text-primary", to: `/resturentMaincategory/${_id}` },
        { label: "Sub Categories",  value: subcategoryList.length,  icon: "bi-diagram-2", color: "text-info",    to: `/resturentSubcategory/${_id}`  },
    ];

    const alertCards = [
        { label: "New Orders",         value: pendingOrders,             icon: "bi-clock-history",      color: "text-warning" },
        { label: "Pending Payments",   value: pendingPayments,           icon: "bi-credit-card",        color: "text-danger"  },
        { label: "Unavailable Items",  value: outOfStock,                icon: "bi-exclamation-circle", color: "text-warning" },
    ];

    const quickActions = [
        { label: "Add Product",     icon: "bi-plus-circle",     to: "/product/create",      color: "#0d6efd" },
        { label: "View Orders",     icon: "bi-bag-check",       to: "/checkout",            color: "#6f42c1" },
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
                            <h1 className="h3 mb-1">Dashboard</h1>
                            <p className="text-muted mb-0">
                                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>
                    </div>

                    <div className="page-heading-actions d-flex flex-column align-items-end gap-1">
                        <button
                            type="button"
                            className={`btn btn-sm ${isOpenState ? "btn-success" : "btn-outline-secondary"}`}
                            onClick={toggleOpenStatus}
                            disabled={togglingOpen || isOpenState === null}
                        >
                            {togglingOpen ? (
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            ) : (
                                <i className={`bi ${isOpenState ? "bi-toggle-on" : "bi-toggle-off"} me-1`} aria-hidden="true"></i>
                            )}
                            {isOpenState === null
                                ? "Loading status…"
                                : isOpenState
                                ? "Restaurant Open"
                                : "Restaurant Closed"}
                        </button>
                        {toggleError && (
                            <span className="text-danger" style={{ fontSize: 11 }}>{toggleError}</span>
                        )}
                    </div>
                </div>

                {/* ── Sample banner ── */}
                {usingSample && (
                    <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
                        <i className="bi bi-flask"></i>
                        <span><strong>Preview mode —</strong> showing sample data. API returned no records yet.</span>
                    </div>
                )}

                {/* ── Revenue banner ── */}
                <div className="panel mb-3">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div>
                            <p className="text-muted mb-1" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 700 }}>Total Revenue</p>
                            <p className="mb-0" style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.02em" }}>
                                {fmt(totalRevenue)}
                            </p>
                        </div>
                        <div className="d-flex align-items-center justify-content-center rounded-3 bg-light"
                            style={{ width: 54, height: 54, fontSize: 22 }}>
                            <i className="bi bi-graph-up-arrow"></i>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap gap-3 mt-3 pt-3 border-top">
                        {[
                            { icon: "bi-check-circle",     label: `Orders Collected: ${fmt(totalRevenue)}`        },
                            { icon: "bi-clock",            label: `Orders Pending: ${fmt(totalRevenuePending)}`   },
                            { icon: "bi-bag-check",        label: `${deliveredOrders} Delivered`                  },
                            { icon: "bi-x-circle",         label: `${cancelledOrders} Cancelled`                  },
                            { icon: "bi-egg-fried",        label: `${D.products.length} Products`                 },
                        ].map((s, i) => (
                            <span key={i} className="text-muted d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
                                <i className={`bi ${s.icon}`}></i> {s.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── Stat cards ── */}
                <section className="row g-3 mb-3">
                    {statCards.map((c, i) => (
                        <div key={i} className="col-12 col-sm-6 col-xl-6">
                            <Link to={c.to} style={{ textDecoration: "none" }}>
                                <article className={`metric-card ${c.variant}`}>
                                    <div className="metric-top">
                                        <span className="metric-label">{c.label}</span>
                                        <span className="metric-icon"><i className={`bi ${c.icon}`} aria-hidden="true"></i></span>
                                    </div>
                                    <div className="metric-value">{c.value}</div>
                                    <div className="metric-meta"><span className="text-muted">total records</span></div>
                                </article>
                            </Link>
                        </div>
                    ))}
                </section>

                {/* ── Category cards ── */}
                <div className="row g-3 mb-3">
                    {categoryCards.map((c, i) => (
                        <div key={i} className="col-12 col-sm-6">
                            <Link to={c.to} style={{ textDecoration: "none" }}>
                                <div className="panel d-flex align-items-center justify-content-between gap-3 py-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <span className={`fs-4 ${c.color}`}><i className={`bi ${c.icon}`}></i></span>
                                        <div>
                                            <div className="fw-bold fs-5">{c.value}</div>
                                            <div className="text-muted small">{c.label}</div>
                                        </div>
                                    </div>
                                    <i className="bi bi-chevron-right text-muted"></i>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

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

                {/* ── Monthly Revenue (area) + Order Status (pie) ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-xl-7">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-graph-up" aria-hidden="true"></i>
                                        <span>Monthly Revenue Trend</span>
                                    </h2>
                                    <p className="text-muted mb-0">Completed orders only</p>
                                </div>
                                <span className="badge text-bg-secondary" style={{ fontSize: 11 }}>Last 7 months</span>
                            </div>
                            {monthlyRevenue.length === 0
                                ? <p className="text-muted text-center py-4">No revenue data yet.</p>
                                : <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#0d6efd" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid {...gridStyle} />
                                        <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                                        <YAxis tick={axisStyle} axisLine={false} tickLine={false}
                                            tickFormatter={v => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)} />
                                        <Tooltip content={<DashTooltip />} />
                                        <Area type="monotone" dataKey="revenue" name="Revenue"
                                            stroke="#0d6efd" strokeWidth={2.5} fill="url(#revGrad)"
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
                                    <p className="text-muted mb-0">All statuses</p>
                                </div>
                                <Link to="/checkout" className="btn btn-light btn-sm">View all</Link>
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
                                            formatter={v => <span style={{ fontSize: 11, color: "var(--bs-secondary-color)" }}>{v}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            }
                        </div>
                    </div>
                </div>

                {/* ── Revenue Split + Payment Modes + Availability Status ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-xl-4">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-bar-chart-line" aria-hidden="true"></i>
                                        <span>Revenue Split</span>
                                    </h2>
                                    <p className="text-muted mb-0">Collected vs Pending</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={revenueSplit} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={44}>
                                    <CartesianGrid {...gridStyle} />
                                    <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={axisStyle} axisLine={false} tickLine={false}
                                        tickFormatter={v => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)} />
                                    <Tooltip content={<DashTooltip />} />
                                    <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                                        {revenueSplit.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-credit-card" aria-hidden="true"></i>
                                        <span>Payment Modes</span>
                                    </h2>
                                    <p className="text-muted mb-0">Orders by payment type</p>
                                </div>
                            </div>
                            {(() => {
                                const modeMap = {};
                                D.checkouts.forEach(c => { const m = c.paymentMode || "COD"; modeMap[m] = (modeMap[m] || 0) + 1; });
                                const modeData = Object.entries(modeMap).map(([name, count]) => ({ name, count }));
                                return modeData.length === 0
                                    ? <p className="text-muted text-center py-4">No data yet.</p>
                                    : <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={modeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={36}>
                                            <CartesianGrid {...gridStyle} />
                                            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                                            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <Tooltip content={<DashTooltip />} />
                                            <Bar dataKey="count" name="Orders" fill="#6f42c1" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>;
                            })()}
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-boxes" aria-hidden="true"></i>
                                        <span>Availability Status</span>
                                    </h2>
                                    <p className="text-muted mb-0">Available vs unavailable</p>
                                </div>
                                <Link to="/product" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={availabilityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={44}>
                                    <CartesianGrid {...gridStyle} />
                                    <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<DashTooltip />} />
                                    <Bar dataKey="count" name="Products" radius={[6, 6, 0, 0]}>
                                        {availabilityData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ── Content breakdown ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12">
                        <div className="panel">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-bar-chart" aria-hidden="true"></i>
                                        <span>Content Breakdown</span>
                                    </h2>
                                    <p className="text-muted mb-0">Records per section</p>
                                </div>
                            </div>
                            <div className="d-flex flex-column gap-2 mt-3">
                                {contentBars.map(b => (
                                    <div key={b.label} className="d-flex align-items-center gap-2">
                                        <Link to={b.to} style={{ width: 86, fontSize: 12, color: "var(--bs-secondary-color)", textDecoration: "none", flexShrink: 0 }}>
                                            {b.label}
                                        </Link>
                                        <div className="flex-grow-1" style={{ height: 8, background: "var(--bs-secondary-bg)", borderRadius: 99, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${Math.round((b.count / maxBar) * 100)}%`, background: b.color, borderRadius: 99, transition: "width .5s ease" }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, minWidth: 20, textAlign: "right" }}>{b.count}</span>
                                    </div>
                                ))}
                            </div>
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
                                    <p className="text-muted mb-0">Latest checkout records, sorted by date</p>
                                </div>
                                <Link to="/checkout" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            <div className="table-responsive mt-2">
                                <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Customer</th>
                                            <th>Pay Mode</th>
                                            <th>Subtotal</th>
                                            <th>Shipping</th>
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
                                                    <td className="text-muted">{fmt(o.subtotal || 0)}</td>
                                                    <td className="text-muted">{fmt(o.shipping || 0)}</td>
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

                {/* ── Unavailable Products + Quick Actions ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-xl-7">
                        <div className="panel">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
                                        <span>Unavailable Products</span>
                                    </h2>
                                    <p className="text-muted mb-0">Products currently marked unavailable</p>
                                </div>
                                <Link to="/product" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            {unavailableProducts.length === 0
                                ? <p className="text-muted text-center py-4">🎉 All products are available.</p>
                                : <div className="table-responsive mt-2">
                                    <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                                        <thead>
                                            <tr><th>Product</th><th>Price</th><th>Status</th></tr>
                                        </thead>
                                        <tbody>
                                            {unavailableProducts.map((p, i) => (
                                                <tr key={i}>
                                                    <td className="fw-semibold">{p.name}</td>
                                                    <td className="text-muted">{fmt(p.finalPrice || 0)}</td>
                                                    <td>
                                                        <span className="badge text-bg-danger">Unavailable</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            }
                        </div>
                    </div>

                    <div className="col-12 col-xl-5">
                        <div className="panel h-100">
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
                                    <div key={i} className="col-6">
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