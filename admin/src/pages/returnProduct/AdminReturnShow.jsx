import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API = `${process.env.REACT_APP_BACKEND_SERVER}/api`;
const authHeader = () => ({ authorization: localStorage.getItem("token") });

const STATUS_STEPS = [
    { key: "pending", label: "Requested", icon: "bi-clipboard-check" },
    { key: "approved", label: "Approved", icon: "bi-hand-thumbs-up" },
    { key: "picked_up", label: "Picked Up", icon: "bi-box-arrow-in-down" },
    { key: "received", label: "Received", icon: "bi-shop" },
    { key: "completed", label: "Refunded", icon: "bi-cash-coin" },
];

// Statuses an admin may pick from the current one (mirrors the server rules).
// received -> completed is NOT here: it goes through the Refund panel.
const NEXT_STATUS = {
    pending: ["pending", "approved", "rejected", "cancelled"],
    approved: ["approved", "cancelled"],
    picked_up: [],
    received: [],
    completed: [],
    rejected: [],
    cancelled: [],
};

const STATUS_LABEL = {
    pending: "Pending",
    approved: "Approved",
    picked_up: "Picked up",
    received: "Received at shop",
    completed: "Completed",
    rejected: "Rejected",
    cancelled: "Cancelled",
};

const label = (s) => STATUS_LABEL[s] || (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const idOf = (ref) => ref?._id?.toString?.() ?? ref?.toString?.() ?? "";
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const reasonText = (res, fallback) => (typeof res?.reason === "string" ? res.reason : fallback);

export default function AdminReturnShow() {
    const { _id } = useParams();

    const [data, setData] = useState(null);
    const [loadError, setLoadError] = useState("");
    const [status, setStatus] = useState("");
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState("");
    const [refundAmount, setRefundAmount] = useState("");
    const [saving, setSaving] = useState(false);
    const [refunding, setRefunding] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Load this one return and reset the form fields from it
    const loadReturn = useCallback(async () => {
        try {
            const r = await fetch(`${API}/return/${_id}`, { headers: authHeader() });
            const res = await r.json();
            if (res.result === "Done" && res.data) {
                const item = res.data;
                setData(item);
                setStatus(item.status || "pending");
                setSelectedDeliveryBoy(idOf(item.deliveryBoy));
                setRefundAmount(item.refundAmount ?? item.order?.total ?? "");
                setLoadError("");
            } else {
                setLoadError(reasonText(res, "Return request not found."));
            }
        } catch (e) {
            console.error(e);
            setLoadError("Couldn't load the return request.");
        }
    }, [_id]);

    useEffect(() => { loadReturn(); }, [loadReturn]);

    useEffect(() => {
        async function fetchDeliveryBoys() {
            try {
                let res = await fetch(`${API}/deliveryBoy`, { headers: authHeader() });
                res = await res.json();
                const list = Array.isArray(res) ? res : res.data || [];
                setDeliveryBoys(list.filter((u) => u.role === "DeliveryBoy" && u.active));
            } catch (e) {
                console.error("Failed to fetch delivery boys", e);
            }
        }
        fetchDeliveryBoys();
    }, []);

    function flash(text) {
        setMessage(text);
        setTimeout(() => setMessage(""), 3000);
    }

    // PUT /return/:id (the route uses multer, so send FormData)
    async function putReturn(fields) {
        const body = new FormData();
        Object.entries(fields).forEach(([k, v]) => body.append(k, v));
        const r = await fetch(`${API}/return/${data._id}`, {
            method: "PUT",
            headers: authHeader(),
            body,
        });
        return r.json();
    }

    // Approve / reject / cancel, and assign or change the pickup delivery boy
    async function saveChanges() {
        if (status === "approved" && !selectedDeliveryBoy) {
            setError("Please assign a delivery boy to pick up the item before approving.");
            return;
        }
        if (!window.confirm("Are you sure you want to update this return request?")) return;

        setSaving(true);
        setError("");
        try {
            const fields = { status };
            if (status === "approved") fields.deliveryBoy = selectedDeliveryBoy;
            const res = await putReturn(fields);
            if (res.result === "Done") {
                flash("Return request updated successfully");
                await loadReturn();
            } else {
                setError(reasonText(res, "Couldn't update the return. Please try again."));
            }
        } catch (e) {
            console.error(e);
            setError("Couldn't update the return. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    // Online (Razorpay) refund. The backend also marks the return completed
    async function refundOnline() {
        const amt = Number(refundAmount);
        if (!amt || amt <= 0) {
            setError("Enter a valid refund amount.");
            return;
        }
        if (data.order?.total && amt > Number(data.order.total)) {
            setError(`Refund cannot be more than the order total (₹${data.order.total}).`);
            return;
        }
        if (!window.confirm(`Refund ₹${amt} to the customer via Razorpay? This cannot be undone.`)) return;

        setRefunding(true);
        setError("");
        try {
            const r = await fetch(`${API}/return/refund/${data._id}`, {
                method: "POST",
                headers: { "content-type": "application/json", ...authHeader() },
                body: JSON.stringify({ refundAmount: amt }),
            });
            const res = await r.json();
            if (res.result === "Done") {
                flash("Refund initiated and return completed");
                await loadReturn();
            } else {
                setError(reasonText(res, "Refund failed. Please try again."));
                if (res.maxRefundable != null) setRefundAmount(String(res.maxRefundable));
            }
        } catch (e) {
            console.error(e);
            setError("Refund failed. Please try again.");
        } finally {
            setRefunding(false);
        }
    }

    // COD / no online payment: admin refunds manually, then closes the return
    async function completeManually() {
        if (!window.confirm("Confirm you have refunded the customer manually and want to complete this return?")) return;
        setSaving(true);
        setError("");
        try {
            const res = await putReturn({ status: "completed" });
            if (res.result === "Done") {
                flash("Return marked as completed");
                await loadReturn();
            } else {
                setError(reasonText(res, "Couldn't complete the return. Please try again."));
            }
        } catch (e) {
            console.error(e);
            setError("Couldn't complete the return. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    if (loadError) {
        return (
            <main className="dashboard-content">
                <div className="container-fluid px-3 px-lg-4 py-4">
                    <div className="alert alert-danger" role="alert">{loadError}</div>
                    <Link className="btn btn-outline-secondary btn-sm" to="/return">
                        <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to Returns
                    </Link>
                </div>
            </main>
        );
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
    const isReceived = data.status === "received";
    const isTerminalNegative = isRejected || isCancelled;
    const allowedStatuses = NEXT_STATUS[data.status] || [];
    const canUpdate = allowedStatuses.length > 1; // more than just "stay as is"

    const statusBadgeClass = isRejected
        ? "text-bg-danger"
        : isCancelled
            ? "text-bg-secondary"
            : isCompleted
                ? "text-bg-success"
                : data.status === "approved" || data.status === "picked_up"
                    ? "text-bg-warning"
                    : isReceived
                        ? "text-bg-primary"
                        : "text-bg-info";

    const product = data.product;
    const order = data.order;
    const hasOnlinePayment = !!order?.rppid;

    // Resolve the assigned delivery boy (populated object or plain id)
    const assignedDeliveryBoy = (() => {
        const db = data.deliveryBoy;
        if (!db) return null;
        if (typeof db === "object") return db;
        return deliveryBoys.find((d) => d._id === db) || { _id: db };
    })();

    const unchanged =
        status === data.status &&
        (status !== "approved" || selectedDeliveryBoy === idOf(data.deliveryBoy));

    // Evidence image: single URL (older records may still hold an array)
    const evidence = Array.isArray(data.pics) ? data.pics[0] : data.pics;

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
                        <span className={`badge ${statusBadgeClass}`}>{label(data.status)}</span>
                        <Link className="btn btn-outline-secondary btn-sm" to="/return">
                            <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to Returns
                        </Link>
                    </div>
                </div>

                {message && (
                    <div className="alert alert-success" role="alert">
                        <i className="bi bi-check-circle me-2"></i>{message}
                    </div>
                )}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>{error}
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

                    <div className={assignedDeliveryBoy ? "col-12 col-lg-3" : "col-12 col-lg-4"}>
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

                    {assignedDeliveryBoy && (
                        <div className="col-12 col-lg-3">
                            <div className="panel h-100">
                                <h2 className="h5 mb-3 section-title">
                                    <i className="bi bi-truck" aria-hidden="true"></i>
                                    <span>Pickup Delivery Boy</span>
                                </h2>
                                <div className="d-flex flex-column gap-2">
                                    {[
                                        { icon: "bi-person", val: assignedDeliveryBoy.name },
                                        { icon: "bi-telephone", val: assignedDeliveryBoy.phone },
                                        { icon: "bi-envelope", val: assignedDeliveryBoy.email },
                                    ].filter((r) => r.val).map(({ icon, val }) => (
                                        <div key={icon} className="detail-row">
                                            <i className={`bi ${icon} text-primary`}></i>
                                            <span>{val}</span>
                                        </div>
                                    ))}
                                    {!assignedDeliveryBoy.name && (
                                        <div className="text-muted small">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Delivery boy assigned (ID: {assignedDeliveryBoy._id}).
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={assignedDeliveryBoy ? "col-12 col-lg-3" : "col-12 col-lg-4"}>
                        <div className="panel h-100">
                            <h2 className="h5 mb-3 section-title">
                                <i className="bi bi-box-seam" aria-hidden="true"></i>
                                <span>Product</span>
                            </h2>
                            {product ? (
                                <>
                                    <div className="summary-row"><span>Name</span><span className="fw-semibold text-end">{product.name || "—"}</span></div>
                                    {product.brand && <div className="summary-row"><span>Brand</span><span>{product.brand?.name || product.brand}</span></div>}
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

                    <div className={assignedDeliveryBoy ? "col-12 col-lg-3" : "col-12 col-lg-4"}>
                        <div className="panel h-100">
                            <h2 className="h5 mb-3 section-title">
                                <i className="bi bi-file-earmark-text" aria-hidden="true"></i>
                                <span>Return Summary</span>
                            </h2>
                            <div className="summary-row">
                                <span>Status</span>
                                <span className={`badge ${statusBadgeClass}`}>{label(data.status)}</span>
                            </div>
                            <div className="summary-row"><span>Requested On</span><span>{fmtDate(data.createdAt)}</span></div>
                            <div className="summary-row"><span>Last Updated</span><span>{fmtDate(data.updatedAt)}</span></div>
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
                            {data.refundId && (
                                <>
                                    <hr className="my-2" />
                                    <div className="summary-row"><span>Refunded</span><span className="fw-semibold">₹{data.refundAmount}</span></div>
                                    <div className="summary-row"><span>Refund Status</span><span className="text-capitalize">{data.refundStatus || "—"}</span></div>
                                    <div className="summary-row"><span>Refund On</span><span>{fmtDate(data.refundedAt)}</span></div>
                                    <div className="summary-row">
                                        <span>Refund ID</span>
                                        <span className="small" style={{ wordBreak: "break-all" }}>{data.refundId}</span>
                                    </div>
                                </>
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
                            {evidence && (
                                <div className="mt-3">
                                    <a href={evidence} target="_blank" rel="noreferrer">
                                        <img
                                            src={evidence}
                                            alt="Return evidence"
                                            style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 8, border: "1px solid #dee2e6" }}
                                        />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 1: approve + assign pickup delivery boy */}
                    {canUpdate && (
                        <div className="col-12">
                            <div className="panel">
                                <h2 className="h5 mb-3 section-title">
                                    <i className="bi bi-pencil-square" aria-hidden="true"></i>
                                    <span>{data.status === "approved" ? "Pickup Assignment" : "Update Status"}</span>
                                </h2>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label">Return Status</label>
                                        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                            {allowedStatuses.map((s) => (
                                                <option key={s} value={s}>{label(s)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {status === "approved" && (
                                        <div className="col-md-4">
                                            <label className="form-label">Assign Delivery Boy for Pickup</label>
                                            <select
                                                className={`form-select ${!selectedDeliveryBoy ? "border-warning" : ""}`}
                                                value={selectedDeliveryBoy}
                                                onChange={(e) => setSelectedDeliveryBoy(e.target.value)}
                                            >
                                                <option value="">-- Select Delivery Boy --</option>
                                                {deliveryBoys.map((db) => (
                                                    <option key={db._id} value={db._id}>{db.name} ({db.phone})</option>
                                                ))}
                                            </select>
                                            {!selectedDeliveryBoy && (
                                                <div className="text-warning small mt-1">
                                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                                    Assign a delivery boy to approve this return.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="d-flex justify-content-end mt-4">
                                    <button className="btn btn-primary" onClick={saveChanges} disabled={unchanged || saving}>
                                        {saving ? (
                                            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                        ) : (
                                            <i className="bi bi-check-circle" aria-hidden="true"></i>
                                        )}{" "}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Waiting on the delivery boy */}
                    {(data.status === "approved" || data.status === "picked_up") && (
                        <div className="col-12">
                            <div className="alert alert-info d-flex align-items-center gap-3 mb-0" role="status">
                                <i className="bi bi-truck fs-3"></i>
                                <div>
                                    <div className="fw-bold">
                                        {data.status === "approved" ? "Waiting for pickup" : "Item picked up — on its way to the shop"}
                                    </div>
                                    <div className="small">
                                        The delivery boy updates the status from his screen. You can refund the customer once the item is received at the shop.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: refund the customer, then complete */}
                    {isReceived && (
                        <div className="col-12">
                            <div className="panel">
                                <h2 className="h5 mb-3 section-title">
                                    <i className="bi bi-cash-coin" aria-hidden="true"></i>
                                    <span>Refund Customer</span>
                                </h2>

                                {hasOnlinePayment ? (
                                    <>
                                        <p className="text-muted small">
                                            The customer paid online ({order?.paymentMode || "Razorpay"}). The refund goes back to the
                                            original payment method and the return is completed automatically.
                                        </p>
                                        <div className="row g-3 align-items-end">
                                            <div className="col-md-4">
                                                <label className="form-label">Refund Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="0.01"
                                                    className="form-control"
                                                    value={refundAmount}
                                                    onChange={(e) => setRefundAmount(e.target.value)}
                                                />
                                                {order?.total !== undefined && (
                                                    <div className="form-text">Order total: ₹{order.total}</div>
                                                )}
                                            </div>
                                            <div className="col-md-8">
                                                <div className="d-flex flex-wrap gap-2">
                                                    <button className="btn btn-success" onClick={refundOnline} disabled={refunding || saving}>
                                                        {refunding ? (
                                                            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                                        ) : (
                                                            <i className="bi bi-arrow-counterclockwise me-1" aria-hidden="true"></i>
                                                        )}{" "}
                                                        Refund Online &amp; Complete
                                                    </button>
                                                    <button className="btn btn-outline-secondary" onClick={completeManually} disabled={saving || refunding} title="Complete without calling Razorpay API (if already refunded or gateway limit reached)">
                                                        {saving ? (
                                                            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                                        ) : (
                                                            <i className="bi bi-check-circle me-1" aria-hidden="true"></i>
                                                        )}{" "}
                                                        Mark Completed (Manual)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="alert alert-warning small" role="alert">
                                            <i className="bi bi-info-circle me-2"></i>
                                            No online payment found for this order ({order?.paymentMode || "COD"}), so it can't be refunded
                                            through Razorpay. Refund the customer manually, then complete the return.
                                        </div>
                                        <button className="btn btn-success" onClick={completeManually} disabled={saving}>
                                            {saving ? (
                                                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                            ) : (
                                                <i className="bi bi-check-circle me-1" aria-hidden="true"></i>
                                            )}{" "}
                                            Mark as Refunded &amp; Complete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {isCompleted && (
                        <div className="col-12">
                            <div className="alert alert-success d-flex align-items-center gap-3 mb-0" role="alert">
                                <i className="bi bi-check-circle fs-3"></i>
                                <div>
                                    <div className="fw-bold">Return Completed</div>
                                    <div className="small">
                                        {data.refundId
                                            ? `₹${data.refundAmount} was refunded to the customer and this return is closed.`
                                            : "This return request has been processed and closed."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </section>
            </div>
        </main>
    );
}