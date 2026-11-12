import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getReturn, updateReturn } from "../../Redux/ActionCreators/ReturnActionCreators";

// Happy-path flow shown in the progress bar
const STATUS_STEPS = [
    { key: "pending", label: "Requested", icon: "bi-clipboard-check" },
    { key: "approved", label: "Approved", icon: "bi-hand-thumbs-up" },
    { key: "completed", label: "Completed", icon: "bi-check-circle" },
];

// Which statuses an admin may move to from the current one
const NEXT_STATUS = {
    pending: ["pending", "approved", "rejected", "cancelled"],
    approved: ["approved", "completed", "cancelled"],
    completed: [],
    rejected: [],
    cancelled: [],
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

export default function AdminReturnShow() {
    const { _id } = useParams();
    const ReturnStateData = useSelector((state) => state.ReturnStateData);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [status, setStatus] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => { dispatch(getReturn()); }, [dispatch]);

    useEffect(() => {
        const list = Array.isArray(ReturnStateData) ? ReturnStateData : ReturnStateData?.data || [];
        if (list.length) {
            const item = list.find((x) => x._id === _id);
            if (item) {
                setData({ ...item });
                setStatus(item.status || "pending");
            } else {
                alert("Invalid Return ID");
            }
        }
    }, [_id, ReturnStateData]);

    function updateRecord() {
        if (window.confirm("Are you sure you want to update the return status?")) {
            dispatch(updateReturn({ _id: data._id, status }));
            setData({ ...data, status });
            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                navigate("/return");
            }, 2000);
        }
    }

    if (!data) {
        return (
            <main className="dashboard-content">
                <div className="container-fluid px-3 px-lg-4 py-4 d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3"></div>
                        <p className="text-muted">Loading return request…</p>
                    </div>
                </div>
            </main>
        );
    }

    const currentStep = STATUS_STEPS.findIndex((s) => s.key === data.status);
    const isRejected = data.status === "rejected";
    const isCancelled = data.status === "cancelled";
    const isCompleted = data.status === "completed";
    const isTerminalNegative = isRejected || isCancelled;
    const allowedStatuses = NEXT_STATUS[data.status] || [];
    const canUpdate = allowedStatuses.length > 1; // more than just "stay as is"

    const statusBadgeClass = isRejected
        ? "text-bg-danger"
        : isCancelled
            ? "text-bg-secondary"
            : isCompleted
                ? "text-bg-success"
                : data.status === "approved"
                    ? "text-bg-warning"
                    : "text-bg-info";

    const product = data.product;
    const order = data.order;

    return (
        <main className="dashboard-content">
            <style>{`
        .order-progress-row {
          display: flex; align-items: center;
          padding: 1.25rem 0.25rem; gap: 0; overflow-x: auto;
        }
        .order-progress-step {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          min-width: 84px;
        }
        .order-progress-circle {
          width: 40px; height: 40px; border-radius: 50%;
          background: #f8f9fa; border: 2px solid #dee2e6;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem; color: #6c757d; transition: all .3s;
        }
        .order-progress-circle.done { background: #d1e7dd; border-color: #198754; color: #198754; }
        .order-progress-circle.active { background: #0d6efd; border-color: #0d6efd; color: #fff; box-shadow: 0 0 0 4px rgba(13,110,253,0.15); }
        .order-progress-label { font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: #adb5bd; text-align: center; }
        .order-progress-label.visible { color: #495057; }
        .order-progress-line { flex: 1; height: 2px; background: #dee2e6; margin-bottom: 26px; min-width: 20px; }
        .order-progress-line.done { background: #198754; }
        .detail-row { display: flex; align-items: flex-start; gap: 10px; font-size: 0.85rem; color: #495057; }
        .summary-row { display: flex; justify-content: space-between; gap: 12px; padding: 0.4rem 0; font-size: 0.85rem; color: #495057; }
        .reason-box {
          background: var(--bs-tertiary-bg, #f8f9fa);
          border: 1px solid var(--bs-border-color, #dee2e6);
          border-radius: 8px; padding: 0.85rem 1rem;
          font-size: 0.9rem; color: #495057; white-space: pre-wrap; word-break: break-word;
        }
      `}</style>

            <div className="container-fluid px-3 px-lg-4 py-4">

                <div className="page-heading">
                    <div className="page-heading-copy">
                        <span className="page-icon">
                            <i className="bi bi-arrow-return-left" aria-hidden="true"></i>
                        </span>
                        <div>
                            <p className="eyebrow mb-1">Management</p>
                            <h1 className="h3 mb-1">Return Details</h1>
                            <p className="text-muted mb-0">ID: {data._id}</p>
                        </div>
                    </div>
                    <div className="heading-actions d-flex flex-wrap gap-2 align-items-center">
                        <span className={`badge ${statusBadgeClass}`}>{capitalize(data.status)}</span>
                        <Link className="btn btn-outline-secondary btn-sm" to="/return">
                            <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to Returns
                        </Link>
                    </div>
                </div>

                {saved && (
                    <div className="alert alert-success" role="alert">
                        <i className="bi bi-check-circle me-2"></i>Return status updated successfully
                    </div>
                )}

                <section className="row g-3">

                    {!isTerminalNegative && (
                        <div className="col-12">
                            <div className="panel">
                                <h2 className="h5 mb-0 section-title">
                                    <i className="bi bi-signpost-split" aria-hidden="true"></i>
                                    <span>Return Progress</span>
                                </h2>
                                <div className="order-progress-row">
                                    {STATUS_STEPS.map((step, i) => {
                                        const isDone = i < currentStep || (isCompleted && i === currentStep);
                                        const isCurrent = i === currentStep && !isCompleted;
                                        return (
                                            <React.Fragment key={step.key}>
                                                <div className="order-progress-step">
                                                    <div className={`order-progress-circle ${isDone ? "done" : isCurrent ? "active" : ""}`}>
                                                        <i className={`bi ${isDone ? "bi-check-lg" : step.icon}`}></i>
                                                    </div>
                                                    <span className={`order-progress-label ${isDone || isCurrent ? "visible" : ""}`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                                {i < STATUS_STEPS.length - 1 && (
                                                    <div className={`order-progress-line ${i < currentStep ? "done" : ""}`}></div>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {isRejected && (
                        <div className="col-12">
                            <div className="alert alert-danger d-flex align-items-center gap-3 mb-0" role="alert">
                                <i className="bi bi-x-circle fs-3"></i>
                                <div>
                                    <div className="fw-bold">Return Rejected</div>
                                    <div className="small">This return request was rejected and cannot be updated.</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isCancelled && (
                        <div className="col-12">
                            <div className="alert alert-secondary d-flex align-items-center gap-3 mb-0" role="alert">
                                <i className="bi bi-slash-circle fs-3"></i>
                                <div>
                                    <div className="fw-bold">Return Cancelled</div>
                                    <div className="small">This return request was cancelled and cannot be updated.</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="col-12 col-lg-4">
                        <div className="panel h-100">
                            <h2 className="h5 mb-3 section-title">
                                <i className="bi bi-person" aria-hidden="true"></i>
                                <span>Customer</span>
                            </h2>
                            <div className="d-flex flex-column gap-2">
                                {[
                                    { icon: "bi-person", val: data.user?.name },
                                    { icon: "bi-at", val: data.user?.username },
                                    { icon: "bi-envelope", val: data.user?.email },
                                    { icon: "bi-telephone", val: data.user?.phone },
                                ].filter((r) => r.val).map(({ icon, val }) => (
                                    <div key={icon} className="detail-row">
                                        <i className={`bi ${icon} text-primary`}></i>
                                        <span>{val}</span>
                                    </div>
                                ))}
                                {!data.user && <div className="text-muted small">Customer details unavailable.</div>}
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-4">
                        <div className="panel h-100">
                            <h2 className="h5 mb-3 section-title">
                                <i className="bi bi-box-seam" aria-hidden="true"></i>
                                <span>Product</span>
                            </h2>
                            {product ? (
                                <>
                                    <div className="summary-row"><span>Name</span><span className="fw-semibold text-end">{product.name || "—"}</span></div>
                                    {product.brand && <div className="summary-row"><span>Brand</span><span>{product.brand}</span></div>}
                                    {product.discount !== undefined && product.discount !== null && (
                                        <div className="summary-row"><span>Discount</span><span>{product.discount}%</span></div>
                                    )}
                                    {product.variants?.length > 0 && (
                                        <div className="summary-row"><span>Variants</span><span>{product.variants.length}</span></div>
                                    )}
                                </>
                            ) : (
                                <div className="text-muted small">Product details unavailable.</div>
                            )}
                        </div>
                    </div>

                    <div className="col-12 col-lg-4">
                        <div className="panel h-100">
                            <h2 className="h5 mb-3 section-title">
                                <i className="bi bi-file-earmark-text" aria-hidden="true"></i>
                                <span>Return Summary</span>
                            </h2>
                            <div className="summary-row">
                                <span>Status</span>
                                <span className={`badge ${statusBadgeClass}`}>{capitalize(data.status)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Requested On</span>
                                <span>{data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
                            </div>
                            <div className="summary-row">
                                <span>Last Updated</span>
                                <span>{data.updatedAt ? new Date(data.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
                            </div>
                            <hr className="my-2" />
                            <div className="summary-row">
                                <span>Order ID</span>
                                <span className="small" style={{ wordBreak: "break-all" }}>{order?._id || (typeof order === "string" ? order : "—")}</span>
                            </div>
                            {order?.total !== undefined && (
                                <div className="summary-row"><span>Order Total</span><span>₹{order.total}</span></div>
                            )}
                            {order?.paymentMode && (
                                <div className="summary-row"><span>Payment Mode</span><span>{order.paymentMode}</span></div>
                            )}
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="panel">
                            <h2 className="h5 mb-3 section-title">
                                <i className="bi bi-chat-left-text" aria-hidden="true"></i>
                                <span>Reason for Return</span>
                            </h2>
                            <div className="reason-box">{data.reason || "—"}</div>
                        </div>
                    </div>

                    {canUpdate && (
                        <div className="col-12">
                            <div className="panel">
                                <h2 className="h5 mb-3 section-title">
                                    <i className="bi bi-pencil-square" aria-hidden="true"></i>
                                    <span>Update Status</span>
                                </h2>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label">Return Status</label>
                                        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                            {allowedStatuses.map((s) => (
                                                <option key={s} value={s}>{capitalize(s)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end mt-4">
                                    <button className="btn btn-primary" onClick={updateRecord} disabled={status === data.status}>
                                        <i className="bi bi-check-circle" aria-hidden="true"></i> Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isCompleted && (
                        <div className="col-12">
                            <div className="alert alert-success d-flex align-items-center gap-3 mb-0" role="alert">
                                <i className="bi bi-check-circle fs-3"></i>
                                <div>
                                    <div className="fw-bold">Return Completed</div>
                                    <div className="small">This return request has been processed and closed.</div>
                                </div>
                            </div>
                        </div>
                    )}

                </section>
            </div>
        </main>
    );
}