import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCheckout } from "../../Redux/ActionCreators/CheckoutActionCreators";

const STATUS_BADGE = {
  Ordered: "text-bg-info",
  Packed: "text-bg-warning",
  Shipped: "text-bg-warning",
  "Out for Delivery": "text-bg-warning",
  Delivered: "text-bg-success",
  Cancelled: "text-bg-danger",
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

export default function OrderHistory() {
  const { _id } = useParams(); // delivery boy's own userid, from /delivery/:_id/history
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

  // ── Scope to THIS delivery boy — ALL of their past orders, any status ───
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

  // Flat ₹30 earned per successfully delivered order.
  const earnedTotal = deliveredCount * DELIVERY_EARNING_PER_ORDER;

  const filteredData = data
    .filter(
      (order) =>
        order._id?.toLowerCase().includes(search.toLowerCase()) ||
        order.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
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
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          <div className="page-heading">
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-clock-history" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Delivery</p>
                <h1 className="h3 mb-1">Order History</h1>
                <p className="text-muted mb-0">
                  All orders ever assigned to you.
                </p>
              </div>
            </div>
          </div>

          <section className="row g-3 mt-2 mb-1" aria-label="History summary">
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Total Records</span>
                  <span className="metric-icon">
                    <i className="bi bi-archive-fill"></i>
                  </span>
                </div>
                <div className="metric-value">{data.length}</div>
                <div className="metric-meta">
                  <span>past</span>
                  <span>orders</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Delivered</span>
                  <span className="metric-icon">
                    <i className="bi bi-check-circle-fill"></i>
                  </span>
                </div>
                <div className="metric-value">{deliveredCount}</div>
                <div className="metric-meta">
                  <span>successfully</span>
                  <span>completed</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card">
                <div className="metric-top">
                  <span className="metric-label">Cancelled</span>
                  <span className="metric-icon">
                    <i className="bi bi-x-circle-fill"></i>
                  </span>
                </div>
                <div className="metric-value">{cancelledCount}</div>
                <div className="metric-meta">
                  <span>not</span>
                  <span>fulfilled</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Delivery Earnings</span>
                  <span className="metric-icon">
                    <i className="bi bi-cash-coin"></i>
                  </span>
                </div>
                <div className="metric-value">₹{earnedTotal}</div>
                <div className="metric-meta">
                  <span>₹{DELIVERY_EARNING_PER_ORDER}</span>
                  <span>per order</span>
                </div>
              </article>
            </div>
          </section>

          <section className="panel mt-3">
            <div className="panel-header d-flex flex-wrap align-items-center gap-2">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-table" aria-hidden="true"></i>
                  <span>Past Orders</span>
                </h2>
                <p className="text-muted mb-0">
                  Search and review your delivery history.
                </p>
              </div>

              <div className="ms-auto d-flex flex-wrap align-items-center gap-2">
                <select
                  className="filter-date-select"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  aria-label="Filter by date range"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>

                <div style={{ minWidth: 200 }}>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search history..."
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
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Restaurant</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((order, index) => (
                      <tr key={order._id}>
                        <td>{index + 1}</td>
                        <td className="fw-semibold">
                          {order.user?.username ?? "N/A"}
                        </td>
                        <td className="text-muted small">
                          {order.products?.[0]?.product?.resturent?.name ?? "—"}
                        </td>
                        <td>
                          <span
                            className={`badge ${STATUS_BADGE[order.orderStatus] ?? "text-bg-info"}`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>
                          <div className="payment-cell">
                            <span className="payment-mode-pill">
                              {order.paymentMode}
                            </span>
                            <span
                              className={`badge ${
                                order.paymentStatus === "Pending"
                                  ? "text-bg-danger"
                                  : "text-bg-success"
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="total-cell">
                          ₹{order.total ?? order.finalReservationPrice}
                        </td>
                        <td className="text-muted small">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="text-end">
                          <div className="act-strip">
                            <button
                              type="button"
                              className="act-btn act-btn-view"
                              onClick={() => openOrder(order)}
                              data-tip="View"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        {search
                          ? `No orders found for "${search}"`
                          : "No order history in this range."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* ── Read-only Order Details Modal ── */}
      {selectedOrder && (
        <div
          className="aob-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="aob-modal">
            <div className="aob-modal-header">
              <div>
                <h2 className="h5 mb-0">Order Details</h2>
                <p className="text-muted small mb-0">ID: {selectedOrder._id}</p>
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

            <div className="aob-modal-body">
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span
                  className={`badge ${STATUS_BADGE[selectedOrder.orderStatus] ?? "text-bg-info"}`}
                >
                  {selectedOrder.orderStatus}
                </span>
                <span
                  className={`badge ${
                    selectedOrder.paymentStatus === "Pending"
                      ? "text-bg-danger"
                      : "text-bg-success"
                  }`}
                >
                  {selectedOrder.paymentStatus}
                </span>
                {selectedOrder.orderStatus === "Delivered" && (
                  <span className="badge text-bg-primary-subtle text-primary-emphasis">
                    <i className="bi bi-cash-coin me-1"></i>
                    Earned ₹{DELIVERY_EARNING_PER_ORDER}
                  </span>
                )}
              </div>

              <h3 className="h6 text-uppercase text-muted mb-2">Customer</h3>
              <div className="mb-3">
                {[
                  {
                    icon: "bi-person",
                    val:
                      selectedOrder.user?.name || selectedOrder.user?.username,
                  },
                  { icon: "bi-envelope", val: selectedOrder.user?.email },
                  { icon: "bi-telephone", val: selectedOrder.user?.phone },
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
                  .map(({ icon, val }) => (
                    <div key={icon} className="aob-detail-row">
                      <i className={`bi ${icon} text-primary`}></i>
                      <span>{val}</span>
                    </div>
                  ))}
              </div>

              <h3 className="h6 text-uppercase text-muted mb-2">
                Order Summary
              </h3>
              <div className="mb-3">
                <div className="aob-summary-row">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal || 0}</span>
                </div>
                <div className="aob-summary-row">
                  <span>Delivery Charge</span>
                  <span>₹{selectedOrder.deliveryCharge || 0}</span>
                </div>
                <hr className="my-2" />
                <div className="aob-summary-row total">
                  <span>Total</span>
                  <span>₹{selectedOrder.total || 0}</span>
                </div>
                <div className="aob-summary-row">
                  <span>Payment Mode</span>
                  <span>{selectedOrder.paymentMode || "COD"}</span>
                </div>
                <div className="aob-summary-row">
                  <span>Order Date</span>
                  <span>
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "—"}
                  </span>
                </div>
                <div className="aob-summary-row">
                  <span>Last Updated</span>
                  <span>
                    {selectedOrder.updatedAt
                      ? new Date(selectedOrder.updatedAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "—"}
                  </span>
                </div>
              </div>

              {selectedOrder.products?.length > 0 && (
                <>
                  <h3 className="h6 text-uppercase text-muted mb-2">Items</h3>
                  <div className="table-responsive mb-3">
                    <table className="table table-sm align-middle mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Product</th>
                          <th>Variant</th>
                          <th>Qty</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.products.map((p, i) => (
                          <tr key={p._id || i}>
                            <td className="text-muted">{i + 1}</td>
                            <td className="fw-semibold">
                              {p.product?.name || p.name || "—"}
                            </td>
                            <td>{p.variant || "—"}</td>
                            <td>{p.qty || p.quantity || 1}</td>
                            <td>₹{p.total || p.price || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <div className="d-flex justify-content-end mt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
