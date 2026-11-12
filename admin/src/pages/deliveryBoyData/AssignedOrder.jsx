import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCheckout } from "../../Redux/ActionCreators/CheckoutActionCreators";

const STATUS_BADGE = {
  "Order is Placed": "text-bg-info",
  Ordered: "text-bg-info",
  Processing: "text-bg-warning",
  Packed: "text-bg-warning",
  Shipped: "text-bg-warning",
  "Out for Delivery": "text-bg-warning",
  Delivered: "text-bg-success",
  Cancelled: "text-bg-danger",
};

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

// Restaurant reference can live at different depths depending on which
// endpoint populated it — sometimes top-level on the order, sometimes only
// nested inside the first product line item.
function getResturentInfo(order) {
  return order?.resturent || order?.products?.[0]?.product?.resturent || null;
}

// Restaurants store their location under `permanentLocation` (see
// ResturentSchema) — including lat/lng, not just the text fields.
function getResturentLocation(resturent) {
  const loc = resturent?.permanentLocation || {};
  return {
    label: null,
    address:
      [loc.address, loc.city, loc.state, loc.pin].filter(Boolean).join(", ") ||
      "",
    lat: loc.lat ?? null,
    lng: loc.lng ?? null,
  };
}

// The customer's delivery address is their saved `defaultAddress` (see
// UpdateProfilePage.jsx / ProfilePage.jsx) — `permanentLocation` on the user
// record is a separate, unused legacy field and is usually empty. Fall back
// to the first entry in `addresses[]` if `defaultAddress` isn't populated.
function getUserAddress(user) {
  const def =
    user?.defaultAddress ||
    (Array.isArray(user?.addresses)
      ? user.addresses.find((a) => a.isDefault) || user.addresses[0]
      : null);
  if (!def) return null;
  return {
    label: def.label || null,
    address:
      def.address ||
      [def.city, def.state, def.pin].filter(Boolean).join(", ") ||
      "",
    lat: def.lat ?? null,
    lng: def.lng ?? null,
  };
}

function directionsUrl(loc) {
  if (!loc) return null;
  if (loc.lat != null && loc.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
  }
  if (loc.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`;
  }
  return null;
}

export default function AssignedOrder() {
  const { _id } = useParams();
  const CheckoutStateData = useSelector((state) => state.CheckoutStateData);
  const dispatch = useDispatch();
  console.log(_id)
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("today"); // "all" | "today"
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "pending" | "delivered"
  const [data, setData] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = Array.isArray(CheckoutStateData)
    ? CheckoutStateData
    : (CheckoutStateData?.data ?? []);

  const totalCount = data.length;
  const deliveredCount = data.filter(
    (o) => o.orderStatus === "Delivered",
  ).length;
  const pendingCount = data.filter(
    (o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled",
  ).length;
  const cancelledCount = data.filter(
    (o) => o.orderStatus === "Cancelled",
  ).length;

  useEffect(() => {
    dispatch(getCheckout());
  }, [dispatch]);

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

  useEffect(() => {
    if (!selectedOrder) return;
    const fresh = data.find((o) => o._id === selectedOrder._id);
    if (fresh) setSelectedOrder(fresh);
  }, [data, selectedOrder]);

  const filteredData = data
    .filter(
      (order) =>
        order._id?.toLowerCase().includes(search.toLowerCase()) ||
        order.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
        order.orderStatus?.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((order) =>
      dateFilter === "today" ? isToday(order.createdAt) : true,
    )
    .filter((order) => {
      if (statusFilter === "delivered")
        return order.orderStatus === "Delivered";
      if (statusFilter === "pending")
        return (
          order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled"
        );
      return true;
    });

  function openOrder(order) {
    setSelectedOrder(order);
  }

  function closeModal() {
    setSelectedOrder(null);
  }

  const resturentInfo = selectedOrder ? getResturentInfo(selectedOrder) : null;
  const resturentLoc = resturentInfo ? getResturentLocation(resturentInfo) : null;
  const resturentDirections = directionsUrl(resturentLoc);

  const userLoc = selectedOrder ? getUserAddress(selectedOrder.user) : null;
  const userDirections = directionsUrl(userLoc);

  return (
    <>
      <style>{BASE_STYLES}</style>
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          <div className="page-heading">
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-bag-check" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Delivery</p>
                <h1 className="h3 mb-1">Assigned Orders</h1>
                <p className="text-muted mb-0">
                  Orders currently assigned to you for delivery.
                </p>
              </div>
            </div>
          </div>

          <section className="row g-3 mt-2 mb-1" aria-label="Order summary">
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Total</span>
                  <span className="metric-icon">
                    <i className="bi bi-cart-fill"></i>
                  </span>
                </div>
                <div className="metric-value">{totalCount}</div>
                <div className="metric-meta">
                  <span>all</span>
                  <span>orders</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">In Progress</span>
                  <span className="metric-icon">
                    <i className="bi bi-truck"></i>
                  </span>
                </div>
                <div className="metric-value">{pendingCount}</div>
                <div className="metric-meta">
                  <span>on the</span>
                  <span>road</span>
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
                  <span>completed</span>
                  <span>drops</span>
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
          </section>

          <section className="panel mt-3">
            <div className="panel-header d-flex flex-wrap align-items-center gap-2">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-table" aria-hidden="true"></i>
                  <span>Order List</span>
                </h2>
                <p className="text-muted mb-0">
                  Search and review your assigned orders.
                </p>
              </div>

              <div className="ms-auto d-flex flex-wrap align-items-center gap-2">
                {/* ── Compact filter bar ── */}
                <div className="filter-bar">
                  <div className="status-pill-group">
                    <button
                      type="button"
                      className={`status-pill pill-all${statusFilter === "all" ? " is-active" : ""}`}
                      onClick={() => setStatusFilter("all")}
                    >
                      <i className="bi bi-collection"></i>
                      <span className="pill-label">All</span>
                    </button>
                    <button
                      type="button"
                      className={`status-pill pill-pending${statusFilter === "pending" ? " is-active" : ""}`}
                      onClick={() => setStatusFilter("pending")}
                    >
                      <i className="bi bi-truck"></i>
                      <span className="pill-label">To Deliver</span>
                    </button>
                    <button
                      type="button"
                      className={`status-pill pill-delivered${statusFilter === "delivered" ? " is-active" : ""}`}
                      onClick={() => setStatusFilter("delivered")}
                    >
                      <i className="bi bi-check-circle"></i>
                      <span className="pill-label">Delivered</span>
                    </button>
                  </div>

                  <select
                    className="filter-date-select"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    aria-label="Filter by date"
                  >
                    <option value="today">Today</option>
                    <option value="all">All Dates</option>
                  </select>
                </div>

                <div style={{ minWidth: 200 }}>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white">
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
                    <th>Order Status</th>
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
                            <Link
                              className="act-btn act-btn-items"
                              to={`/checkout/product/${order._id}`}
                              data-tip="Items"
                            >
                              <i className="bi bi-boxes"></i>
                            </Link>
                            <span className="act-sep"></span>
                            <button
                              type="button"
                              className="act-btn act-btn-view"
                              onClick={() => openOrder(order)}
                              data-tip="View"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            {order.orderStatus === "Out for Delivery" && (
                              <>
                                <span className="act-sep"></span>
                                <Link
                                  className="act-btn act-btn-track"
                                  to={`/deliveryBoy/${_id}/order/${order._id}`}
                                  data-tip="Track"
                                >
                                  <i className="bi bi-geo-alt"></i>
                                </Link>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        {search
                          ? `No orders found for "${search}"`
                          : statusFilter === "delivered"
                            ? "No delivered orders" +
                              (dateFilter === "today" ? " today." : ".")
                            : statusFilter === "pending"
                              ? "No orders to be delivered" +
                                (dateFilter === "today" ? " today." : ".")
                              : dateFilter === "today"
                                ? "No orders assigned to you today."
                                : "No orders assigned to you."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* ── Order Details Modal ──
          Purely informational now: no Mark as Delivered / cash verification
          here anymore — that action now lives on the Live Tracking page
          (DeliveryLiveMap.jsx), which is reached via the "Track" button once
          an order is Out for Delivery. */}
      {selectedOrder && (
        <div
          className="aob-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <style>{ORDER_DETAILS_STYLES}</style>
          <div className="aob-modal aob-modal-lg">
            <div className="aob-modal-header">
              <div>
                <p className="odm-eyebrow mb-1">
                  Order #{selectedOrder._id?.slice(-6)?.toUpperCase()}
                </p>
                <h2 className="h5 mb-2">Order Details</h2>
                <div className="d-flex flex-wrap gap-2">
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
                  <span className="badge payment-mode-pill">
                    {selectedOrder.paymentMode || "COD"}
                  </span>
                </div>
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
              <div className="odm-grid">
                {/* ── Customer & delivery address ── */}
                <section className="odm-card">
                  <h3 className="odm-card-title">
                    <i className="bi bi-person-fill"></i> Customer
                  </h3>
                  <div className="mb-2">
                    {[
                      {
                        icon: "bi-person",
                        val:
                          selectedOrder.user?.name ||
                          selectedOrder.user?.username,
                      },
                      { icon: "bi-envelope", val: selectedOrder.user?.email },
                      { icon: "bi-telephone", val: selectedOrder.user?.phone },
                    ]
                      .filter((r) => r.val)
                      .map(({ icon, val }) => (
                        <div key={icon} className="aob-detail-row">
                          <i className={`bi ${icon} text-primary`}></i>
                          <span>{val}</span>
                        </div>
                      ))}
                  </div>

                  <div className="odm-divider"></div>

                  <h3 className="odm-card-title">
                    <i className="bi bi-geo-alt-fill"></i> Deliver to
                    {userLoc?.label && (
                      <span className="odm-tag">{userLoc.label}</span>
                    )}
                  </h3>
                  {userLoc?.address ? (
                    <>
                      <p className="odm-address">{userLoc.address}</p>
                      {userDirections && (
                        <a
                          className="btn btn-outline-secondary btn-sm"
                          href={userDirections}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <i className="bi bi-signpost-2 me-1"></i> Get
                          directions
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-muted small mb-0">
                      No saved address on file for this customer.
                    </p>
                  )}
                </section>

                {/* ── Restaurant / pickup point ── */}
                <section className="odm-card">
                  <h3 className="odm-card-title">
                    <i className="bi bi-shop"></i> Pickup from
                  </h3>
                  {resturentInfo ? (
                    <>
                      <div className="aob-detail-row">
                        <i className="bi bi-building text-primary"></i>
                        <span className="fw-semibold">
                          {resturentInfo.name || "—"}
                        </span>
                      </div>
                      {resturentInfo.phone && (
                        <div className="aob-detail-row">
                          <i className="bi bi-telephone text-primary"></i>
                          <span>{resturentInfo.phone}</span>
                        </div>
                      )}

                      <div className="odm-divider"></div>

                      {resturentLoc?.address ? (
                        <>
                          <p className="odm-address">{resturentLoc.address}</p>
                          {resturentDirections && (
                            <a
                              className="btn btn-outline-secondary btn-sm"
                              href={resturentDirections}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <i className="bi bi-signpost-2 me-1"></i> Get
                              directions
                            </a>
                          )}
                        </>
                      ) : (
                        <p className="text-muted small mb-0">
                          No pickup address on file.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted small mb-0">
                      Restaurant details aren't available on this order.
                    </p>
                  )}
                </section>
              </div>

              {/* ── Order summary ── */}
              <section className="odm-card mt-3">
                <h3 className="odm-card-title">
                  <i className="bi bi-receipt"></i> Order Summary
                </h3>
                <div className="aob-summary-row">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal || 0}</span>
                </div>
                <div className="aob-summary-row">
                  <span>Delivery Charge</span>
                  <span>₹{selectedOrder.deliveryCharge || 0}</span>
                </div>
                <div className="odm-divider"></div>
                <div className="aob-summary-row total">
                  <span>Total</span>
                  <span>₹{selectedOrder.total || 0}</span>
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
              </section>

              {/* ── Items ── */}
              {selectedOrder.products?.length > 0 && (
                <section className="odm-card mt-3">
                  <h3 className="odm-card-title">
                    <i className="bi bi-boxes"></i> Items
                  </h3>
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
                          // `variant` is an object ({color, size, stockQuantity,
                          // stock, price, finalPrice, pic, sku, _id}), not a
                          // string — rendering it directly is what crashed
                          // React. Build a readable label from its fields
                          // instead, and prefer its price fields for the total.
                          const variantLabel = [p.variant?.color, p.variant?.size]
                            .filter(Boolean)
                            .join(" / ");
                          const lineTotal =
                            p.total ??
                            (p.variant?.finalPrice ?? p.variant?.price ?? p.price ?? 0) *
                              (p.qty || p.quantity || 1);
                          return (
                            <tr key={p._id || i}>
                              <td className="text-muted">{i + 1}</td>
                              <td className="fw-semibold">
                                {p.product?.name || p.name || "—"}
                              </td>
                              <td>{variantLabel || "—"}</td>
                              <td>{p.qty || p.quantity || 1}</td>
                              <td className="text-end">₹{lineTotal}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
                {selectedOrder.orderStatus === "Out for Delivery" && (
                  <Link
                    className="btn btn-primary"
                    to={`/delivery/${_id}/live-map/${selectedOrder._id}`}
                  >
                    <i className="bi bi-geo-alt me-1"></i> Go to Live Tracking
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

// Base styles for elements that appear regardless of whether the Order
// Details modal is open: the row action buttons, the status-pill filter
// bar, and the shared modal chrome (overlay/card/header/body/detail rows/
// summary rows).
const BASE_STYLES = `
/* ── Row action buttons ── */
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
.act-btn-view:hover  { background: #cfe2ff; color: #0d6efd; }
.act-btn-items:hover { background: #e2d9f3; color: #6f42c1; }
.act-btn-track:hover { background: #d1f4e0; color: #198754; }
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
.total-cell { font-weight: 600; color: #198754; }

/* ── Filter bar ── */
.filter-bar {
  display: inline-flex; align-items: center; gap: 8px;
  flex-wrap: wrap;
}
.status-pill-group {
  display: inline-flex; border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: 8px; overflow: hidden;
}
.status-pill {
  display: inline-flex; align-items: center; gap: 6px;
  border: none; background: #fff; padding: 0.32rem 0.75rem;
  font-size: 0.8rem; font-weight: 600; color: #6c757d; cursor: pointer;
  transition: background .13s, color .13s;
}
.status-pill + .status-pill { border-left: 1px solid var(--bs-border-color, #dee2e6); }
.status-pill.pill-all.is-active { background: #0d6efd; color: #fff; }
.status-pill.pill-pending.is-active { background: #fd7e14; color: #fff; }
.status-pill.pill-delivered.is-active { background: #198754; color: #fff; }
.filter-date-select {
  border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: 8px; padding: 0.32rem 0.6rem;
  font-size: 0.8rem; font-weight: 600; color: #495057;
  background: #fff; cursor: pointer;
}

/* ── Modal chrome (Order Details modal) ── */
.aob-overlay {
  position: fixed; inset: 0; z-index: 1050;
  background: rgba(15, 18, 25, 0.55);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.aob-modal {
  background: #fff; border-radius: 14px;
  max-width: 480px; width: 100%;
  max-height: 90vh; display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  overflow: hidden;
}
.aob-modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 12px; padding: 18px 20px; border-bottom: 1px solid #eef0f3;
  flex-shrink: 0;
}
.aob-modal-body {
  padding: 18px 20px; overflow-y: auto;
}
.aob-close-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 8px;
  border: none; background: #f1f3f5; color: #495057; cursor: pointer;
  flex-shrink: 0; transition: background .13s, color .13s;
}
.aob-close-btn:hover { background: #e9ecef; color: #212529; }
.aob-detail-row {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; color: #212529; margin-bottom: 6px;
}
.aob-summary-row {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 14px; color: #495057; padding: 4px 0;
}
.aob-summary-row.total {
  font-weight: 700; font-size: 15px; color: #212529;
}
`;

// Scoped styles for the redesigned Order Details modal only, prefixed
// "odm-" (Order Details Modal) so they can't clash with the app's global
// aob-/panel classes. Reuses those global classes for anything they already
// style well (badges, detail rows, summary rows) and only adds what's new:
// the two-column card grid and the section dividers/tags within it.
const ORDER_DETAILS_STYLES = `
.aob-modal-lg { max-width: 760px; width: 100%; }

.odm-eyebrow {
  font-size: 11px; text-transform: uppercase; letter-spacing: .06em;
  color: #8a8f98; font-weight: 600;
}

.odm-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 768px) {
  .odm-grid { grid-template-columns: 1fr 1fr; align-items: start; }
}

.odm-card {
  border: 1px solid #eef0f3;
  border-radius: 10px;
  padding: 14px 16px;
}

.odm-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: #6c7280;
  margin-bottom: 10px;
}

.odm-tag {
  margin-left: auto;
  font-size: 10px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  color: #0d6efd;
  background: rgba(13, 110, 253, .1);
  border-radius: 999px;
  padding: 2px 8px;
}

.odm-address {
  font-size: 14px;
  color: #212529;
  margin-bottom: 8px;
  line-height: 1.4;
}

.odm-divider {
  height: 1px;
  margin: 10px 0;
}
`;