import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API = `${process.env.REACT_APP_BACKEND_SERVER}/api`;
const authHeader = (isJson = false) => {
    const headers = { authorization: localStorage.getItem("token") };
    if (isJson) headers["content-type"] = "application/json";
    return headers;
};

const STATUS_STEPS = [
    { key: "pending", label: "Requested", icon: "bi-clipboard-check" },
    { key: "approved", label: "Approved", icon: "bi-hand-thumbs-up" },
    { key: "picked_up", label: "Picked Up", icon: "bi-box-arrow-in-down" },
    { key: "received", label: "Received", icon: "bi-shop" },
    { key: "completed", label: "Refunded", icon: "bi-cash-coin" },
];

// Statuses an admin may pick from the current one (mirrors server rules)
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

// Total for the returned item only, or null if it can't be found
const getItemAmount = (order, product) => {
    const line = order?.products?.find((p) => idOf(p.product) === idOf(product));
    const t = Number(line?.total);
    return Number.isFinite(t) && t > 0 ? t : null;
};

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
                const productTotal = item.itemTotal ?? getItemAmount(item.order, item.product);
                setRefundAmount(
                    item.refundAmount ?? productTotal ?? ""
                );
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
                let res = await fetch(`${API}/deliveryBoy`, { headers: authHeader(false) });
                res = await res.json();
                const list = Array.isArray(res) ? res : res.data || [];
                const filtered = list.filter(
                    (u) => (!u.role || u.role.toLowerCase().includes("delivery")) && u.active !== false
                );
                setDeliveryBoys(filtered);
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

    // PUT /return/:id
    async function putReturn(fields) {
        const body = new FormData();
        Object.entries(fields).forEach(([k, v]) => {
            if (v !== undefined && v !== null) body.append(k, v);
        });
        const r = await fetch(`${API}/return/${data._id}`, {
            method: "PUT",
            headers: authHeader(false),
            body,
        });
        const contentType = r.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return r.json();
        }
        const text = await r.text();
        return { result: "Fail", reason: text || "Server error" };
    }

    // Approve / reject / cancel, and assign or change pickup delivery boy
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
            if (selectedDeliveryBoy) fields.deliveryBoy = selectedDeliveryBoy;
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

    // Dynamically load Razorpay Checkout script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Open Razorpay Checkout modal to execute refund transaction
    const initRefundPayment = (orderData, amt) => {
        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_hPWsSLPsp2DADQ",
            amount: orderData.amount,
            currency: "INR",
            name: "ShopKaro",
            description: `Refund for Return #${data?._id?.slice(-6)?.toUpperCase()}`,
            order_id: orderData.id,
            prefill: {
                name: data?.user?.name || "Customer",
                email: data?.user?.email || "customer@example.com",
                contact: data?.user?.phone || "9999999999",
            },
            handler: async (response) => {
                try {
                    let res = await fetch(`${API}/return/refund/verify`, {
                        method: "POST",
                        headers: authHeader(true),
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            returnId: data._id,
                            amount: amt,
                        }),
                    });
                    res = await res.json();
                    if (res.result === "Done") {
                        flash(`Refund of ₹${amt} completed successfully!`);
                        await loadReturn();
                    } else {
                        setError(reasonText(res, "Refund payment verification failed."));
                    }
                } catch (err) {
                    console.error("Verification error:", err);
                    setError("Failed to verify refund payment.");
                } finally {
                    setRefunding(false);
                }
            },
            modal: {
                ondismiss: () => setRefunding(false),
            },
            theme: { color: "#c9a84c" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    // Online (Razorpay) refund modal flow
    async function refundOnline() {
        const amt = Number(refundAmount);
        if (!amt || amt <= 0) {
            setError("Enter a valid refund amount.");
            return;
        }

        const itemMax = data.itemTotal ?? getItemAmount(data.order, data.product);
        if (itemMax != null && amt > itemMax) {
            setError(`Refund cannot be more than this item's total (₹${itemMax.toFixed(2)}).`);
            return;
        }

        setRefunding(true);
        setError("");
        try {
            const hasSdk = await loadRazorpayScript();
            if (!hasSdk) {
                setError("Failed to load Razorpay SDK. Please check your internet connection.");
                setRefunding(false);
                return;
            }

            let response = await fetch(`${API}/return/refund/order`, {
                method: "POST",
                headers: authHeader(true),
                body: JSON.stringify({ amount: amt, returnId: data._id }),
            });
            response = await response.json();
            if (!response.data) {
                setError(response.message || "Failed to create Razorpay refund order");
                setRefunding(false);
                return;
            }

            initRefundPayment(response.data, amt);
        } catch (e) {
            console.error("Refund error:", e);
            setError("Failed to initiate refund. Please try again.");
            setRefunding(false);
        }
    }

    // Complete return manually (offline refund / COD)
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
            <main className="dashboard-content ars-page">
                <style>{ARS_STYLES}</style>
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
            <main className="dashboard-content ars-page">
                <style>{ARS_STYLES}</style>
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
    const canUpdate = allowedStatuses.length > 1;

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
    const itemAmount = data.itemTotal ?? getItemAmount(order, product);

    // Safely extract brand name (preventing object-as-child runtime crash)
    const brandName = typeof product?.brand === "object"
        ? (product?.brand?.name || "")
        : (typeof product?.brand === "string" ? product?.brand : "");

    // Resolve assigned delivery boy
    const assignedDeliveryBoy = (() => {
        const db = data.deliveryBoy;
        if (!db) return null;
        if (typeof db === "object") return db;
        return deliveryBoys.find((d) => d._id === db) || { _id: db };
    })();

    const unchanged =
        status === data.status &&
        selectedDeliveryBoy === idOf(data.deliveryBoy);

    // Evidence image URL
    const evidence = Array.isArray(data.pics) ? data.pics[0] : data.pics;

    return (
        <main className="dashboard-content ars-page">
            <style>{ARS_STYLES}</style>

            <div className="container-fluid px-2 px-sm-3 px-lg-4 py-3 py-lg-4">
                {/* ── Page Heading ── */}
                <div className="page-heading mb-3 mb-md-4 d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div className="page-heading-copy">
                        <span className="page-icon">
                            <i className="bi bi-arrow-return-left" aria-hidden="true"></i>
                        </span>
                        <div>
                            <p className="eyebrow mb-1">Return Management</p>
                            <h1 className="h4 mb-0 fw-bold">Return Details</h1>
                            <p className="text-muted mb-0 small font-monospace">ID: #{data._id}</p>
                        </div>
                    </div>
                    <div className="heading-actions d-flex flex-wrap gap-2 align-items-center">
                        <span className={`badge ${statusBadgeClass} py-2 px-3 rounded-pill`}>{label(data.status)}</span>
                        <Link className="btn btn-outline-secondary btn-sm rounded-pill px-3" to="/return">
                            <i className="bi bi-arrow-left me-1" aria-hidden="true"></i> Back to Returns
                        </Link>
                    </div>
                </div>

                {message && (
                    <div className="alert alert-success d-flex align-items-center gap-2 mb-3" role="alert">
                        <i className="bi bi-check-circle-fill fs-5"></i>
                        <span>{message}</span>
                    </div>
                )}
                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
                        <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                        <span>{error}</span>
                    </div>
                )}

                <section className="row g-3">
                    {/* ── Return Progress Stepper ── */}
                    {!isTerminalNegative && (
                        <div className="col-12">
                            <div className="panel">
                                <h2 className="h6 mb-3 section-title">
                                    <i className="bi bi-signpost-split text-primary" aria-hidden="true"></i>
                                    <span>Return Lifecycle Progress</span>
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
                                    <div className="small">This return request was rejected and cannot be modified.</div>
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
                                    <div className="small">This return request was cancelled by the customer or admin.</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Card 1: Customer Details ── */}
                    <div className={assignedDeliveryBoy ? "col-12 col-md-6 col-lg-3" : "col-12 col-md-6 col-lg-4"}>
                        <div className="panel h-100">
                            <h2 className="h6 mb-3 section-title">
                                <i className="bi bi-person text-primary" aria-hidden="true"></i>
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
                                        <i className={`bi ${icon} text-primary flex-shrink-0`}></i>
                                        <span className="text-truncate">{val}</span>
                                    </div>
                                ))}
                                {!data.user && <div className="text-muted small">Customer details unavailable.</div>}
                            </div>
                        </div>
                    </div>

                    {/* ── Card 2: Pickup Delivery Boy ── */}
                    {assignedDeliveryBoy && (
                        <div className="col-12 col-md-6 col-lg-3">
                            <div className="panel h-100">
                                <h2 className="h6 mb-3 section-title">
                                    <i className="bi bi-truck text-primary" aria-hidden="true"></i>
                                    <span>Pickup Delivery Boy</span>
                                </h2>
                                <div className="d-flex flex-column gap-2">
                                    {[
                                        { icon: "bi-person", val: assignedDeliveryBoy.name },
                                        { icon: "bi-telephone", val: assignedDeliveryBoy.phone },
                                        { icon: "bi-envelope", val: assignedDeliveryBoy.email },
                                    ].filter((r) => r.val).map(({ icon, val }) => (
                                        <div key={icon} className="detail-row">
                                            <i className={`bi ${icon} text-primary flex-shrink-0`}></i>
                                            <span className="text-truncate">{val}</span>
                                        </div>
                                    ))}
                                    {!assignedDeliveryBoy.name && (
                                        <div className="text-muted small">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Assigned (ID: {assignedDeliveryBoy._id}).
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Card 3: Product Details ── */}
                    <div className={assignedDeliveryBoy ? "col-12 col-md-6 col-lg-3" : "col-12 col-md-6 col-lg-4"}>
                        <div className="panel h-100">
                            <h2 className="h6 mb-3 section-title">
                                <i className="bi bi-box-seam text-primary" aria-hidden="true"></i>
                                <span>Product</span>
                            </h2>
                            {product ? (
                                <>
                                    <div className="summary-row">
                                        <span>Name</span>
                                        <span className="fw-semibold text-end text-truncate ms-2" style={{ maxWidth: 160 }}>
                                            {product.name || "—"}
                                        </span>
                                    </div>
                                    {itemAmount != null && (
                                        <div className="summary-row">
                                            <span>Item Total</span>
                                            <span className="fw-semibold text-success">₹{itemAmount}</span>
                                        </div>
                                    )}
                                    {brandName && (
                                        <div className="summary-row">
                                            <span>Brand</span>
                                            <span className="fw-semibold">{brandName}</span>
                                        </div>
                                    )}
                                    {product.discount !== undefined && product.discount !== null && (
                                        <div className="summary-row">
                                            <span>Discount</span>
                                            <span>{product.discount}%</span>
                                        </div>
                                    )}
                                    {product.variants?.length > 0 && (
                                        <div className="summary-row">
                                            <span>Variants</span>
                                            <span>{product.variants.length} available</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-muted small">Product details unavailable.</div>
                            )}
                        </div>
                    </div>

                    {/* ── Card 4: Return Summary ── */}
                    <div className={assignedDeliveryBoy ? "col-12 col-md-6 col-lg-3" : "col-12 col-md-6 col-lg-4"}>
                        <div className="panel h-100">
                            <h2 className="h6 mb-3 section-title">
                                <i className="bi bi-file-earmark-text text-primary" aria-hidden="true"></i>
                                <span>Return Summary</span>
                            </h2>
                            <div className="summary-row">
                                <span>Status</span>
                                <span className={`badge ${statusBadgeClass}`}>{label(data.status)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Requested On</span>
                                <span>{fmtDate(data.createdAt)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Last Updated</span>
                                <span>{fmtDate(data.updatedAt)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Order ID</span>
                                <span className="small font-monospace text-truncate ms-2" style={{ maxWidth: 140 }}>
                                    #{order?._id || (typeof order === "string" ? order : "—")}
                                </span>
                            </div>
                            {itemAmount != null ? (
                                <>
                                    <div className="summary-row">
                                        <span>Item Total</span>
                                        <span className="fw-semibold text-success">₹{itemAmount}</span>
                                    </div>
                                    {order?.total !== undefined && (
                                        <div className="summary-row text-muted small">
                                            <span>Full Order Total</span>
                                            <span>₹{order.total}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                order?.total !== undefined && (
                                    <div className="summary-row">
                                        <span>Order Total</span>
                                        <span>₹{order.total}</span>
                                    </div>
                                )
                            )}
                            {order?.paymentMode && (
                                <div className="summary-row">
                                    <span>Payment Mode</span>
                                    <span className="fw-semibold">{order.paymentMode}</span>
                                </div>
                            )}
                            {(data.refundId || data.refundStatus) && (
                                <>
                                    {data.refundAmount != null && (
                                        <div className="summary-row">
                                            <span>Refunded</span>
                                            <span className="fw-bold text-success">₹{data.refundAmount}</span>
                                        </div>
                                    )}
                                    <div className="summary-row">
                                        <span>Refund Status</span>
                                        <span className="text-capitalize fw-semibold">{data.refundStatus || "—"}</span>
                                    </div>
                                    {data.refundedAt && (
                                        <div className="summary-row">
                                            <span>Refunded On</span>
                                            <span>{fmtDate(data.refundedAt)}</span>
                                        </div>
                                    )}
                                    <div className="summary-row">
                                        <span>Refund Ref ID</span>
                                        <span className="small font-monospace text-truncate ms-2" style={{ maxWidth: 140 }}>
                                            {data.refundId || "Manual / Offline"}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Return Reason & Evidence ── */}
                    <div className="col-12">
                        <div className="panel">
                            <h2 className="h6 mb-3 section-title">
                                <i className="bi bi-chat-left-text text-primary" aria-hidden="true"></i>
                                <span>Customer Return Reason &amp; Evidence</span>
                            </h2>
                            <div className="reason-box">{data.reason || "—"}</div>
                            {evidence && (
                                <div className="mt-3">
                                    <p className="text-muted small mb-2">Attached Photo Proof:</p>
                                    <a href={evidence} target="_blank" rel="noreferrer">
                                        <img
                                            src={evidence}
                                            alt="Return evidence"
                                            className="img-thumbnail"
                                            style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 8 }}
                                        />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Action Panel 1: Approve / Reject & Assign Delivery Partner ── */}
                    {canUpdate && (
                        <div className="col-12">
                            <div className="panel">
                                <h2 className="h6 mb-3 section-title">
                                    <i className="bi bi-pencil-square text-primary" aria-hidden="true"></i>
                                    <span>{data.status === "approved" ? "Pickup Assignment" : "Update Return Status"}</span>
                                </h2>
                                <div className="row g-3 align-items-end">
                                    <div className="col-12 col-md-4">
                                        <label className="form-label small fw-semibold">Return Status</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            {allowedStatuses.map((s) => (
                                                <option key={s} value={s}>{label(s)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {(status === "approved" || data.status === "pending" || data.status === "approved") && (
                                        <div className="col-12 col-md-5">
                                            <label className="form-label small fw-semibold">
                                                Assign Delivery Boy for Customer Pickup
                                            </label>
                                            <select
                                                className={`form-select form-select-sm ${
                                                    status === "approved" && !selectedDeliveryBoy ? "border-warning" : ""
                                                }`}
                                                value={selectedDeliveryBoy}
                                                onChange={(e) => setSelectedDeliveryBoy(e.target.value)}
                                            >
                                                <option value="">-- Select Delivery Boy --</option>
                                                {deliveryBoys.map((db) => (
                                                    <option key={db._id} value={db._id}>
                                                        {db.name} ({db.phone})
                                                    </option>
                                                ))}
                                            </select>
                                            {status === "approved" && !selectedDeliveryBoy && (
                                                <div className="text-warning small mt-1">
                                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                                    Assign a delivery boy to approve this return.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="col-12 col-md-3 text-md-end">
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm px-4 rounded-pill w-100 w-md-auto"
                                            onClick={saveChanges}
                                            disabled={unchanged || saving}
                                        >
                                            {saving ? (
                                                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                            ) : (
                                                <i className="bi bi-check-circle me-1" aria-hidden="true"></i>
                                            )}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Waiting on Delivery Partner */}
                    {(data.status === "approved" || data.status === "picked_up") && (
                        <div className="col-12">
                            <div className="alert alert-info d-flex align-items-center gap-3 mb-0" role="status">
                                <i className="bi bi-truck fs-3"></i>
                                <div>
                                    <div className="fw-bold">
                                        {data.status === "approved"
                                            ? "Awaiting Pickup from Customer"
                                            : "Item in Transit — On its way to the Merchant Shop"}
                                    </div>
                                    <div className="small">
                                        The delivery partner updates the pickup and dropoff status. You can refund the customer once the item is confirmed received at the shop.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Action Panel 2: Process Refund ── */}
                    {isReceived && (
                        <div className="col-12">
                            <div className="panel">
                                <h2 className="h6 mb-3 section-title">
                                    <i className="bi bi-cash-coin text-primary" aria-hidden="true"></i>
                                    <span>Process Customer Refund</span>
                                </h2>

                                {hasOnlinePayment ? (
                                    <>
                                        <p className="text-muted small mb-3">
                                            The customer paid online ({order?.paymentMode || "Razorpay"}). Refund directly to customer's account in <strong>ONE single transaction</strong>.
                                        </p>

                                        {/* 4-Card Payment Reconciliation Dashboard */}
                                        <div className="row g-2 mb-3">
                                            <div className="col-6 col-md-3">
                                                <div className="ars-stat-card">
                                                    <div className="label">Product Eligible Total</div>
                                                    <div className="val text-primary">₹{(itemAmount ?? 0).toFixed(2)}</div>
                                                </div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <div className="ars-stat-card">
                                                    <div className="label">Original Order Payment</div>
                                                    <div className="val">
                                                        ₹{Number(data.paymentDetails?.originalAmount ?? order?.total ?? 0).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <div className="ars-stat-card">
                                                    <div className="label">Already Refunded</div>
                                                    <div className="val text-danger">
                                                        ₹{Number(data.paymentDetails?.alreadyRefunded ?? 0).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <div className="ars-stat-card">
                                                    <div className="label">Razorpay Remaining</div>
                                                    <div
                                                        className={`val ${
                                                            (data.paymentDetails?.remainingRefundable ?? data.maxRefundable ?? 0) < (itemAmount ?? 0)
                                                                ? "text-danger"
                                                                : "text-success"
                                                        }`}
                                                    >
                                                        ₹{Number(data.paymentDetails?.remainingRefundable ?? data.maxRefundable ?? 0).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Warning Banner if Gateway balance is constrained */}
                                        {(data.paymentDetails?.remainingRefundable ?? data.maxRefundable ?? 0) < (itemAmount ?? 0) && (
                                            <div className="alert alert-warning small mb-3" role="alert">
                                                <div className="fw-bold mb-1">
                                                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                    Insufficient Razorpay Balance for Full Product Refund
                                                </div>
                                                <div>
                                                    The eligible product refund is <strong>₹{(itemAmount ?? 0).toFixed(2)}</strong>, but only <strong>₹{Number(data.paymentDetails?.remainingRefundable ?? data.maxRefundable ?? 0).toFixed(2)}</strong> remains unrefunded on Razorpay payment <code>{order?.rppid}</code> because <strong>₹{Number(data.paymentDetails?.alreadyRefunded ?? 0).toFixed(2)}</strong> was already refunded across previous transactions.
                                                </div>
                                                <div className="mt-2">
                                                    Razorpay gateway strictly rejects any single refund exceeding the remaining balance. To resolve:
                                                    <ul className="mb-0 mt-1">
                                                        <li>Use <strong>Mark Completed (Manual)</strong> below if the customer has been refunded offline/out-of-band.</li>
                                                        <li>Or refund the available <strong>₹{Number(data.paymentDetails?.remainingRefundable ?? data.maxRefundable ?? 0).toFixed(2)}</strong> via Razorpay and the remainder manually.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        <div className="row g-3 align-items-end">
                                            <div className="col-12 col-md-4">
                                                <label className="form-label small fw-semibold">Refund Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="0.01"
                                                    className="form-control form-control-sm"
                                                    value={refundAmount}
                                                    onChange={(e) => setRefundAmount(e.target.value)}
                                                />
                                                <div className="form-text small">
                                                    Eligible item total: ₹{itemAmount != null ? itemAmount.toFixed(2) : "—"}
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-8">
                                                <div className="d-flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-success btn-sm rounded-pill px-3 py-2 fw-semibold"
                                                        onClick={refundOnline}
                                                        disabled={refunding || saving || !refundAmount || Number(refundAmount) <= 0}
                                                    >
                                                        {refunding ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                                                Opening Razorpay...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bi bi-credit-card me-1" aria-hidden="true"></i>
                                                                Pay Refund (Razorpay Checkout)
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2 fw-semibold"
                                                        onClick={completeManually}
                                                        disabled={saving || refunding}
                                                        title="Complete without calling Razorpay API"
                                                    >
                                                        {saving ? (
                                                            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                                        ) : (
                                                            <i className="bi bi-check-circle me-1" aria-hidden="true"></i>
                                                        )}
                                                        Mark Completed (Manual)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="alert alert-warning small mb-3" role="alert">
                                            <i className="bi bi-info-circle me-2"></i>
                                            No online payment found for this order ({order?.paymentMode || "COD"}), so it cannot be refunded through Razorpay. Refund the customer offline/manually{itemAmount != null ? ` (eligible item total: ₹${itemAmount})` : ""}, then close the return request.
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-success btn-sm rounded-pill px-4 py-2 fw-semibold"
                                            onClick={completeManually}
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                            ) : (
                                                <i className="bi bi-check-circle me-1" aria-hidden="true"></i>
                                            )}
                                            Mark as Refunded &amp; Complete Return
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Completed Banner */}
                    {isCompleted && (
                        <div className="col-12">
                            <div className="alert alert-success d-flex align-items-center gap-3 mb-0" role="alert">
                                <i className="bi bi-check-circle fs-3"></i>
                                <div>
                                    <div className="fw-bold">Return Process Completed</div>
                                    <div className="small">
                                        {data.refundId
                                            ? `₹${data.refundAmount} was refunded to the customer and this return request is closed.`
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

// ── Theme Responsive CSS Styles ──────────────────────────────────────────────

const ARS_STYLES = `
/* ── Light Mode Tokens ── */
.ars-page {
  --ars-bg:             #F8FAFC;
  --ars-surface:        #FFFFFF;
  --ars-surface-muted:  #F8FAFC;
  --ars-border:         #E2E8F0;
  --ars-text:           #0F172A;
  --ars-text-muted:     #64748B;
  --ars-primary:        #0284C7;
  --ars-primary-soft:   #E0F2FE;
  --ars-success:        #059669;
  --ars-success-soft:   #D1FAE5;
  --ars-warning:        #D97706;
  --ars-warning-soft:   #FEF3C7;
  --ars-danger:         #DC2626;
  --ars-danger-soft:    #FEE2E2;
  --ars-card-shadow:    0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03);
  color: var(--ars-text);
  min-height: 100vh;
}

/* ── Dark Mode Tokens (Supports both data-bs-theme and prefers-color-scheme) ── */
[data-bs-theme="dark"] .ars-page,
[data-theme="dark"] .ars-page,
body.dark .ars-page {
  --ars-bg:             #0B1120;
  --ars-surface:        #1E293B;
  --ars-surface-muted:  #0F172A;
  --ars-border:         #334155;
  --ars-text:           #F8FAFC;
  --ars-text-muted:     #94A3B8;
  --ars-primary:        #38BDF8;
  --ars-primary-soft:   #0C4A6E;
  --ars-success:        #34D399;
  --ars-success-soft:   #064E3B;
  --ars-warning:        #FBBF24;
  --ars-warning-soft:   #451A03;
  --ars-danger:         #F87171;
  --ars-danger-soft:    #450A0A;
  --ars-card-shadow:    0 2px 8px rgba(0,0,0,0.4);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-bs-theme="light"]) .ars-page {
    --ars-bg:             #0B1120;
    --ars-surface:        #1E293B;
    --ars-surface-muted:  #0F172A;
    --ars-border:         #334155;
    --ars-text:           #F8FAFC;
    --ars-text-muted:     #94A3B8;
    --ars-primary:        #38BDF8;
    --ars-primary-soft:   #0C4A6E;
    --ars-success:        #34D399;
    --ars-success-soft:   #064E3B;
    --ars-warning:        #FBBF24;
    --ars-warning-soft:   #451A03;
    --ars-danger:         #F87171;
    --ars-danger-soft:    #450A0A;
    --ars-card-shadow:    0 2px 8px rgba(0,0,0,0.4);
  }
}

/* ── Panels ── */
.ars-page .panel {
  background: var(--ars-surface);
  border: 1px solid var(--ars-border);
  color: var(--ars-text);
  border-radius: 14px;
  box-shadow: var(--ars-card-shadow);
  padding: 18px;
}
@media (min-width: 768px) {
  .ars-page .panel { padding: 22px; }
}

.ars-page .section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ars-text);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .03em;
  font-size: 13px;
}

/* ── Progress Stepper ── */
.order-progress-row {
  display: flex;
  align-items: center;
  padding: 1rem 0.25rem;
  gap: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.order-progress-row::-webkit-scrollbar { display: none; }
.order-progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 78px;
  flex-shrink: 0;
}
@media (min-width: 768px) {
  .order-progress-step { min-width: 90px; }
}
.order-progress-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--ars-surface-muted);
  border: 2px solid var(--ars-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  color: var(--ars-text-muted);
  transition: all .25s ease;
}
.order-progress-circle.done {
  background: var(--ars-success-soft);
  border-color: var(--ars-success);
  color: var(--ars-success);
}
.order-progress-circle.active {
  background: var(--ars-primary);
  border-color: var(--ars-primary);
  color: #fff;
  box-shadow: 0 0 0 4px var(--ars-primary-soft);
}
.order-progress-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--ars-text-muted);
  text-align: center;
}
.order-progress-label.visible {
  color: var(--ars-text);
  font-weight: 700;
}
.order-progress-line {
  flex: 1;
  height: 2px;
  background: var(--ars-border);
  margin-bottom: 24px;
  min-width: 16px;
}
.order-progress-line.done {
  background: var(--ars-success);
}

/* ── Rows ── */
.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13.5px;
  color: var(--ars-text);
}
.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 0.45rem 0;
  font-size: 13.5px;
  color: var(--ars-text);
  border-bottom: 1px dashed var(--ars-border);
}
.summary-row:last-of-type { border-bottom: none; }
.summary-row > span:first-child {
  color: var(--ars-text-muted);
  flex-shrink: 0;
}

/* ── Reason Box ── */
.reason-box {
  background: var(--ars-surface-muted);
  border: 1px solid var(--ars-border);
  border-radius: 10px;
  padding: 14px;
  font-size: 13.5px;
  color: var(--ars-text);
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

/* ── Reconciliation Cards ── */
.ars-stat-card {
  background: var(--ars-surface-muted);
  border: 1px solid var(--ars-border);
  border-radius: 12px;
  padding: 12px 14px;
  height: 100%;
}
.ars-stat-card .label {
  color: var(--ars-text-muted);
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.ars-stat-card .val {
  color: var(--ars-text);
  font-size: 16px;
  font-weight: 800;
  margin-top: 4px;
}

/* ── Dark mode input / select adjustments ── */
[data-bs-theme="dark"] .ars-page .form-control,
[data-bs-theme="dark"] .ars-page .form-select,
[data-theme="dark"] .ars-page .form-control,
[data-theme="dark"] .ars-page .form-select,
body.dark .ars-page .form-control,
body.dark .ars-page .form-select {
  background-color: var(--ars-surface-muted);
  border-color: var(--ars-border);
  color: var(--ars-text);
}
[data-bs-theme="dark"] .ars-page .form-control:focus,
[data-bs-theme="dark"] .ars-page .form-select:focus,
[data-theme="dark"] .ars-page .form-control:focus,
[data-theme="dark"] .ars-page .form-select:focus,
body.dark .ars-page .form-control:focus,
body.dark .ars-page .form-select:focus {
  background-color: var(--ars-surface);
  border-color: var(--ars-primary);
  color: var(--ars-text);
}
`;
