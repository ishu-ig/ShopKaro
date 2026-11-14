import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCheckout } from "../../Redux/ActionCreators/CheckoutActionCreators";

const STATUS_BADGE = {
  Ordered: "badge-status-ordered",
  Packed: "badge-status-packed",
  Shipped: "badge-status-shipped",
  "Out for Delivery": "badge-status-out",
  Delivered: "badge-status-delivered",
  Cancelled: "badge-status-cancelled",
};

// Flat rate earned per successfully delivered order.
const DELIVERY_EARNING_PER_ORDER = 30;

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isThisWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek && d <= now;
}

function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
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

export default function OrderHistory() {
  const { _id } = useParams(); // delivery boy's own userid
  const CheckoutStateData = useSelector((state) => state.CheckoutStateData);
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // "all" | "today" | "week" | "month"
  const [data, setData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = Array.isArray(CheckoutStateData)
    ? CheckoutStateData
    : (CheckoutStateData?.data ?? []);

  useEffect(() => {
    dispatch(getCheckout());
  }, [dispatch]);

  // ── Scope to THIS delivery boy ───
  useEffect(() => {
    if (!orders.length) {
      setData([]);
      return;
    }

    const scoped = orders.filter((order) => {
      const deliveryBoyId =
        order.deliveryBoy?._id?.toString?.() ?? order.deliveryBoy?.toString?.();

      return deliveryBoyId === _id;
    });

    setData(scoped);
  }, [orders, _id]);

  const deliveredCount = data.filter(
    (o) => o.orderStatus === "Delivered",
  ).length;
  const cancelledCount = data.filter(
    (o) => o.orderStatus === "Cancelled",
  ).length;

  const earnedTotal = deliveredCount * DELIVERY_EARNING_PER_ORDER;

  const filteredData = data
    .filter(
      (order) =>
        order._id?.toLowerCase().includes(search.toLowerCase()) ||
        order.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        order.orderStatus?.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((order) => {
      if (dateFilter === "today") return isToday(order.createdAt);
      if (dateFilter === "week") return isThisWeek(order.createdAt);
      if (dateFilter === "month") return isThisMonth(order.createdAt);
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  function openOrder(order) {
    setSelectedOrder(order);
  }

  function closeModal() {
    setSelectedOrder(null);
  }

  return (
    <>
      <main className="dashboard-content oh-page">
        <style>{OH_STYLES}</style>
        <div className="container-fluid px-2 px-sm-3 px-lg-4 py-3 py-lg-4">
          {/* ── Page Heading ── */}
          <div className="oh-header mb-3 mb-md-4">
            <div className="d-flex align-items-center gap-3">
              <span className="oh-page-icon">
                <i className="bi bi-clock-history" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-0 oh-eyebrow">Delivery Partner</p>
                <h1 className="h4 mb-0 oh-title">Order History</h1>
                <p className="text-muted mb-0 small">
                  Complete history of orders assigned to you.
                </p>
              </div>
            </div>
          </div>

          {/* ── Summary Metric Cards: 2x2 on Mobile, 4x1 on Desktop ── */}
          <section className="row g-2 g-sm-3 mb-3 mb-md-4" aria-label="History summary">
            <div className="col-6 col-md-3">
              <article className="oh-metric-card oh-metric-total">
                <div className="oh-metric-top">
                  <span className="oh-metric-label">Total Orders</span>
                  <span className="oh-metric-icon">
                    <i className="bi bi-archive-fill"></i>
                  </span>
                </div>
                <div className="oh-metric-value">{data.length}</div>
                <div className="oh-metric-meta">all time records</div>
              </article>
            </div>

            <div className="col-6 col-md-3">
              <article className="oh-metric-card oh-metric-delivered">
                <div className="oh-metric-top">
                  <span className="oh-metric-label">Delivered</span>
                  <span className="oh-metric-icon">
                    <i className="bi bi-check-circle-fill"></i>
                  </span>
                </div>
                <div className="oh-metric-value">{deliveredCount}</div>
                <div className="oh-metric-meta">successfully completed</div>
              </article>
            </div>

            <div className="col-6 col-md-3">
              <article className="oh-metric-card oh-metric-cancelled">
                <div className="oh-metric-top">
                  <span className="oh-metric-label">Cancelled</span>
                  <span className="oh-metric-icon">
                    <i className="bi bi-x-circle-fill"></i>
                  </span>
                </div>
                <div className="oh-metric-value">{cancelledCount}</div>
                <div className="oh-metric-meta">not fulfilled</div>
              </article>
            </div>

            <div className="col-6 col-md-3">
              <article className="oh-metric-card oh-metric-earnings">
                <div className="oh-metric-top">
                  <span className="oh-metric-label">Earnings</span>
                  <span className="oh-metric-icon">
                    <i className="bi bi-cash-coin"></i>
                  </span>
                </div>
                <div className="oh-metric-value">₹{earnedTotal}</div>
                <div className="oh-metric-meta">₹{DELIVERY_EARNING_PER_ORDER} / delivered order</div>
              </article>
            </div>
          </section>

          {/* ── Main Panel ── */}
          <section className="oh-panel">
            {/* ── Header: Title & Filters (Responsive Stack on Phone) ── */}
            <div className="oh-panel-header">
              <div className="oh-panel-title-area">
                <h2 className="h6 mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-table text-primary" aria-hidden="true"></i>
                  <span>Past Orders</span>
                  <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill ms-1">
                    {filteredData.length}
                  </span>
                </h2>
              </div>

              <div className="oh-filters-wrap">
                <select
                  className="form-select form-select-sm oh-filter-select"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  aria-label="Filter by date range"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>

                <div className="oh-search-box">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-transparent border-end-0">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search orders..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Desktop & Tablet View (>= 768px): Responsive Data Table ── */}
            <div className="table-responsive d-none d-md-block">
              <table className="table table-hover align-middle mb-0 oh-table">
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th style={{ width: "22%" }}>Customer</th>
                    <th style={{ width: "18%" }}>Status</th>
                    <th style={{ width: "22%" }}>Payment</th>
                    <th style={{ width: "13%" }}>Total</th>
                    <th style={{ width: "12%" }}>Date</th>
                    <th style={{ width: "8%" }} className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((order, index) => (
                      <tr key={order._id}>
                        <td className="text-muted small">{index + 1}</td>
                        <td>
                          <div className="fw-semibold text-truncate" style={{ maxWidth: 180 }}>
                            {order.user?.name || order.user?.username || "N/A"}
                          </div>
                          <div className="text-muted small font-monospace">
                            #{order._id?.slice(-6)?.toUpperCase()}
                          </div>
                        </td>
                        <td>
                          <span className={`oh-badge ${STATUS_BADGE[order.orderStatus] ?? "badge-status-ordered"}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1 flex-wrap">
                            <span className="oh-pill-mode">{order.paymentMode || "COD"}</span>
                            <span className={`badge ${order.paymentStatus === "Pending" ? "text-bg-danger" : "text-bg-success"} rounded-pill`} style={{ fontSize: "11px" }}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="fw-bold text-success">
                          ₹{(order.total ?? order.finalReservationPrice ?? 0).toLocaleString("en-IN")}
                        </td>
                        <td className="text-muted small">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary rounded-pill px-2 py-1"
                            onClick={() => openOrder(order)}
                            title="View Details"
                          >
                            <i className="bi bi-eye me-1"></i> View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-5">
                        <i className="bi bi-inbox fs-3 d-block mb-2 text-muted opacity-50"></i>
                        {search
                          ? `No orders found matching "${search}"`
                          : "No order history found for the selected time range."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Phone View (< 768px): Touch-Friendly Cards ── */}
            <div className="d-md-none p-2">
              {filteredData.length > 0 ? (
                <div className="oh-mobile-cards-list">
                  {filteredData.map((order, index) => (
                    <article
                      key={order._id}
                      className="oh-mobile-card"
                      onClick={() => openOrder(order)}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="oh-mobile-id font-monospace">
                          #{order._id?.slice(-6)?.toUpperCase()}
                        </span>
                        <span className={`oh-badge ${STATUS_BADGE[order.orderStatus] ?? "badge-status-ordered"}`}>
                          {order.orderStatus}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div>
                          <div className="fw-bold text-dark">
                            <i className="bi bi-person me-1 text-muted"></i>
                            {order.user?.name || order.user?.username || "N/A"}
                          </div>
                          <div className="text-muted small">
                            <i className="bi bi-calendar3 me-1"></i>
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : "—"}
                          </div>
                        </div>

                        <div className="text-end">
                          <div className="fs-5 fw-extrabold text-success">
                            ₹{(order.total ?? order.finalReservationPrice ?? 0).toLocaleString("en-IN")}
                          </div>
                          <div className="small text-muted">{order.paymentMode || "COD"}</div>
                        </div>
                      </div>

                      <div className="oh-mobile-card-footer">
                        <span className={`badge ${order.paymentStatus === "Pending" ? "text-bg-danger" : "text-bg-success"} rounded-pill`} style={{ fontSize: "11px" }}>
                          Pay: {order.paymentStatus}
                        </span>
                        <span className="text-primary small fw-semibold">
                          View details <i className="bi bi-chevron-right ms-1"></i>
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-inbox fs-2 d-block mb-2 opacity-50"></i>
                  {search
                    ? `No orders found matching "${search}"`
                    : "No orders found in this period."}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ── Read-only Order Details Modal: Responsive Across Phone, Tab & Laptop ── */}
      {selectedOrder && (
        <div
          className="aob-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="aob-modal">
            {/* Modal Header */}
            <div className="aob-modal-header">
              <div>
                <h2 className="h5 mb-0 fw-bold">Order Details</h2>
                <p className="text-muted small mb-0 font-monospace">
                  ID: #{selectedOrder._id}
                </p>
              </div>
              <button
                type="button"
                className="aob-close-btn"
                onClick={closeModal}
                aria-label="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="aob-modal-body">
              {/* Badges strip */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className={`oh-badge ${STATUS_BADGE[selectedOrder.orderStatus] ?? "badge-status-ordered"}`}>
                  {selectedOrder.orderStatus}
                </span>
                <span
                  className={`badge ${
                    selectedOrder.paymentStatus === "Pending"
                      ? "text-bg-danger"
                      : "text-bg-success"
                  } rounded-pill py-2 px-3`}
                >
                  Payment: {selectedOrder.paymentStatus}
                </span>
                {selectedOrder.orderStatus === "Delivered" && (
                  <span className="badge text-bg-success-subtle text-success-emphasis rounded-pill py-2 px-3">
                    <i className="bi bi-cash-coin me-1"></i>
                    Earned ₹{DELIVERY_EARNING_PER_ORDER}
                  </span>
                )}
              </div>

              {/* Customer section */}
              <div className="oh-modal-card mb-3">
                <h3 className="oh-card-header-label">Customer</h3>
                {[
                  {
                    icon: "bi-person",
                    val: selectedOrder.user?.name || selectedOrder.user?.username,
                  },
                  { icon: "bi-envelope", val: selectedOrder.user?.email },
                  { icon: "bi-telephone", val: selectedOrder.user?.phone, isPhone: true },
                  {
                    icon: "bi-geo-alt",
                    val: [
                      selectedOrder.user?.address,
                      selectedOrder.user?.city,
                      selectedOrder.user?.state,
                      selectedOrder.user?.pin,
                    ]
                      .filter(Boolean)
                      .join(", "),
                  },
                ]
                  .filter((r) => r.val)
                  .map(({ icon, val, isPhone }) => (
                    <div key={icon} className="aob-detail-row">
                      <i className={`bi ${icon} text-primary flex-shrink-0`}></i>
                      {isPhone ? (
                        <a href={`tel:${val}`} className="text-decoration-none fw-semibold">
                          {val}
                        </a>
                      ) : (
                        <span>{val}</span>
                      )}
                    </div>
                  ))}
              </div>

              {/* Order items section */}
              {selectedOrder.products?.length > 0 && (
                <div className="oh-modal-card mb-3">
                  <h3 className="oh-card-header-label">Items ({selectedOrder.products.length})</h3>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Product</th>
                          <th>Variant</th>
                          <th>Qty</th>
                          <th className="text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.products.map((p, i) => {
                          const variantLabel = formatVariant(p.variant) || "—";
                          const lineTotal =
                            p.total ??
                            (p.variant?.finalPrice ?? p.variant?.price ?? p.price ?? 0) *
                              (p.qty || p.quantity || 1);
                          return (
                            <tr key={p._id || i}>
                              <td className="text-muted small">{i + 1}</td>
                              <td className="fw-semibold">
                                {p.product?.name || p.name || "—"}
                              </td>
                              <td className="small text-muted">{variantLabel}</td>
                              <td>{p.qty || p.quantity || 1}</td>
                              <td className="text-end fw-semibold">₹{Number(lineTotal).toLocaleString("en-IN")}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Order summary section */}
              <div className="oh-modal-card mb-3">
                <h3 className="oh-card-header-label">Summary</h3>
                <div className="aob-summary-row">
                  <span>Subtotal</span>
                  <span>₹{(selectedOrder.subtotal || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="aob-summary-row">
                  <span>Delivery Charge</span>
                  <span>₹{(selectedOrder.deliveryCharge || 0).toLocaleString("en-IN")}</span>
                </div>
                <hr className="my-2" />
                <div className="aob-summary-row total">
                  <span>Grand Total</span>
                  <span className="text-success fs-5">
                    ₹{(selectedOrder.total || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="aob-summary-row">
                  <span>Payment Mode</span>
                  <span className="fw-semibold">{selectedOrder.paymentMode || "COD"}</span>
                </div>
                <div className="aob-summary-row">
                  <span>Order Date</span>
                  <span>
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="aob-modal-footer">
              <button
                type="button"
                className="btn btn-primary w-100 py-2 rounded-pill fw-semibold"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Scoped Styles: Highly Responsive for Phone, Tablet & Laptop ─────────────

const OH_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');

.oh-page {
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #1e293b;
}

.oh-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #0284c7;
}

.oh-title {
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #0f172a;
}

.oh-page-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #e0f2fe;
  color: #0284c7;
  font-size: 20px;
  flex-shrink: 0;
}

/* ── Metric Cards ── */
.oh-metric-card {
  border-radius: 14px;
  padding: 14px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 104px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: transform .12s ease;
}
@media (min-width: 768px) {
  .oh-metric-card { padding: 18px; min-height: 118px; }
}
.oh-metric-card:hover { transform: translateY(-2px); }

.oh-metric-total     { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.oh-metric-delivered { background: linear-gradient(135deg, #10b981, #047857); }
.oh-metric-cancelled { background: linear-gradient(135deg, #ef4444, #b91c1c); }
.oh-metric-earnings  { background: linear-gradient(135deg, #f59e0b, #b45309); }

.oh-metric-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.oh-metric-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  opacity: .9;
}
.oh-metric-icon { font-size: 18px; opacity: .85; }
.oh-metric-value {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.1;
}
@media (min-width: 768px) {
  .oh-metric-value { font-size: 26px; }
}
.oh-metric-meta {
  font-size: 10.5px;
  opacity: .85;
  margin-top: 4px;
}

/* ── Main Panel ── */
.oh-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
  overflow: hidden;
}

.oh-panel-header {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
@media (max-width: 576px) {
  .oh-panel-header {
    flex-direction: column;
    align-items: stretch;
  }
}

.oh-filters-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
@media (max-width: 576px) {
  .oh-filters-wrap {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}

.oh-filter-select {
  width: auto;
  min-width: 120px;
  border-radius: 10px;
}
@media (max-width: 576px) {
  .oh-filter-select { width: 100%; }
}

.oh-search-box {
  min-width: 180px;
}
@media (max-width: 576px) {
  .oh-search-box {
    grid-column: 1 / -1;
    width: 100%;
  }
}

/* ── Badges ── */
.oh-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  letter-spacing: .02em;
}
.badge-status-ordered   { background: #e0f2fe; color: #0369a1; }
.badge-status-packed    { background: #fef3c7; color: #92400e; }
.badge-status-shipped   { background: #fef3c7; color: #b45309; }
.badge-status-out       { background: #fed7aa; color: #c2410c; }
.badge-status-delivered { background: #d1fae5; color: #047857; }
.badge-status-cancelled { background: #fee2e2; color: #b91c1c; }

.oh-pill-mode {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  background: #f1f5f9;
  border-radius: 6px;
  color: #475569;
}

/* ── Mobile Order Cards (< 768px) ── */
.oh-mobile-cards-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.oh-mobile-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  cursor: pointer;
  transition: all .12s ease;
  -webkit-tap-highlight-color: transparent;
}
.oh-mobile-card:hover, .oh-mobile-card:active {
  background: #f8fafc;
  border-color: #cbd5e1;
}
.oh-mobile-id {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}
.oh-mobile-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #f1f5f9;
}

/* ── Desktop Table (>= 768px) ── */
.oh-table th {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: #64748b;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.oh-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
}

/* ── Modal (Phone, Tablet, Laptop) ── */
.aob-overlay {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  backdrop-filter: blur(4px);
}
.aob-modal {
  background: #fff;
  border-radius: 16px;
  max-width: 580px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  overflow: hidden;
}
@media (max-width: 576px) {
  .aob-modal {
    max-width: 100%;
    max-height: 94vh;
    border-radius: 14px;
  }
}
.aob-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #fff;
  flex-shrink: 0;
}
.aob-modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.aob-modal-footer {
  padding: 12px 20px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  flex-shrink: 0;
}
.aob-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  background: #f1f5f9;
  color: #475569;
  cursor: pointer;
  flex-shrink: 0;
  transition: all .15s ease;
}
.aob-close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}
.oh-modal-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
}
.oh-card-header-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #64748b;
  margin-bottom: 10px;
}
.aob-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13.5px;
  color: #1e293b;
  margin-bottom: 8px;
}
.aob-detail-row:last-child { margin-bottom: 0; }
.aob-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13.5px;
  color: #475569;
  padding: 5px 0;
}
.aob-summary-row.total {
  font-weight: 700;
  font-size: 15px;
  color: #0f172a;
}
`;
