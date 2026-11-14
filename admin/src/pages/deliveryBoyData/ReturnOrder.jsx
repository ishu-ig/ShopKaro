import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
    getReturn,
    updateReturn,
} from "../../Redux/ActionCreators/ReturnActionCreators";

// Return flow statuses (matching backend):
//   approved   → delivery boy goes to the customer      (step 1: pickup)
//   picked_up  → item collected, heading to the shop    (step 2: dropoff)
//   received   → item handed over / received at shop    (step 3: completed by delivery boy)
//   completed  → admin processed refund

const STATUS_LABEL = {
    pending:    "Pending Approval",
    approved:   "Ready for Pickup",
    picked_up:  "Picked Up",
    received:   "Received at Shop",
    completed:  "Completed",
    rejected:   "Rejected",
    cancelled:  "Cancelled",
};

const STATUS_BADGE = {
    pending:    "dc-badge-warn",
    approved:   "dc-badge-warn",
    picked_up:  "dc-badge-info",
    received:   "dc-badge-success",
    completed:  "dc-badge-success",
    rejected:   "dc-badge-danger",
    cancelled:  "dc-badge-danger",
};

const VISIBLE_STATUSES  = ["approved", "picked_up", "received", "completed"];
const ACTIVE_STATUSES   = ["approved", "picked_up"];
const REDIRECT_AFTER_SECONDS = 5;
const STEPS = ["Pickup from Customer", "Picked Up", "Received at Shop"];

// ── helpers ──────────────────────────────────────────────────────────────────

function unwrap(slice) {
    if (!slice) return [];
    if (Array.isArray(slice)) return slice;
    if (Array.isArray(slice.data)) return slice.data;
    return [];
}

function idOf(ref) {
    return ref?._id?.toString?.() ?? ref?.toString?.() ?? "";
}

function getUserAddress(user) {
    if (!user) return "";
    const a = user.defaultAddress || user;
    return [a.address, a.city, a.state, a.pin].filter(Boolean).join(", ");
}

function getShopAddress(shop) {
    if (!shop) return "";
    return (
        shop.address ||
        [shop.city, shop.state, shop.pin].filter(Boolean).join(", ") ||
        ""
    );
}

function getStepIndex(status) {
    if (status === "picked_up")                          return 1;
    if (status === "received" || status === "completed") return 3;
    return 0;
}

function mapsHref(addr) {
    return addr
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`
        : null;
}

function fmtDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

function fmtMoney(n) {
    if (n == null) return "—";
    return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function formatVariant(v) {
    if (!v) return null;
    if (typeof v === "string") return v;
    if (typeof v === "object") {
        const parts = [v.color, v.size, v.storage].filter(Boolean);
        if (parts.length > 0) return parts.join(" / ");
        if (v.sku) return `SKU: ${v.sku}`;
        return "Standard";
    }
    return String(v);
}

// ── main component ───────────────────────────────────────────────────────────

export default function ReturnOrder() {
    const { _id, returnId: returnIdParam } = useParams();
    const navigate   = useNavigate();
    const dispatch   = useDispatch();
    const ReturnStateData = useSelector((s) => s.ReturnStateData);

    // Selected return id (for detail view)
    const [selectedId, setSelectedId] = useState(returnIdParam ?? null);

    // Filter and search state for list view
    const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "approved" | "picked_up" | "completed"
    const [searchQuery, setSearchQuery] = useState("");

    // Action panel state
    const [localStatus, setLocalStatus] = useState(null);
    const [confirmed,   setConfirmed]   = useState(false);
    const [saving,      setSaving]      = useState(false);
    const [error,       setError]       = useState("");
    const [redirectIn,  setRedirectIn]  = useState(null);

    const myId = _id || localStorage.getItem("userid") || "";
    const backHref = `/deliveryBoy/${myId}/return`;

    // Fetch returns on mount
    useEffect(() => {
        dispatch(getReturn());
    }, [dispatch]);

    // Sync selectedId with URL param
    useEffect(() => {
        setSelectedId(returnIdParam ?? null);
    }, [returnIdParam]);

    // Countdown redirect after marking "received"
    useEffect(() => {
        if (redirectIn === null) return;
        if (redirectIn <= 0) {
            setSelectedId(null);
            navigate(backHref);
            return;
        }
        const t = setTimeout(() => setRedirectIn((n) => n - 1), 1000);
        return () => clearTimeout(t);
    }, [redirectIn, backHref, navigate]);

    // Derived returns list
    const allReturns = unwrap(ReturnStateData);

    const myReturns = useMemo(() =>
        allReturns
            .filter((r) => idOf(r.deliveryBoy) === myId && VISIBLE_STATUSES.includes(r.status))
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)),
        [allReturns, myId]
    );

    // Filtered returns based on filter tabs & search
    const filteredReturns = useMemo(() => {
        return myReturns.filter((r) => {
            // Status tab filter
            if (statusFilter === "active") {
                if (!ACTIVE_STATUSES.includes(r.status)) return false;
            } else if (statusFilter === "approved") {
                if (r.status !== "approved") return false;
            } else if (statusFilter === "picked_up") {
                if (r.status !== "picked_up") return false;
            } else if (statusFilter === "completed") {
                if (r.status !== "received" && r.status !== "completed") return false;
            }

            // Search query filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const returnIdMatch = r._id?.toLowerCase().includes(q);
                const orderIdMatch = (r.order?._id || r.order)?.toString().toLowerCase().includes(q);
                const productNameMatch = r.product?.name?.toLowerCase().includes(q);
                const customerNameMatch = (r.user?.name || r.user?.username)?.toLowerCase().includes(q);
                const shopNameMatch = r.product?.shop?.name?.toLowerCase().includes(q);
                return returnIdMatch || orderIdMatch || productNameMatch || customerNameMatch || shopNameMatch;
            }

            return true;
        });
    }, [myReturns, statusFilter, searchQuery]);

    const activeReturn = useMemo(() => {
        if (!selectedId) return null;
        return myReturns.find((r) => r._id === selectedId || r._id?.toString() === selectedId) ?? null;
    }, [myReturns, selectedId]);

    // Reset local state when active return changes
    useEffect(() => {
        setLocalStatus(null);
        setConfirmed(false);
        setError("");
        setRedirectIn(null);
    }, [activeReturn?._id]);

    useEffect(() => {
        setLocalStatus(null);
    }, [activeReturn?.status]);

    // Status change action
    async function changeStatus(next) {
        if (!activeReturn || saving) return;
        setSaving(true);
        setError("");
        try {
            await dispatch(updateReturn({ _id: activeReturn._id, status: next }));
            setLocalStatus(next);
            setConfirmed(false);
            setTimeout(() => dispatch(getReturn()), 500);
            if (next === "received") {
                setRedirectIn(REDIRECT_AFTER_SECONDS);
            }
        } catch (err) {
            console.error(err);
            setError("Couldn't update return status. Please check your connection and try again.");
        } finally {
            setSaving(false);
        }
    }

    function openDetail(id) {
        setSelectedId(id);
        navigate(`/deliveryBoy/${myId}/return/${id}`);
    }

    function goBackToList() {
        setSelectedId(null);
        navigate(backHref);
    }

    // Counts for stat tabs
    const totalCount = myReturns.length;
    const activeCount = myReturns.filter((r) => ACTIVE_STATUSES.includes(r.status)).length;
    const readyPickupCount = myReturns.filter((r) => r.status === "approved").length;
    const pickedUpCount = myReturns.filter((r) => r.status === "picked_up").length;
    const completedCount = myReturns.filter((r) => r.status === "received" || r.status === "completed").length;

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER: DETAIL VIEW
    // ─────────────────────────────────────────────────────────────────────────
    if (selectedId) {
        if (!activeReturn) {
            return (
                <main className="dashboard-content dc-page">
                    <style>{DC_STYLES}</style>
                    <div className="container-fluid px-2 px-sm-3 px-lg-4 py-3 py-lg-4">
                        <PageHeader onBack={goBackToList} subtitle="Return Not Found" />
                        <div className="dc-panel text-center py-5">
                            <span className="dc-empty-icon">
                                <i className="bi bi-box-seam" aria-hidden="true" />
                            </span>
                            <h2 className="h5 mt-3 mb-1">Return Request Not Found</h2>
                            <p className="dc-muted mb-3 small">
                                This return is either not assigned to your account or is not currently active for pickup.
                            </p>
                            <button type="button" className="btn dc-btn-primary btn-sm" onClick={goBackToList}>
                                <i className="bi bi-arrow-left me-1"></i> Back to Assigned Returns
                            </button>
                        </div>
                    </div>
                </main>
            );
        }

        return (
            <DetailView
                key={activeReturn._id}
                ret={activeReturn}
                localStatus={localStatus}
                confirmed={confirmed}
                setConfirmed={setConfirmed}
                saving={saving}
                error={error}
                redirectIn={redirectIn}
                onChangeStatus={changeStatus}
                onBack={goBackToList}
            />
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER: LIST VIEW
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <main className="dashboard-content dc-page">
            <style>{DC_STYLES}</style>
            <div className="container-fluid px-2 px-sm-3 px-lg-4 py-3 py-lg-4">
                {/* ── Page Header ── */}
                <div className="dc-header">
                    <div className="d-flex align-items-center gap-3">
                        <span className="dc-page-icon">
                            <i className="bi bi-arrow-return-left" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="eyebrow mb-0 dc-eyebrow">Delivery Partner</p>
                            <h1 className="h4 mb-0 dc-title">Assigned Return Pickups</h1>
                            <p className="dc-muted mb-0 small">
                                Collect returned items from customers and deliver them back to the merchant shops.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Summary Stats: Responsive Grid (3 cards) ── */}
                <section className="dc-stats-grid" aria-label="Returns summary">
                    <div className="dc-stat-card">
                        <div className="dc-stat-icon-wrap">
                            <i className="bi bi-arrow-return-left dc-stat-icon"></i>
                        </div>
                        <div className="dc-stat-body">
                            <div className="dc-stat-num">{totalCount}</div>
                            <div className="dc-stat-label">Total Assigned</div>
                        </div>
                    </div>

                    <div className="dc-stat-card dc-stat-warn">
                        <div className="dc-stat-icon-wrap">
                            <i className="bi bi-clock-history dc-stat-icon"></i>
                        </div>
                        <div className="dc-stat-body">
                            <div className="dc-stat-num">{activeCount}</div>
                            <div className="dc-stat-label">Pending Action</div>
                        </div>
                    </div>

                    <div className="dc-stat-card dc-stat-success">
                        <div className="dc-stat-icon-wrap">
                            <i className="bi bi-check2-circle dc-stat-icon"></i>
                        </div>
                        <div className="dc-stat-body">
                            <div className="dc-stat-num">{completedCount}</div>
                            <div className="dc-stat-label">Delivered to Shop</div>
                        </div>
                    </div>
                </section>

                {/* ── Filter Tabs & Search Bar (Responsive flex/stack) ── */}
                <div className="dc-toolbar">
                    <div className="dc-pill-group" role="tablist" aria-label="Status filters">
                        <button
                            type="button"
                            className={`dc-pill ${statusFilter === "all" ? "is-active" : ""}`}
                            onClick={() => setStatusFilter("all")}
                        >
                            All ({totalCount})
                        </button>
                        <button
                            type="button"
                            className={`dc-pill ${statusFilter === "approved" ? "is-active pill-warn" : ""}`}
                            onClick={() => setStatusFilter("approved")}
                        >
                            Pickup Ready ({readyPickupCount})
                        </button>
                        <button
                            type="button"
                            className={`dc-pill ${statusFilter === "picked_up" ? "is-active pill-info" : ""}`}
                            onClick={() => setStatusFilter("picked_up")}
                        >
                            In Transit ({pickedUpCount})
                        </button>
                        <button
                            type="button"
                            className={`dc-pill ${statusFilter === "completed" ? "is-active pill-success" : ""}`}
                            onClick={() => setStatusFilter("completed")}
                        >
                            Received ({completedCount})
                        </button>
                    </div>

                    <div className="dc-search-wrap">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-transparent border-end-0">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search customer, order, product..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear search"
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Empty State ── */}
                {filteredReturns.length === 0 && (
                    <div className="dc-panel text-center py-5">
                        <span className="dc-empty-icon">
                            <i className="bi bi-inbox" aria-hidden="true" />
                        </span>
                        <h2 className="h5 mt-3 mb-1">
                            {searchQuery ? "No Matching Returns" : "No Returns in This Category"}
                        </h2>
                        <p className="dc-muted mb-3 small">
                            {searchQuery
                                ? `No returns match "${searchQuery}". Try a different keyword.`
                                : "You don't have any return tasks in this status."}
                        </p>
                        {searchQuery && (
                            <button
                                type="button"
                                className="btn dc-btn-ghost btn-sm"
                                onClick={() => setSearchQuery("")}
                            >
                                Clear Search Filter
                            </button>
                        )}
                    </div>
                )}

                {/* ── Return Cards Grid: 1 col on Phone, 2 cols on Tablet, 3 cols on Laptop ── */}
                {filteredReturns.length > 0 && (
                    <div className="dc-cards-grid">
                        {filteredReturns.map((ret) => (
                            <ReturnCard
                                key={ret._id}
                                ret={ret}
                                onClick={() => openDetail(ret._id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

// ── ReturnCard (Accessible, responsive card component) ────────────────────────

function ReturnCard({ ret, onClick }) {
    const product    = ret.product;
    const customer   = ret.user;
    const shop       = product?.shop;
    const status     = ret.status;
    const isActive   = ACTIVE_STATUSES.includes(status);
    const variantStr = formatVariant(ret.variant);
    const orderId    = ((ret.order?._id || ret.order)?.toString() || "").slice(-6).toUpperCase();

    return (
        <div
            role="button"
            tabIndex={0}
            className={`dc-return-card ${isActive ? "dc-return-card--active" : ""}`}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            {/* Header: ID, Date, Status */}
            <div className="dc-rc-header">
                <div className="dc-rc-avatar">
                    <i className="bi bi-box-seam" aria-hidden="true" />
                </div>
                <div className="dc-rc-meta">
                    <div className="dc-rc-id">Return #{ret._id?.slice(-6)?.toUpperCase()}</div>
                    <div className="dc-rc-date">
                        <i className="bi bi-calendar3 me-1"></i>
                        {fmtDate(ret.createdAt)}
                    </div>
                </div>
                <span className={`badge dc-badge ${STATUS_BADGE[status] ?? "dc-badge-info"}`}>
                    {STATUS_LABEL[status] ?? status}
                </span>
            </div>

            <div className="dc-rc-divider" />

            {/* Product details */}
            <div className="dc-rc-row">
                <i className="bi bi-bag-check dc-rc-row-icon" />
                <span className="dc-rc-row-label">Product</span>
                <span className="dc-rc-row-val fw-bold">{product?.name || "—"}</span>
            </div>

            {/* Variant (if any) */}
            {variantStr && (
                <div className="dc-rc-row">
                    <i className="bi bi-layers dc-rc-row-icon" />
                    <span className="dc-rc-row-label">Variant</span>
                    <span className="dc-rc-row-val">{variantStr}</span>
                </div>
            )}

            {/* Customer name */}
            <div className="dc-rc-row">
                <i className="bi bi-person dc-rc-row-icon" />
                <span className="dc-rc-row-label">Customer</span>
                <span className="dc-rc-row-val">{customer?.name || customer?.username || "—"}</span>
            </div>

            {/* Shop name */}
            {shop?.name && (
                <div className="dc-rc-row">
                    <i className="bi bi-shop dc-rc-row-icon" />
                    <span className="dc-rc-row-label">Merchant</span>
                    <span className="dc-rc-row-val">{shop.name}</span>
                </div>
            )}

            {/* Order # and Amount */}
            <div className="dc-rc-row">
                <i className="bi bi-receipt dc-rc-row-icon" />
                <span className="dc-rc-row-label">Order #</span>
                <span className="dc-rc-row-val">
                    #{orderId || "—"}
                    {ret.refundAmount != null && (
                        <span className="ms-2 text-success fw-bold">
                            ({fmtMoney(ret.refundAmount)})
                        </span>
                    )}
                </span>
            </div>

            {/* Reason */}
            {ret.reason && (
                <div className="dc-rc-row dc-rc-reason">
                    <i className="bi bi-chat-left-text dc-rc-row-icon" />
                    <span className="dc-rc-row-label">Reason</span>
                    <span className="dc-rc-row-val dc-rc-reason-val">{ret.reason}</span>
                </div>
            )}

            {/* Mini Progress Stepper */}
            <div className="dc-rc-progress" aria-hidden="true">
                {STEPS.map((s, i) => {
                    const idx = getStepIndex(status);
                    const done   = i < idx;
                    const active = i === idx;
                    return (
                        <div key={s} className={`dc-rc-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
                            <span className="dc-rc-step-dot">
                                {done ? <i className="bi bi-check-lg" /> : i + 1}
                            </span>
                            {i < STEPS.length - 1 && <span className="dc-rc-step-line" />}
                        </div>
                    );
                })}
            </div>

            {/* Action CTA prompt */}
            <div className="dc-rc-cta">
                <span>{isActive ? "Tap to Update Pickup Status" : "View Pickup Details"}</span>
                <i className="bi bi-chevron-right ms-1" />
            </div>
        </div>
    );
}

// ── PageHeader Component ─────────────────────────────────────────────────────

function PageHeader({ onBack, subtitle, badge, badgeCls }) {
    return (
        <div className="dc-header">
            <div className="d-flex align-items-center gap-2 gap-sm-3 flex-wrap">
                <button
                    type="button"
                    className="btn dc-back-btn"
                    aria-label="Back to Return List"
                    onClick={onBack}
                >
                    <i className="bi bi-arrow-left" />
                </button>
                <div>
                    <p className="eyebrow mb-0 dc-eyebrow">Return Pickup</p>
                    <h1 className="h4 mb-0 dc-title">{subtitle || "Return Details"}</h1>
                </div>
            </div>
            {badge && (
                <span className={`badge dc-badge ${badgeCls ?? "dc-badge-info"}`}>{badge}</span>
            )}
        </div>
    );
}

// ── DetailView (Multi-Device Responsive Detail View) ─────────────────────────

function DetailView({ ret, localStatus, confirmed, setConfirmed, saving, error, redirectIn, onChangeStatus, onBack }) {
    const status      = localStatus ?? ret.status;
    const stepIndex   = getStepIndex(status);
    const isDone      = status === "received" || status === "completed";

    const customer    = ret.user;
    const product     = ret.product;
    const shop        = product?.shop;
    const pickupAddr  = getUserAddress(customer);
    const shopAddr    = getShopAddress(shop);
    const navTarget   = status === "picked_up" ? shopAddr : pickupAddr;
    const navHref     = mapsHref(navTarget);
    const variantStr  = formatVariant(ret.variant);
    const orderId     = ((ret.order?._id || ret.order)?.toString() || "").slice(-6).toUpperCase();

    return (
        <main className="dashboard-content dc-page">
            <style>{DC_STYLES}</style>
            <div className="container-fluid px-2 px-sm-3 px-lg-4 py-3 py-lg-4">
                <PageHeader
                    onBack={onBack}
                    subtitle={`Return #${ret._id?.slice(-6)?.toUpperCase()}`}
                    badge={STATUS_LABEL[status] ?? status}
                    badgeCls={STATUS_BADGE[status]}
                />

                {/* ── Stepper Component (Responsive for Phone, Tab, Laptop) ── */}
                <div className="dc-stepper-wrap">
                    <div className="dc-stepper" role="list" aria-label="Return pickup steps">
                        {STEPS.map((label, i) => (
                            <div
                                key={label}
                                role="listitem"
                                className={`dc-step ${i < stepIndex ? "is-done" : ""} ${i === stepIndex ? "is-active" : ""}`}
                            >
                                <span className="dc-step-dot">
                                    {i < stepIndex ? <i className="bi bi-check-lg" /> : i + 1}
                                </span>
                                <span className="dc-step-label">{label}</span>
                                {i < STEPS.length - 1 && <span className="dc-step-line" aria-hidden="true" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Responsive Detail Layout: Phone (1-col), Tab (2-col), Laptop (2-col split) ── */}
                <div className="dc-detail-layout">
                    {/* LEFT COLUMN (or Top on Mobile): Action Card */}
                    <div className="dc-detail-col-action">
                        <div className="dc-panel dc-action-panel">
                            {isDone ? (
                                <div className="dc-success" role="status">
                                    <span className="dc-success-icon">
                                        <i className="bi bi-check2-circle" aria-hidden="true" />
                                    </span>
                                    <h2 className="dc-success-title h5 mb-1">Return Received at Merchant Shop</h2>
                                    <p className="dc-success-sub small mb-0">
                                        {redirectIn !== null
                                            ? `Redirecting back to Return List in ${redirectIn}s…`
                                            : "This returned item has been successfully delivered and received by the shop."}
                                    </p>
                                    <button
                                        type="button"
                                        className="btn dc-btn-primary btn-sm mt-3"
                                        onClick={onBack}
                                    >
                                        <i className="bi bi-arrow-left me-1" /> Return to Assigned List
                                    </button>
                                </div>
                            ) : status === "picked_up" ? (
                                <>
                                    <div className="dc-panel-head">
                                        <span className="dc-avatar dc-avatar-otp">
                                            <i className="bi bi-shop-window" aria-hidden="true" />
                                        </span>
                                        <div>
                                            <h2 className="dc-panel-title h6 mb-0">Step 2: Deliver to Merchant</h2>
                                            <span className="small text-muted">Final step</span>
                                        </div>
                                    </div>
                                    <p className="dc-muted small mb-3">
                                        Deliver the item to <strong>{shop?.name || "the merchant shop"}</strong>. Once inspected and accepted by the shopkeeper, check the confirmation and mark as received.
                                    </p>

                                    {error && (
                                        <div className="dc-alert-error" role="alert">
                                            <i className="bi bi-exclamation-triangle me-2" />{error}
                                        </div>
                                    )}

                                    <label className="dc-check" htmlFor="dcConfirmShop">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="dcConfirmShop"
                                            checked={confirmed}
                                            onChange={(e) => setConfirmed(e.target.checked)}
                                        />
                                        <span>
                                            I have delivered <strong>{product?.name || "the product"}</strong> to{" "}
                                            <strong>{shop?.name || "the merchant shop"}</strong>.
                                        </span>
                                    </label>

                                    <button
                                        type="button"
                                        className="btn dc-btn-primary w-100 mt-3"
                                        onClick={() => onChangeStatus("received")}
                                        disabled={!confirmed || saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                Updating Status…
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check2-circle me-1" /> Mark Received at Shop
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="dc-panel-head">
                                        <span className="dc-avatar dc-avatar-otp">
                                            <i className="bi bi-box-arrow-in-down" aria-hidden="true" />
                                        </span>
                                        <div>
                                            <h2 className="dc-panel-title h6 mb-0">Step 1: Customer Pickup</h2>
                                            <span className="small text-muted">Collect package</span>
                                        </div>
                                    </div>
                                    <p className="dc-muted small mb-3">
                                        Collect the item from <strong>{customer?.name || "the customer"}</strong>. Verify that the item matches the return request and is securely packed.
                                    </p>

                                    {error && (
                                        <div className="dc-alert-error" role="alert">
                                            <i className="bi bi-exclamation-triangle me-2" />{error}
                                        </div>
                                    )}

                                    <label className="dc-check" htmlFor="dcConfirmCustomer">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="dcConfirmCustomer"
                                            checked={confirmed}
                                            onChange={(e) => setConfirmed(e.target.checked)}
                                        />
                                        <span>
                                            I have collected <strong>{product?.name || "the product"}</strong> from{" "}
                                            <strong>{customer?.name || "the customer"}</strong>.
                                        </span>
                                    </label>

                                    <button
                                        type="button"
                                        className="btn dc-btn-primary w-100 mt-3"
                                        onClick={() => onChangeStatus("picked_up")}
                                        disabled={!confirmed || saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                Updating Status…
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-box-arrow-in-down me-1" /> Confirm Package Collected
                                            </>
                                        )}
                                    </button>
                                </>
                            )}

                            {/* GPS Directions Link */}
                            {!isDone && navHref && (
                                <a
                                    className="btn dc-btn-link w-100 mt-2"
                                    href={navHref}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <i className="bi bi-geo-alt-fill me-1" />
                                    {status === "picked_up"
                                        ? "Open GPS Navigation to Shop"
                                        : "Open GPS Navigation to Customer"}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN (or Main info): Customer, Shop, Item details */}
                    <div className="dc-detail-col-info">
                        {/* ── Customer Panel ── */}
                        <div className="dc-panel mb-3">
                            <div className="dc-panel-head">
                                <span className="dc-avatar dc-avatar-customer">
                                    <i className="bi bi-person" aria-hidden="true" />
                                </span>
                                <div>
                                    <h3 className="dc-panel-title h6 mb-0">Customer Pickup Address</h3>
                                    <span className="small text-muted">Collect package here</span>
                                </div>
                            </div>

                            <DetailRow label="Customer Name" value={customer?.name || customer?.username || "—"} />
                            {customer?.phone && <DetailRow label="Contact Phone" value={customer.phone} />}
                            {customer?.email && <DetailRow label="Email Address" value={customer.email} />}
                            {pickupAddr && <DetailRow label="Pickup Location" value={pickupAddr} />}

                            <div className="dc-btn-group mt-3">
                                {customer?.phone && (
                                    <a className="btn dc-btn-ghost flex-fill" href={`tel:${customer.phone}`}>
                                        <i className="bi bi-telephone-fill me-1" /> Call Customer
                                    </a>
                                )}
                                {mapsHref(pickupAddr) && (
                                    <a
                                        className="btn dc-btn-ghost-alt flex-fill"
                                        href={mapsHref(pickupAddr)}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <i className="bi bi-signpost-2-fill me-1" /> Google Maps
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* ── Shop Panel ── */}
                        <div className="dc-panel mb-3">
                            <div className="dc-panel-head">
                                <span className="dc-avatar dc-avatar-shop">
                                    <i className="bi bi-shop" aria-hidden="true" />
                                </span>
                                <div>
                                    <h3 className="dc-panel-title h6 mb-0">Merchant Dropoff Address</h3>
                                    <span className="small text-muted">Deliver item here</span>
                                </div>
                            </div>

                            <DetailRow label="Shop Name" value={shop?.name || "—"} />
                            {shop?.phone && <DetailRow label="Shop Phone" value={shop.phone} />}
                            {shop?.email && <DetailRow label="Shop Email" value={shop.email} />}
                            {shopAddr && <DetailRow label="Shop Address" value={shopAddr} />}

                            <div className="dc-btn-group mt-3">
                                {shop?.phone && (
                                    <a className="btn dc-btn-ghost flex-fill" href={`tel:${shop.phone}`}>
                                        <i className="bi bi-telephone-fill me-1" /> Call Merchant
                                    </a>
                                )}
                                {mapsHref(shopAddr) && (
                                    <a
                                        className="btn dc-btn-ghost-alt flex-fill"
                                        href={mapsHref(shopAddr)}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <i className="bi bi-signpost-2-fill me-1" /> Google Maps
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* ── Item to Collect Panel ── */}
                        <div className="dc-panel">
                            <div className="dc-panel-head">
                                <span className="dc-avatar dc-avatar-order">
                                    <i className="bi bi-box-seam" aria-hidden="true" />
                                </span>
                                <div>
                                    <h3 className="dc-panel-title h6 mb-0">Item Specification</h3>
                                    <span className="small text-muted">Verify before receiving</span>
                                </div>
                            </div>

                            <DetailRow label="Product Name" value={product?.name || "—"} isBold />
                            {product?.brand?.name && <DetailRow label="Brand" value={product.brand.name} />}
                            {variantStr && <DetailRow label="Variant" value={variantStr} />}
                            <DetailRow label="Original Order" value={`#${orderId || "—"}`} />
                            {ret.quantity && <DetailRow label="Quantity" value={`${ret.quantity} item(s)`} />}
                            {ret.refundAmount != null && (
                                <DetailRow label="Refund Amount" value={fmtMoney(ret.refundAmount)} isSuccess />
                            )}
                            <DetailRow label="Return Reason" value={ret.reason || "—"} />
                            <DetailRow label="Date Requested" value={fmtDate(ret.createdAt)} />
                            {ret.updatedAt && <DetailRow label="Last Update" value={fmtDate(ret.updatedAt)} />}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

// ── DetailRow Component ──────────────────────────────────────────────────────

function DetailRow({ label, value, isBold, isSuccess }) {
    return (
        <div className="dc-detail-row">
            <span className="dc-detail-label">{label}</span>
            <span
                className={`dc-detail-value ${isBold ? "fw-bold" : ""} ${isSuccess ? "text-success fw-bold" : ""}`}
            >
                {value}
            </span>
        </div>
    );
}

// ── Scoped Theme & Responsive CSS ───────────────────────────────────────────

const DC_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

/* ── Light Mode Color Tokens (Default) ── */
.dc-page {
  --dc-bg:          #F8FAFC;
  --dc-surface:     #FFFFFF;
  --dc-surface-alt: #F1F5F9;
  --dc-ink:         #0F172A;
  --dc-ink-soft:    #64748B;
  --dc-navy:        #0284C7;
  --dc-navy-soft:   #E0F2FE;
  --dc-amber:       #D97706;
  --dc-amber-soft:  #FEF3C7;
  --dc-green:       #059669;
  --dc-green-soft:  #D1FAE5;
  --dc-red:         #DC2626;
  --dc-red-soft:    #FEE2E2;
  --dc-border:      #E2E8F0;
  --dc-card-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03);
  --dc-active-ring: rgba(2, 132, 199, 0.18);
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--dc-ink);
  background: var(--dc-bg);
  min-height: 100vh;
}

/* ── Dark Mode Tokens (Supports both data-bs-theme and prefers-color-scheme) ── */
[data-bs-theme="dark"] .dc-page,
[data-theme="dark"] .dc-page,
body.dark .dc-page {
  --dc-bg:          #0B1120;
  --dc-surface:     #1E293B;
  --dc-surface-alt: #0F172A;
  --dc-ink:         #F8FAFC;
  --dc-ink-soft:    #94A3B8;
  --dc-navy:        #38BDF8;
  --dc-navy-soft:   #0C4A6E;
  --dc-amber:       #FBBF24;
  --dc-amber-soft:  #451A03;
  --dc-green:       #34D399;
  --dc-green-soft:  #064E3B;
  --dc-red:         #F87171;
  --dc-red-soft:    #450A0A;
  --dc-border:      #334155;
  --dc-card-shadow: 0 2px 8px rgba(0,0,0,0.4);
  --dc-active-ring: rgba(56, 189, 248, 0.25);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-bs-theme="light"]) .dc-page {
    --dc-bg:          #0B1120;
    --dc-surface:     #1E293B;
    --dc-surface-alt: #0F172A;
    --dc-ink:         #F8FAFC;
    --dc-ink-soft:    #94A3B8;
    --dc-navy:        #38BDF8;
    --dc-navy-soft:   #0C4A6E;
    --dc-amber:       #FBBF24;
    --dc-amber-soft:  #451A03;
    --dc-green:       #34D399;
    --dc-green-soft:  #064E3B;
    --dc-red:         #F87171;
    --dc-red-soft:    #450A0A;
    --dc-border:      #334155;
    --dc-card-shadow: 0 2px 8px rgba(0,0,0,0.4);
    --dc-active-ring: rgba(56, 189, 248, 0.25);
  }
}

/* ── Typography & Header ── */
.dc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.dc-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--dc-navy);
}
.dc-title {
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--dc-ink);
}
.dc-muted { color: var(--dc-ink-soft); }

.dc-page-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--dc-navy-soft);
  color: var(--dc-navy);
  font-size: 20px;
  flex-shrink: 0;
}
.dc-back-btn {
  width: 38px;
  height: 38px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
  border: 1px solid var(--dc-border);
  color: var(--dc-ink);
  background: var(--dc-surface);
  transition: all .15s ease;
}
.dc-back-btn:hover {
  background: var(--dc-navy-soft);
  border-color: var(--dc-navy);
  color: var(--dc-navy);
}

/* ── Badges ── */
.dc-badge {
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .02em;
  padding: 5px 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.dc-badge-warn    { background: var(--dc-amber-soft); color: var(--dc-amber); }
.dc-badge-success { background: var(--dc-green-soft); color: var(--dc-green); }
.dc-badge-danger  { background: var(--dc-red-soft);   color: var(--dc-red); }
.dc-badge-info    { background: var(--dc-navy-soft);  color: var(--dc-navy); }

/* ── Stats Summary Grid: Responsive 3 Columns ── */
.dc-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}
@media (max-width: 576px) {
  .dc-stats-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
.dc-stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--dc-surface);
  border: 1px solid var(--dc-border);
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: var(--dc-card-shadow);
}
.dc-stat-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dc-navy-soft);
  color: var(--dc-navy);
  font-size: 18px;
  flex-shrink: 0;
}
.dc-stat-warn .dc-stat-icon-wrap {
  background: var(--dc-amber-soft);
  color: var(--dc-amber);
}
.dc-stat-success .dc-stat-icon-wrap {
  background: var(--dc-green-soft);
  color: var(--dc-green);
}
.dc-stat-num {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.1;
  color: var(--dc-ink);
}
.dc-stat-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--dc-ink-soft);
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-top: 2px;
}

/* ── Toolbar: Filter Tabs + Search ── */
.dc-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
@media (max-width: 768px) {
  .dc-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}

.dc-pill-group {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}
.dc-pill-group::-webkit-scrollbar { display: none; }
.dc-pill {
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--dc-border);
  background: var(--dc-surface);
  color: var(--dc-ink-soft);
  cursor: pointer;
  transition: all .12s ease;
}
.dc-pill:hover {
  background: var(--dc-surface-alt);
  color: var(--dc-ink);
}
.dc-pill.is-active {
  background: var(--dc-navy);
  border-color: var(--dc-navy);
  color: #fff;
}
.dc-pill.is-active.pill-warn    { background: var(--dc-amber); border-color: var(--dc-amber); }
.dc-pill.is-active.pill-info    { background: var(--dc-navy);  border-color: var(--dc-navy); }
.dc-pill.is-active.pill-success { background: var(--dc-green); border-color: var(--dc-green); }

.dc-search-wrap {
  min-width: 240px;
}
@media (max-width: 768px) {
  .dc-search-wrap {
    width: 100%;
    min-width: 100%;
  }
}

/* ── Cards Grid: Responsive for Phone (1), Tablet (2), Laptop (3) ── */
.dc-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 640px) {
  .dc-cards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
@media (min-width: 1024px) {
  .dc-cards-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

/* ── Return Card ── */
.dc-return-card {
  display: flex;
  flex-direction: column;
  background: var(--dc-surface);
  border: 1px solid var(--dc-border);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--dc-card-shadow);
  cursor: pointer;
  transition: transform .12s ease, box-shadow .15s ease, border-color .15s ease;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}
.dc-return-card:hover, .dc-return-card:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  border-color: var(--dc-navy);
}
.dc-return-card--active {
  border-color: var(--dc-navy);
  box-shadow: 0 0 0 3px var(--dc-active-ring), var(--dc-card-shadow);
}
.dc-rc-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.dc-rc-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: var(--dc-navy-soft);
  color: var(--dc-navy);
}
.dc-rc-meta { flex: 1; min-width: 0; }
.dc-rc-id   { font-size: 13.5px; font-weight: 700; color: var(--dc-ink); }
.dc-rc-date { font-size: 11.5px; color: var(--dc-ink-soft); }
.dc-rc-divider { height: 1px; background: var(--dc-border); margin-bottom: 10px; }

.dc-rc-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
  padding: 4px 0;
}
.dc-rc-row-icon  { font-size: 13px; color: var(--dc-ink-soft); flex-shrink: 0; }
.dc-rc-row-label { color: var(--dc-ink-soft); flex-shrink: 0; width: 68px; }
.dc-rc-row-val   { color: var(--dc-ink); flex: 1; min-width: 0; word-break: break-word; }
.dc-rc-reason-val { font-style: italic; color: var(--dc-ink-soft); font-size: 12px; }

/* Mini card stepper */
.dc-rc-progress {
  display: flex;
  align-items: center;
  margin: 14px 0 10px;
  padding: 0 4px;
}
.dc-rc-step { display: flex; align-items: center; flex: 1; }
.dc-rc-step-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  background: var(--dc-surface);
  border: 2px solid var(--dc-border);
  color: var(--dc-ink-soft);
}
.dc-rc-step.done   .dc-rc-step-dot { background: var(--dc-green); border-color: var(--dc-green); color: #fff; }
.dc-rc-step.active .dc-rc-step-dot { border-color: var(--dc-navy); color: var(--dc-navy); font-weight: 800; }
.dc-rc-step-line { flex: 1; height: 2px; background: var(--dc-border); }
.dc-rc-step.done .dc-rc-step-line  { background: var(--dc-green); }

.dc-rc-cta {
  font-size: 12px;
  font-weight: 700;
  color: var(--dc-navy);
  text-align: right;
  margin-top: auto;
  padding-top: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* ── Stepper: Detail View ── */
.dc-stepper-wrap {
  background: var(--dc-surface);
  border: 1px solid var(--dc-border);
  border-radius: 16px;
  padding: 16px 12px;
  margin-bottom: 20px;
  box-shadow: var(--dc-card-shadow);
}
.dc-stepper {
  display: flex;
  align-items: flex-start;
  margin: 0;
}
.dc-step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
}
.dc-step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: var(--dc-surface);
  border: 2px solid var(--dc-border);
  color: var(--dc-ink-soft);
  z-index: 1;
}
@media (min-width: 768px) {
  .dc-step-dot { width: 34px; height: 34px; font-size: 13px; }
}
.dc-step.is-done   .dc-step-dot { background: var(--dc-green);  border-color: var(--dc-green); color: #fff; }
.dc-step.is-active .dc-step-dot { border-color: var(--dc-navy); color: var(--dc-navy); box-shadow: 0 0 0 4px var(--dc-navy-soft); }
.dc-step-label {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--dc-ink-soft);
  text-align: center;
  padding: 0 4px;
  line-height: 1.25;
}
@media (min-width: 768px) {
  .dc-step-label { font-size: 12.5px; margin-top: 8px; }
}
.dc-step.is-active .dc-step-label,
.dc-step.is-done   .dc-step-label { color: var(--dc-ink); }
.dc-step-line {
  position: absolute;
  top: 14px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--dc-border);
  z-index: 0;
}
@media (min-width: 768px) {
  .dc-step-line { top: 17px; }
}
.dc-step.is-done .dc-step-line { background: var(--dc-green); }

/* ── Responsive Detail Layout (Phone, Tab, Laptop) ── */
.dc-detail-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
/* Laptop & Desktop (>= 1024px): 2 Column Split with Sticky Action Panel */
@media (min-width: 1024px) {
  .dc-detail-layout {
    display: grid;
    grid-template-columns: 360px 1fr;
    align-items: start;
    gap: 24px;
  }
  .dc-detail-col-action {
    position: sticky;
    top: 20px;
  }
}

/* ── Panels ── */
.dc-panel {
  border: 1px solid var(--dc-border);
  border-radius: 16px;
  box-shadow: var(--dc-card-shadow);
  background: var(--dc-surface);
  padding: 18px;
}
@media (min-width: 768px) {
  .dc-panel { padding: 22px; }
}
.dc-panel-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.dc-panel-title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--dc-ink);
  margin: 0;
}
.dc-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.dc-avatar-shop,
.dc-avatar-customer,
.dc-avatar-order { background: var(--dc-navy-soft); color: var(--dc-navy); }
.dc-avatar-otp   { background: var(--dc-green-soft); color: var(--dc-green); }

.dc-detail-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px dashed var(--dc-border);
  font-size: 13.5px;
}
.dc-detail-row:last-of-type { border-bottom: none; }
.dc-detail-label { color: var(--dc-ink-soft); flex-shrink: 0; font-size: 13px; }
.dc-detail-value { text-align: right; color: var(--dc-ink); word-break: break-word; }

/* ── Action Buttons & Checkboxes (Touch Friendly) ── */
.dc-btn-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.dc-check {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--dc-amber-soft);
  border: 1px solid var(--dc-border);
  border-radius: 12px;
  padding: 14px;
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--dc-ink);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.dc-check input {
  margin-top: 3px;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
}

.dc-alert-error {
  background: var(--dc-red-soft);
  color: var(--dc-red);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 14px;
}

.dc-btn-primary {
  background: var(--dc-navy);
  border: 1px solid var(--dc-navy);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  border-radius: 12px;
  padding: 12px 18px;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all .15s ease;
}
.dc-btn-primary:hover:not(:disabled) {
  opacity: .92;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
  color: #fff;
}
.dc-btn-primary:disabled { opacity: .45; }

.dc-btn-ghost {
  background: var(--dc-surface);
  border: 1px solid var(--dc-border);
  color: var(--dc-navy);
  font-weight: 600;
  font-size: 13px;
  border-radius: 10px;
  padding: 10px 14px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all .12s ease;
}
.dc-btn-ghost:hover {
  background: var(--dc-navy-soft);
  border-color: var(--dc-navy);
  color: var(--dc-navy);
}

.dc-btn-ghost-alt {
  background: var(--dc-surface);
  border: 1px solid var(--dc-border);
  color: var(--dc-ink-soft);
  font-weight: 600;
  font-size: 13px;
  border-radius: 10px;
  padding: 10px 14px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all .12s ease;
}
.dc-btn-ghost-alt:hover {
  background: var(--dc-surface-alt);
  color: var(--dc-ink);
}

.dc-btn-link {
  color: var(--dc-navy);
  font-weight: 700;
  font-size: 13.5px;
  text-decoration: none;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.dc-btn-link:hover { text-decoration: underline; color: var(--dc-navy); }

/* ── Success State ── */
.dc-success { text-align: center; padding: 24px 12px; }
.dc-success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--dc-green-soft);
  color: var(--dc-green);
  font-size: 32px;
  margin-bottom: 12px;
}
.dc-success-title { font-weight: 800; color: var(--dc-ink); }
.dc-success-sub   { color: var(--dc-ink-soft); margin-top: 6px; }

/* ── Empty State ── */
.dc-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--dc-navy-soft);
  color: var(--dc-navy);
  font-size: 28px;
}
`;
