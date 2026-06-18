import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getTestimonial,
  deleteTestimonial,
  updateTestimonial, // ✅ FIX 1: import updateTestimonial action
} from "../../Redux/ActionCreators/TestimonialActionCreators";

export default function AdminTestimonial() {
  let TestimonialStateData = useSelector((state) => state.TestimonialStateData);
  let dispatch = useDispatch();

  let [search, setSearch] = useState("");

  // Derived stats
  const totalCount = TestimonialStateData.length;
  const activeCount = TestimonialStateData.filter((t) => t.active).length;
  const inactiveCount = TestimonialStateData.filter((t) => !t.active).length;

  let filteredData = TestimonialStateData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  function deleteRecord(_id) {
    if (window.confirm("Are you sure you want to delete this item?")) {
      dispatch(deleteTestimonial({ _id: _id }));
      getAPIData();
    }
  }

  // ✅ FIX 2: Added missing updateRecord function to toggle active status
  function updateRecord(_id) {
    const item = TestimonialStateData.find((t) => t._id === _id);
    if (!item) return;
    dispatch(updateTestimonial({ _id, active: !item.active }));
  }

  // ✅ FIX 3: Removed jQuery DataTable logic — it conflicts with React-side
  // search filtering. Using plain React rendering instead.
  function getAPIData() {
    dispatch(getTestimonial());
  }

  useEffect(() => {
    getAPIData();
  }, []); // ✅ FIX 4: Run only on mount; Redux state updates will re-render automatically

  return (
    <>
      <style>{`
                /* ── Metric cards ── */
                .metric-card {
                    border-radius: 12px;
                    border: 1px solid rgba(0,0,0,.08);
                    padding: 18px 20px 14px;
                    position: relative; overflow: hidden;
                    transition: transform .15s, box-shadow .15s;
                    box-shadow: 0 1px 4px rgba(0,0,0,.06);
                }
                .metric-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,.10);
                }
                .metric-top {
                    display: flex; align-items: center;
                    justify-content: space-between; margin-bottom: 10px;
                }
                .metric-label {
                    font-size: 0.7rem; font-weight: 700; letter-spacing: .08em;
                    text-transform: uppercase; opacity: .75;
                }
                .metric-icon {
                    width: 34px; height: 34px; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1rem; background: rgba(255,255,255,.3);
                }
                .metric-value {
                    font-size: 1.9rem; font-weight: 700; line-height: 1; margin-bottom: 4px;
                }
                .metric-meta {
                    font-size: 0.75rem; opacity: .75; display: flex; gap: 4px;
                }

                /* ── Action pill strip ── */
                .act-strip {
                    display: inline-flex;
                    align-items: center;
                    gap: 2px;
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 3px;
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
                .act-btn-edit:hover { background: #cfe2ff; color: #0d6efd; }
                .act-btn-on:hover   { background: #d1e7dd; color: #198754; }
                .act-btn-off:hover  { background: #fff3cd; color: #856404; }
                .act-btn-del:hover  { background: #f8d7da; color: #dc3545; }
                .act-sep {
                    width: 1px; height: 16px;
                    background: #dee2e6; flex-shrink: 0;
                }
                /* Tooltip */
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

                /* ── Message truncate ── */
                .msg-cell {
                    max-width: 220px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-size: 0.82rem;
                    color: #6c757d;
                    pointer-events: none;
                    user-select: none;
                }
            `}</style>

      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          {/* ── Page heading ── */}
          <div className="page-heading">
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-chat-quote" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Management</p>
                <h1 className="h3 mb-1">Testimonials</h1>
                <p className="text-muted mb-0">
                  Review and manage testimonials.
                </p>
              </div>
            </div>
            <div className="heading-actions">
              <Link className="btn btn-primary btn-sm" to="/testimonial/Create">
                <i className="bi bi-plus-circle" aria-hidden="true"></i> Add
                Testimonial
              </Link>
            </div>
          </div>

          {/* ── Summary metric cards ── */}
          <section
            className="row g-3 mt-2 mb-1"
            aria-label="Testimonial summary"
          >
            <div className="col-12 col-sm-6 col-xl-4">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Total</span>
                  <span className="metric-icon">
                    <i className="bi bi-chat-quote-fill"></i>
                  </span>
                </div>
                <div className="metric-value">{totalCount}</div>
                <div className="metric-meta">
                  <span>all</span>
                  <span>testimonials</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-4">
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
                  <span>on site</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-4">
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
                  <span>from site</span>
                </div>
              </article>
            </div>
          </section>

          {/* ── Table panel ── */}
          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-table" aria-hidden="true"></i>
                  <span>Testimonial List</span>
                </h2>
                <p className="text-muted mb-0">
                  Search, review, and manage testimonials.
                  <span className="ms-2 badge text-bg-secondary">
                    {filteredData.length} / {totalCount}
                  </span>
                </p>
              </div>
              {/* Search */}
              <div className="ms-auto" style={{ minWidth: 220 }}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search testimonials..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSearch("")}
                      title="Clear search"
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0" id="DataTable">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Person</th>
                    <th scope="col">Message</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-end">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr key={item._id}>
                        <td
                          className="text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {index + 1}
                        </td>

                        {/* Person: avatar + name stacked */}
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={item.pic}
                              alt={item.name}
                              style={{
                                width: 36,
                                height: 36,
                                objectFit: "cover",
                                borderRadius: "50%",
                                flexShrink: 0,
                                border: "2px solid #dee2e6",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <span
                              style={{ fontWeight: 600, fontSize: "0.875rem" }}
                            >
                              {item.name}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="msg-cell" title={item.message}>
                            {item.message && item.message.length > 60
                              ? item.message.slice(0, 60) + "..."
                              : item.message}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge ${item.active ? "text-bg-success" : "text-bg-secondary"}`}
                          >
                            {item.active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* ── Action pill strip ── */}
                        <td className="text-end">
                          <div className="act-strip">
                            {/* Edit — ✅ FIX 5: corrected route from /user/Update to /testimonial/Update */}
                            <Link
                              className="act-btn act-btn-edit"
                              to={`/testimonial/Update/${item._id}`}
                              data-tip="Edit"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </Link>

                            <span className="act-sep"></span>

                            {/* Toggle */}
                            <button
                              className={`act-btn ${item.active ? "act-btn-off" : "act-btn-on"}`}
                              onClick={() => updateRecord(item._id)}
                              data-tip={item.active ? "Deactivate" : "Activate"}
                            >
                              <i
                                className={`bi ${item.active ? "bi-pause-fill" : "bi-play-fill"}`}
                              ></i>
                            </button>

                            <span className="act-sep"></span>

                            {/* Delete */}
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-5">
                        <div
                          style={{
                            fontSize: "2rem",
                            opacity: 0.3,
                            marginBottom: 8,
                          }}
                        >
                          <i className="bi bi-chat-quote"></i>
                        </div>
                        {search
                          ? `No testimonials found for "${search}"`
                          : "No testimonials available."}
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