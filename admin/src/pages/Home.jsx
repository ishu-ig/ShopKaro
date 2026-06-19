import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, Legend,
    AreaChart, Area,
} from "recharts";

import { getMaincategory } from "../Redux/ActionCreators/MaincategoryActionCreators";
import { getSubcategory }  from "../Redux/ActionCreators/SubcategoryActionCreators";
import { getBrand }        from "../Redux/ActionCreators/BrandActionCreators";
import { getProduct }      from "../Redux/ActionCreators/ProductActionCreators";
import { getBanner }         from "../Redux/ActionCreators/BannerActionCreators";
import { getCheckout }     from "../Redux/ActionCreators/CheckoutActionCreators";
import { getNewsletter }   from "../Redux/ActionCreators/NewsletterActionCreators";
import { getContactUs }    from "../Redux/ActionCreators/ContactUsActionCreators";
import { getTestimonial }  from "../Redux/ActionCreators/TestimonialActionCreators";

// ── Sample fallback ────────────────────────────────────────────────────────────
const SAMPLE = {
    maincategories: [
        { name: "Electronics",   active: true  },
        { name: "Fashion",       active: true  },
        { name: "Home & Living", active: false },
        { name: "Sports",        active: true  },
    ],
    subcategories: [
        { name: "Mobiles",   active: true  },
        { name: "Laptops",   active: true  },
        { name: "T-Shirts",  active: true  },
        { name: "Shoes",     active: false },
        { name: "Furniture", active: true  },
    ],
    brands: [
        { name: "Samsung", active: true  },
        { name: "Apple",   active: true  },
        { name: "Nike",    active: true  },
        { name: "Sony",    active: false },
        { name: "Adidas",  active: true  },
    ],
    products: [
        { name: "iPhone 15",        brand: { name: "Apple"   }, maincategory: { name: "Electronics" }, stock: true,  stockQuantity: 8,   basePrice: 79999,  discount: 5,  finalPrice: 75999  },
        { name: "Samsung Galaxy",   brand: { name: "Samsung" }, maincategory: { name: "Electronics" }, stock: true,  stockQuantity: 30,  basePrice: 59999,  discount: 10, finalPrice: 53999  },
        { name: "Nike Air Max",     brand: { name: "Nike"    }, maincategory: { name: "Sports"      }, stock: true,  stockQuantity: 100, basePrice: 8999,   discount: 15, finalPrice: 7649   },
        { name: "Sony Headphones",  brand: { name: "Sony"    }, maincategory: { name: "Electronics" }, stock: false, stockQuantity: 0,   basePrice: 14999,  discount: 20, finalPrice: 11999  },
        { name: "Adidas Tracksuit", brand: { name: "Adidas"  }, maincategory: { name: "Fashion"     }, stock: true,  stockQuantity: 5,   basePrice: 3999,   discount: 25, finalPrice: 2999   },
        { name: "MacBook Pro",      brand: { name: "Apple"   }, maincategory: { name: "Electronics" }, stock: true,  stockQuantity: 3,   basePrice: 129999, discount: 5,  finalPrice: 123499 },
        { name: "Denim Jeans",      brand: { name: "Nike"    }, maincategory: { name: "Fashion"     }, stock: false, stockQuantity: 0,   basePrice: 1999,   discount: 20, finalPrice: 1599   },
    ],
    Banners:     [{ qty: 2, total: 151998 }, { qty: 1, total: 7649 }, { qty: 3, total: 8997 }],
    checkouts: [
        { user: { name: "Rahul Sharma"  }, paymentMode: "UPI",  subtotal: 75999, shipping: 0,  total: 75999, orderStatus: "Delivered",       paymentStatus: "Done",    createdAt: "2025-02-10" },
        { user: { name: "Priya Mehta"   }, paymentMode: "COD",  subtotal: 53999, shipping: 99, total: 54098, orderStatus: "Processing",      paymentStatus: "Pending", createdAt: "2025-03-15" },
        { user: { name: "Aakash Singh"  }, paymentMode: "Card", subtotal: 7649,  shipping: 49, total: 7698,  orderStatus: "Out for Delivery",paymentStatus: "Done",    createdAt: "2025-04-01" },
        { user: { name: "Sneha Patel"   }, paymentMode: "UPI",  subtotal: 2999,  shipping: 0,  total: 2999,  orderStatus: "Order is Placed", paymentStatus: "Pending", createdAt: "2025-04-18" },
        { user: { name: "Vikram Nair"   }, paymentMode: "COD",  subtotal: 11999, shipping: 99, total: 12098, orderStatus: "Cancelled",       paymentStatus: "Pending", createdAt: "2025-05-02" },
        { user: { name: "Anjali Rao"    }, paymentMode: "UPI",  subtotal: 123499,shipping: 0,  total: 123499,orderStatus: "Delivered",       paymentStatus: "Done",    createdAt: "2025-05-20" },
    ],
    newsletters:  Array(28).fill({ _id: "x" }),
    contacts: [
        { name: "Rahul Sharma",  email: "rahul@email.com",  active: true  },
        { name: "Priya Mehta",   email: "priya@email.com",  active: true  },
        { name: "Aakash Singh",  email: "aakash@email.com", active: false },
        { name: "Sneha Patel",   email: "sneha@email.com",  active: true  },
        { name: "Vikram Nair",   email: "vikram@email.com", active: false },
    ],
    testimonials: [
        { name: "Rahul Sharma", active: true  },
        { name: "Priya Mehta",  active: true  },
        { name: "Aakash Singh", active: false },
        { name: "Sneha Patel",  active: true  },
        { name: "Vikram Nair",  active: false },
    ],
};

function unwrap(slice) {
    if (!slice) return [];
    if (Array.isArray(slice)) return slice;
    if (Array.isArray(slice.data)) return slice.data;
    return [];
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
                        {(p.name || "").toLowerCase().includes("revenue") || (p.name || "").toLowerCase().includes("total")
                            ? "₹" + Number(p.value).toLocaleString("en-IN")
                            : p.value}
                    </strong>
                </p>
            ))}
        </div>
    );
};

// ── Order status badge helper ─────────────────────────────────────────────────
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

export default function Home() {
    const dispatch = useDispatch();
    const [loaded,      setLoaded]      = useState(false);
    const [usingSample, setUsingSample] = useState(false);

    // ── Selectors — keys match RootReducer exactly ─────────────────────────────
    const raw = {
        maincategories: useSelector(s => s.MaincategoryStateData),
        subcategories:  useSelector(s => s.SubcategoryStateData),
        brands:         useSelector(s => s.BrandStateData),
        products:       useSelector(s => s.ProductStateData),
        Banners:          useSelector(s => s.BannerStateData),
        checkouts:      useSelector(s => s.CheckoutStateData),
        newsletters:    useSelector(s => s.NewsletterStateData),
        contacts:       useSelector(s => s.ContactUsStateData),
        testimonials:   useSelector(s => s.TestimonialStateData),
    };

    useEffect(() => {
        dispatch(getMaincategory());
        dispatch(getSubcategory());
        dispatch(getBrand());
        dispatch(getProduct());
        dispatch(getBanner());
        dispatch(getCheckout());
        dispatch(getNewsletter());
        dispatch(getContactUs());
        dispatch(getTestimonial());
        setTimeout(() => setLoaded(true), 600);
    }, []);

    const live = Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, unwrap(v)])
    );

    const allEmpty = loaded && Object.values(live).every(a => a.length === 0);
    useEffect(() => { if (loaded) setUsingSample(allEmpty); }, [allEmpty, loaded]);

    const D = allEmpty ? SAMPLE : live;

    // ── Derived numbers ───────────────────────────────────────────────────────
    const fmt = n => "₹" + Number(n).toLocaleString("en-IN");

    const outOfStock           = D.products.filter(p => !p.stock).length;
    const inStock              = D.products.filter(p => p.stock).length;

    const totalRevenue         = D.checkouts.filter(o => o.paymentStatus === "Done").reduce((s, o) => s + (o.total || 0), 0);
    const totalRevenuePending  = D.checkouts.filter(o => o.paymentStatus === "Pending").reduce((s, o) => s + (o.total || 0), 0);

    const pendingOrders        = D.checkouts.filter(o => o.orderStatus === "Order is Placed").length;
    const pendingPayments      = D.checkouts.filter(o => o.paymentStatus === "Pending").length;
    const deliveredOrders      = D.checkouts.filter(o => o.orderStatus === "Delivered").length;
    const cancelledOrders      = D.checkouts.filter(o => o.orderStatus === "Cancelled").length;

    const unreadContacts       = D.contacts.filter(c => c.active).length;
    const approvedTestimonials = D.testimonials.filter(t => t.active).length;
    const pendingTestimonials  = D.testimonials.filter(t => !t.active).length;

    // ── Recent orders sorted by date ──────────────────────────────────────────
    const recentOrders = [...D.checkouts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

    // ── Low stock: in-stock products with qty ≤ 10 ────────────────────────────
    const lowStockProducts = D.products
        .filter(p => p.stock === true && (p.stockQuantity || 0) <= 10)
        .sort((a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0))
        .slice(0, 5);

    // ── Monthly revenue area chart ────────────────────────────────────────────
    const monthlyMap = {};
    D.checkouts.filter(c => c.paymentStatus === "Done" && c.createdAt).forEach(c => {
        const key = new Date(c.createdAt).toLocaleString("en-IN", { month: "short", year: "2-digit" });
        monthlyMap[key] = (monthlyMap[key] || 0) + (c.total || 0);
    });
    const monthlyRevenue = Object.entries(monthlyMap).slice(-7).map(([month, revenue]) => ({ month, revenue }));

    // ── Order status pie — all 5 statuses ────────────────────────────────────
    const orderStatusPie = [
        { name: "Placed",          value: D.checkouts.filter(c => c.orderStatus === "Order is Placed").length,  fill: "#ffc107" },
        { name: "Processing",      value: D.checkouts.filter(c => c.orderStatus === "Processing").length,       fill: "#0d6efd" },
        { name: "Out for Delivery",value: D.checkouts.filter(c => c.orderStatus === "Out for Delivery").length, fill: "#0dcaf0" },
        { name: "Delivered",       value: deliveredOrders,                                                       fill: "#198754" },
        { name: "Cancelled",       value: cancelledOrders,                                                       fill: "#dc3545" },
    ].filter(d => d.value > 0);

    // ── Revenue split bar ─────────────────────────────────────────────────────
    const revenueSplit = [
        { name: "Collected", revenue: totalRevenue,        fill: "#0d6efd" },
        { name: "Pending",   revenue: totalRevenuePending, fill: "#ffc107" },
    ];

    // ── Products per brand bar ────────────────────────────────────────────────
    const brandMap = {};
    D.products.forEach(p => { const n = p.brand?.name || "Unknown"; brandMap[n] = (brandMap[n] || 0) + 1; });
    const productsPerBrand = Object.entries(brandMap)
        .sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([name, count]) => ({ name, count }));

    // ── Products per category pie ─────────────────────────────────────────────
    const catMap = {};
    D.products.forEach(p => { const n = p.maincategory?.name || "Unknown"; catMap[n] = (catMap[n] || 0) + 1; });
    const productsPerCategory = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

    // ── Stock status bar ──────────────────────────────────────────────────────
    const stockData = [
        { name: "In Stock",     count: inStock,    fill: "#198754" },
        { name: "Out of Stock", count: outOfStock, fill: "#dc3545" },
    ];

    // ── Content breakdown bars ────────────────────────────────────────────────
    const contentBars = [
        { label: "Products",    count: D.products.length,      to: "/product",      color: "#0d6efd" },
        { label: "Main Cat.",   count: D.maincategories.length, to: "/maincategory", color: "#198754" },
        { label: "Sub Cat.",    count: D.subcategories.length,  to: "/subcategory",  color: "#0dcaf0" },
        { label: "Brands",      count: D.brands.length,         to: "/brand",        color: "#ffc107" },
        { label: "Orders",      count: D.checkouts.length,      to: "/checkout",     color: "#6f42c1" },
        { label: "Subscribers", count: D.newsletters.length,    to: "/newsletter",   color: "#14b8a6" },
    ];
    const maxBar = Math.max(...contentBars.map(b => b.count), 1);

    // ── Stat cards ────────────────────────────────────────────────────────────
    const statCards = [
        { label: "Total Products", value: D.products.length,   icon: "bi-box-seam",  variant: "metric-primary", to: "/product"   },
        { label: "Total Orders",   value: D.checkouts.length,  icon: "bi-bag-check", variant: "metric-success", to: "/checkout"  },
        { label: "Banner Items",     value: D.Banners.length,      icon: "bi-Banner3",     variant: "metric-warning", to: "/Banner"      },
        { label: "Queries",        value: D.contacts.length,   icon: "bi-headset",   variant: "metric-danger",  to: "/contactUs" },
    ];

    // ── Alert cards ───────────────────────────────────────────────────────────
    const alertCards = [
        { label: "New Orders",        value: pendingOrders,    icon: "bi-clock-history",      color: "text-warning" },
        { label: "Pending Payments",  value: pendingPayments,  icon: "bi-credit-card",        color: "text-danger"  },
        { label: "Unread Messages",   value: unreadContacts,   icon: "bi-envelope",           color: "text-primary" },
        { label: "Out of Stock",      value: outOfStock,       icon: "bi-exclamation-circle", color: "text-warning" },
    ];

    // ── Quick actions ─────────────────────────────────────────────────────────
    const quickActions = [
        { label: "Add Product",    icon: "bi-plus-circle",  to: "/product/create",      color: "#0d6efd" },
        { label: "Add Category",   icon: "bi-folder-plus",  to: "/maincategory/create", color: "#198754" },
        { label: "Add Brand",      icon: "bi-patch-plus",   to: "/brand/create",        color: "#ffc107" },
        { label: "Add Sub-Cat.",   icon: "bi-diagram-3",    to: "/subcategory/create",  color: "#0dcaf0" },
        { label: "View Orders",    icon: "bi-bag-check",    to: "/checkout",            color: "#6f42c1" },
        { label: "View Banner",      icon: "bi-Banner3",        to: "/Banner",                color: "#14b8a6" },
        { label: "View Messages",  icon: "bi-headset",      to: "/contactUs",           color: "#dc3545" },
        { label: "Testimonials",   icon: "bi-chat-quote",   to: "/testimonial",         color: "#ec4899" },
    ];

    const axisStyle = { fontSize: 11, fill: "var(--bs-secondary-color, #6c757d)" };
    const gridStyle = { stroke: "var(--bs-border-color, rgba(0,0,0,.1))", strokeDasharray: "3 3" };
    const PIE_COLORS = ["#0d6efd", "#198754", "#0dcaf0", "#ffc107", "#dc3545", "#6f42c1"];

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
                </div>

                {/* ── Sample banner ── */}
                {usingSample && (
                    <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
                        <i className="bi bi-flask"></i>
                        <span><strong>Preview mode —</strong> showing sample data. API returned no records yet.</span>
                    </div>
                )}

                {/* ── Revenue banner ── */}
                <div className="panel mb-3" style={{ background: "linear-gradient(135deg, var(--bs-primary) 0%, #0a3880 100%)", border: "none" }}>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div>
                            <p className="text-white-50 mb-1" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 700 }}>Total Revenue Collected</p>
                            <p className="text-white mb-0" style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.02em" }}>
                                {fmt(totalRevenue)}
                            </p>
                        </div>
                        <div className="d-flex align-items-center justify-content-center rounded-3"
                            style={{ width: 54, height: 54, background: "rgba(255,255,255,.15)", fontSize: 22, color: "#fff" }}>
                            <i className="bi bi-graph-up-arrow"></i>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap gap-3 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,.15)" }}>
                        {[
                            { icon: "bi-check-circle",   label: `Collected: ${fmt(totalRevenue)}`         },
                            { icon: "bi-clock",          label: `Pending: ${fmt(totalRevenuePending)}`    },
                            { icon: "bi-bag-check",      label: `${deliveredOrders} Delivered`            },
                            { icon: "bi-x-circle",       label: `${cancelledOrders} Cancelled`            },
                            { icon: "bi-box-seam",       label: `${D.products.length} Products`           },
                            { icon: "bi-envelope-paper", label: `${D.newsletters.length} Subscribers`     },
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

                {/* ── Alert cards ── */}
                <div className="row g-3 mb-3">
                    {alertCards.map((c, i) => (
                        <div key={i} className="col-12 col-sm-6 col-xl-3">
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

                {/* ── Revenue Split + Payment Modes + Stock Status ── */}
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
                                        <span>Stock Status</span>
                                    </h2>
                                    <p className="text-muted mb-0">In stock vs out of stock</p>
                                </div>
                                <Link to="/product" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={stockData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={44}>
                                    <CartesianGrid {...gridStyle} />
                                    <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<DashTooltip />} />
                                    <Bar dataKey="count" name="Products" radius={[6, 6, 0, 0]}>
                                        {stockData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ── Products per Brand + Products per Category ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-xl-7">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-tag" aria-hidden="true"></i>
                                        <span>Products per Brand</span>
                                    </h2>
                                    <p className="text-muted mb-0">Top 6 brands by count</p>
                                </div>
                                <Link to="/brand" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            {productsPerBrand.length === 0
                                ? <p className="text-muted text-center py-4">No product data yet.</p>
                                : <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={productsPerBrand} margin={{ top: 10, right: 10, left: 0, bottom: 44 }} barSize={32}>
                                        <CartesianGrid {...gridStyle} />
                                        <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false}
                                            angle={-25} textAnchor="end" interval={0} />
                                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip content={<DashTooltip />} />
                                        <Bar dataKey="count" name="Products" fill="#fd7e14" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            }
                        </div>
                    </div>

                    <div className="col-12 col-xl-5">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-layer-backward" aria-hidden="true"></i>
                                        <span>Products per Category</span>
                                    </h2>
                                    <p className="text-muted mb-0">Category distribution</p>
                                </div>
                                <Link to="/maincategory" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            {productsPerCategory.length === 0
                                ? <p className="text-muted text-center py-4">No product data yet.</p>
                                : <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={productsPerCategory} dataKey="count" nameKey="name"
                                            cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                                            paddingAngle={3} strokeWidth={0}>
                                            {productsPerCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
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

                {/* ── Testimonial status ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-xl-6">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-chat-quote" aria-hidden="true"></i>
                                        <span>Testimonial Status</span>
                                    </h2>
                                    <p className="text-muted mb-0">Approved vs pending</p>
                                </div>
                                <Link to="/testimonial" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={[
                                        { name: "Approved", value: approvedTestimonials, fill: "#198754" },
                                        { name: "Pending",  value: pendingTestimonials,  fill: "#ffc107" },
                                    ].filter(d => d.value > 0)} dataKey="value" nameKey="name"
                                        cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                                        paddingAngle={3} strokeWidth={0}>
                                        {[{ fill: "#198754" }, { fill: "#ffc107" }].map((e, i) => <Cell key={i} fill={e.fill} />)}
                                    </Pie>
                                    <Tooltip content={<DashTooltip />} />
                                    <Legend iconType="circle" iconSize={8}
                                        formatter={v => <span style={{ fontSize: 11, color: "var(--bs-secondary-color)" }}>{v}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ── Recent Messages ── */}
                    <div className="col-12 col-xl-6">
                        <div className="panel h-100">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-headset" aria-hidden="true"></i>
                                        <span>Recent Messages</span>
                                    </h2>
                                    <p className="text-muted mb-0">Latest contact queries</p>
                                </div>
                                <Link to="/contactUs" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            <div className="table-responsive mt-2">
                                <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                                    <thead>
                                        <tr><th>Name</th><th>Email</th><th>Status</th></tr>
                                    </thead>
                                    <tbody>
                                        {D.contacts.slice(0, 5).map((c, i) => (
                                            <tr key={i}>
                                                <td className="fw-semibold">{c.name || "—"}</td>
                                                <td className="text-muted">{c.email || "—"}</td>
                                                <td>
                                                    <span className={`badge ${c.active ? "text-bg-warning" : "text-bg-success"}`}>
                                                        {c.active ? "Unread" : "Read"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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

                {/* ── Low Stock Alert + Quick Actions ── */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-xl-7">
                        <div className="panel">
                            <div className="panel-header">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
                                        <span>Low Stock Alert</span>
                                    </h2>
                                    <p className="text-muted mb-0">In-stock products with ≤ 10 units remaining</p>
                                </div>
                                <Link to="/product" className="btn btn-light btn-sm">View all</Link>
                            </div>
                            {lowStockProducts.length === 0
                                ? <p className="text-muted text-center py-4">🎉 All products are well stocked.</p>
                                : <div className="table-responsive mt-2">
                                    <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                                        <thead>
                                            <tr><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Qty Left</th></tr>
                                        </thead>
                                        <tbody>
                                            {lowStockProducts.map((p, i) => (
                                                <tr key={i}>
                                                    <td className="fw-semibold">{p.name}</td>
                                                    <td className="text-muted">{p.brand?.name || "—"}</td>
                                                    <td className="text-muted">{p.maincategory?.name || "—"}</td>
                                                    <td className="text-muted">{fmt(p.finalPrice || 0)}</td>
                                                    <td>
                                                        <span className="badge text-bg-warning">{p.stockQuantity} left</span>
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

                            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--bs-border-color)" }}>
                                {[
                                    { icon: "bi-envelope-paper", color: "text-primary",   label: "Newsletter Subscribers", val: D.newsletters.length,   to: "/newsletter"  },
                                    { icon: "bi-star",           color: "text-warning",   label: "Testimonials",          val: D.testimonials.length,   to: "/testimonial" },
                                ].map((r, i) => (
                                    <div key={i} className="d-flex justify-content-between align-items-center mb-2">
                                        <span className={`text-muted small d-flex align-items-center gap-2`}>
                                            <i className={`bi ${r.icon} ${r.color}`}></i> {r.label}
                                        </span>
                                        <Link to={r.to} className="fw-bold small text-decoration-none">{r.val}</Link>
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