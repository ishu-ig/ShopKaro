import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMaincategory, deleteMaincategory } from "../../../Redux/ActionCreators/MaincategoryActionCreators";
import { getShop, updateShop } from "../../../Redux/ActionCreators/ShopActionCreators";

export default function ShopAddMaincategory() {
  const {_id} = useParams()
  const MaincategoryStateData = useSelector((state) => state.MaincategoryStateData);
  const ShopStateData = useSelector((state) => state.ShopStateData);
  const dispatch = useDispatch();
  const [flag, setFlag]   = useState(false);
  const [search, setSearch] = useState("");
  const [attachingId, setAttachingId] = useState(null);
  console.log(_id)

  const totalCount    = MaincategoryStateData?.length ?? 0;
  const activeCount   = MaincategoryStateData?.filter((i) => i.active).length ?? 0;
  const inactiveCount = totalCount - activeCount;

    useEffect(() => { dispatch(getShop()); }, [dispatch]);

  // The restaurant this page is scoped to (route is /:role/:_id/create,
  // so _id here is the Shop's _id, not a Maincategory's).
  const currentShop = ShopStateData?.find((r) => r._id === _id);
  console.log(currentShop)
  // Normalize to plain ids — maincategory may come back populated
  // (objects) or as raw ObjectId strings depending on the query.
  const attachedIds = (currentShop?.maincategory || []).map((c) =>
    typeof c === "string" ? c : c._id
  );

  function deleteRecord(_id) {
    if (window.confirm("Are you sure you want to delete this category?")) {
      dispatch(deleteMaincategory({ _id }));
      setFlag((f) => !f);
    }
  }

function toggleAttach(categoryId) {
  if (!_id || !currentShop) return;

  const categoryIdString = categoryId.toString();

  const isAttached = attachedIds.some(
    (id) => id.toString() === categoryIdString
  );

  const nextIds = isAttached
    ? attachedIds.filter(
        (id) => id.toString() !== categoryIdString
      )
    : [...attachedIds, categoryIdString];

  const formData = new FormData();

  formData.append("_id", _id);
  formData.append("maincategory", JSON.stringify(nextIds));

  setAttachingId(categoryIdString);

  dispatch(updateShop(formData));

  setTimeout(() => {
    dispatch(getShop());
    setAttachingId(null);
  }, 500);
}

  useEffect(() => { dispatch(getMaincategory()); }, [flag]);


  const filteredData = MaincategoryStateData?.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
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
        .act-btn-del:hover   { background: #f8d7da; color: #dc3545; }
        .act-btn-attach:hover   { background: #d1e7dd; color: #198754; }
        .act-btn-detach:hover   { background: #f8d7da; color: #dc3545; }
        .act-btn.is-attached { background: #d1e7dd; color: #198754; }
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
        .cat-thumb {
          width: 64px; height: 42px; object-fit: cover;
          border-radius: 6px; border: 1px solid var(--bs-border-color, #dee2e6);
        }
      `}</style>

      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">

          <div className="page-heading">
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-grid" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Management</p>
                <h1 className="h3 mb-1">
                  Main Categories
                  {currentShop && <> — <span className="text-primary">{currentShop.name}</span></>}
                </h1>
                <p className="text-muted mb-0">
                  {currentShop
                    ? "Attach existing categories to this restaurant."
                    : "Manage top-level product categories."}
                </p>
              </div>
            </div>
            {/* <div className="heading-actions">
              <Link className="btn btn-primary btn-sm" to="/maincategory/create">
                <i className="bi bi-plus-circle" aria-hidden="true"></i> Add Category
              </Link>
            </div> */}
          </div>

          <section className="row g-3 mt-2 mb-1" aria-label="Maincategory summary">
            <div className="col-12 col-sm-6 col-xl-4">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Total</span>
                  <span className="metric-icon"><i className="bi bi-grid-fill"></i></span>
                </div>
                <div className="metric-value">{totalCount}</div>
                <div className="metric-meta"><span>all</span><span>categories</span></div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-4">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Active</span>
                  <span className="metric-icon"><i className="bi bi-check-circle-fill"></i></span>
                </div>
                <div className="metric-value">{activeCount}</div>
                <div className="metric-meta"><span>published</span><span>on site</span></div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-4">
              <article className="metric-card">
                <div className="metric-top">
                  <span className="metric-label">Inactive</span>
                  <span className="metric-icon"><i className="bi bi-eye-slash-fill"></i></span>
                </div>
                <div className="metric-value">{inactiveCount}</div>
                <div className="metric-meta"><span>hidden</span><span>from site</span></div>
              </article>
            </div>
          </section>

          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-table" aria-hidden="true"></i>
                  <span>Category List</span>
                </h2>
                <p className="text-muted mb-0">Search, review, and manage main categories.</p>
              </div>
              <div className="ms-auto" style={{ minWidth: 220 }}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input type="text" className="form-control border-start-0"
                    placeholder="Search categories..." value={search}
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
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => {
                      const isAttached = attachedIds.includes(item._id);
                      return (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>
                          {item.pic ? (
                            <a href={item.pic} target="_blank" rel="noreferrer">
                              <img src={item.pic} className="cat-thumb" alt={item.name} />
                            </a>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                        <td className="fw-semibold">{item.name}</td>
                        <td>
                          <span className={`badge ${item.active ? "text-bg-success" : "text-bg-secondary"}`}>
                            {item.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="act-strip">
                            {currentShop && (
                              <button
                                className={`act-btn ${isAttached ? "act-btn-detach is-attached" : "act-btn-attach"}`}
                                onClick={() => toggleAttach(item._id)}
                                disabled={attachingId === item._id}
                                data-tip={isAttached ? "Remove from restaurant" : "Add to restaurant"}
                              >
                                <i className={`bi ${isAttached ? "bi-dash-circle" : "bi-plus-circle"}`}></i>
                              </button>
                            )}
                            {localStorage.getItem("role") === "Super Admin" && (
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
                      <td colSpan="5" className="text-center text-muted py-4">
                        {search ? `No categories found for "${search}"` : "No categories available."}
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