import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getCheckout } from "../Redux/ActionCreators/CheckoutActionCreators";
import { getReturn, createReturn } from "../Redux/ActionCreators/ReturnActionCreators";

const STATUS_STEPS = [
  "Ordered",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];
const STATUS_ICONS = {
  Ordered: "fa-file-alt",
  Packed: "fa-box",
  Shipped: "fa-truck",
  "Out for Delivery": "fa-map-marker-alt",
  Delivered: "fa-check-circle",
};

function getOrderStepIndex(status) {
  if (!status) return 0;
  const s = String(status).toLowerCase().trim();
  if (s === "order is placed" || s === "ordered" || s === "placed") return 0;
  if (s === "packed" || s === "order is packed" || s === "processing" || s === "order is under process") return 1;
  if (s === "shipped") return 2;
  if (s === "out for delivery") return 3;
  if (s === "delivered") return 4;
  return -1;
}

// Return request statuses (match the backend RETURN_STATUSES)
const RETURN_BADGE = {
  pending: { bg: "rgba(201,168,76,0.14)", color: "#9a7b1f", label: "Return Requested" },
  approved: { bg: "rgba(59,130,246,0.12)", color: "#2563eb", label: "Return Approved" },
  completed: { bg: "rgba(16,185,129,0.1)", color: "#059669", label: "Return Completed" },
  rejected: { bg: "rgba(244,63,94,0.1)", color: "#e11d48", label: "Return Rejected" },
  cancelled: { bg: "rgba(120,120,120,0.12)", color: "#666", label: "Return Cancelled" },
};

// Rejected / cancelled returns don't block a fresh request
const BLOCKING_STATUSES = ["pending", "approved", "completed"];

const REASON_PRESETS = [
  "Product is damaged or defective",
  "Wrong item received",
  "Size or fit issue",
  "Not as described",
  "Quality not as expected",
  "Other",
];

const MIN_REASON_LENGTH = 10;

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "11px 0",
        borderBottom: "1px solid rgba(200,64,10,0.07)",
        gap: 16,
      }}
    >
      <span
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7A6E65",
          flexShrink: 0,
          minWidth: 80,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "0.88rem",
          fontWeight: 500,
          color: "#1C1009",
          textAlign: "right",
        }}
      >
        {value || (
          <span style={{ color: "#ccc", fontStyle: "italic" }}>Not set</span>
        )}
      </span>
    </div>
  );
}

function Card({ icon, title, children, delay = ".1s" }) {
  return (
    <div
      className="wow fadeIn"
      data-wow-delay={delay}
      style={{
        background: "white",
        borderRadius: 20,
        border: "1px solid rgba(201,168,76,0.1)",
        boxShadow: "0 2px 16px rgba(28,16,9,0.07)",
        marginBottom: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(201,168,76,0.1)",
          background: "#FFFBF7",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "rgba(201,168,76,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--sk-gold, #c9a84c)",
            flexShrink: 0,
          }}
        >
          <i className={`fa ${icon}`} style={{ fontSize: "0.85rem" }}></i>
        </div>
        <h6
          style={{
            fontFamily: "Playfair Display,serif",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "#1C1009",
            margin: 0,
          }}
        >
          {title}
        </h6>
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── Return reason modal ───────────────────────── */
function ReturnModal({ item, onClose, onSubmit, submitting }) {
  const [preset, setPreset] = useState("");
  const [details, setDetails] = useState("");
  const [touched, setTouched] = useState(false);

  // Close on Esc
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  // Final reason sent to the backend: preset (if any) + free-text details
  const reason = [preset, details.trim()].filter(Boolean).join(" — ");
  const tooShort = reason.length < MIN_REASON_LENGTH;
  const showError = touched && tooShort;

  function handleSubmit() {
    setTouched(true);
    if (tooShort || submitting) return;
    onSubmit(reason);
  }

  const prodImg =
    item.variant?.pic?.[0] ||
    item.product?.variants?.[0]?.pic?.[0] ||
    item.product?.pic?.[0] ||
    null;

  return (
    <div
      onClick={() => !submitting && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28,16,9,0.55)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Request a return"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 20,
          width: "100%",
          maxWidth: 480,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(28,16,9,0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid rgba(201,168,76,0.12)",
            background: "#FFFBF7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "20px 20px 0 0",
          }}
        >
          <h6
            style={{
              fontFamily: "Playfair Display,serif",
              fontWeight: 700,
              fontSize: "1.02rem",
              color: "#1C1009",
              margin: 0,
            }}
          >
            <i
              className="fa fa-undo"
              style={{ color: "var(--sk-gold, #c9a84c)", marginRight: 10, fontSize: "0.9rem" }}
            ></i>
            Return Product
          </h6>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            style={{
              border: "none",
              background: "transparent",
              fontSize: "1.1rem",
              color: "#7A6E65",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            <i className="fa fa-times"></i>
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          {/* Product summary */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              background: "rgba(200,64,10,0.03)",
              border: "1px solid rgba(200,64,10,0.07)",
              borderRadius: 12,
              marginBottom: 18,
            }}
          >
            {prodImg ? (
              <img
                src={prodImg.replace(/\\/g, "/")}
                alt={item.product?.name || "Product"}
                style={{ width: 46, height: 46, borderRadius: 8, objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 8,
                  background: "rgba(201,168,76,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--sk-gold, #c9a84c)",
                }}
              >
                <i className="fa fa-box"></i>
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  color: "#1C1009",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.product?.name}
              </div>
              <div style={{ fontSize: "0.74rem", color: "#7A6E65" }}>
                {[item.variant?.color, item.variant?.size].filter(Boolean).join(" / ")}
                {item.qty ? ` · Qty ${item.qty}` : ""}
              </div>
            </div>
          </div>

          {/* Reason chips */}
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#7A6E65",
              marginBottom: 8,
            }}
          >
            Why are you returning this?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {REASON_PRESETS.map((p) => {
              const active = preset === p;
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPreset(active ? "" : p)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 50,
                    fontSize: "0.76rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: active
                      ? "1.5px solid var(--sk-gold, #c9a84c)"
                      : "1.5px solid rgba(201,168,76,0.25)",
                    background: active ? "rgba(201,168,76,0.14)" : "white",
                    color: active ? "#8a6d1a" : "#7A6E65",
                    transition: "all 0.15s",
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Details */}
          <label
            htmlFor="return-details"
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#7A6E65",
              marginBottom: 6,
              display: "block",
            }}
          >
            Additional details
          </label>
          <textarea
            id="return-details"
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Tell us what went wrong so we can process your return faster…"
            maxLength={500}
            style={{
              width: "100%",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: "0.88rem",
              resize: "vertical",
              outline: "none",
              border: showError
                ? "1.5px solid #e11d48"
                : "1.5px solid rgba(201,168,76,0.28)",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.72rem",
              marginTop: 4,
              color: showError ? "#e11d48" : "#999",
            }}
          >
            <span>
              {showError
                ? `Please give a reason (at least ${MIN_REASON_LENGTH} characters).`
                : "A short, clear reason is enough."}
            </span>
            <span>{details.length}/500</span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: "9px 20px",
                borderRadius: 50,
                background: "transparent",
                border: "1.5px solid rgba(201,168,76,0.3)",
                color: "var(--sk-gold, #c9a84c)",
                fontWeight: 700,
                fontSize: "0.84rem",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: "9px 22px",
                borderRadius: 50,
                border: "none",
                color: "white",
                fontWeight: 700,
                fontSize: "0.84rem",
                cursor: submitting ? "not-allowed" : "pointer",
                background: "linear-gradient(135deg,var(--sk-gold, #c9a84c),var(--sk-gold-bright, #e8c873))",
                opacity: submitting ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {submitting ? (
                <>
                  <div
                    style={{
                      width: 13,
                      height: 13,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  ></div>
                  Submitting…
                </>
              ) : (
                "Submit Return Request"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { _id } = useParams();
  const CheckoutStateData = useSelector((state) => state.CheckoutStateData);
  const ReturnStateData = useSelector((state) => state.ReturnStateData);
  const [order, setOrder] = useState(null);
  const dispatch = useDispatch();

  // Return flow state
  const [returnItem, setReturnItem] = useState(null); // order line currently being returned
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    dispatch(getCheckout());
    dispatch(getReturn());
  }, [dispatch]);

  useEffect(() => {
    if (CheckoutStateData.length) {
      setOrder(CheckoutStateData.find((o) => o._id === _id) || {});
    }
  }, [CheckoutStateData, _id]);

  const [invoiceLoading, setInvoiceLoading] = React.useState(false);

  const generateInvoice = async () => {
    if (invoiceLoading) return;
    setInvoiceLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/invoice/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({ orderId: _id }),
        }
      );

      const data = await response.json();

      if (response.ok && data.result === "Done" && data.invoice?.invoiceNumber) {
        window.open(
          `${process.env.REACT_APP_BACKEND_SERVER}/invoices/${data.invoice.invoiceNumber}.pdf`,
          "_blank"
        );
      } else {
        alert(data.reason || "Invoice generation failed. Please try again.");
      }
    } catch (err) {
      console.error("Invoice error:", err);
      alert("Could not connect to server. Please try again.");
    } finally {
      setInvoiceLoading(false);
    }
  };

  if (!order)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: "3px solid rgba(200,64,10,0.15)",
            borderTopColor: "var(--sk-gold, #c9a84c)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <span style={{ fontSize: 13, color: "#7A6E65", letterSpacing: 1 }}>
          Loading order…
        </span>
      </div>
    );

  const currentIndex = getOrderStepIndex(order.orderStatus);
  const isCancelled = order.orderStatus?.toLowerCase() === "cancelled";
  const isDelivered = order.orderStatus?.toLowerCase() === "delivered";
  const isOutForDelivery = order.orderStatus?.toLowerCase() === "out for delivery";

  const statusStyle = isDelivered
    ? { bg: "rgba(16,185,129,0.1)", color: "#059669" }
    : isCancelled
      ? { bg: "rgba(244,63,94,0.1)", color: "#e11d48" }
      : { bg: "rgba(201,168,76,0.12)", color: "var(--sk-gold, #c9a84c)" };

  /* ───────── Return helpers ───────── */
  const allReturns = Array.isArray(ReturnStateData)
    ? ReturnStateData
    : ReturnStateData?.data ?? [];

  // Returns that belong to THIS order
  const orderReturns = allReturns.filter(
    (r) => (r.order?._id ?? r.order) === _id
  );

  // Latest return for a product on this order (any status) — used for the badge
  function latestReturnFor(prod) {
    const pid = prod.product?._id;
    return orderReturns
      .filter((r) => (r.product?._id ?? r.product) === pid)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  }

  // Return eligibility for one order line, based on the product's own policy.
  // ASSUMPTION: the delivery date is order.deliveredAt; if your Checkout model
  // has no such field we fall back to updatedAt, then createdAt.
  function returnEligibility(prod) {
    const p = prod.product || {};
    const returnable = p.isreturnAble !== false && (p.returnDuration ?? 7) > 0;
    if (!returnable) return { state: "notReturnable" };

    const days = p.returnDuration ?? 7;
    const base = new Date(order.deliveredAt || order.updatedAt || order.createdAt);
    const deadline = new Date(base);
    deadline.setDate(deadline.getDate() + days);
    const daysLeft = Math.ceil((deadline - new Date()) / 86400000);

    return daysLeft > 0
      ? { state: "eligible", daysLeft, days }
      : { state: "expired", days };
  }

  function submitReturn(reason) {
    if (!returnItem) return;
    setReturnSubmitting(true);

    dispatch(
      createReturn({
        product: returnItem.product?._id,
        user: order.user?._id || localStorage.getItem("userid"),
        order: order._id,
        reason,
      })
    );

    // Action creators here are fire-and-forget: close the modal, then refetch
    // so ReturnStateData picks up the new request and the badge appears.
    setTimeout(() => {
      dispatch(getReturn());
      setReturnSubmitting(false);
      setReturnItem(null);
      setToast("Return request submitted successfully");
      setTimeout(() => setToast(""), 3500);
    }, 700);
  }

  return (
    <div
      style={{
        padding: "48px 0 100px",
        background: "linear-gradient(135deg,#FDF6EE 0%,#FFF8F3 100%)",
        minHeight: "100vh",
      }}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div className="container" style={{ maxWidth: 820 }}>
        {/* ── Page header ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: "var(--sk-gold, #c9a84c)",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Order
            </p>
            <h2
              style={{
                fontFamily: "Playfair Display,serif",
                fontWeight: 900,
                fontSize: "clamp(1.5rem,3vw,2rem)",
                color: "#1C1009",
                margin: 0,
              }}
            >
              Order Details
            </h2>
            <div style={{ fontSize: "0.8rem", color: "#7A6E65", marginTop: 4 }}>
              #{order._id?.slice(-10)?.toUpperCase()}
            </div>
          </div>
          <span
            style={{
              background: statusStyle.bg,
              color: statusStyle.color,
              borderRadius: 50,
              padding: "8px 20px",
              fontSize: "0.82rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            <i
              className={`fa ${isDelivered ? "fa-check" : isCancelled ? "fa-times" : "fa-clock"
                } me-2`}
              style={{ fontSize: "0.72rem" }}
            ></i>
            {order.orderStatus}
          </span>
        </div>

        {/* ── Order Summary ── */}
        <Card icon="fa-info-circle" title="Order Summary" delay=".1s">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
              gap: 16,
            }}
          >
            {[
              {
                label: "Order ID",
                value: (
                  <span style={{ fontSize: "0.78rem", wordBreak: "break-all" }}>
                    {order._id}
                  </span>
                ),
              },
              {
                label: "Order Date",
                value: order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                  : "—",
              },
              {
                label: "Expected Delivery",
                value: order.expectedDelivery
                  ? new Date(order.expectedDelivery).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                  : "3–6 business days",
              },
              { label: "Payment Mode", value: order.paymentMode },
              {
                label: "Payment Status",
                value: (
                  <span
                    style={{
                      background:
                        order.paymentStatus === "Pending"
                          ? "rgba(244,63,94,0.1)"
                          : "rgba(16,185,129,0.1)",
                      color:
                        order.paymentStatus === "Pending"
                          ? "#e11d48"
                          : "#059669",
                      borderRadius: 50,
                      padding: "3px 12px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {order.paymentStatus}
                  </span>
                ),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "rgba(200,64,10,0.03)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  border: "1px solid rgba(200,64,10,0.07)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#7A6E65",
                    marginBottom: 6,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    color: "#1C1009",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Order Progress Tracker ── */}
        {!isCancelled && (
          <Card icon="fa-map-marked-alt" title="Order Progress" delay=".2s">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                position: "relative",
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {/* Background line */}
              <div
                style={{
                  position: "absolute",
                  top: 17,
                  left: "5%",
                  right: "5%",
                  height: 2,
                  background: "rgba(201,168,76,0.12)",
                  zIndex: 0,
                }}
              />
              {/* Progress fill */}
              <div
                style={{
                  position: "absolute",
                  top: 17,
                  left: "5%",
                  width:
                    currentIndex >= 0
                      ? `${(currentIndex / (STATUS_STEPS.length - 1)) * 90}%`
                      : "0%",
                  height: 2,
                  background: "linear-gradient(90deg,var(--sk-gold, #c9a84c),var(--sk-gold-bright, #e8c873))",
                  zIndex: 1,
                  transition: "width 0.6s ease",
                }}
              />

              {STATUS_STEPS.map((step, index) => {
                const done = currentIndex > index;
                const current = currentIndex === index;
                return (
                  <div
                    key={step}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                      minWidth: 60,
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: done
                          ? "linear-gradient(135deg,var(--sk-gold, #c9a84c),var(--sk-gold-bright, #e8c873))"
                          : "white",
                        border: done
                          ? "none"
                          : current
                            ? "2.5px solid var(--sk-gold, #c9a84c)"
                            : "2px solid rgba(201,168,76,0.22)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: done ? "white" : current ? "var(--sk-gold, #c9a84c)" : "#ccc",
                        fontSize: "0.8rem",
                        boxShadow: current
                          ? "0 0 0 4px rgba(200,64,10,0.12)"
                          : "none",
                        transition: "all 0.3s",
                      }}
                    >
                      <i
                        className={`fa ${done ? "fa-check" : STATUS_ICONS[step]}`}
                      ></i>
                    </div>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: current || done ? 700 : 500,
                        color: done ? "var(--sk-gold, #c9a84c)" : current ? "var(--sk-gold, #c9a84c)" : "#aaa",
                        marginTop: 8,
                        textAlign: "center",
                        lineHeight: 1.3,
                      }}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* ── Cancelled Banner ── */}
        {isCancelled && (
          <div
            style={{
              background: "rgba(244,63,94,0.05)",
              border: "1.5px solid rgba(244,63,94,0.15)",
              borderRadius: 20,
              padding: "28px",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "rgba(244,63,94,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                color: "#f43f5e",
                fontSize: 22,
              }}
            >
              <i className="fa fa-times" />
            </div>
            <div
              style={{
                fontFamily: "Playfair Display,serif",
                fontSize: 15,
                fontWeight: 800,
                color: "#e11d48",
                marginBottom: 4,
              }}
            >
              Order Cancelled
            </div>
            <div style={{ fontSize: 13, color: "#7A6E65" }}>
              This order has been cancelled.
            </div>
          </div>
        )}

        {/* ── Delivery Address ── */}
        <Card icon="fa-map-marker-alt" title="Delivery Address" delay=".3s">
          {[
            { label: "Name", value: order.user?.name },
            { label: "Email", value: order.user?.email },
            { label: "Phone", value: order.user?.phone },
            { label: "Address", value: order.user?.defaultAddress?.address },
            // { label: "Landmark", value: order.user?.defaultAddress?.landmark },
            { label: "City", value: order.user?.defaultAddress?.city },
            { label: "State", value: order.user?.defaultAddress?.state },
            { label: "Pincode", value: order.user?.defaultAddress?.pin },
          ].map((f) => (
            <InfoRow key={f.label} {...f} />
          ))}
        </Card>

        {/* ── Delivery Boy ── */}
        {order.deliveryBoy &&
          (isOutForDelivery || isDelivered) && (
            <Card icon="fa-motorcycle" title="Delivery Boy" delay=".35s">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,var(--sk-gold, #c9a84c),var(--sk-gold-bright, #e8c873))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 22,
                    flexShrink: 0,
                    boxShadow: "0 4px 14px rgba(201,168,76,0.28)",
                  }}
                >
                  <i className="fa fa-user"></i>
                </div>

                <div style={{ flex: 1, minWidth: 180 }}>
                  <div
                    style={{
                      fontFamily: "Playfair Display,serif",
                      fontWeight: 800,
                      fontSize: "1rem",
                      color: "#1C1009",
                      marginBottom: 6,
                    }}
                  >
                    {order.deliveryBoy?.name || "Assigned"}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {order.deliveryBoy?.phone && (
                      <a
                        href={`tel:${order.deliveryBoy.phone}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: "var(--sk-gold, #c9a84c)",
                          textDecoration: "none",
                        }}
                      >
                        <i className="fa fa-phone" style={{ fontSize: "0.72rem" }}></i>
                        {order.deliveryBoy.phone}
                      </a>
                    )}
                    {order.deliveryBoy?.vehicleNumber && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: "#7A6E65",
                        }}
                      >
                        <i className="fa fa-id-card" style={{ fontSize: "0.72rem" }}></i>
                        {order.deliveryBoy.vehicleNumber}
                      </span>
                    )}
                    {order.deliveryBoy?.vehicleType && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: "#7A6E65",
                        }}
                      >
                        <i className="fa fa-bicycle" style={{ fontSize: "0.72rem" }}></i>
                        {order.deliveryBoy.vehicleType}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ flexShrink: 0 }}>
                  <span
                    style={{
                      background:
                        isDelivered
                          ? "rgba(16,185,129,0.1)"
                          : "rgba(201,168,76,0.1)",
                      color:
                        isDelivered ? "#059669" : "var(--sk-gold, #c9a84c)",
                      borderRadius: 50,
                      padding: "6px 16px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}
                  >
                    <i
                      className={`fa ${isDelivered
                          ? "fa-check-circle"
                          : "fa-shipping-fast"
                        } me-2`}
                      style={{ fontSize: "0.7rem" }}
                    ></i>
                    {isDelivered ? "Delivered" : "On the Way"}
                  </span>
                </div>
              </div>
            </Card>
          )}

        {/* ── Ordered Products ── */}
        <Card icon="fa-box-open" title="Ordered Products" delay=".4s">
          {order.products?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {order.products.map((prod) => {
                const existingReturn = latestReturnFor(prod);
                const blocked =
                  existingReturn && BLOCKING_STATUSES.includes(existingReturn.status);
                const eligibility = isDelivered ? returnEligibility(prod) : null;
                const badge = existingReturn ? RETURN_BADGE[existingReturn.status] : null;

                return (
                  <div key={prod._id}>
                    <Link
                      to={`/product/${prod.product?._id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 14,
                          padding: "12px 16px",
                          background: "rgba(200,64,10,0.03)",
                          borderRadius: 12,
                          border: "1px solid rgba(200,64,10,0.07)",
                          flexWrap: "wrap",
                          cursor: "pointer",
                          transition: "background 0.2s, border-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(201,168,76,0.1)";
                          e.currentTarget.style.borderColor = "rgba(201,168,76,0.22)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(200,64,10,0.03)";
                          e.currentTarget.style.borderColor = "rgba(200,64,10,0.07)";
                        }}
                      >
                        {/* Product image */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {(() => {
                            const prodImg = prod.variant?.pic?.[0] || prod.product?.variants?.[0]?.pic?.[0] || prod.product?.pic?.[0] || prod.pic?.[0] || (typeof prod.pic === "string" ? prod.pic : null);
                            return (
                              <>
                                {prodImg ? (
                                  <img
                                    src={prodImg.replace(/\\/g, "/")}
                                    alt={prod.product?.name || "Product"}
                                    style={{
                                      width: 52,
                                      height: 52,
                                      borderRadius: 10,
                                      objectFit: "cover",
                                      flexShrink: 0,
                                      border: "1px solid rgba(200,64,10,0.12)",
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      if (e.currentTarget.nextSibling) {
                                        e.currentTarget.nextSibling.style.display = "flex";
                                      }
                                    }}
                                  />
                                ) : null}

                                {/* Fallback icon (shown if image fails or is missing) */}
                                <div
                                  style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 10,
                                    background: "rgba(201,168,76,0.1)",
                                    display: prodImg ? "none" : "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--sk-gold, #c9a84c)",
                                    flexShrink: 0,
                                  }}
                                >
                                  <i className="fa fa-box" style={{ fontSize: "1rem" }}></i>
                                </div>
                              </>
                            );
                          })()}

                          {/* Product name + redirect hint */}
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "0.88rem",
                                color: "#1C1009",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {prod.product?.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.7rem",
                                color: "var(--sk-gold, #c9a84c)",
                                marginTop: 3,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <i className="fa fa-external-link-alt" style={{ fontSize: "0.6rem" }}></i>
                              View product
                            </div>
                          </div>
                        </div>

                        {/* Price / Qty / Total */}
                        <div
                          style={{
                            display: "flex",
                            gap: 20,
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <div style={{ textAlign: "center" }}>
                            <div
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                color: "#7A6E65",
                                marginBottom: 2,
                              }}
                            >
                              Price
                            </div>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "0.85rem",
                                color: "#1C1009",
                              }}
                            >
                              ₹{prod.variant?.finalPrice?.toLocaleString()}
                            </div>
                          </div>

                          <div style={{ textAlign: "center" }}>
                            <div
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                color: "#7A6E65",
                                marginBottom: 2,
                              }}
                            >
                              Qty
                            </div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: "0.88rem",
                                color: "#1C1009",
                              }}
                            >
                              {prod.qty}
                            </div>
                          </div>

                          <div style={{ textAlign: "center" }}>
                            <div
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                color: "#7A6E65",
                                marginBottom: 2,
                              }}
                            >
                              Total
                            </div>
                            <div
                              style={{
                                fontFamily: "Playfair Display,serif",
                                fontWeight: 900,
                                fontSize: "1rem",
                                color: "var(--sk-gold, #c9a84c)",
                              }}
                            >
                              ₹{prod.total?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* ── Return bar (outside the Link so clicks don't navigate) ── */}
                    {isDelivered && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 10,
                          padding: "8px 16px 0",
                        }}
                      >
                        {/* Existing return request status */}
                        {badge && (
                          <span
                            style={{
                              background: badge.bg,
                              color: badge.color,
                              borderRadius: 50,
                              padding: "4px 14px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                            }}
                          >
                            <i className="fa fa-undo me-2" style={{ fontSize: "0.66rem" }}></i>
                            {badge.label}
                            {existingReturn?.createdAt &&
                              ` · ${new Date(existingReturn.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}`}
                          </span>
                        )}

                        {/* Return button / policy note */}
                        {!blocked && eligibility?.state === "eligible" && (
                          <>
                            <span style={{ fontSize: "0.74rem", color: "#7A6E65" }}>
                              <i className="fa fa-clock me-1" style={{ fontSize: "0.68rem" }}></i>
                              {eligibility.daysLeft} day{eligibility.daysLeft === 1 ? "" : "s"} left to return
                            </span>
                            <button
                              type="button"
                              onClick={() => setReturnItem(prod)}
                              style={{
                                padding: "6px 18px",
                                borderRadius: 50,
                                background: "transparent",
                                border: "1.5px solid var(--sk-gold, #c9a84c)",
                                color: "var(--sk-gold, #c9a84c)",
                                fontWeight: 700,
                                fontSize: "0.78rem",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "var(--sk-gold, #c9a84c)";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "var(--sk-gold, #c9a84c)";
                              }}
                            >
                              <i className="fa fa-undo" style={{ fontSize: "0.7rem" }}></i>
                              Return
                            </button>
                          </>
                        )}

                        {!blocked && eligibility?.state === "expired" && (
                          <span style={{ fontSize: "0.74rem", color: "#999" }}>
                            Return window ({eligibility.days} days) has closed
                          </span>
                        )}

                        {!blocked && eligibility?.state === "notReturnable" && (
                          <span style={{ fontSize: "0.74rem", color: "#999" }}>
                            This product is not returnable
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p
              style={{
                textAlign: "center",
                color: "#ccc",
                padding: "20px 0",
                fontSize: 14,
              }}
            >
              No products found.
            </p>
          )}
        </Card>

        {/* ── Footer bar ── */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            border: "1px solid rgba(201,168,76,0.1)",
            boxShadow: "0 2px 16px rgba(28,16,9,0.07)",
            padding: "20px 24px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#7A6E65",
                marginBottom: 4,
              }}
            >
              Order Total
            </div>
            <div
              style={{
                fontFamily: "Playfair Display,serif",
                fontWeight: 900,
                fontSize: "1.6rem",
                color: "var(--sk-gold, #c9a84c)",
              }}
            >
              ₹{order.total?.toLocaleString()}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {!isCancelled && isDelivered && (
              <button
                onClick={generateInvoice}
                disabled={invoiceLoading}
                style={{
                  padding: "10px 22px",
                  background: invoiceLoading
                    ? "#555"
                    : "linear-gradient(135deg,#1A1A2E,#2d1b4e)",
                  color: "white",
                  border: "none",
                  borderRadius: 50,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: invoiceLoading ? "not-allowed" : "pointer",
                  transition: "opacity 0.2s",
                  boxShadow: "0 4px 14px rgba(26,26,46,0.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: invoiceLoading ? 0.75 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!invoiceLoading) e.currentTarget.style.opacity = "0.88";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {invoiceLoading ? (
                  <>
                    <div
                      style={{
                        width: 13,
                        height: 13,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    ></div>
                    Generating…
                  </>
                ) : (
                  <>
                    <i className="fa fa-file-invoice" style={{ fontSize: "0.78rem" }}></i>
                    Download Invoice
                  </>
                )}
              </button>
            )}

            <Link
              to="/order"
              style={{
                padding: "10px 22px",
                background: "transparent",
                border: "1.5px solid rgba(201,168,76,0.3)",
                color: "var(--sk-gold, #c9a84c)",
                borderRadius: 50,
                fontWeight: 700,
                fontSize: "0.85rem",
                textDecoration: "none",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--sk-gold, #c9a84c)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--sk-gold, #c9a84c)";
              }}
            >
              <i className="fa fa-arrow-left" style={{ fontSize: "0.72rem" }}></i>
              My Orders
            </Link>
          </div>
        </div>
      </div>

      {/* ── Return reason modal ── */}
      {returnItem && (
        <ReturnModal
          item={returnItem}
          submitting={returnSubmitting}
          onClose={() => setReturnItem(null)}
          onSubmit={submitReturn}
        />
      )}

      {/* ── Success toast ── */}
      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1C1009",
            color: "white",
            padding: "12px 24px",
            borderRadius: 50,
            fontSize: "0.85rem",
            fontWeight: 600,
            boxShadow: "0 8px 30px rgba(28,16,9,0.3)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <i className="fa fa-check-circle" style={{ color: "#34d399" }}></i>
          {toast}
        </div>
      )}
    </div>
  );
}