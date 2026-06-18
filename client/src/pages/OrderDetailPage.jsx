import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getCheckout } from "../Redux/ActionCreartors/CheckoutActionCreators";

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
        border: "1px solid rgba(200,64,10,0.08)",
        boxShadow: "0 2px 16px rgba(28,16,9,0.07)",
        marginBottom: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(200,64,10,0.08)",
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
            background: "rgba(200,64,10,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#C8400A",
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

export default function OrderDetailPage() {
  const { _id } = useParams();
  const CheckoutStateData = useSelector((state) => state.CheckoutStateData);
  const [order, setOrder] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCheckout());
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
            borderTopColor: "#C8400A",
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

  const currentIndex = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "Cancelled";
  const isDelivered = order.orderStatus === "Delivered";

  const statusStyle = isDelivered
    ? { bg: "rgba(16,185,129,0.1)", color: "#059669" }
    : isCancelled
    ? { bg: "rgba(244,63,94,0.1)", color: "#e11d48" }
    : { bg: "rgba(200,64,10,0.1)", color: "#C8400A" };

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
                color: "#C8400A",
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
              className={`fa ${
                isDelivered ? "fa-check" : isCancelled ? "fa-times" : "fa-clock"
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
                  background: "rgba(200,64,10,0.1)",
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
                  background: "linear-gradient(90deg,#C8400A,#E86834)",
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
                          ? "linear-gradient(135deg,#C8400A,#E86834)"
                          : "white",
                        border: done
                          ? "none"
                          : current
                          ? "2.5px solid #C8400A"
                          : "2px solid rgba(200,64,10,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: done ? "white" : current ? "#C8400A" : "#ccc",
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
                        color: done ? "#C8400A" : current ? "#C8400A" : "#aaa",
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
            { label: "Name",     value: order.user?.name },
            { label: "Email",    value: order.user?.email },
            { label: "Phone",    value: order.user?.phone },
            { label: "Address",  value: order.user?.address },
            { label: "City",     value: order.user?.city },
            { label: "State",    value: order.user?.state },
            { label: "Pincode",  value: order.user?.pin },
          ].map((f) => (
            <InfoRow key={f.label} {...f} />
          ))}
        </Card>

        {/* ── Delivery Boy ── */}
        {order.deliveryBoy &&
          (order.orderStatus === "Out for Delivery" ||
            order.orderStatus === "Delivered") && (
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
                    background: "linear-gradient(135deg,#C8400A,#E86834)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 22,
                    flexShrink: 0,
                    boxShadow: "0 4px 14px rgba(200,64,10,0.25)",
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
                          color: "#C8400A",
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
                        order.orderStatus === "Delivered"
                          ? "rgba(16,185,129,0.1)"
                          : "rgba(200,64,10,0.08)",
                      color:
                        order.orderStatus === "Delivered" ? "#059669" : "#C8400A",
                      borderRadius: 50,
                      padding: "6px 16px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}
                  >
                    <i
                      className={`fa ${
                        order.orderStatus === "Delivered"
                          ? "fa-check-circle"
                          : "fa-shipping-fast"
                      } me-2`}
                      style={{ fontSize: "0.7rem" }}
                    ></i>
                    {order.orderStatus === "Delivered" ? "Delivered" : "On the Way"}
                  </span>
                </div>
              </div>
            </Card>
          )}

        {/* ── Ordered Products ── */}
        <Card icon="fa-box-open" title="Ordered Products" delay=".4s">
          {order.products?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {order.products.map((prod) => (
                <Link
                  key={prod._id}
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
                      e.currentTarget.style.background = "rgba(200,64,10,0.08)";
                      e.currentTarget.style.borderColor = "rgba(200,64,10,0.2)";
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
                      {prod.product?.pic?.[0] ? (
                        <img
                          src={prod.product.pic[0].replace(/\\/g, "/")}
                          alt={prod.product?.name}
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
                            e.currentTarget.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}

                      {/* Fallback icon (shown if image fails or is missing) */}
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 10,
                          background: "rgba(200,64,10,0.08)",
                          display: prod.product?.pic?.[0] ? "none" : "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#C8400A",
                          flexShrink: 0,
                        }}
                      >
                        <i className="fa fa-utensils" style={{ fontSize: "1rem" }}></i>
                      </div>

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
                            color: "#C8400A",
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
                          ₹{prod.product?.finalPrice?.toLocaleString()}
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
                            color: "#C8400A",
                          }}
                        >
                          ₹{prod.total?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
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
            border: "1px solid rgba(200,64,10,0.08)",
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
                color: "#C8400A",
              }}
            >
              ₹{order.total?.toLocaleString()}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {!isCancelled && order.orderStatus === "Delivered" && (
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
                border: "1.5px solid rgba(200,64,10,0.3)",
                color: "#C8400A",
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
                e.currentTarget.style.background = "#C8400A";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#C8400A";
              }}
            >
              <i className="fa fa-arrow-left" style={{ fontSize: "0.72rem" }}></i>
              My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}