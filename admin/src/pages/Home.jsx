import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, Legend,
    AreaChart, Area,
} from "recharts";

import { getMaincategory } from "../Redux/ActionCreators/MaincategoryActionCreators";
import { getSubcategory }  from "../Redux/ActionCreators/SubcategoryActionCreators";
import { getProduct }      from "../Redux/ActionCreators/ProductActionCreators";
import { getBrand }        from "../Redux/ActionCreators/BrandActionCreators";
import { getTestimonial }  from "../Redux/ActionCreators/TestimonialActionCreators";
import { getNewsletter }   from "../Redux/ActionCreators/NewsletterActionCreators";
import { getContactUs }    from "../Redux/ActionCreators/ContactUsActionCreators";
import { getCheckout }     from "../Redux/ActionCreators/CheckoutActionCreators";

// ─────────────────────────────────────────────────────────────────────────────
//  SAMPLE / FALLBACK DATA
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLE = {
    checkouts: [
        { _id:"c1", user:{ name:"Rahul Sharma" },  paymentMode:"UPI",  subtotal:480, shipping:40,  total:520,  orderStatus:"Delivered",       paymentStatus:"Done",    createdAt:"2025-04-01" },
        { _id:"c2", user:{ name:"Priya Mehta" },   paymentMode:"COD",  subtotal:310, shipping:30,  total:340,  orderStatus:"Processing",      paymentStatus:"Pending", createdAt:"2025-04-10" },
        { _id:"c3", user:{ name:"Aakash Singh" },  paymentMode:"Card", subtotal:750, shipping:50,  total:800,  orderStatus:"Out for Delivery",paymentStatus:"Done",    createdAt:"2025-04-18" },
        { _id:"c4", user:{ name:"Sneha Patel" },   paymentMode:"UPI",  subtotal:200, shipping:20,  total:220,  orderStatus:"Order is Placed", paymentStatus:"Pending", createdAt:"2025-05-01" },
        { _id:"c5", user:{ name:"Vikram Nair" },   paymentMode:"COD",  subtotal:640, shipping:40,  total:680,  orderStatus:"Cancelled",       paymentStatus:"Pending", createdAt:"2025-05-02" },
        { _id:"c6", user:{ name:"Anjali Rao" },    paymentMode:"UPI",  subtotal:920, shipping:60,  total:980,  orderStatus:"Delivered",       paymentStatus:"Done",    createdAt:"2025-03-15" },
        { _id:"c7", user:{ name:"Deepak Kumar" },  paymentMode:"Card", subtotal:550, shipping:50,  total:600,  orderStatus:"Delivered",       paymentStatus:"Done",    createdAt:"2025-02-20" },
    ],
    products: [
        { name:"Cotton T-Shirt",   brand:{ name:"Nike" },   maincategory:{ name:"Clothing" },   stock:true,  stockQuantity:45, basePrice:999,  discount:10, finalPrice:899  },
        { name:"Running Shoes",    brand:{ name:"Adidas" }, maincategory:{ name:"Footwear" },   stock:true,  stockQuantity:30, basePrice:3499, discount:15, finalPrice:2974 },
        { name:"Denim Jeans",      brand:{ name:"Levi's" }, maincategory:{ name:"Clothing" },   stock:false, stockQuantity:0,  basePrice:1999, discount:20, finalPrice:1599 },
        { name:"Leather Wallet",   brand:{ name:"Nike" },   maincategory:{ name:"Accessories"}, stock:true,  stockQuantity:80, basePrice:599,  discount:5,  finalPrice:569  },
        { name:"Sports Cap",       brand:{ name:"Adidas" }, maincategory:{ name:"Accessories"}, stock:true,  stockQuantity:60, basePrice:499,  discount:0,  finalPrice:499  },
        { name:"Hoodie",           brand:{ name:"Nike" },   maincategory:{ name:"Clothing" },   stock:true,  stockQuantity:25, basePrice:2499, discount:10, finalPrice:2249 },
        { name:"Formal Shoes",     brand:{ name:"Levi's" }, maincategory:{ name:"Footwear" },   stock:false, stockQuantity:0,  basePrice:2999, discount:5,  finalPrice:2849 },
        { name:"Sunglasses",       brand:{ name:"Ray-Ban" },maincategory:{ name:"Accessories"}, stock:true,  stockQuantity:15, basePrice:1499, discount:0,  finalPrice:1499 },
    ],
    maincategories: [
        { name:"Clothing",    active:true  },
        { name:"Footwear",    active:true  },
        { name:"Accessories", active:true  },
        { name:"Electronics", active:false },
    ],
    subcategories: [
        { name:"Men's Wear",  active:true  },
        { name:"Women's Wear",active:true  },
        { name:"Kids Wear",   active:true  },
        { name:"Sports",      active:true  },
        { name:"Casual",      active:false },
    ],
    brands: [
        { name:"Nike",    active:true  },
        { name:"Adidas",  active:true  },
        { name:"Levi's",  active:true  },
        { name:"Ray-Ban", active:true  },
        { name:"Puma",    active:false },
    ],
    newsletters:  Array.from({ length:15 }, (_,i) => ({ _id:`nl${i}`, active: i < 12 })),
    testimonials: Array.from({ length:6  }, (_,i) => ({ _id:`t${i}` })),
    contacts: [
        { active:true },{ active:true },{ active:false },{ active:true },{ active:false },
    ],
};

// ─────────────────────────────────────────────────────────────────────────────
//  Custom Tooltip
// ─────────────────────────────────────────────────────────────────────────────
const DashTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background:"#161D2F", border:"1px solid rgba(79,142,247,0.25)",
            borderRadius:"10px", padding:"10px 14px", fontSize:"12.5px", lineHeight:1.8
        }}>
            {label && <p style={{ color:"#8896B3", marginBottom:"4px", fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</p>}
            {payload.map((p,i) => (
                <p key={i} style={{ color: p.color || p.fill || "#EEF2FF", margin:0 }}>
                    {p.name}: <strong style={{ color:"#EEF2FF" }}>
                        {p.name?.toLowerCase().includes("revenue") || p.name?.toLowerCase().includes("total")
                            ? "₹"+Number(p.value).toLocaleString("en-IN") : p.value}
                    </strong>
                </p>
            ))}
        </div>
    );
};

function unwrap(slice) {
    if (!slice) return [];
    if (Array.isArray(slice)) return slice;
    if (Array.isArray(slice.data)) return slice.data;
    return [];
}

// ─────────────────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
    const dispatch = useDispatch();
    const [loaded,      setLoaded]      = useState(false);
    const [usingSample, setUsingSample] = useState(false);

    const raw = {
        maincategories: useSelector(s => s.MaincategoryStateData),
        subcategories:  useSelector(s => s.SubcategoryStateData),
        brands:         useSelector(s => s.BrandStateData),
        products:       useSelector(s => s.ProductStateData),
        testimonials:   useSelector(s => s.TestimonialStateData),
        newsletters:    useSelector(s => s.NewsletterStateData),
        contacts:       useSelector(s => s.ContactUsStateData),
        checkouts:      useSelector(s => s.CheckoutStateData),
    };

    useEffect(() => {
        dispatch(getMaincategory());
        dispatch(getSubcategory());
        dispatch(getProduct());
        dispatch(getBrand());
        dispatch(getTestimonial());
        dispatch(getNewsletter());
        dispatch(getContactUs());
        dispatch(getCheckout());
        setTimeout(() => setLoaded(true), 400);
    }, []);

    const live = {
        maincategories: unwrap(raw.maincategories),
        subcategories:  unwrap(raw.subcategories),
        brands:         unwrap(raw.brands),
        products:       unwrap(raw.products),
        testimonials:   unwrap(raw.testimonials),
        newsletters:    unwrap(raw.newsletters),
        contacts:       unwrap(raw.contacts),
        checkouts:      unwrap(raw.checkouts),
    };

    const allEmpty = loaded && Object.values(live).every(a => a.length === 0);
    useEffect(() => { if (loaded) setUsingSample(allEmpty); }, [allEmpty, loaded]);

    const D = allEmpty ? SAMPLE : live;

    // ── Derived numbers ───────────────────────────────────────────────────────
    const pendingOrders     = D.checkouts.filter(c => c.orderStatus === "Order is Placed").length;
    const pendingPayments   = D.checkouts.filter(c => c.paymentStatus === "Pending").length;
    const pendingContacts   = D.contacts.filter(c => c.active === true).length;
    const activeSubscribers = D.newsletters.filter(n => n.active !== false).length;

    const totalRevenue = D.checkouts
        .filter(c => c.paymentStatus === "Done")
        .reduce((s,c) => s + (c.total||0), 0);
    const totalRevenuePending = D.checkouts
        .filter(c => c.paymentStatus === "Pending")
        .reduce((s,c) => s + (c.total||0), 0);

    const inStock    = D.products.filter(p => p.stock === true).length;
    const outOfStock = D.products.filter(p => p.stock === false).length;

    const recentOrders = [...D.checkouts]
        .sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);

    const lowStockProducts = D.products
        .filter(p => p.stock === true && (p.stockQuantity||0) <= 10)
        .sort((a,b) => (a.stockQuantity||0)-(b.stockQuantity||0)).slice(0,5);

    // ── Chart data ────────────────────────────────────────────────────────────
    const orderStatusPie = [
        { name:"Placed",          value: D.checkouts.filter(c => c.orderStatus==="Order is Placed").length,  color:"#F7C35F" },
        { name:"Processing",      value: D.checkouts.filter(c => c.orderStatus==="Processing").length,       color:"#4F8EF7" },
        { name:"Out for Delivery",value: D.checkouts.filter(c => c.orderStatus==="Out for Delivery").length, color:"#38EFC3" },
        { name:"Delivered",       value: D.checkouts.filter(c => c.orderStatus==="Delivered").length,        color:"#38EF91" },
        { name:"Cancelled",       value: D.checkouts.filter(c => c.orderStatus==="Cancelled").length,        color:"#F75F5F" },
    ].filter(d => d.value > 0);

    const monthlyMap = {};
    D.checkouts.filter(c => c.paymentStatus==="Done" && c.createdAt).forEach(c => {
        const key = new Date(c.createdAt).toLocaleString("en-IN",{ month:"short", year:"2-digit" });
        monthlyMap[key] = (monthlyMap[key]||0) + (c.total||0);
    });
    const monthlyRevenue = Object.entries(monthlyMap).slice(-7).map(([month,revenue])=>({ month, revenue }));

    const paymentModeMap = {};
    D.checkouts.forEach(c => { const m=c.paymentMode||"COD"; paymentModeMap[m]=(paymentModeMap[m]||0)+1; });
    const paymentModeData = Object.entries(paymentModeMap).map(([name,count])=>({ name, count }));

    const brandMap = {};
    D.products.forEach(p => { const n=p.brand?.name||"Unknown"; brandMap[n]=(brandMap[n]||0)+1; });
    const productsPerBrand = Object.entries(brandMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,count])=>({ name, count }));

    const catMap = {};
    D.products.forEach(p => { const n=p.maincategory?.name||"Unknown"; catMap[n]=(catMap[n]||0)+1; });
    const productsPerCategory = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([name,count])=>({ name, count }));

    const stockData    = [{ name:"In Stock", count:inStock, fill:"#38EF91" },{ name:"Out of Stock", count:outOfStock, fill:"#F75F5F" }];
    const revenueSplit = [{ name:"Collected", revenue:totalRevenue, fill:"#4F8EF7" },{ name:"Pending", revenue:totalRevenuePending, fill:"#F7C35F" }];

    // ── Helpers ───────────────────────────────────────────────────────────────
    const fmt  = n => "₹" + Number(n).toLocaleString("en-IN");
    const axis = { fontSize:11, fill:"#8896B3" };
    const grid = { stroke:"rgba(255,255,255,0.05)" };

    const orderBadge = s => ({
        "Order is Placed":  { cls:"hm-badge hm-badge--warn",    label:"Placed"     },
        "Processing":       { cls:"hm-badge hm-badge--info",    label:"Processing" },
        "Out for Delivery": { cls:"hm-badge hm-badge--teal",    label:"Dispatched" },
        "Delivered":        { cls:"hm-badge hm-badge--success", label:"Delivered"  },
        "Cancelled":        { cls:"hm-badge hm-badge--danger",  label:"Cancelled"  },
    }[s] || { cls:"hm-badge", label: s||"—" });

    const payBadge = s => ({
        "Done":    "hm-badge hm-badge--success",
        "Pending": "hm-badge hm-badge--warn",
        "Failed":  "hm-badge hm-badge--danger",
    }[s] || "hm-badge");

    const statCards = [
        { label:"Main Categories", value:D.maincategories.length, icon:"fa-layer-group", accent:"#38EFC3", link:"/maincategory" },
        { label:"Subcategories",   value:D.subcategories.length,  icon:"fa-list",        accent:"#A78BFA", link:"/subcategory"  },
        { label:"Brands",          value:D.brands.length,         icon:"fa-tag",         accent:"#F97316", link:"/brand"        },
        { label:"Products",        value:D.products.length,       icon:"fa-box-open",    accent:"#F7C35F", link:"/product"      },
        { label:"Orders",          value:D.checkouts.length,      icon:"fa-receipt",     accent:"#4F8EF7", link:"/checkout"     },
        { label:"Subscribers",     value:activeSubscribers,       icon:"fa-envelope",    accent:"#14B8A6", link:"/newsletter"   },
    ];

    const alertCards = [
        { label:"New Orders",       value:pendingOrders,   icon:"fa-clock",       color:"#F7C35F" },
        { label:"Pending Payments", value:pendingPayments, icon:"fa-credit-card", color:"#F75F5F" },
        { label:"New Messages",     value:pendingContacts, icon:"fa-envelope",    color:"#4F8EF7" },
        { label:"Out of Stock",     value:outOfStock,      icon:"fa-box",         color:"#F97316" },
    ];

    return (
        <>
        <style>{`
            .hm-root { padding:28px 24px 80px; max-width:1280px; margin:0 auto; width:100%; opacity:0; transform:translateY(14px); transition:opacity .45s ease,transform .45s ease; }
            .hm-root.hm-loaded { opacity:1; transform:none; }
            .hm-sample-banner { display:flex; align-items:center; gap:10px; background:rgba(247,195,95,0.1); border:1px solid rgba(247,195,95,0.3); border-radius:10px; padding:10px 16px; font-size:13px; color:#F7C35F; margin-bottom:20px; animation:hmFadeUp .4s ease; }
            @keyframes hmFadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
            .hm-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:22px; }
            .hm-title { font-family:'Syne',sans-serif; font-size:24px; bordor-radius:10px font-weight:800; color:var(--text-primary); letter-spacing:-.02em; margin:0; }
            .hm-subtitle { font-size:13px; color:var(--text-secondary); margin:3px 0 0; }
            .hm-date { font-size:12.5px; color:var(--text-muted); background:var(--bg-card); border:1px solid var(--border); border-radius:8px; padding:7px 14px; display:flex; align-items:center; gap:7px; }
            .hm-rev-banner { background:linear-gradient(135deg,#0d1d46 0%,#0a1530 60%,#061020 100%); border:1px solid var(--border-accent); border-radius:16px; padding:22px 28px; margin-bottom:20px; position:relative; overflow:hidden; }
            .hm-rev-banner::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 10% 50%,rgba(79,142,247,.1) 0%,transparent 60%),radial-gradient(ellipse at 90% 50%,rgba(56,239,195,.07) 0%,transparent 60%); }
            .hm-rev-inner { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; position:relative; }
            .hm-rev-label { font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:var(--text-secondary); margin-bottom:6px; font-weight:700; }
            .hm-rev-value { font-family:'Syne',sans-serif; font-size:34px; font-weight:800; color:var(--text-primary); letter-spacing:-.02em; }
            .hm-rev-icon { width:54px; height:54px; background:linear-gradient(135deg,var(--accent),#3a7de0); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; color:#fff; box-shadow:0 8px 24px rgba(79,142,247,.4); }
            .hm-rev-sub { display:flex; align-items:center; flex-wrap:wrap; gap:20px; margin-top:14px; padding-top:14px; border-top:1px solid rgba(255,255,255,.06); position:relative; }
            .hm-rev-sub span { font-size:12.5px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; }
            .hm-rev-sub span i { color:var(--accent); }
            .hm-stat-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:14px; margin-bottom:14px; }
            .hm-stat-card { background:var(--bg-surface); border:1px solid var(--border); border-radius:14px; padding:16px 18px; display:flex; align-items:center; gap:14px; text-decoration:none; transition:var(--transition); animation:hmFadeUp .4s ease both; position:relative; overflow:hidden; }
            .hm-stat-card::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:var(--card-accent,var(--accent)); transform:scaleX(0); transform-origin:left; transition:transform .3s ease; }
            .hm-stat-card:hover { background:var(--bg-hover); transform:translateY(-2px); }
            .hm-stat-card:hover::after { transform:scaleX(1); }
            .hm-stat-icon { width:42px; height:42px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
            .hm-stat-value { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; color:var(--text-primary); display:block; line-height:1; }
            .hm-stat-label { font-size:11.5px; color:var(--text-secondary); display:block; margin-top:3px; font-weight:600; }
            .hm-stat-arrow { margin-left:auto; color:var(--text-muted); font-size:12px; }
            .hm-alert-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
            .hm-alert-card { background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; padding:14px 16px; display:flex; align-items:center; gap:12px; animation:hmFadeUp .4s ease both; }
            .hm-alert-val { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; line-height:1; }
            .hm-alert-lbl { font-size:12px; color:var(--text-secondary); font-weight:600; }
            .hm-card { background:var(--bg-surface); border:1px solid var(--border); border-radius:14px; padding:20px; animation:hmFadeUp .45s ease both; }
            .hm-card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
            .hm-card-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:var(--text-primary); margin:0; display:flex; align-items:center; gap:8px; }
            .hm-card-title i { color:var(--accent); font-size:13px; }
            .hm-card-link { font-size:12px; color:var(--accent); text-decoration:none; font-weight:600; transition:color .2s; }
            .hm-card-link:hover { color:var(--accent-2); }
            .hm-empty { font-size:13px; color:var(--text-muted); text-align:center; padding:28px 0; font-style:italic; }
            .hm-chart-note { font-size:11px; color:var(--text-muted); background:var(--bg-card); border:1px solid var(--border); border-radius:6px; padding:3px 9px; }
            .hm-row-wide   { display:grid; grid-template-columns:1.6fr 1fr; gap:16px; margin-bottom:16px; }
            .hm-row-three  { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:16px; }
            .hm-row-mid    { display:grid; grid-template-columns:1fr; gap:16px; margin-bottom:16px; }
            .hm-row-bottom { display:grid; grid-template-columns:1.4fr 1fr; gap:16px; margin-bottom:16px; }
            .hm-table-wrap { overflow-x:auto; margin:0 -4px; padding:0 4px; }
            .hm-table { width:100%; border-collapse:collapse; font-size:13px; color:var(--text-secondary); }
            .hm-table thead tr th { background:var(--bg-card); color:var(--text-muted); font-size:10.5px; text-transform:uppercase; letter-spacing:.07em; font-weight:700; padding:10px 14px; border-bottom:1px solid var(--border); white-space:nowrap; }
            .hm-table tbody tr { border-bottom:1px solid var(--border); transition:background .15s; }
            .hm-table tbody tr:last-child { border-bottom:none; }
            .hm-table tbody tr:hover { background:var(--bg-hover); }
            .hm-table tbody td { padding:11px 14px; vertical-align:middle; color:var(--text-secondary); white-space:nowrap; }
            .hm-table tbody tr:hover td { color:var(--text-primary); }
            .hm-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; background:var(--bg-card); color:var(--text-muted); border:1px solid var(--border); }
            .hm-badge--success { background:rgba(56,239,145,.12); color:#38EF91; border-color:rgba(56,239,145,.25); }
            .hm-badge--warn    { background:rgba(247,195,95,.12);  color:#F7C35F; border-color:rgba(247,195,95,.25); }
            .hm-badge--info    { background:rgba(79,142,247,.12);  color:#4F8EF7; border-color:rgba(79,142,247,.25); }
            .hm-badge--teal    { background:rgba(56,239,195,.12);  color:#38EFC3; border-color:rgba(56,239,195,.25); }
            .hm-badge--danger  { background:rgba(247,95,95,.12);   color:#F75F5F; border-color:rgba(247,95,95,.25);  }
            .hm-quick-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px; }
            .hm-quick-btn { display:flex; align-items:center; gap:10px; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; padding:10px 12px; color:var(--text-secondary); font-size:12.5px; font-weight:600; text-decoration:none; transition:var(--transition); border-left:3px solid var(--q-color,var(--accent)); }
            .hm-quick-btn:hover { background:var(--bg-hover); color:var(--text-primary); transform:translateX(2px); }
            .hm-quick-btn i { font-size:13px; width:16px; text-align:center; }
            .hm-low-stock-row { display:flex; align-items:center; justify-content:space-between; padding:9px 0; border-bottom:1px solid var(--border); font-size:13px; }
            .hm-low-stock-row:last-child { border-bottom:none; }
            .hm-stock-qty { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; padding:2px 10px; border-radius:20px; background:rgba(249,115,22,.12); color:#F97316; border:1px solid rgba(249,115,22,.25); }
            @media (max-width:1100px) { .hm-stat-grid { grid-template-columns:repeat(3,1fr); } }
            @media (max-width:900px)  { .hm-stat-grid{grid-template-columns:repeat(2,1fr)} .hm-alert-grid{grid-template-columns:repeat(2,1fr)} .hm-row-wide{grid-template-columns:1fr} .hm-row-three{grid-template-columns:1fr 1fr} .hm-row-bottom{grid-template-columns:1fr} }
            @media (max-width:600px)  { .hm-stat-grid{grid-template-columns:repeat(2,1fr)} .hm-alert-grid{grid-template-columns:repeat(2,1fr)} .hm-row-three{grid-template-columns:1fr} .hm-rev-value{font-size:26px} }
        `}</style>

        <div className={`hm-root ${loaded ? "hm-loaded" : ""}`}>

            {usingSample && (
                <div className="hm-sample-banner">
                    <i className="fas fa-flask"></i>
                    <strong>Preview mode —</strong> showing sample data because the API returned no records. Connect your backend to see live data.
                </div>
            )}

            <div className="hm-header">
                <div>
                    <h1 className="hm-title text-light bg-primary p-2 ps-3" style={{borderRadius:"10px"}}>Dashboard</h1>
                    <p className="hm-subtitle">Welcome back, Admin — here's what's happening today.</p>
                </div>
                <span className="hm-date">
                    <i className="fas fa-calendar-alt"></i>
                    {new Date().toLocaleDateString("en-IN",{ weekday:"long", year:"numeric", month:"long", day:"numeric" })}
                </span>
            </div>

            <div className="hm-rev-banner">
                <div className="hm-rev-inner">
                    <div>
                        <p className="hm-rev-label">Total Revenue Collected</p>
                        <p className="hm-rev-value">{fmt(totalRevenue)}</p>
                    </div>
                    <div className="hm-rev-icon"><i className="fas fa-rupee-sign"></i></div>
                </div>
                <div className="hm-rev-sub">
                    <span><i className="fas fa-check-circle"></i> Collected: <strong>{fmt(totalRevenue)}</strong></span>
                    <span><i className="fas fa-clock"></i> Pending: <strong>{fmt(totalRevenuePending)}</strong></span>
                    <span><i className="fas fa-exclamation-circle"></i> {pendingPayments} payments pending</span>
                    <span><i className="fas fa-box"></i> {outOfStock} products out of stock</span>
                </div>
            </div>

            <div className="hm-stat-grid">
                {statCards.map((c,i) => (
                    <Link to={c.link} key={i} className="hm-stat-card"
                        style={{ "--card-accent":c.accent, animationDelay:`${i*.05}s` }}>
                        <div className="hm-stat-icon" style={{ background:c.accent+"22", color:c.accent }}>
                            <i className={`fas ${c.icon}`}></i>
                        </div>
                        <div>
                            <span className="hm-stat-value">{c.value}</span>
                            <span className="hm-stat-label">{c.label}</span>
                        </div>
                        <div className="hm-stat-arrow"><i className="fas fa-arrow-right"></i></div>
                    </Link>
                ))}
            </div>

            <div className="hm-alert-grid">
                {alertCards.map((c,i) => (
                    <div key={i} className="hm-alert-card" style={{ animationDelay:`${.4+i*.07}s` }}>
                        <i className={`fas ${c.icon}`} style={{ color:c.color, fontSize:18 }}></i>
                        <div>
                            <div className="hm-alert-val" style={{ color:c.color }}>{c.value}</div>
                            <div className="hm-alert-lbl">{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hm-row-wide">
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-chart-area"></i> Monthly Revenue Trend</h2>
                        <span className="hm-chart-note">Completed orders only</span>
                    </div>
                    {monthlyRevenue.length === 0 ? <p className="hm-empty">No revenue data yet.</p>
                        : <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={monthlyRevenue} margin={{ top:10, right:10, left:0, bottom:0 }}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#4F8EF7" stopOpacity={0.35}/>
                                        <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0.02}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" {...grid}/>
                                <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false}/>
                                <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={v=>"₹"+(v>=1000?(v/1000).toFixed(0)+"k":v)}/>
                                <Tooltip content={<DashTooltip/>}/>
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4F8EF7" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill:"#4F8EF7", r:4, strokeWidth:0 }} activeDot={{ r:6, fill:"#7FB3FF" }}/>
                            </AreaChart>
                        </ResponsiveContainer>
                    }
                </div>
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-chart-pie"></i> Order Status</h2>
                        <Link to="/checkout" className="hm-card-link">View all</Link>
                    </div>
                    {orderStatusPie.length === 0 ? <p className="hm-empty">No orders yet.</p>
                        : <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={orderStatusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} strokeWidth={0}>
                                    {orderStatusPie.map((e,i) => <Cell key={i} fill={e.color}/>)}
                                </Pie>
                                <Tooltip content={<DashTooltip/>}/>
                                <Legend iconType="circle" iconSize={8} formatter={v=><span style={{ fontSize:11, color:"#8896B3" }}>{v}</span>}/>
                            </PieChart>
                        </ResponsiveContainer>
                    }
                </div>
            </div>

            <div className="hm-row-three">
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-chart-bar"></i> Revenue Split</h2>
                        <span className="hm-chart-note">Collected vs Pending</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={revenueSplit} margin={{ top:10, right:10, left:0, bottom:0 }} barSize={44}>
                            <CartesianGrid strokeDasharray="3 3" {...grid}/>
                            <XAxis dataKey="name" tick={{ ...axis, fontSize:10 }} axisLine={false} tickLine={false}/>
                            <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={v=>"₹"+(v>=1000?(v/1000).toFixed(0)+"k":v)}/>
                            <Tooltip content={<DashTooltip/>}/>
                            <Bar dataKey="revenue" name="Revenue" radius={[6,6,0,0]}>
                                {revenueSplit.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-credit-card"></i> Payment Modes</h2>
                    </div>
                    {paymentModeData.length === 0 ? <p className="hm-empty">No data yet.</p>
                        : <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={paymentModeData} margin={{ top:10, right:10, left:0, bottom:0 }} barSize={36}>
                                <CartesianGrid strokeDasharray="3 3" {...grid}/>
                                <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false}/>
                                <YAxis tick={axis} axisLine={false} tickLine={false} allowDecimals={false}/>
                                <Tooltip content={<DashTooltip/>}/>
                                <Bar dataKey="count" name="Orders" fill="#A78BFA" radius={[6,6,0,0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    }
                </div>
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-boxes"></i> Stock Status</h2>
                        <Link to="/product" className="hm-card-link">View all</Link>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={stockData} margin={{ top:10, right:10, left:0, bottom:0 }} barSize={44}>
                            <CartesianGrid strokeDasharray="3 3" {...grid}/>
                            <XAxis dataKey="name" tick={{ ...axis, fontSize:10 }} axisLine={false} tickLine={false}/>
                            <YAxis tick={axis} axisLine={false} tickLine={false} allowDecimals={false}/>
                            <Tooltip content={<DashTooltip/>}/>
                            <Bar dataKey="count" name="Products" radius={[6,6,0,0]}>
                                {stockData.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="hm-row-wide">
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-tag"></i> Products per Brand</h2>
                        <Link to="/brand" className="hm-card-link">View all</Link>
                    </div>
                    {productsPerBrand.length === 0 ? <p className="hm-empty">No product data yet.</p>
                        : <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={productsPerBrand} margin={{ top:10, right:10, left:0, bottom:40 }} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" {...grid}/>
                                <XAxis dataKey="name" tick={{ ...axis, fontSize:10 }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" interval={0}/>
                                <YAxis tick={axis} axisLine={false} tickLine={false} allowDecimals={false}/>
                                <Tooltip content={<DashTooltip/>}/>
                                <Bar dataKey="count" name="Products" fill="#F97316" radius={[6,6,0,0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    }
                </div>
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-layer-group"></i> Products per Category</h2>
                        <Link to="/maincategory" className="hm-card-link">View all</Link>
                    </div>
                    {productsPerCategory.length === 0 ? <p className="hm-empty">No product data yet.</p>
                        : <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={productsPerCategory} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} strokeWidth={0}>
                                    {productsPerCategory.map((_,i) => <Cell key={i} fill={["#4F8EF7","#38EFC3","#A78BFA","#F7C35F","#F97316","#EC4899"][i%6]}/>)}
                                </Pie>
                                <Tooltip content={<DashTooltip/>}/>
                                <Legend iconType="circle" iconSize={8} formatter={v=><span style={{ fontSize:11, color:"#8896B3" }}>{v}</span>}/>
                            </PieChart>
                        </ResponsiveContainer>
                    }
                </div>
            </div>

            <div className="hm-row-mid">
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-receipt"></i> Recent Orders</h2>
                        <Link to="/checkout" className="hm-card-link">View all</Link>
                    </div>
                    {recentOrders.length === 0 ? <p className="hm-empty">No orders yet.</p>
                        : <div className="hm-table-wrap">
                            <table className="hm-table">
                                <thead><tr>
                                    <th>#</th><th>Customer</th><th>Pay Mode</th>
                                    <th>Subtotal</th><th>Shipping</th><th>Total</th>
                                    <th>Order Status</th><th>Payment</th>
                                </tr></thead>
                                <tbody>
                                    {recentOrders.map((c,i) => {
                                        const s = orderBadge(c.orderStatus);
                                        return (
                                            <tr key={i}>
                                                <td style={{ color:"var(--text-muted)", fontSize:11 }}>#{i+1}</td>
                                                <td style={{ color:"var(--text-primary)", fontWeight:600 }}>{c.user?.name || c.user?.username || "—"}</td>
                                                <td>{c.paymentMode || "COD"}</td>
                                                <td>{fmt(c.subtotal||0)}</td>
                                                <td>{fmt(c.shipping||0)}</td>
                                                <td style={{ color:"var(--text-primary)", fontWeight:700 }}>{fmt(c.total||0)}</td>
                                                <td><span className={s.cls}>{s.label}</span></td>
                                                <td><span className={payBadge(c.paymentStatus)}>{c.paymentStatus||"Pending"}</span></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    }
                </div>
            </div>

            <div className="hm-row-bottom">
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-exclamation-triangle"></i> Low Stock Alert</h2>
                        <Link to="/product" className="hm-card-link">View all products</Link>
                    </div>
                    {lowStockProducts.length === 0
                        ? <p className="hm-empty">All products are well stocked 🎉</p>
                        : lowStockProducts.map((p,i) => (
                            <div key={i} className="hm-low-stock-row">
                                <div>
                                    <div style={{ color:"var(--text-primary)", fontWeight:600, fontSize:13 }}>{p.name}</div>
                                    <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>
                                        {p.brand?.name||"—"} · {p.maincategory?.name||"—"} · {fmt(p.finalPrice||0)}
                                    </div>
                                </div>
                                <span className="hm-stock-qty">{p.stockQuantity} left</span>
                            </div>
                        ))
                    }
                </div>
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-bolt"></i> Quick Actions</h2>
                    </div>
                    <div className="hm-quick-grid">
                        {[
                            { label:"Add Brand",       icon:"fa-tag",         link:"/brand/create",        color:"#F97316" },
                            { label:"Add Product",     icon:"fa-box-open",    link:"/product/create",      color:"#38EFC3" },
                            { label:"Add Category",    icon:"fa-layer-group", link:"/maincategory/create", color:"#A78BFA" },
                            { label:"Add Subcategory", icon:"fa-list",        link:"/subcategory/create",  color:"#38EF91" },
                            { label:"View Orders",     icon:"fa-receipt",     link:"/checkout",            color:"#4F8EF7" },
                            { label:"View Messages",   icon:"fa-envelope",    link:"/contactus",           color:"#F75F5F" },
                            { label:"Testimonials",    icon:"fa-star",        link:"/testimonial",         color:"#EC4899" },
                            { label:"Newsletters",     icon:"fa-paper-plane", link:"/newsletter",          color:"#14B8A6" },
                        ].map((q,i) => (
                            <Link to={q.link} key={i} className="hm-quick-btn" style={{ "--q-color":q.color }}>
                                <i className={`fas ${q.icon}`} style={{ color:q.color }}></i>
                                <span>{q.label}</span>
                            </Link>
                        ))}
                    </div>
                    <div style={{ borderTop:"1px solid var(--border)", paddingTop:14, display:"flex", flexDirection:"column", gap:10 }}>
                        {[
                            { icon:"fa-envelope-open", color:"var(--accent)",  label:"Active Subscribers", val:activeSubscribers,    unit:"subs",   link:"/newsletter"  },
                            { icon:"fa-star",          color:"#F7C35F",        label:"Testimonials",       val:D.testimonials.length, unit:"reviews", link:"/testimonial" },
                            { icon:"fa-tag",           color:"#F97316",        label:"Total Brands",       val:D.brands.length,       unit:"brands",  link:"/brand"       },
                        ].map((r,i) => (
                            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                <span style={{ fontSize:13, color:"var(--text-secondary)", display:"flex", alignItems:"center", gap:7 }}>
                                    <i className={`fas ${r.icon}`} style={{ color:r.color }}></i> {r.label}
                                </span>
                                <Link to={r.link} className="hm-card-link"><strong>{r.val}</strong> {r.unit}</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
        </>
    );
}