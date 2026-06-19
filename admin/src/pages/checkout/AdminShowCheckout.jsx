import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCheckout, updateCheckout } from "../../Redux/ActionCreators/CheckoutActionCreators";

const STATUS_STEPS = [
  { key: "Order is Placed",   label: "Ordered",          icon: "bi-clipboard-check" },
  { key: "Processing",        label: "Processing",       icon: "bi-gear" },
  { key: "Shipped",           label: "Shipped",          icon: "bi-box-seam" },
  { key: "Out for Delivery",  label: "Out for Delivery", icon: "bi-truck" },
  { key: "Delivered",         label: "Delivered",        icon: "bi-check-circle" },
];

export default function AdminCheckoutShow() {
  const { _id } = useParams();
  const CheckoutStateData = useSelector((state) => state.CheckoutStateData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [saved, setSaved] = useState(false);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState("");

  useEffect(() => { dispatch(getCheckout()); }, [dispatch]);

  useEffect(() => {
    async function fetchDeliveryBoys() {
      try {
        let res = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user`, {
          headers: { authorization: localStorage.getItem("token") },
        });
        res = await res.json();
        const list = Array.isArray(res) ? res : res.data || [];
        setDeliveryBoys(list.filter((u) => u.role === "Delivery Boy" && u.active));
      } catch (e) {
        console.error("Failed to fetch delivery boys", e);
      }
    }
    fetchDeliveryBoys();
  }, []);

  useEffect(() => {
    const list = Array.isArray(CheckoutStateData) ? CheckoutStateData : CheckoutStateData?.data || [];
    if (list.length) {
      const item = list.find((x) => x._id === _id);
      if (item) {
        setData({ ...item });
        setOrderStatus(item.orderStatus || "Order is Placed");
        setPaymentStatus(item.paymentStatus || "Pending");
        setSelectedDeliveryBoy(item.deliveryBoy?._id || item.deliveryBoy || "");
      } else {
        alert("Invalid Checkout ID");
      }
    }
  }, [_id, CheckoutStateData]);

  function updateRecord() {
    if (orderStatus === "Out for Delivery" && !selectedDeliveryBoy) {
      alert("Please assign a delivery boy before setting status to 'Out for Delivery'.");
      return;
    }
    if (window.confirm("Are you sure you want to update the status?")) {
      const updatedData = { ...data, orderStatus, paymentStatus, deliveryBoy: selectedDeliveryBoy || undefined };
      dispatch(updateCheckout(updatedData));
      setData(updatedData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      navigate("/checkout");
    }
  }

  if (!data) {
    return (
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4 d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3"></div>
            <p className="text-muted">Loading order…</p>
          </div>
        </div>
      </main>
    );
  }

  const currentStep = STATUS_STEPS.findIndex(
    (s) => s.key.toLowerCase() === data.orderStatus?.toLowerCase()
  );
  const isCancelled = data.orderStatus === "Cancelled";
  const isCompleted = data.orderStatus === "Delivered" && data.paymentStatus === "Done";
  const canUpdateOrder   = data.orderStatus !== "Delivered" && !isCancelled;
  const canUpdatePayment = data.paymentStatus !== "Done";
  const showUpdatePanel  = canUpdateOrder || canUpdatePayment;

  const safeStep = currentStep === -1 ? 0 : currentStep;
  const nextStatusOptions = STATUS_STEPS.map((s, i) => ({
    ...s,
    disabled: i > safeStep + 1 || i < safeStep,
  }));

  const statusBadgeClass = isCancelled
    ? "text-bg-danger"
    : data.orderStatus === "Delivered"
    ? "text-bg-success"
    : data.orderStatus === "Out for Delivery"
    ? "text-bg-warning"
    : "text-bg-info";

  // Resolve the assigned delivery boy's details — handles both a populated
  // object (data.deliveryBoy is {_id, name, phone, email}) and a plain ID
  // string (data.deliveryBoy is just an _id), falling back to the fetched
  // deliveryBoys list to look up details in the latter case.
  const assignedDeliveryBoy = (() => {
    const db = data.deliveryBoy;
    if (!db) return null;
    if (typeof db === "object") return db;
    return deliveryBoys.find((d) => d._id === db) || { _id: db };
  })();

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
        .summary-row { display: flex; justify-content: space-between; padding: 0.4rem 0; font-size: 0.85rem; color: #495057; }
        .summary-row.total { font-size: 1rem; font-weight: 700; color: #212529; }
        .summary-row.total span:last-child { color: #0d6efd; }
      `}</style>

      <div className="container-fluid px-3 px-lg-4 py-4">

        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-receipt" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Order Details</h1>
              <p className="text-muted mb-0">ID: {data._id}</p>
            </div>
          </div>
          <div className="heading-actions d-flex flex-wrap gap-2 align-items-center">
            <span className={`badge ${statusBadgeClass}`}>{data.orderStatus}</span>
            <span className={`badge ${data.paymentStatus === "Done" ? "text-bg-success" : "text-bg-warning"}`}>
              {data.paymentStatus}
            </span>
            <Link className="btn btn-outline-secondary btn-sm" to="/checkout">
              <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to Orders
            </Link>
          </div>
        </div>

        {saved && (
          <div className="alert alert-success" role="alert">
            <i className="bi bi-check-circle me-2"></i>Order status updated successfully
          </div>
        )}

        <section className="row g-3">

          {!isCancelled && (
            <div className="col-12">
              <div className="panel">
                <h2 className="h5 mb-0 section-title">
                  <i className="bi bi-signpost-split" aria-hidden="true"></i>
                  <span>Order Progress</span>
                </h2>
                <div className="order-progress-row">
                  {STATUS_STEPS.map((step, i) => {
                    const isDone    = i < currentStep;
                    const isCurrent = i === currentStep;
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
                          <div className={`order-progress-line ${isDone ? "done" : ""}`}></div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="col-12">
              <div className="alert alert-danger d-flex align-items-center gap-3 mb-0" role="alert">
                <i className="bi bi-x-circle fs-3"></i>
                <div>
                  <div className="fw-bold">Order Cancelled</div>
                  <div className="small">This order has been cancelled and cannot be updated.</div>
                </div>
              </div>
            </div>
          )}

          <div className={assignedDeliveryBoy ? "col-12 col-lg-4" : "col-12 col-lg-6"}>
            <div className="panel h-100">
              <h2 className="h5 mb-3 section-title">
                <i className="bi bi-person" aria-hidden="true"></i>
                <span>Customer</span>
              </h2>
              <div className="d-flex flex-column gap-2">
                {[
                  { icon: "bi-person",      val: data.user?.name },
                  { icon: "bi-envelope",    val: data.user?.email },
                  { icon: "bi-telephone",   val: data.user?.phone },
                  { icon: "bi-geo-alt",     val: [data.user?.address, data.user?.city, data.user?.state, data.user?.pin].filter(Boolean).join(", ") },
                ].filter((r) => r.val).map(({ icon, val }) => (
                  <div key={icon} className="detail-row">
                    <i className={`bi ${icon} text-primary`}></i>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {assignedDeliveryBoy && (
            <div className="col-12 col-lg-4">
              <div className="panel h-100">
                <h2 className="h5 mb-3 section-title">
                  <i className="bi bi-truck" aria-hidden="true"></i>
                  <span>Delivery Boy</span>
                </h2>
                <div className="d-flex flex-column gap-2">
                  {[
                    { icon: "bi-person",    val: assignedDeliveryBoy.name },
                    { icon: "bi-telephone", val: assignedDeliveryBoy.phone },
                    { icon: "bi-envelope",  val: assignedDeliveryBoy.email },
                  ].filter((r) => r.val).map(({ icon, val }) => (
                    <div key={icon} className="detail-row">
                      <i className={`bi ${icon} text-primary`}></i>
                      <span>{val}</span>
                    </div>
                  ))}
                  {!assignedDeliveryBoy.name && (
                    <div className="text-muted small">
                      <i className="bi bi-info-circle me-1"></i>
                      Delivery boy assigned (ID: {assignedDeliveryBoy._id}), but details aren't loaded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className={assignedDeliveryBoy ? "col-12 col-lg-4" : "col-12 col-lg-6"}>
            <div className="panel h-100">
              <h2 className="h5 mb-3 section-title">
                <i className="bi bi-file-earmark-text" aria-hidden="true"></i>
                <span>Order Summary</span>
              </h2>
              <div className="summary-row"><span>Subtotal</span><span>₹{data.subtotal || 0}</span></div>
              <div className="summary-row"><span>Shipping</span><span>₹{data.shipping || 0}</span></div>
              <hr className="my-2" />
              <div className="summary-row total"><span>Total</span><span>₹{data.total || 0}</span></div>
              <div className="summary-row"><span>Payment Mode</span><span>{data.paymentMode || "COD"}</span></div>
              <div className="summary-row">
                <span>Payment Status</span>
                <span className={`badge ${data.paymentStatus === "Done" ? "text-bg-success" : "text-bg-warning"}`}>
                  {data.paymentStatus}
                </span>
              </div>
              <div className="summary-row">
                <span>Order Date</span>
                <span>{data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
              </div>
              {data.rppid && (
                <div className="summary-row">
                  <span>Transaction ID</span>
                  <span className="small" style={{ wordBreak: "break-all" }}>{data.rppid}</span>
                </div>
              )}
            </div>
          </div>

          {data.products?.length > 0 && (
            <div className="col-12">
              <div className="panel">
                <div className="panel-header">
                  <h2 className="h5 mb-0 section-title">
                    <i className="bi bi-box-seam" aria-hidden="true"></i>
                    <span>Ordered Items</span>
                  </h2>
                  <span className="badge text-bg-primary-subtle text-primary-emphasis ms-auto">
                    {data.products.length} item{data.products.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.products.map((p, i) => (
                        <tr key={i}>
                          <td className="text-muted">{i + 1}</td>
                          <td className="fw-semibold">{p.name || p.product?.name || "—"}</td>
                          <td>{p.qty || p.quantity || 1}</td>
                          <td>₹{p.total || p.price || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {showUpdatePanel && !isCancelled && (
            <div className="col-12">
              <div className="panel">
                <h2 className="h5 mb-3 section-title">
                  <i className="bi bi-pencil-square" aria-hidden="true"></i>
                  <span>Update Status</span>
                </h2>
                <div className="row g-3">
                  {canUpdateOrder && (
                    <div className="col-md-4">
                      <label className="form-label">Order Status</label>
                      <select className="form-select" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                        {nextStatusOptions.map((s) => (
                          <option key={s.key} value={s.key} disabled={s.disabled}>{s.label}</option>
                        ))}
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  )}
                  {canUpdateOrder && orderStatus === "Out for Delivery" && (
                    <div className="col-md-4">
                      <label className="form-label">Assign Delivery Boy</label>
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
                          Please assign a delivery boy before saving.
                        </div>
                      )}
                    </div>
                  )}
                  {canUpdatePayment && (
                    <div className="col-md-4">
                      <label className="form-label">Payment Status</label>
                      <select className="form-select" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                        <option value="Pending">Pending</option>
                        <option value="Done">Done</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="d-flex justify-content-end mt-4">
                  <button className="btn btn-primary" onClick={updateRecord}>
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
                  <div className="fw-bold">Order Completed</div>
                  <div className="small">This order has been delivered and payment received.</div>
                </div>
              </div>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}