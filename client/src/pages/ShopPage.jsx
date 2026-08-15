import React, { useEffect, useState } from 'react';
import HeroSection from '../Components/HeroSection';
import Product from '../Components/Product';
import { Link, useSearchParams } from 'react-router-dom';

import { getMaincategory } from "../Redux/ActionCreators/MaincategoryActionCreators";
import { getSubcategory } from "../Redux/ActionCreators/SubcategoryActionCreators";
import { getBrand } from "../Redux/ActionCreators/BrandActionCreators";
import { getProduct } from "../Redux/ActionCreators/ProductActionCreators";
import { useDispatch, useSelector } from 'react-redux';

// Pricing/color now live per-variant instead of on the product itself.
// The listing card (Product.jsx) always shows variants[0], so sort/filter
// use that same variant as "the" price for a product to stay consistent
// with what's on screen.
const listingPrice = (item) => item?.variants?.[0]?.finalPrice ?? 0;

export default function ShopPage() {
  const [data, setData] = useState([]);
  const [mc, setMc] = useState("All");
  const [sc, setSc] = useState("All");
  const [br, setBr] = useState("All");
  const [search, setSearch] = useState("");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100000);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ProductStateData = useSelector((state) => state.ProductStateData);
  const MaincategoryStateData = useSelector((state) => state.MaincategoryStateData);
  const SubcategoryStateData = useSelector((state) => state.SubcategoryStateData);
  const BrandStateData = useSelector((state) => state.BrandStateData);

  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => { dispatch(getMaincategory()); }, []);
  useEffect(() => { dispatch(getSubcategory()); }, []);
  useEffect(() => { dispatch(getBrand()); }, []);

  function postSearch(e) {
    e.preventDefault();
    const ch = search.toLowerCase();
    setData(ProductStateData.filter(x =>
      x.active &&
      (x.maincategory?.name?.toLowerCase().includes(ch) ||
        x.subcategory?.name?.toLowerCase().includes(ch) ||
        x.brand?.name?.toLowerCase().includes(ch) ||
        x.variants?.some(v => v.color?.toLowerCase() === ch) ||
        x.description?.toLowerCase().includes(ch))
    ));
  }

  function sortFilter(option) {
    const sorted = [...data];
    if (option === "1") sorted.sort((x, y) => y._id.localeCompare(x._id));
    else if (option === "2") sorted.sort((x, y) => listingPrice(y) - listingPrice(x));
    else sorted.sort((x, y) => listingPrice(x) - listingPrice(y));
    setData(sorted);
  }

  function filter(mcVal, scVal, brVal, minVal = -1, maxVal = -1) {
    setSearch("");
    setData(ProductStateData.filter((p) =>
      p.active &&
      (mcVal === "All" || mcVal === p.maincategory?.name) &&
      (scVal === "All" || scVal === p.subcategory?.name) &&
      (brVal === "All" || brVal === p.brand?.name) &&
      (minVal === -1 || listingPrice(p) >= minVal) &&
      (maxVal === -1 || listingPrice(p) <= maxVal)
    ));
  }

  function applyPriceFilter(e) {
    e.preventDefault();
    filter(mc, sc, br, min, max);
  }

  useEffect(() => {
    dispatch(getProduct());
    const mcQ = searchParams.get("mc") ?? "All";
    const scQ = searchParams.get("sc") ?? "All";
    const brQ = searchParams.get("br") ?? "All";
    if (ProductStateData.length) {
      setMc(mcQ); setSc(scQ); setBr(brQ);
      filter(mcQ, scQ, brQ);
    }
  }, [ProductStateData.length, searchParams]);

  const FilterSection = ({ label, items, current, paramKey }) => (
    <div className="sk-filter-group">
      <div className="sk-filter-group-title">{label}</div>
      <Link
        to={`/shop?mc=${paramKey === 'mc' ? 'All' : mc}&sc=${paramKey === 'sc' ? 'All' : sc}&br=${paramKey === 'br' ? 'All' : br}`}
        className={`sk-filter-item ${current === "All" ? "active" : ""}`}
      >
        All
      </Link>
      {items.filter(x => x.active).map(item => (
        <Link
          key={item._id}
          to={`/shop?mc=${paramKey === 'mc' ? item.name : mc}&sc=${paramKey === 'sc' ? item.name : sc}&br=${paramKey === 'br' ? item.name : br}`}
          className={`sk-filter-item ${current === item.name ? "active" : ""}`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );

  const MobilePriceFilter = (
    <form onSubmit={(e) => { applyPriceFilter(e); setSidebarOpen(false); }}>
      <div className="sk-filter-group-title mb-2">Price Range</div>
      <div className="row g-2 mb-2">
        <div className="col-6">
          <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 4 }}>Min (₹)</label>
          <input type="number" value={min} onChange={e => setMin(e.target.value)} className="sk-price-input" />
        </div>
        <div className="col-6">
          <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 4 }}>Max (₹)</label>
          <input type="number" value={max} onChange={e => setMax(e.target.value)} className="sk-price-input" />
        </div>
      </div>
      <button type="submit" className="sk-price-btn">Apply Price Filter</button>
    </form>
  );

  return (
    <div className='mt-5'>
      {/* <HeroSection title="Shop" /> */}
      <h3
        className="text-center pt-3"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          color: '#0d1b2a',
          letterSpacing: 1,
          position: 'relative',
          paddingBottom: 12,
          marginBottom: 8,
        }}
      >
        Shop
        <span
          style={{
            display: 'block',
            width: 60,
            height: 3,
            background: '#c9a84c',
            margin: '10px auto 0',
            borderRadius: 2,
          }}
        />
      </h3>

      {/* Mobile Filter Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1040,
          }}
        />
      )}

      {/* Mobile Filter Drawer */}
      <div
        className="d-lg-none"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '78%', maxWidth: 320,
          height: '100%',
          background: '#fff',
          zIndex: 1050,
          overflowY: 'auto',
          padding: '20px 18px 40px',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.25,0.8,0.25,1)',
          boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.18)' : 'none',
        }}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '2px solid #c9a84c' }}>
          <span style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.1rem', fontWeight: 700, color: '#0d1b2a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa fa-sliders-h" style={{ color: '#c9a84c' }}></i> Filters
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer', lineHeight: 1, padding: 4 }}
            aria-label="Close filters"
          >
            &times;
          </button>
        </div>

        <FilterSection label="Category" items={MaincategoryStateData} current={mc} paramKey="mc" />
        <FilterSection label="Subcategory" items={SubcategoryStateData} current={sc} paramKey="sc" />
        <FilterSection label="Brands" items={BrandStateData} current={br} paramKey="br" />
        {MobilePriceFilter}
      </div>

      <div className="sk-shop-page">
        <div className="container py-4">
          <div className="row g-4">

            {/* Desktop Sidebar */}
            <div className="col-lg-2 d-none d-lg-block">
              <div className="sk-sidebar">
                <div className="sk-sidebar-title">
                  <i className="fa fa-sliders-h"></i> Filters
                </div>
                <FilterSection label="Category" items={MaincategoryStateData} current={mc} paramKey="mc" />
                <FilterSection label="Subcategory" items={SubcategoryStateData} current={sc} paramKey="sc" />
                <FilterSection label="Brands" items={BrandStateData} current={br} paramKey="br" />

                <div className="sk-filter-group sk-price-filter">
                  <div className="sk-filter-group-title">Price Range</div>
                  <form onSubmit={applyPriceFilter}>
                    <div className="mb-2">
                      <label>Min (₹)</label>
                      <input type="number" value={min} onChange={e => setMin(e.target.value)} className="sk-price-input" />
                    </div>
                    <div className="mb-2">
                      <label>Max (₹)</label>
                      <input type="number" value={max} onChange={e => setMax(e.target.value)} className="sk-price-input" />
                    </div>
                    <button type="submit" className="sk-price-btn">Apply</button>
                  </form>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-12 col-lg-10">

              {/* Mobile Filter Toggle */}
              <div className="d-lg-none mb-3">
                <button className="sk-mobile-filter-btn" onClick={() => setSidebarOpen(true)}>
                  <i className="fa fa-filter"></i> Filters
                </button>
              </div>

              {/* Toolbar - stacks vertically on mobile, row on md+ */}
              <div className="sk-toolbar d-flex flex-column flex-md-row gap-2 align-items-stretch align-items-md-center">
                <form onSubmit={postSearch} className="sk-search-wrap w-100 position-relative">
                  <input
                    type="search"
                    placeholder="Search luxury products, brands, categories..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="sk-search-input w-100"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => { setSearch(""); filter(mc, sc, br); }}
                      style={{
                        position: "absolute",
                        right: 48,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#999",
                        fontSize: 16,
                        cursor: "pointer",
                      }}
                    >
                      &times;
                    </button>
                  )}
                  <button type="submit" className="sk-search-btn">
                    <i className="fa fa-search"></i>
                  </button>
                </form>
                <select
                  onChange={e => sortFilter(e.target.value)}
                  className="sk-sort-select w-100"
                  style={{ maxWidth: '100%' }}
                >
                  <option value="1">✨ Latest Arrivals</option>
                  <option value="2">📈 Price: High to Low</option>
                  <option value="3">📉 Price: Low to High</option>
                </select>
              </div>

              {/* Quick price chips rail */}
              <div className="sk-quick-price-bar px-1">
                <span className="sk-quick-price-label">
                  <i className="fa fa-sliders-h" style={{ fontSize: 10, color: "#c9a84c" }} /> Quick Price:
                </span>
                {[
                  { label: "All", minV: 0, maxV: 100000 },
                  { label: "Under ₹1,000", minV: 0, maxV: 1000 },
                  { label: "₹1,000 - ₹3,000", minV: 1000, maxV: 3000 },
                  { label: "₹3,000 - ₹10,000", minV: 3000, maxV: 10000 },
                  { label: "₹10,000+", minV: 10000, maxV: 100000 },
                ].map(p => {
                  const isActive = min === p.minV && max === p.maxV;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => { setMin(p.minV); setMax(p.maxV); filter(mc, sc, br, p.minV, p.maxV); }}
                      className={`sk-quick-price-chip ${isActive ? "active" : ""}`}
                    >
                      {isActive && <i className="fa fa-check me-1" style={{ fontSize: 9 }} />}
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Results count + Active filter tags */}
              <div className="d-flex flex-wrap align-items-center gap-2 mb-0 px-1 mt-2">
                <span style={{ fontSize: "0.82rem", color: "#6e685f" }}>
                  Showing <strong style={{ color: "#0d1b2a" }}>{data.length}</strong> items
                </span>

                {mc !== "All" && (
                  <span className="sk-active-filter">
                    <i className="fa fa-tag" style={{ fontSize: 10 }} /> {mc}
                    <Link
                      to={`/shop?mc=All&sc=${sc}&br=${br}`}
                      className="sk-active-filter-remove"
                    >×</Link>
                  </span>
                )}
                {sc !== "All" && (
                  <span className="sk-active-filter">
                    <i className="fa fa-tag" style={{ fontSize: 10 }} /> {sc}
                    <Link
                      to={`/shop?mc=${mc}&sc=All&br=${br}`}
                      className="sk-active-filter-remove"
                    >×</Link>
                  </span>
                )}
                {br !== "All" && (
                  <span className="sk-active-filter">
                    <i className="fa fa-tag" style={{ fontSize: 10 }} /> {br}
                    <Link
                      to={`/shop?mc=${mc}&sc=${sc}&br=All`}
                      className="sk-active-filter-remove"
                    >×</Link>
                  </span>
                )}
                {search && (
                  <span className="sk-active-filter">
                    <i className="fa fa-search" style={{ fontSize: 10 }} /> "{search}"
                    <button
                      className="sk-active-filter-remove"
                      onClick={() => { setSearch(""); filter(mc, sc, br); }}
                    >×</button>
                  </span>
                )}
                {(min > 0 || max < 100000) && (
                  <span className="sk-active-filter">
                    ₹{min} – ₹{max}
                    <button
                      className="sk-active-filter-remove"
                      onClick={() => { setMin(0); setMax(100000); filter(mc, sc, br, -1, -1); }}
                    >×</button>
                  </span>
                )}
              </div>

              {data.length === 0 ? (
                <div
                  className="text-center py-5 my-4"
                  style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    border: "1px solid #e8e0d0",
                    padding: "48px 24px",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "rgba(201,168,76,0.12)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                      color: "#c9a84c",
                      fontSize: 24,
                    }}
                  >
                    <i className="fa fa-search"></i>
                  </div>
                  <h4 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#0d1b2a" }}>
                    No Products Found
                  </h4>
                  <p style={{ color: "#777", maxWidth: 400, margin: "0 auto 20px", fontSize: "0.9rem" }}>
                    We couldn't find any products matching your current search or filter criteria.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMc("All");
                      setSc("All");
                      setBr("All");
                      setSearch("");
                      setMin(0);
                      setMax(100000);
                      setData(ProductStateData.filter(x => x.active));
                    }}
                    className="btn px-4 py-2 rounded-pill"
                    style={{
                      background: "linear-gradient(135deg, #c9a84c, #e8c873)",
                      color: "#070d14",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      border: "none",
                    }}
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <Product title="Shop" data={data} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}