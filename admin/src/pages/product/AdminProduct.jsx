import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProduct, deleteProduct, updateProduct } from "../../Redux/ActionCreators/ProductActionCreators";

export default function AdminProduct() {
  const ProductStateData = useSelector((state) => state.ProductStateData);
  const dispatch = useDispatch();
  const [flag, setFlag] = useState(false);
  const [search, setSearch] = useState("");

  const totalCount    = ProductStateData?.length ?? 0;
  const activeCount   = ProductStateData?.filter((i) => i.active).length ?? 0;
  const inactiveCount = totalCount - activeCount;
  const inStockCount  = ProductStateData?.filter((i) => i.stock).length ?? 0;

  function deleteRecord(_id) {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct({ _id }));
      setFlag((f) => !f);
    }
  }

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

  useEffect(() => { dispatch(getProduct()); }, [flag]);

  const filteredData = ProductStateData?.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.maincategory?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.subcategory?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.brand?.name?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  // Backend stores pic as an array of relative paths e.g. "product/xyz.jpg"
  function picUrl(p) {
    if (!p) return "";
    return `${p}`;
  }

  function coverPic(item) {
    if (Array.isArray(item.pic) && item.pic.length > 0) return picUrl(item.pic[0]);
    if (item.pic) return picUrl(item.pic);
    return "";
  }

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
        .pic-count {
          font-size: 0.65rem; background: #0d6efd; color: #fff;
          border-radius: 999px; padding: 1px 5px;
          position: absolute; bottom: -6px; right: -6px;
        }
        .price-strike { text-decoration: line-through; color: #6c757d; font-size: 0.78rem; }
        .price-final  { font-weight: 600; color: #198754; }
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
                <p className="text-muted mb-0">Review and manage your product catalogue.</p>
              </div>
            </div>
            <div className="heading-actions">
              <Link className="btn btn-primary btn-sm" to="/product/create">
                <i className="bi bi-plus-circle" aria-hidden="true"></i> Add Product
              </Link>
            </div>
          </div>

          <section className="row g-3 mt-2 mb-1" aria-label="Product summary">
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Total</span>
                  <span className="metric-icon"><i className="bi bi-box-seam-fill"></i></span>
                </div>
                <div className="metric-value">{totalCount}</div>
                <div className="metric-meta"><span>all</span><span>products</span></div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Active</span>
                  <span className="metric-icon"><i className="bi bi-check-circle-fill"></i></span>
                </div>
                <div className="metric-value">{activeCount}</div>
                <div className="metric-meta"><span>published</span><span>on site</span></div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card">
                <div className="metric-top">
                  <span className="metric-label">Inactive</span>
                  <span className="metric-icon"><i className="bi bi-eye-slash-fill"></i></span>
                </div>
                <div className="metric-value">{inactiveCount}</div>
                <div className="metric-meta"><span>hidden</span><span>from site</span></div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">In Stock</span>
                  <span className="metric-icon"><i className="bi bi-archive-fill"></i></span>
                </div>
                <div className="metric-value">{inStockCount}</div>
                <div className="metric-meta"><span>available</span><span>to order</span></div>
              </article>
            </div>
          </section>

          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-table" aria-hidden="true"></i>
                  <span>Product List</span>
                </h2>
                <p className="text-muted mb-0">Search, review, and manage products.</p>
              </div>
              <div className="ms-auto" style={{ minWidth: 220 }}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input type="text" className="form-control border-start-0"
                    placeholder="Search products..." value={search}
                    onChange={(e) => setSearch(e.target.value)} />
                  {search && (
                    <button className="btn btn-outline-secondary" type="button"
                      onClick={() => setSearch("")}>
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
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
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => {
                      const cover    = coverPic(item);
                      const picCount = Array.isArray(item.pic) ? item.pic.length : (item.pic ? 1 : 0);
                      return (
                        <tr key={item._id}>
                          <td>{index + 1}</td>
                          <td>
                            <div className="position-relative d-inline-block">
                              {cover ? (
                                <a href={cover} target="_blank" rel="noreferrer">
                                  <img src={cover} className="product-thumb" alt={item.name} />
                                </a>
                              ) : (
                                <div className="product-thumb d-flex align-items-center justify-content-center bg-light">
                                  <i className="bi bi-image text-muted"></i>
                                </div>
                              )}
                              {picCount > 1 && <span className="pic-count">+{picCount}</span>}
                            </div>
                          </td>
                          <td>
                            <div className="fw-semibold">{item.name}</div>
                            <div className="text-muted small">{item.color} · {item.size}</div>
                          </td>
                          <td>
                            <div className="small">{item.maincategory?.name ?? "—"}</div>
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>{item.subcategory?.name}</div>
                          </td>
                          <td>{item.brand?.name ?? "—"}</td>
                          <td>
                            <div className="price-final">₹{item.finalPrice}</div>
                            {item.discount > 0 && (
                              <div className="price-strike">₹{item.basePrice} <span className="text-danger">-{item.discount}%</span></div>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${item.stock ? "text-bg-success" : "text-bg-danger"}`}>
                              {item.stock ? `${item.stockQuantity} left` : "Out"}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${item.active ? "text-bg-success" : "text-bg-secondary"}`}>
                              {item.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="act-strip">
                              <Link className="act-btn act-btn-edit"
                                to={`/product/update/${item._id}`} data-tip="Edit">
                                <i className="bi bi-pencil-square"></i>
                              </Link>
                              <span className="act-sep"></span>
                              <button className={`act-btn ${item.active ? "act-btn-off" : "act-btn-on"}`}
                                onClick={() => toggleActive(item._id)}
                                data-tip={item.active ? "Deactivate" : "Activate"}>
                                <i className={`bi ${item.active ? "bi-pause-fill" : "bi-play-fill"}`}></i>
                              </button>
                              {localStorage.getItem("role") === "Admin" && (
                                <>
                                  <span className="act-sep"></span>
                                  <button className="act-btn act-btn-del"
                                    onClick={() => deleteRecord(item._id)} data-tip="Delete">
                                    <i className="bi bi-trash3-fill"></i>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center text-muted py-4">
                        {search ? `No products found for "${search}"` : "No products available."}
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