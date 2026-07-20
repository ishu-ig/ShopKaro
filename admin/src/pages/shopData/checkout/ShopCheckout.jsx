import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getCheckout,
  deleteCheckout,
} from "../../../Redux/ActionCreators/CheckoutActionCreators";

const STATUS_BADGE = {
  Ordered: "text-bg-info",
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

export default function ShopCheckout() {
  const { _id } = useParams();
  const CheckoutStateData = useSelector((state) => state.CheckoutStateData);
  const dispatch = useDispatch();
  const [flag, setFlag] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // "all" | "today"
  const [data, setData] = useState([]);

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
  function deleteRecord(_id) {
    if (window.confirm("Are you sure you want to delete this order?")) {
      dispatch(deleteCheckout({ _id }));
      setFlag((f) => !f);
    }
  }

  useEffect(() => {
    dispatch(getCheckout());
  }, [flag]);

  useEffect(() => {
    if (!orders.length) {
      setData([]);
      return;
    }

    const scoped = orders.filter((order) =>
      order.products?.some(
        (item) => item.product?.shop?._id?.toString() === _id,
      ),
    );

    setData(scoped);
  }, [orders, _id]);

  const filteredData = data
    .filter(
      (order) =>
        order._id?.toLowerCase().includes(search.toLowerCase()) ||
        order.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
        order.orderStatus?.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((order) =>
      dateFilter === "today" ? isToday(order.createdAt) : true,
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
        .act-btn-view:hover  { background: #cfe2ff; color: #0d6efd; }
        .act-btn-items:hover { background: #e2d9f3; color: #6f42c1; }
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
        .date-filter-group { display: inline-flex; border: 1px solid var(--bs-border-color, #dee2e6); border-radius: 8px; overflow: hidden; }
        .date-filter-btn {
          border: none; background: #fff; padding: 0.28rem 0.75rem;
          font-size: 0.8rem; font-weight: 600; color: #6c757d; cursor: pointer;
          transition: background .13s, color .13s;
        }
        .date-filter-btn + .date-filter-btn { border-left: 1px solid var(--bs-border-color, #dee2e6); }
        .date-filter-btn.active { background: #0d6efd; color: #fff; }
      `}</style>

      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          <div className="page-heading">
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-cart-check" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Management</p>
                <h1 className="h3 mb-1">Checkout Orders</h1>
                <p className="text-muted mb-0">
                  Review and manage customer orders.
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
                  <span>being</span>
                  <span>fulfilled</span>
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
                  <span>orders</span>
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
                  Search, review, and manage orders.
                </p>
              </div>

              <div className="ms-auto d-flex align-items-center gap-2">
                <div className="date-filter-group">
                  <button
                    type="button"
                    className={`date-filter-btn${dateFilter === "all" ? " active" : ""}`}
                    onClick={() => setDateFilter("all")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`date-filter-btn${dateFilter === "today" ? " active" : ""}`}
                    onClick={() => setDateFilter("today")}
                  >
                    Today
                  </button>
                </div>

                <div style={{ minWidth: 220 }}>
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
                            <Link
                              className="act-btn act-btn-view"
                              to={`/checkout/view/${order._id}`}
                              data-tip="View"
                            >
                              <i className="bi bi-eye"></i>
                            </Link>
                            <span className="act-sep"></span>
                            <button
                              className="act-btn act-btn-del"
                              onClick={() => deleteRecord(order._id)}
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
                      <td colSpan="7" className="text-center text-muted py-4">
                        {search
                          ? `No orders found for "${search}"`
                          : dateFilter === "today"
                            ? "No orders for today."
                            : "No orders available."}
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