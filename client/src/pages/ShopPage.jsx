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
  const [mc, setMc] = useState("");
  const [sc, setSc] = useState("");
  const [br, setBr] = useState("");
  const [flag, setFlag] = useState(false);
  const [search, setSearch] = useState("");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(1000);

  const ProductStateData = useSelector((state) => state.ProductStateData);
  const MaincategoryStateData = useSelector((state) => state.MaincategoryStateData);
  const SubcategoryStateData = useSelector((state) => state.SubcategoryStateData);
  const BrandStateData = useSelector((state) => state.BrandStateData);

  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => { dispatch(getMaincategory()) }, []);
  useEffect(() => { dispatch(getSubcategory()) }, []);
  useEffect(() => { dispatch(getBrand()) }, []);

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
    setFlag(!flag);
  }

  function filter(mc, sc, br, min = -1, max = -1) {
    setSearch("");
    setData(ProductStateData.filter((p) =>
      (mc === "All" || mc === p.maincategory?.name) &&
      (sc === "All" || sc === p.subcategory?.name) &&
      (br === "All" || br === p.brand?.name) &&
      (min === -1 || p.finalPrice >= min) &&
      (max === -1 || p.finalPrice <= max)
    ));
  }

  function applyPriceFilter(e) {
    e.preventDefault();
    filter(mc, sc, br, min, max);
    document.getElementById('mobileFilters').style.display = 'none'; // Hide overlay on submit
  }

  useEffect(() => {
    dispatch(getProduct());
    const mc = searchParams.get("mc") ?? "All";
    const sc = searchParams.get("sc") ?? "All";
    const br = searchParams.get("br") ?? "All";
    if (ProductStateData.length) {
      setMc(mc);
      setSc(sc);
      setBr(br);
      filter(mc, sc, br);
    }
  }, [ProductStateData.length, searchParams]);

  return (
    <>
      <HeroSection title="Shop" />
      <div className="container-fluid my-3">
        <div className="row">

          {/* Desktop Sidebar Filters */}
          <div className="col-md-2 d-none d-md-block">
            <div className="list-group mb-3">
              <Link className="list-group-item active">Maincategory</Link>
              <Link to={`/shop?mc=All&sc=${sc}&br=${br}`} className="list-group-item">All</Link>
              {MaincategoryStateData.filter(x => x.active).map((item) => (
                <Link to={`/shop?mc=${item.name}&sc=${sc}&br=${br}`} key={item._id} className="list-group-item">{item.name}</Link>
              ))}
            </div>

            <div className="list-group mb-3">
              <Link className="list-group-item active">Subcategory</Link>
              <Link to={`/shop?mc=${mc}&sc=All&br=${br}`} className="list-group-item">All</Link>
              {SubcategoryStateData.filter(x => x.active).map((item) => (
                <Link to={`/shop?mc=${mc}&sc=${item.name}&br=${br}`} key={item._id} className="list-group-item">{item.name}</Link>
              ))}
            </div>

            <div className="list-group mb-3">
              <Link className="list-group-item active">Brands</Link>
              <Link to={`/shop?mc=${mc}&sc=${sc}&br=All`} className="list-group-item">All</Link>
              {BrandStateData.filter(x => x.active).map((item) => (
                <Link to={`/shop?mc=${mc}&sc=${sc}&br=${item.name}`} key={item._id} className="list-group-item">{item.name}</Link>
              ))}
            </div>

            <h5 className='bg-primary text-light text-center p-2'>Price Filter</h5>
            <form onSubmit={applyPriceFilter}>
              <div className="row">
                <div className="col-6 mb-3">
                  <label>Minimum</label>
                  <input type="number" value={min} onChange={(e) => setMin(e.target.value)} className='form-control' />
                </div>
                <div className="col-6 mb-3">
                  <label>Maximum</label>
                  <input type="number" value={max} onChange={(e) => setMax(e.target.value)} className='form-control' />
                </div>
              </div>
              <button type="submit" className='btn btn-primary w-100 mb-5'>Apply Filter</button>
            </form>
          </div>

          {/* Mobile Filter Overlay Button */}
          <div className="col-12 d-block d-md-none mb-3">
            <button className="btn btn-primary w-100" onClick={() => {
              document.getElementById("mobileFilters").style.display = "block";
            }}>
              Filter Options
            </button>
          </div>

          {/* Mobile Filter Overlay */}
          <div
            id="mobileFilters"
            className="position-fixed top-0 start-0 w-100 h-100 bg-white p-3 overflow-auto"
            style={{ zIndex: 1050, display: 'none' }}
          >
            <button className="btn btn-danger w-100 mb-3" onClick={() => {
              document.getElementById("mobileFilters").style.display = "none";
            }}>Close Filters</button>

            <div className="list-group mb-3">
              <strong>Maincategory</strong>
              <Link to={`/shop?mc=All&sc=${sc}&br=${br}`} className="list-group-item">All</Link>
              {MaincategoryStateData.filter(x => x.active).map((item) => (
                <Link to={`/shop?mc=${item.name}&sc=${sc}&br=${br}`} key={item._id} className="list-group-item">{item.name}</Link>
              ))}
            </div>

            <div className="list-group mb-3">
              <strong>Subcategory</strong>
              <Link to={`/shop?mc=${mc}&sc=All&br=${br}`} className="list-group-item">All</Link>
              {SubcategoryStateData.filter(x => x.active).map((item) => (
                <Link to={`/shop?mc=${mc}&sc=${item.name}&br=${br}`} key={item._id} className="list-group-item">{item.name}</Link>
              ))}
            </div>

            <div className="list-group mb-3">
              <strong>Brands</strong>
              <Link to={`/shop?mc=${mc}&sc=${sc}&br=All`} className="list-group-item">All</Link>
              {BrandStateData.filter(x => x.active).map((item) => (
                <Link to={`/shop?mc=${mc}&sc=${sc}&br=${item.name}`} key={item._id} className="list-group-item">{item.name}</Link>
              ))}
            </div>

            <form onSubmit={applyPriceFilter}>
              <div className="row">
                <div className="col-6 mb-3">
                  <label>Min</label>
                  <input type="number" value={min} onChange={(e) => setMin(e.target.value)} className='form-control' />
                </div>
                <div className="col-6 mb-3">
                  <label>Max</label>
                  <input type="number" value={max} onChange={(e) => setMax(e.target.value)} className='form-control' />
                </div>
              </div>
              <button type="submit" className="btn btn-success w-100">Apply Price Filter</button>
            </form>
          </div>

          {/* Products Section */}
          <div className="col-md-10">
            <div className="row">
              <div className="col-md-9 mb-3">
                <form onSubmit={postSearch}>
                  <div className="btn-group w-100">
                    <input type="search" placeholder='Search' value={search} onChange={(e) => setSearch(e.target.value)} className='form-control border-3 border-primary' style={{ borderRadius: "10px 0 0 10px" }} />
                    <button type='submit' className='btn btn-primary'>Search</button>
                  </div>
                </form>
              </div>
              <div className="col-md-3">
                <select onChange={(e) => sortFilter(e.target.value)} className='form-select border-3 border-primary'>
                  <option value="1">Latest</option>
                  <option value="2">Price: High to Low</option>
                  <option value="3">Price: Low to High</option>
                </select>
              </div>
            </div>
            <Product title="Shop" data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
