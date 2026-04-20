import React, { useEffect, useState } from 'react';
import HeroSection from '../Components/HeroSection';
import Product from '../Components/Product';
import { Link, useSearchParams } from 'react-router-dom';

import { getMaincategory } from "../Redux/ActionCreartors/MaincategoryActionCreators";
import { getSubcategory } from "../Redux/ActionCreartors/SubcategoryActionCreators";
import { getBrand } from "../Redux/ActionCreartors/BrandActionCreators";
import { getProduct } from "../Redux/ActionCreartors/ProductActionCreators";
import { useDispatch, useSelector } from 'react-redux';

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
        x.color?.toLowerCase() === ch ||
        x.description?.toLowerCase().includes(ch))
    ));
  }

  function sortFilter(option) {
    const sorted = [...data];
    if (option === "1") sorted.sort((x, y) => y._id.localeCompare(x._id));
    else if (option === "2") sorted.sort((x, y) => y.finalPrice - x.finalPrice);
    else sorted.sort((x, y) => x.finalPrice - y.finalPrice);
    setData(sorted);
  }

  function filter(mcVal, scVal, brVal, minVal = -1, maxVal = -1) {
    setSearch("");
    setData(ProductStateData.filter((p) =>
      p.active &&
      (mcVal === "All" || mcVal === p.maincategory?.name) &&
      (scVal === "All" || scVal === p.subcategory?.name) &&
      (brVal === "All" || brVal === p.brand?.name) &&
      (minVal === -1 || p.finalPrice >= minVal) &&
      (maxVal === -1 || p.finalPrice <= maxVal)
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
          <label style={{fontSize:11,fontWeight:600,letterSpacing:1,textTransform:'uppercase',color:'#888',display:'block',marginBottom:4}}>Min (₹)</label>
          <input type="number" value={min} onChange={e => setMin(e.target.value)} className="sk-price-input" />
        </div>
        <div className="col-6">
          <label style={{fontSize:11,fontWeight:600,letterSpacing:1,textTransform:'uppercase',color:'#888',display:'block',marginBottom:4}}>Max (₹)</label>
          <input type="number" value={max} onChange={e => setMax(e.target.value)} className="sk-price-input" />
        </div>
      </div>
      <button type="submit" className="sk-price-btn">Apply Price Filter</button>
    </form>
  );

  return (
    <>
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
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, paddingBottom:14, borderBottom:'2px solid #c9a84c' }}>
          <span style={{ fontFamily:'Playfair Display,serif', fontSize:'1.1rem', fontWeight:700, color:'#0d1b2a', display:'flex', alignItems:'center', gap:8 }}>
            <i className="fa fa-sliders-h" style={{ color:'#c9a84c' }}></i> Filters
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background:'none', border:'none', fontSize:20, color:'#888', cursor:'pointer', lineHeight:1, padding:4 }}
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
        <div className="d-none d-lg-block">
          <HeroSection title="Shop" />
        </div>

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

            {/* Main Content — full width on mobile, no shifting */}
            <div className="col-12 col-lg-10">
              {/* Mobile Filter Toggle */}
              <div className="d-lg-none mb-3">
                <button className="sk-mobile-filter-btn" onClick={() => setSidebarOpen(true)}>
                  <i className="fa fa-filter"></i> Filters
                </button>
              </div>

              {/* Toolbar */}
              <div className="sk-toolbar">
                <form onSubmit={postSearch} className="sk-search-wrap">
                  <input
                    type="search"
                    placeholder="Search products, brands, categories..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="sk-search-input"
                  />
                  <button type="submit" className="sk-search-btn">
                    <i className="fa fa-search"></i>
                  </button>
                </form>
                <select onChange={e => sortFilter(e.target.value)} className="sk-sort-select">
                  <option value="1">Latest First</option>
                  <option value="2">Price: High to Low</option>
                  <option value="3">Price: Low to High</option>
                </select>
              </div>

              <div className="sk-results-count mb-3 px-1">
                Showing <strong>{Math.min(data.length, 21)}</strong> of <strong>{data.length}</strong> products
              </div>

              <Product title="Shop" data={data} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}