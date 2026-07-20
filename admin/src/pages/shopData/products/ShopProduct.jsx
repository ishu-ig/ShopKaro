import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getProduct,
  deleteProduct,
  updateProduct,
} from "../../../Redux/ActionCreators/ProductActionCreators";

// Cover image: the first image found on the first variant that has one.
function getCoverImage(item) {
  const variants = item.variants || [];
  for (const v of variants) {
    if (Array.isArray(v.pic) && v.pic.length > 0) return v.pic[0];
  }
  return null;
}

// "Available" now lives at the variant level (stock / stockQuantity), not as
// a single top-level flag, so a product counts as available if any variant
// is in stock.
function isAvailable(item) {
  return (item.variants || []).some((v) => v.stock && (v.stockQuantity ?? 0) > 0);
}

// Reviews no longer carry a precomputed top-level rating — average it here.
function averageRating(item) {
  const reviews = item.reviews || [];
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  return total / reviews.length;
}

// Product has NO top-level basePrice/finalPrice field — only variants carry
// price/finalPrice (each variant sets its own finalPrice from its own price
// and the product's shared discount). Build a min-max range from whatever
// variants exist instead of reading a field that was never on the schema.
function priceSummary(item) {
  const variants = item.variants || [];
  const finalPrices = variants
    .map((v) => v.finalPrice)
    .filter((p) => typeof p === "number" && !Number.isNaN(p));
  const origPrices = variants
    .map((v) => v.price)
    .filter((p) => typeof p === "number" && !Number.isNaN(p));

  if (finalPrices.length === 0) return null;

  const finalMin = Math.min(...finalPrices);
  const finalMax = Math.max(...finalPrices);
  const origMin = origPrices.length ? Math.min(...origPrices) : null;

  return {
    finalMin,
    finalMax,
    isRange: finalMin !== finalMax,
    showStrike: origMin !== null && origMin > finalMin,
    origMin,
  };
}

export default function ShopProduct() {
  const { _id } = useParams();
  const ProductStateData = useSelector((state) => state.ProductStateData);
  const dispatch = useDispatch();
  const [flag, setFlag] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);

  // Scope summary counts to the same dataset the table renders (shop-scoped or full list)
  const totalCount = data?.length ?? 0;
  const activeCount = data?.filter((i) => i.active).length ?? 0;
  const inactiveCount = totalCount - activeCount;
  const availableCount = data?.filter((i) => isAvailable(i)).length ?? 0;

  function deleteRecord(_id) {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct({ _id }));
      setFlag((f) => !f);
    }
  }

  // Toggling now flips the product's `active` status, since there's no
  // separate top-level availability flag in the new schema.
  function toggleActive(_id) {
    const item = ProductStateData.find((p) => p._id === _id);
    if (!item) return;
    const formData = new FormData();
    formData.append("_id", item._id);
    formData.append("name", item.name);
    formData.append("active", !item.active);
    dispatch(updateProduct(formData));
    setFlag((f) => !f);
  }

  useEffect(() => {
    dispatch(getProduct());
  }, [flag]);

  // Scope the working list to this shop when `_id` is present in the route,
  // otherwise fall back to the full product list (e.g. a generic /product page).
  useEffect(() => {
    if (!ProductStateData.length) {
      setData([]);
      return;
    }

    const scoped = ProductStateData.filter((item) => {
      const shopId = item.shop?._id || item.shop;
      return shopId?.toString() === _id?.toString();
    });

    setData(scoped);
  }, [ProductStateData, _id]);

  const filteredData =
    data?.filter(
      (item) =>
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.maincategory?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.subcategory?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.brand?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.shop?.name?.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  return (
    <>
      <style>{`
        .act-strip {
          display: inline-flex; align-items: center; gap: 2px;
          background: var(--bs-tertiary-bg, #f8f9fa);
          border: 1px solid var(--bs-border-color, #dee2e6);
          border-radius: 8px; padding: 3px;
        }
        .act-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 6px;
          border: none; background: transparent; cursor: pointer;
          font-size: 0.88rem; color: #6c757d;
          transition: background .13s, color .13s, transform .1s;
          text-decoration: none; position: relative;
        }
        .act-btn:hover { transform: scale(1.1); }
        .act-btn-edit:hover  { background: #cfe2ff; color: #0d6efd; }
        .act-btn-on:hover    { background: #d1e7dd; color: #198754; }
        .act-btn-off:hover   { background: #fff3cd; color: #856404; }
        .act-btn-del:hover   { background: #f8d7da; color: #dc3545; }
        .act-sep { width: 1px; height: 16px; background: var(--bs-border-color, #dee2e6); flex-shrink: 0; }
        .act-btn::after {
          content: attr(data-tip);
          position: absolute; bottom: calc(100% + 6px); left: 50%;
          transform: translateX(-50%);
          background: #212529; color: #fff;
          font-size: 0.67rem; font-weight: 600;
          padding: 3px 7px; border-radius: 4px; white-space: nowrap;
          pointer-events: none; z-index: 20;
          opacity: 0; transition: opacity .12s;
        }
        .act-btn:hover::after { opacity: 1; }
        .product-thumb {
          width: 64px; height: 48px; object-fit: cover;
          border-radius: 6px; border: 1px solid var(--bs-border-color, #dee2e6);
        }
        .price-strike { text-decoration: line-through; color: #6c757d; font-size: 0.78rem; }
        .price-final  { font-weight: 600; color: #198754; }
        .rating-star  { color: #f5a623; font-size: 0.8rem; }
        .variant-chip {
          font-size: 0.7rem; padding: 1px 6px; border-radius: 10px;
          background: var(--bs-tertiary-bg, #f1f3f5); margin: 1px;
          display: inline-block;
        }
      `}</style>

      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          <div className="page-heading">
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-box-seam" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Management</p>
                <h1 className="h3 mb-1">Products</h1>
                <p className="text-muted mb-0">
                  Review and manage your product catalogue.
                </p>
              </div>
            </div>
            <div className="heading-actions">
              <Link
                className="btn btn-outline-secondary btn-sm"
                to={`/shopProduct/${localStorage.getItem("role")}/${localStorage.getItem("userid")}/create`}
              >
                <i className="bi bi-plus-lg" aria-hidden="true"></i>
                Create Product
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <section className="row g-3 mt-2 mb-1" aria-label="Product summary">
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Total</span>
                  <span className="metric-icon">
                    <i className="bi bi-box-seam"></i>
                  </span>
                </div>
                <div className="metric-value">{totalCount}</div>
                <div className="metric-meta">
                  <span>all</span>
                  <span>products</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Active</span>
                  <span className="metric-icon">
                    <i className="bi bi-check-circle-fill"></i>
                  </span>
                </div>
                <div className="metric-value">{activeCount}</div>
                <div className="metric-meta">
                  <span>published</span>
                  <span>on shop</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card">
                <div className="metric-top">
                  <span className="metric-label">Inactive</span>
                  <span className="metric-icon">
                    <i className="bi bi-eye-slash-fill"></i>
                  </span>
                </div>
                <div className="metric-value">{inactiveCount}</div>
                <div className="metric-meta">
                  <span>hidden</span>
                  <span>from shop</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card">
                <div className="metric-top">
                  <span className="metric-label">In Stock</span>
                  <span className="metric-icon">
                    <i className="bi bi-boxes"></i>
                  </span>
                </div>
                <div className="metric-value">{availableCount}</div>
                <div className="metric-meta">
                  <span>at least one</span>
                  <span>variant available</span>
                </div>
              </article>
            </div>
          </section>

          <section className="panel mt-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2 className="h5 mb-0 section-title">
                <i className="bi bi-table" aria-hidden="true"></i>
                <span>Product List</span>
              </h2>
              <div className="input-group" style={{ maxWidth: 320 }}>
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearch("")}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Shop</th>
                    <th>Variants</th>
                    <th>Price</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => {
                      const cover = getCoverImage(item);
                      const rating = averageRating(item);
                      const price = priceSummary(item);
                      return (
                        <tr key={item._id}>
                          <td>{index + 1}</td>

                          {/* Image — first available variant image */}
                          <td>
                            {cover ? (
                              <a href={cover} target="_blank" rel="noreferrer">
                                <img src={cover} className="product-thumb" alt={item.name} />
                              </a>
                            ) : (
                              <div className="product-thumb d-flex align-items-center justify-content-center bg-light">
                                <i className="bi bi-image text-muted"></i>
                              </div>
                            )}
                          </td>

                          {/* Name */}
                          <td>
                            <div className="fw-semibold">{item.name}</div>
                          </td>

                          {/* Category */}
                          <td>
                            <div className="small">{item.maincategory?.name ?? "—"}</div>
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                              {item.subcategory?.name}
                            </div>
                          </td>

                          {/* Brand */}
                          <td>{item.brand?.name ?? "—"}</td>

                          {/* Shop */}
                          <td>{item.shop?.name ?? "—"}</td>

                          {/* Variants — color/size chips with stock status */}
                          <td>
                            {(item.variants || []).length > 0 ? (
                              (item.variants || []).map((v, i) => (
                                <span
                                  key={v._id || i}
                                  className="variant-chip"
                                  title={`Stock: ${v.stockQuantity ?? 0}`}
                                >
                                  {v.color}/{v.size} {v.stock ? "" : "(out)"}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted small">No variants</span>
                            )}
                          </td>

                          {/* Price — no top-level price on Product; derived
                              from each variant's own finalPrice/price */}
                          <td>
                            {price ? (
                              <>
                                <span className="price-final">
                                  ₹{price.finalMin}
                                  {price.isRange ? ` - ₹${price.finalMax}` : ""}
                                </span>
                                {price.showStrike && (
                                  <span className="price-strike ms-1">₹{price.origMin}</span>
                                )}
                                {item.discount > 0 && (
                                  <div className="text-danger small">-{item.discount}% off</div>
                                )}
                              </>
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </td>

                          {/* Rating — averaged from reviews client-side */}
                          <td>
                            {rating > 0 ? (
                              <span>
                                <i className="bi bi-star-fill rating-star"></i>{" "}
                                {rating.toFixed(1)}
                                <span className="text-muted small ms-1">
                                  ({item.reviews?.length ?? 0})
                                </span>
                              </span>
                            ) : (
                              <span className="text-muted small">No reviews</span>
                            )}
                          </td>

                          {/* Status */}
                          <td>
                            <span className={`badge ${item.active ? "text-bg-success" : "text-bg-secondary"}`}>
                              {item.active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="text-end">
                            <div className="act-strip">
                              <Link
                                className="act-btn act-btn-edit"
                                to={`/shopProduct/${localStorage.getItem("role")}/${_id}/update/${item._id}`}
                                data-tip="Edit"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </Link>
                              <span className="act-sep"></span>
                              <button
                                className={`act-btn ${item.active ? "act-btn-off" : "act-btn-on"}`}
                                onClick={() => toggleActive(item._id)}
                                data-tip={item.active ? "Deactivate" : "Activate"}
                              >
                                <i className={`bi ${item.active ? "bi-pause-fill" : "bi-play-fill"}`}></i>
                              </button>
                          
                                  <span className="act-sep"></span>
                                  <button
                                    className="act-btn act-btn-del"
                                    onClick={() => deleteRecord(item._id)}
                                    data-tip="Delete"
                                  >
                                    <i className="bi bi-trash3-fill"></i>
                                  </button>
                                
                              
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="11" className="text-center text-muted py-4">
                        {search
                          ? `No products found for "${search}"`
                          : "No products available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}