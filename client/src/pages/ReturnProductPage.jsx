import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getReturn, deleteReturn } from "../../Redux/ActionCreators/ReturnActionCreators";

const STATUS_BADGE = {
    pending: "text-bg-info",
    approved: "text-bg-warning",
    completed: "text-bg-success",
    rejected: "text-bg-danger",
    cancelled: "text-bg-secondary",
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

export default function AdminReturn() {
    const ReturnStateData = useSelector((state) => state.ReturnStateData);
    const dispatch = useDispatch();
    const [flag, setFlag] = useState(false);
    const [search, setSearch] = useState("");

    const returns = Array.isArray(ReturnStateData) ? ReturnStateData : ReturnStateData?.data ?? [];

    const totalCount = returns.length;
    const pendingCount = returns.filter((r) => r.status === "pending").length;
    const approvedCount = returns.filter((r) => r.status === "approved").length;
    const completedCount = returns.filter((r) => r.status === "completed").length;

    function deleteRecord(_id) {
        if (window.confirm("Are you sure you want to delete this return request?")) {
            dispatch(deleteReturn({ _id }));
            setFlag((f) => !f);
        }
    }

    useEffect(() => { dispatch(getReturn()); }, [flag]);

    const q = search.toLowerCase();
    const filteredData = returns.filter((r) =>
        r._id?.toLowerCase().includes(q) ||
        r.user?.name?.toLowerCase().includes(q) ||
        r.product?.name?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q)
    );

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
        .act-btn-view:hover { background: #cfe2ff; color: #0d6efd; }
        .act-btn-del:hover  { background: #f8d7da; color: #dc3545; }
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
        .order-id-cell {
          font-family: monospace; font-size: 0.78rem; color: #6c757d;
          max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          display: inline-block;
        }
        .reason-cell {
          max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          display: inline-block; font-size: 0.85rem;
        }
      `}</style>

            <main className="dashboard-content">
                <div className="container-fluid px-3 px-lg-4 py-4">

                    <div className="page-heading">
                        <div className="page-heading-copy">
                            <span className="page-icon">
                                <i className="bi bi-arrow-return-left" aria-hidden="true"></i>
                            </span>
                            <div>
                                <p className="eyebrow mb-1">Management</p>
                                <h1 className="h3 mb-1">Return Requests</h1>
                                <p className="text-muted mb-0">Review and manage customer product returns.</p>
                            </div>
                        </div>
                    </div>

                    <section className="row g-3 mt-2 mb-1" aria-label="Return summary">
                        <div className="col-12 col-sm-6 col-xl-3">
                            <article className="metric-card text-white">
                                <div className="metric-top">
                                    <span className="metric-label">Total</span>
                                    <span className="metric-icon"><i className="bi bi-arrow-return-left"></i></span>
                                </div>
                                <div className="metric-value">{totalCount}</div>
                                <div className="metric-meta"><span>all</span><span>requests</span></div>
                            </article>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                            <article className="metric-card text-white">
                                <div className="metric-top">
                                    <span className="metric-label">Pending</span>
                                    <span className="metric-icon"><i className="bi bi-hourglass-split"></i></span>
                                </div>
                                <div className="metric-value">{pendingCount}</div>
                                <div className="metric-meta"><span>awaiting</span><span>review</span></div>
                            </article>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                            <article className="metric-card text-white">
                                <div className="metric-top">
                                    <span className="metric-label">Approved</span>
                                    <span className="metric-icon"><i className="bi bi-hand-thumbs-up-fill"></i></span>
                                </div>
                                <div className="metric-value">{approvedCount}</div>
                                <div className="metric-meta"><span>in</span><span>progress</span></div>
                            </article>
                        </div>
                        <div className="col-12 col-sm-6 col-xl-3">
                            <article className="metric-card">
                                <div className="metric-top">
                                    <span className="metric-label">Completed</span>
                                    <span className="metric-icon"><i className="bi bi-check-circle-fill"></i></span>
                                </div>
                                <div className="metric-value">{completedCount}</div>
                                <div className="metric-meta"><span>returns</span><span>closed</span></div>
                            </article>
                        </div>
                    </section>

                    <section className="panel mt-3">
                        <div className="panel-header">
                            <div>
                                <h2 className="h5 mb-1 section-title">
                                    <i className="bi bi-table" aria-hidden="true"></i>
                                    <span>Return List</span>
                                </h2>
                                <p className="text-muted mb-0">Search, review, and manage return requests.</p>
                            </div>
                            <div className="ms-auto" style={{ minWidth: 220 }}>
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-white">
                                        <i className="bi bi-search text-muted"></i>
                                    </span>
                                    <input type="text" className="form-control border-start-0"
                                        placeholder="Search returns..." value={search}
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
                                        <th>Return ID</th>
                                        <th>Customer</th>
                                        <th>Product</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (
                                        filteredData.map((item, index) => (
                                            <tr key={item._id}>
                                                <td>{index + 1}</td>
                                                <td><span className="order-id-cell" title={item._id}>{item._id}</span></td>
                                                <td className="fw-semibold">{item.user?.name ?? "N/A"}</td>
                                                <td>
                                                    <div className="fw-semibold">{item.product?.name ?? "N/A"}</div>
                                                    {item.product?.brand && <div className="small text-muted">{item.product.brand}</div>}
                                                </td>
                                                <td><span className="reason-cell" title={item.reason}>{item.reason}</span></td>
                                                <td>
                                                    <span className={`badge ${STATUS_BADGE[item.status] ?? "text-bg-info"}`}>
                                                        {capitalize(item.status)}
                                                    </span>
                                                </td>
                                                <td className="text-muted small">
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                                                </td>
                                                <td className="text-end">
                                                    <div className="act-strip">
                                                        <Link className="act-btn act-btn-view"
                                                            to={`/return/view/${item._id}`} data-tip="View">
                                                            <i className="bi bi-eye"></i>
                                                        </Link>
                                                        <span className="act-sep"></span>
                                                        <button className="act-btn act-btn-del"
                                                            onClick={() => deleteRecord(item._id)} data-tip="Delete">
                                                            <i className="bi bi-trash3-fill"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center text-muted py-4">
                                                {search ? `No return requests found for "${search}"` : "No return requests available."}
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