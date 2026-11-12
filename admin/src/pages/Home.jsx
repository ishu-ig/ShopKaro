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
        "Ordered":          { cls: "badge text-bg-warning",   label: "Placed"      },
        "Processing":       { cls: "badge text-bg-primary",   label: "Processing"  },
        "Packed":           { cls: "badge text-bg-primary",   label: "Packed"      },
        "Shipped":          { cls: "badge text-bg-info",      label: "Shipped"     },
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

    const pendingOrders        = D.checkouts.filter(o => o.orderStatus === "Order is Placed" || o.orderStatus === "Ordered").length;
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
        { name: "Placed",          value: D.checkouts.filter(c => c.orderStatus === "Order is Placed" || c.orderStatus === "Ordered").length,  fill: "#ffc107" },
        { name: "Packed",          value: D.checkouts.filter(c => c.orderStatus === "Processing" || c.orderStatus === "Packed").length,       fill: "#0d6efd" },
        { name: "Shipped",         value: D.checkouts.filter(c => c.orderStatus === "Shipped").length,                                         fill: "#6f42c1" },
        { name: "Out for Delivery",value: D.checkouts.filter(c => c.orderStatus === "Out for Delivery").length,                               fill: "#0dcaf0" },
        { name: "Delivered",       value: deliveredOrders,                                                                                      fill: "#198754" },
        { name: "Cancelled",       value: cancelledOrders,                                                                                      fill: "#dc3545" },
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

    // ── Greeting calculation ──────────────────────────────────────────────────
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const userName = localStorage.getItem("name") || "Admin";

    const statCards = [
        { label: "Total Products", value: D.products.length, icon: "bi-box-seam", variant: "metric-primary", to: "/product", trend: "+8.2% this mo" },
        { label: "Total Orders", value: D.checkouts.length, icon: "bi-bag-check", variant: "metric-success", to: "/checkout", trend: "+14.5% this mo" },
        { label: "Active Brands", value: D.brands.length, icon: "bi-award", variant: "metric-warning", to: "/brand", trend: "Catalogued" },
        { label: "Customer Inquiries", value: D.contacts.length, icon: "bi-chat-dots", variant: "metric-danger", to: "/contactUs", trend: `${unreadContacts} Unread` },
    ];

    const alertCards = [
        { label: "New Orders Placed", value: pendingOrders, icon: "bi-clock-history", bg: "bg-warning-subtle", text: "text-warning", border: "border-warning-subtle", to: "/checkout" },
        { label: "Pending Payments", value: pendingPayments, icon: "bi-credit-card", bg: "bg-danger-subtle", text: "text-danger", border: "border-danger-subtle", to: "/checkout" },
        { label: "Unread Messages", value: unreadContacts, icon: "bi-envelope-check", bg: "bg-primary-subtle", text: "text-primary", border: "border-primary-subtle", to: "/contactUs" },
        { label: "Out of Stock Items", value: outOfStock, icon: "bi-exclamation-circle", bg: "bg-warning-subtle", text: "text-warning", border: "border-warning-subtle", to: "/product" },
    ];

    const quickActions = [
        { label: "Add Product", icon: "bi-plus-circle-fill", to: "/product/create", color: "#4f46e5" },
        { label: "Add Category", icon: "bi-folder-plus", to: "/maincategory/create", color: "#10b981" },
        { label: "Add Brand", icon: "bi-patch-plus", to: "/brand/create", color: "#f59e0b" },
        { label: "Add Sub-Cat.", icon: "bi-diagram-3", to: "/subcategory/create", color: "#06b6d4" },
        { label: "View Orders", icon: "bi-bag-check", to: "/checkout", color: "#8b5cf6" },
        { label: "Banners", icon: "bi-images", to: "/banner", color: "#ec4899" },
        { label: "Customer Queries", icon: "bi-chat-dots", to: "/contactUs", color: "#f43f5e" },
        { label: "Testimonials", icon: "bi-chat-quote", to: "/testimonial", color: "#14b8a6" },
    ];

    const axisStyle = { fontSize: 11, fill: "var(--admin-muted, #94a3b8)" };
    const gridStyle = { stroke: "var(--admin-border, rgba(0,0,0,.08))", strokeDasharray: "3 3" };
    const PIE_COLORS = ["#4f46e5", "#10b981", "#06b6d4", "#f59e0b", "#f43f5e", "#8b5cf6"];

    return (
        <main className="dashboard-content">
            <div className="container-fluid px-3 px-lg-4 py-4">

                {/* ── Welcome Header ── */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-2">
                    <div className="d-flex align-items-center gap-3">
                        <div className="page-icon">
                            <i className="bi bi-grid-1x2-fill" aria-hidden="true"></i>
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h1 className="h3 mb-0 fw-bold">{getGreeting()}, {userName}! 👋</h1>
                            </div>
                            <p className="text-muted mb-0 small">
                                Here is what’s happening in your store today • {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
                            </p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Link to="/product/create" className="btn btn-primary shadow-sm">
                            <i className="bi bi-plus-lg"></i>
                            <span>Add New Product</span>
                        </Link>
                    </div>
                </div>

                {/* ── Sample Preview Alert (if mock mode) ── */}
                {usingSample && (
                    <div className="alert bg-warning-subtle text-warning-emphasis border border-warning-subtle d-flex align-items-center gap-2 mb-4 shadow-sm" role="alert">
                        <i className="bi bi-info-circle-fill fs-5"></i>
                        <div><strong>Preview Mode:</strong> Displaying sample store metrics while connecting with backend database records.</div>
                    </div>
                )}

                {/* ── Total Revenue Highlight Banner ── */}
                <div className="panel mb-4 p-4 text-white position-relative overflow-hidden" 
                     style={{ 
                         background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)", 
                         border: "1px solid rgba(255, 255, 255, 0.12)",
                         boxShadow: "0 20px 40px -10px rgba(49, 46, 129, 0.4)" 
                     }}>
                    {/* Background glow decoration */}
                    <div style={{
                        position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px",
                        background: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0) 70%)",
                        borderRadius: "50%", pointerEvents: "none"
                    }}></div>

                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 position-relative z-1">
                        <div>
                            <span className="badge bg-white bg-opacity-20 text-white border-0 mb-2 px-2.5 py-1">
                                <i className="bi bi-cash-stack me-1"></i> Net Sales Performance
                            </span>
                            <div className="text-white-50 small text-uppercase fw-bold letter-spacing-wide">Total Revenue Collected</div>
                            <div className="text-white display-5 fw-extrabold my-1 letter-spacing-tight">
                                {fmt(totalRevenue)}
                            </div>
                            <div className="text-white-50 small d-flex align-items-center gap-1">
                                <span className="text-success-light fw-bold">₹{Number(totalRevenuePending).toLocaleString("en-IN")}</span> pending clearance across {pendingOrders} open orders
                            </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-center rounded-4"
                            style={{ width: 64, height: 64, background: "rgba(255,255,255,.12)", backdropFilter: "blur(10px)", fontSize: 26, color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
                            <i className="bi bi-graph-up-arrow"></i>
                        </div>
                    </div>

                    <div className="row g-2 mt-3 pt-3 border-top border-white border-opacity-15 position-relative z-1">
                        {[
                            { icon: "bi-check-circle-fill", label: "Completed Revenue", val: fmt(totalRevenue), color: "#34d399" },
                            { icon: "bi-clock-fill", label: "Pending Revenue", val: fmt(totalRevenuePending), color: "#fbbf24" },
                            { icon: "bi-truck", label: "Delivered Orders", val: `${deliveredOrders} orders`, color: "#38bdf8" },
                            { icon: "bi-boxes", label: "Catalog Products", val: `${D.products.length} items`, color: "#c084fc" },
                            { icon: "bi-send-check", label: "Subscribers", val: `${D.newsletters.length} users`, color: "#f472b6" },
                        ].map((s, i) => (
                            <div key={i} className="col-6 col-md-4 col-lg">
                                <div className="d-flex align-items-center gap-2 text-white-50 small">
                                    <i className={`bi ${s.icon}`} style={{ color: s.color }}></i>
                                    <div>
                                        <div className="text-white fw-bold">{s.val}</div>
                                        <div style={{ fontSize: "0.72rem" }}>{s.label}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── 4 Primary Stat Cards ── */}
                <section className="row g-3 mb-4">
                    {statCards.map((c, i) => (
                        <div key={i} className="col-12 col-sm-6 col-xl-3">
                            <Link to={c.to} className="text-decoration-none">
                                <article className={`metric-card ${c.variant} h-100`}>
                                    <div className="metric-top">
                                        <span className="metric-label">{c.label}</span>
                                        <span className="metric-icon">
                                            <i className={`bi ${c.icon}`} aria-hidden="true"></i>
                                        </span>
                                    </div>
                                    <div className="metric-value">{c.value}</div>
                                    <div className="metric-meta d-flex justify-content-between align-items-center">
                                        <span className="badge bg-primary-subtle text-primary border-0 font-size-xs">{c.trend}</span>
                                        <span className="text-muted small">View all <i className="bi bi-chevron-right ms-0.5"></i></span>
                                    </div>
                                </article>
                            </Link>
                        </div>
                    ))}
                </section>

                {/* ── 4 Mini Status Cards ── */}
                <div className="row g-3 mb-4">
                    {alertCards.map((c, i) => (
                        <div key={i} className="col-12 col-sm-6 col-xl-3">
                            <Link to={c.to} className="text-decoration-none">
                                <div className={`panel p-3 d-flex align-items-center gap-3 border ${c.border} h-100`}>
                                    <div className={`p-2.5 rounded-3 ${c.bg} ${c.text} fs-4 d-inline-grid place-items-center`}>
                                        <i className={`bi ${c.icon}`}></i>
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="fw-bold fs-5 text-body">{c.value}</div>
                                        <div className="text-muted small">{c.label}</div>
                                    </div>
                                    <i className="bi bi-arrow-up-right text-muted opacity-50"></i>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* ── Charts Row 1: Monthly Revenue Area Chart + Order Status Donut Chart ── */}
                <div className="row g-4 mb-4">
                    <div className="col-12 col-xl-8">
                        <div className="panel h-100">
                            <div className="panel-header mb-3">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-graph-up text-primary" aria-hidden="true"></i>
                                        <span>Monthly Revenue Trend</span>
                                    </h2>
                                    <p className="text-muted small mb-0">Completed sales revenue trend over recent months</p>
                                </div>
                                <span className="badge bg-primary-subtle text-primary">Last 7 Months</span>
                            </div>
                            {monthlyRevenue.length === 0
                                ? <div className="text-muted text-center py-5">No completed revenue transactions to display.</div>
                                : <div style={{ height: 260 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid {...gridStyle} />
                                            <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                                            <YAxis tick={axisStyle} axisLine={false} tickLine={false}
                                                tickFormatter={v => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)} />
                                            <Tooltip content={<DashTooltip />} />
                                            <Area type="monotone" dataKey="revenue" name="Revenue"
                                                stroke="#4f46e5" strokeWidth={3} fill="url(#revenueGradient)"
                                                dot={{ fill: "#4f46e5", r: 4, strokeWidth: 2, stroke: "#ffffff" }}
                                                activeDot={{ r: 7, fill: "#6366f1", stroke: "#ffffff", strokeWidth: 2 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            }
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="panel h-100 d-flex flex-column">
                            <div className="panel-header mb-3">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-pie-chart text-success" aria-hidden="true"></i>
                                        <span>Order Status Breakdown</span>
                                    </h2>
                                    <p className="text-muted small mb-0">Distribution across active order statuses</p>
                                </div>
                                <Link to="/checkout" className="btn btn-light btn-sm py-1 px-2.5">View all</Link>
                            </div>
                            <div className="flex-grow-1 d-flex flex-column justify-content-center" style={{ minHeight: 220 }}>
                                {orderStatusPie.length === 0
                                    ? <div className="text-muted text-center py-4">No order records recorded.</div>
                                    : <ResponsiveContainer width="100%" height={230}>
                                        <PieChart>
                                            <Pie data={orderStatusPie} dataKey="value" nameKey="name"
                                                cx="50%" cy="50%" innerRadius={54} outerRadius={82}
                                                paddingAngle={4} strokeWidth={2} stroke="var(--admin-surface, #ffffff)">
                                                {orderStatusPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                            </Pie>
                                            <Tooltip content={<DashTooltip />} />
                                            <Legend iconType="circle" iconSize={8}
                                                formatter={v => <span className="small text-muted">{v}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Charts Row 2: Payment Modes & Brand Distribution ── */}
                <div className="row g-4 mb-4">
                    <div className="col-12 col-xl-6">
                        <div className="panel h-100">
                            <div className="panel-header mb-3">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-credit-card-2-front text-info" aria-hidden="true"></i>
                                        <span>Payment Methods Distribution</span>
                                    </h2>
                                    <p className="text-muted small mb-0">Checkout volumes categorized by payment channel</p>
                                </div>
                            </div>
                            {(() => {
                                const modeMap = {};
                                D.checkouts.forEach(c => { const m = c.paymentMode || "COD"; modeMap[m] = (modeMap[m] || 0) + 1; });
                                const modeData = Object.entries(modeMap).map(([name, count]) => ({ name, count }));
                                return modeData.length === 0
                                    ? <p className="text-muted text-center py-4">No payment data recorded yet.</p>
                                    : <div style={{ height: 210 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={modeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={38}>
                                                <CartesianGrid {...gridStyle} />
                                                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                                                <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                                                <Tooltip content={<DashTooltip />} />
                                                <Bar dataKey="count" name="Orders" fill="#6366f1" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>;
                            })()}
                        </div>
                    </div>

                    <div className="col-12 col-xl-6">
                        <div className="panel h-100">
                            <div className="panel-header mb-3">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-tag text-warning" aria-hidden="true"></i>
                                        <span>Top Brands in Catalog</span>
                                    </h2>
                                    <p className="text-muted small mb-0">Product distribution by manufacturer brand</p>
                                </div>
                                <Link to="/brand" className="btn btn-light btn-sm py-1 px-2.5">Manage Brands</Link>
                            </div>
                            {productsPerBrand.length === 0
                                ? <p className="text-muted text-center py-4">No products catalogued yet.</p>
                                : <div style={{ height: 210 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={productsPerBrand} margin={{ top: 10, right: 10, left: 0, bottom: 25 }} barSize={34}>
                                            <CartesianGrid {...gridStyle} />
                                            <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false}
                                                angle={-20} textAnchor="end" interval={0} />
                                            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <Tooltip content={<DashTooltip />} />
                                            <Bar dataKey="count" name="Products" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                {/* ── Recent Orders Table (Rich Dashboard Card) ── */}
                <div className="row g-4 mb-4">
                    <div className="col-12">
                        <div className="panel">
                            <div className="panel-header mb-3">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-receipt-cutoff text-primary" aria-hidden="true"></i>
                                        <span>Recent Orders</span>
                                    </h2>
                                    <p className="text-muted small mb-0">Real-time checkout records received across all shops</p>
                                </div>
                                <Link to="/checkout" className="btn btn-primary btn-sm">
                                    <span>View All Orders</span>
                                    <i className="bi bi-arrow-right ms-1"></i>
                                </Link>
                            </div>
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Customer</th>
                                            <th>Payment Method</th>
                                            <th>Subtotal</th>
                                            <th>Shipping</th>
                                            <th>Order Total</th>
                                            <th>Status</th>
                                            <th>Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="text-center text-muted py-4">No order records recorded.</td>
                                            </tr>
                                        ) : (
                                            recentOrders.map((o, i) => {
                                                const s = orderBadge(o.orderStatus);
                                                const custName = o.user?.name || o.user?.username || "Guest Customer";
                                                const initial = custName.charAt(0).toUpperCase();
                                                return (
                                                    <tr key={i}>
                                                        <td className="text-muted small">#{i + 1}</td>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-2.5">
                                                                <div className="rounded-circle bg-primary-subtle text-primary fw-bold d-inline-grid place-items-center"
                                                                     style={{ width: 34, height: 34, fontSize: 13 }}>
                                                                    {initial}
                                                                </div>
                                                                <span className="fw-semibold text-body">{custName}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="username-badge">{o.paymentMode || "COD"}</span>
                                                        </td>
                                                        <td className="text-muted">{fmt(o.subtotal || 0)}</td>
                                                        <td className="text-muted">{o.shipping ? fmt(o.shipping) : "Free"}</td>
                                                        <td className="fw-bold text-body">{fmt(o.total || 0)}</td>
                                                        <td><span className={s.cls}>{s.label}</span></td>
                                                        <td><span className={payBadge(o.paymentStatus)}>{o.paymentStatus || "Pending"}</span></td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Bottom Row: Quick Actions + Recent Queries + Low Stock Alert ── */}
                <div className="row g-4">
                    {/* Quick Actions */}
                    <div className="col-12 col-xl-4">
                        <div className="panel h-100">
                            <div className="panel-header mb-3">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-lightning-charge-fill text-warning" aria-hidden="true"></i>
                                        <span>Quick Operations</span>
                                    </h2>
                                    <p className="text-muted small mb-0">Shortcuts to frequent tasks</p>
                                </div>
                            </div>
                            <div className="row g-2.5">
                                {quickActions.map((q, i) => (
                                    <div key={i} className="col-6">
                                        <Link to={q.to} className="d-flex align-items-center gap-2 p-2.5 rounded-3 text-decoration-none border shadow-xs"
                                            style={{
                                                background: "var(--admin-surface)",
                                                borderLeft: `3.5px solid ${q.color}`,
                                                fontSize: "0.86rem",
                                                fontWeight: 700,
                                                color: "var(--admin-text)",
                                                transition: "all .16s ease",
                                            }}>
                                            <i className={`bi ${q.icon}`} style={{ color: q.color, fontSize: 16 }}></i>
                                            <span className="text-truncate">{q.label}</span>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="col-12 col-xl-4">
                        <div className="panel h-100">
                            <div className="panel-header mb-3">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-exclamation-triangle-fill text-danger" aria-hidden="true"></i>
                                        <span>Low Stock Alerts</span>
                                    </h2>
                                    <p className="text-muted small mb-0">Items with ≤ 10 units left</p>
                                </div>
                                <Link to="/product" className="btn btn-light btn-sm py-1 px-2.5">View all</Link>
                            </div>
                            {lowStockProducts.length === 0 ? (
                                <div className="text-center py-4 text-muted small">
                                    <i className="bi bi-check-circle text-success fs-3 d-block mb-1"></i>
                                    All products are well stocked!
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {lowStockProducts.map((p, i) => (
                                        <div key={i} className="d-flex align-items-center justify-content-between p-2.5 rounded-3 border bg-light-subtle">
                                            <div className="min-w-0 me-2">
                                                <div className="fw-semibold text-truncate text-body small">{p.name}</div>
                                                <div className="text-muted" style={{ fontSize: "0.74rem" }}>
                                                    {p.brand?.name || "Brand"} • {p.maincategory?.name || "Category"}
                                                </div>
                                            </div>
                                            <span className="badge bg-danger-subtle text-danger flex-shrink-0">
                                                {p.stockQuantity} remaining
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Contact Messages */}
                    <div className="col-12 col-xl-4">
                        <div className="panel h-100">
                            <div className="panel-header mb-3">
                                <div>
                                    <h2 className="h5 mb-1 section-title">
                                        <i className="bi bi-chat-dots-fill text-primary" aria-hidden="true"></i>
                                        <span>Customer Queries</span>
                                    </h2>
                                    <p className="text-muted small mb-0">Latest messages submitted</p>
                                </div>
                                <Link to="/contactUs" className="btn btn-light btn-sm py-1 px-2.5">View all</Link>
                            </div>
                            {D.contacts.length === 0 ? (
                                <div className="text-center py-4 text-muted small">No customer queries recorded.</div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {D.contacts.slice(0, 4).map((c, i) => (
                                        <div key={i} className="d-flex align-items-center justify-content-between p-2.5 rounded-3 border bg-light-subtle">
                                            <div className="min-w-0 me-2">
                                                <div className="fw-semibold text-truncate text-body small">{c.name || "Customer"}</div>
                                                <div className="text-muted text-truncate" style={{ fontSize: "0.74rem" }}>{c.email || "No email"}</div>
                                            </div>
                                            <span className={`badge ${c.active ? "bg-warning-subtle text-warning" : "bg-success-subtle text-success"} flex-shrink-0`}>
                                                {c.active ? "Unread" : "Resolved"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}