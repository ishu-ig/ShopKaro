import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getCheckout,
  updateCheckout,
} from "../../Redux/ActionCreators/CheckoutActionCreators";

// Suggested route: /delivery/:_id/confirm-delivery/:orderId
// Link to it from Assigned Orders (a "Confirm Delivery" action shown once
// an order is "Out for Delivery"), the same spot the old "Track" button
// used to live.

const STATUS_BADGE = {
  "Out for Delivery": "dc-badge-warn",
  Delivered: "dc-badge-success",
  Cancelled: "dc-badge-danger",
};

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;
const REDIRECT_AFTER_SECONDS = 5;

// ── API base — adjust to match however the rest of the app configures its
// axios/fetch client (base URL + auth header). Written as a small helper
// here since there's no existing action creator for OTP verification yet. ──
const API_BASE = process.env.REACT_APP_BACKEND_SERVER || "";

async function verifyDeliveryOtp(orderId, otp) {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn(
      "verifyDeliveryOtp: no auth token found in localStorage under 'token' — request will be sent without an Authorization header and may be rejected by verifyFour middleware.",
    );
  }
  const res = await fetch(`${API_BASE}/api/checkout/verify-delivery/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ otp }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.result === "Fail") {
    throw new Error(body.reason || "Invalid OTP. Please try again.");
  }
  return body;
}

function unwrap(slice) {
  if (!slice) return [];
  if (Array.isArray(slice)) return slice;
  if (Array.isArray(slice.data)) return slice.data;
  return [];
}

// Shop/pickup reference lives on the first product line item — there's no
// top-level `resturent`/`shop` field on the order itself. See
// PRODUCT_POPULATE in checkoutController.js: products.product.shop is
// populated with { name, phone, address, city, state, pin }.
function getShopInfo(order) {
  return order?.products?.[0]?.product?.shop || null;
}

function getShopAddress(shop) {
  if (!shop) return "";
  return (
    shop.address ||
    [shop.city, shop.state, shop.pin].filter(Boolean).join(", ") ||
    ""
  );
}

// Steps in the confirmation flow — genuinely sequential, so a stepper is the
// right structural device here (each stage gates the next).
function getStepIndex(otpStage) {
  if (otpStage === "verified") return 2;
  if (otpStage === "requested") return 1;
  return 0;
}

const STEPS = ["Confirm handover", "Verify OTP", "Delivered"];

export default function DeliveryConfirm() {
  const { _id, orderId } = useParams(); // _id = delivery boy's own userid; orderId = picked from Assigned Orders
  const dispatch = useDispatch();
  const CheckoutStateData = useSelector((s) => s.CheckoutStateData);

  const [cashCollected, setCashCollected] = useState(false);

  // otpStage: "idle" -> "requested" -> "verified"
  const [otpStage, setOtpStage] = useState("idle");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [sendError, setSendError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const otpInputRefs = useRef([]);

  const [redirectIn, setRedirectIn] = useState(null);

  const backHref = `/deliveryBoy/${localStorage.getItem("userid")}/orders`;

  useEffect(() => {
    dispatch(getCheckout());
  }, [dispatch]);

  // Cooldown ticker for the resend button.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Countdown + redirect once delivery is confirmed.
  useEffect(() => {
    if (redirectIn === null) return;
    if (redirectIn <= 0) {
      window.location.href = backHref;
      return;
    }
    const t = setTimeout(() => setRedirectIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [redirectIn, backHref]);

  const orders = unwrap(CheckoutStateData);

  // The order this delivery boy is currently out delivering. Acceptance is
  // no longer tracked (isaccept was removed) — being assigned to this
  // delivery boy and sitting at "Out for Delivery" is enough. If we
  // arrived here via a specific order (Assigned Orders' "Confirm Delivery"
  // action), lock onto that one; otherwise fall back to the most recently
  // updated matching order.
  const activeOrder = useMemo(() => {
    const mine = orders.filter((o) => {
      const did = o.deliveryBoy?._id?.toString?.() ?? o.deliveryBoy?.toString?.();
      return did === _id && o.orderStatus === "Out for Delivery";
    });
    if (orderId) {
      return mine.find((o) => o._id === orderId) || null;
    }
    return (
      mine.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] ||
      null
    );
  }, [orders, _id, orderId]);

  // Reset all local flow state whenever we land on a new order.
  useEffect(() => {
    setCashCollected(false);
    setOtpStage("idle");
    setSendError("");
    setCooldown(0);
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setVerifyError("");
    setRedirectIn(null);
  }, [activeOrder?._id]);

  const codDue =
    activeOrder?.paymentMode === "COD" && activeOrder?.paymentStatus === "Pending"
      ? activeOrder.total
      : 0;
  const requireCashConfirm = codDue > 0;
  const canRequestOtp =
    !!activeOrder && !sendingOtp && (!requireCashConfirm || cashCollected);

  async function requestOtp() {
    if (!activeOrder || !canRequestOtp) return;

    setSendingOtp(true);
    setSendError("");
    try {
      // Sending orderStatus: "Delivered" here doesn't mark the order
      // delivered directly anymore — the backend intercepts that specific
      // transition, emails the customer an OTP, and leaves orderStatus as
      // "Out for Delivery" until verifyDeliveryOtp confirms it below.
      await dispatch(
        updateCheckout({
          _id: activeOrder._id,
          orderStatus: "Delivered",
          paymentStatus: requireCashConfirm ? "Done" : activeOrder.paymentStatus,
        }),
      );
      setOtpStage("requested");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    } catch (err) {
      console.error(err);
      setSendError("Couldn't send the OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  }

  function handleDigitChange(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleDigitKeyDown(index, e) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  }

  function handleDigitPaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtpDigits(next);
    otpInputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  const otpValue = otpDigits.join("");
  const otpComplete = otpValue.length === OTP_LENGTH;

  async function submitOtp() {
    if (!activeOrder || !otpComplete || verifying) return;

    setVerifying(true);
    setVerifyError("");
    try {
      await verifyDeliveryOtp(activeOrder._id, otpValue);
      setOtpStage("verified");
      dispatch(getCheckout());
      setRedirectIn(REDIRECT_AFTER_SECONDS);
    } catch (err) {
      console.error(err);
      setVerifyError(err.message || "Invalid OTP. Please try again.");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      otpInputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  }

  // ── Empty state — nothing currently out for delivery ──────────────────
  if (!activeOrder) {
    return (
      <main className="dashboard-content dc-page">
        <style>{DC_STYLES}</style>
        <div className="container-fluid px-3 px-lg-4 py-4">
          <div className="page-heading mb-4 d-flex align-items-start gap-2">
            <Link to={backHref} className="btn btn-outline-secondary btn-sm dc-back-btn" aria-label="Back to Assigned Orders">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <div className="page-heading-copy">
              <span className="page-icon dc-page-icon">
                <i className="bi bi-shield-check" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1 dc-eyebrow">Delivery</p>
                <h1 className="h3 mb-1 dc-title">Confirm delivery</h1>
                <p className="text-muted mb-0">
                  Verify an order with the customer's OTP once it's delivered.
                </p>
              </div>
            </div>
          </div>

          <div className="panel dc-empty text-center py-5">
            <span className="dc-empty-icon">
              <i className="bi bi-signpost-2" aria-hidden="true"></i>
            </span>
            <h2 className="h5 mt-3 mb-1">Nothing to confirm right now</h2>
            <p className="text-muted mb-3">
              {orderId
                ? "This order isn't out for delivery — it may already be delivered, or hasn't reached that stage yet."
                : "You don't have any orders out for delivery right now."}
            </p>
            <Link to={backHref} className="btn dc-btn-primary btn-sm">
              Go to Assigned Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const status = otpStage === "verified" ? "Delivered" : activeOrder.orderStatus;
  const shopInfo = getShopInfo(activeOrder);
  const shopAddress = getShopAddress(shopInfo);
  const dropoffAddress = [
    activeOrder.user?.address,
    activeOrder.user?.city,
    activeOrder.user?.state,
    activeOrder.user?.pin,
  ]
    .filter(Boolean)
    .join(", ");
  const directionsHref = dropoffAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dropoffAddress)}`
    : null;
  const stepIndex = getStepIndex(otpStage);

  return (
    <main className="dashboard-content dc-page">
      <style>{DC_STYLES}</style>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-start gap-2">
            <Link to={backHref} className="btn btn-outline-secondary btn-sm dc-back-btn" aria-label="Back to Assigned Orders">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <div className="page-heading-copy">
              <span className="page-icon dc-page-icon">
                <i className="bi bi-shield-check" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1 dc-eyebrow">Delivery</p>
                <h1 className="h3 mb-1 dc-title">Confirm delivery</h1>
                <p className="text-muted mb-0 dc-order-id">
                  Order #{activeOrder._id?.slice(-6)?.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
          <span className={`badge dc-badge ${STATUS_BADGE[status] ?? "dc-badge-info"}`}>
            {status}
          </span>
        </div>

        {/* ── Route stepper — mirrors the actual state machine (idle → requested → verified) ── */}
        <div className="dc-stepper" role="list" aria-label="Delivery confirmation progress">
          {STEPS.map((label, i) => (
            <div
              key={label}
              role="listitem"
              className={`dc-step ${i < stepIndex ? "is-done" : ""} ${i === stepIndex ? "is-active" : ""}`}
            >
              <span className="dc-step-dot">
                {i < stepIndex ? <i className="bi bi-check-lg"></i> : i + 1}
              </span>
              <span className="dc-step-label">{label}</span>
              {i < STEPS.length - 1 && <span className="dc-step-line" aria-hidden="true"></span>}
            </div>
          ))}
        </div>

        <div className="dc-layout">
          <div className="panel dc-panel">
            <div className="dc-panel-head">
              <span className="dc-avatar dc-avatar-shop">
                <i className="bi bi-shop" aria-hidden="true"></i>
              </span>
              <h3 className="dc-panel-title">Pickup from</h3>
            </div>
            <div className="dc-detail-row">
              <span className="dc-detail-label">Shop</span>
              <span className="dc-detail-value">{shopInfo?.name || "Shop"}</span>
            </div>
            {shopAddress && (
              <div className="dc-detail-row">
                <span className="dc-detail-label">Address</span>
                <span className="dc-detail-value">{shopAddress}</span>
              </div>
            )}
            {shopInfo?.phone && (
              <a
                className="btn dc-btn-ghost btn-sm mt-2"
                href={`tel:${shopInfo.phone}`}
              >
                <i className="bi bi-telephone me-1"></i> Call shop
              </a>
            )}
          </div>

          <div className="panel dc-panel">
            <div className="dc-panel-head">
              <span className="dc-avatar dc-avatar-customer">
                <i className="bi bi-person" aria-hidden="true"></i>
              </span>
              <h3 className="dc-panel-title">Deliver to</h3>
            </div>
            <div className="dc-detail-row">
              <span className="dc-detail-label">Customer</span>
              <span className="dc-detail-value">
                {activeOrder.user?.name || activeOrder.user?.username}
              </span>
            </div>
            {dropoffAddress && (
              <div className="dc-detail-row">
                <span className="dc-detail-label">Address</span>
                <span className="dc-detail-value">{dropoffAddress}</span>
              </div>
            )}
            <div className="d-flex flex-wrap gap-2 mt-2">
              {activeOrder.user?.phone && (
                <a
                  className="btn dc-btn-ghost btn-sm"
                  href={`tel:${activeOrder.user.phone}`}
                >
                  <i className="bi bi-telephone me-1"></i> Call
                </a>
              )}
              {directionsHref && (
                <a
                  className="btn dc-btn-ghost-alt btn-sm"
                  href={directionsHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="bi bi-signpost-2 me-1"></i> Directions
                </a>
              )}
            </div>
          </div>

          <div className="panel dc-panel">
            <div className="dc-panel-head">
              <span className="dc-avatar dc-avatar-order">
                <i className="bi bi-receipt" aria-hidden="true"></i>
              </span>
              <h3 className="dc-panel-title">Order summary</h3>
            </div>
            <div className="dc-summary-row">
              <span>Payment mode</span>
              <span className="dc-summary-chip">{activeOrder.paymentMode || "COD"}</span>
            </div>
            <div className="dc-summary-row dc-summary-total">
              <span>Order total</span>
              <span>₹{activeOrder.total || 0}</span>
            </div>

            {codDue > 0 && (
              <div className="dc-cash-alert">
                <i className="bi bi-cash-coin" aria-hidden="true"></i>
                <div>
                  <div className="dc-cash-alert-label">Cash to collect</div>
                  <div className="dc-cash-alert-amount">₹{codDue}</div>
                </div>
              </div>
            )}

            {requireCashConfirm && otpStage === "idle" && (
              <label className="dc-cash-check mt-3" htmlFor="dcCashCollected">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="dcCashCollected"
                  checked={cashCollected}
                  onChange={(e) => setCashCollected(e.target.checked)}
                />
                <span>
                  I have collected <strong>₹{codDue}</strong> cash from the customer
                </span>
              </label>
            )}
          </div>

          {/* ── OTP verification panel ── */}
          <div className="panel dc-panel dc-otp-panel">
            {otpStage === "verified" ? (
              <div className="dc-success" role="status">
                <span className="dc-success-icon">
                  <i className="bi bi-check2-circle" aria-hidden="true"></i>
                </span>
                <div className="dc-success-title">Delivery confirmed</div>
                <div className="dc-success-sub">
                  Redirecting to Assigned Orders in {redirectIn}s…
                </div>
              </div>
            ) : otpStage === "requested" ? (
              <>
                <div className="dc-panel-head">
                  <span className="dc-avatar dc-avatar-otp">
                    <i className="bi bi-key" aria-hidden="true"></i>
                  </span>
                  <h3 className="dc-panel-title">Enter customer's OTP</h3>
                </div>
                <p className="text-muted small mb-3">
                  Ask the customer for the code emailed to them and enter it
                  below to confirm delivery.
                </p>

                {verifyError && (
                  <div className="dc-alert-error" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {verifyError}
                  </div>
                )}

                <div className="dc-otp-boxes" onPaste={handleDigitPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpInputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className="dc-otp-box"
                      value={digit}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(i, e)}
                      aria-label={`OTP digit ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="btn dc-btn-primary w-100 mt-3"
                  onClick={submitOtp}
                  disabled={!otpComplete || verifying}
                >
                  {verifying ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-1"></i> Verify &amp;
                      complete delivery
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn dc-btn-link w-100 mt-1"
                  onClick={requestOtp}
                  disabled={cooldown > 0 || sendingOtp}
                >
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                </button>
              </>
            ) : (
              <>
                <div className="dc-panel-head">
                  <span className="dc-avatar dc-avatar-otp">
                    <i className="bi bi-key" aria-hidden="true"></i>
                  </span>
                  <h3 className="dc-panel-title">Confirm delivery</h3>
                </div>
                <p className="text-muted small mb-3">
                  We'll email the customer a one-time code. Ask them for it
                  once you've handed over the order to complete delivery.
                </p>

                {sendError && (
                  <div className="dc-alert-error" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {sendError}
                  </div>
                )}

                <button
                  type="button"
                  className="btn dc-btn-primary w-100"
                  onClick={requestOtp}
                  disabled={!canRequestOtp}
                  title={
                    requireCashConfirm && !cashCollected
                      ? "Confirm you've collected the cash before requesting the OTP"
                      : undefined
                  }
                >
                  {sendingOtp ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Sending OTP…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-check me-1"></i> Send delivery
                      OTP
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Scoped styles for this page only, prefixed "dc-" (Delivery Confirm) to
// avoid clashing with the app's global stylesheet. Everything below is
// namespaced under `.dc-page` so it layers on top of the shared `.panel` /
// `.page-heading` classes used elsewhere in the app rather than replacing
// them globally.
//
// Design tokens: a "harbor" navy for structure/trust (this is a cash-
// handling, verification-gated flow — it should feel procedural and calm,
// not like a generic storefront), a signal-amber for the one thing that
// genuinely needs the courier's attention (cash owed), and a confirming
// green reserved only for the completed state. The stepper across the top
// is the signature element: it mirrors the real three-stage state machine
// (idle → requested → verified) already in the component, so the structure
// is doing real work, not decorating.
const DC_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap');

.dc-page {
  --dc-ink: #172136;
  --dc-ink-soft: #5B6577;
  --dc-navy: #123B54;
  --dc-navy-soft: #E8EFF3;
  --dc-amber: #C97A1A;
  --dc-amber-soft: #FCF0DE;
  --dc-green: #147A57;
  --dc-green-soft: #E3F6ED;
  --dc-red: #B3342A;
  --dc-red-soft: #FBEAE8;
  --dc-border: #E4E8EF;
  --dc-card-shadow: 0 1px 2px rgba(18,59,84,.05), 0 6px 16px rgba(18,59,84,.06);
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--dc-ink);
}

.dc-page .dc-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--dc-navy);
}
.dc-page .dc-title { font-weight: 800; letter-spacing: -0.01em; }
.dc-page .dc-order-id { font-size: 13px; font-variant-numeric: tabular-nums; }

.dc-page-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--dc-navy-soft);
  color: var(--dc-navy);
  font-size: 18px;
  flex-shrink: 0;
}

.dc-back-btn {
  width: 36px; height: 36px; padding: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%; flex-shrink: 0;
}

/* Status badge */
.dc-badge {
  font-weight: 700;
  font-size: 12.5px;
  letter-spacing: .01em;
  padding: 6px 12px;
  border-radius: 999px;
}
.dc-badge-warn { background: var(--dc-amber-soft); color: var(--dc-amber); }
.dc-badge-success { background: var(--dc-green-soft); color: var(--dc-green); }
.dc-badge-danger { background: var(--dc-red-soft); color: var(--dc-red); }
.dc-badge-info { background: var(--dc-navy-soft); color: var(--dc-navy); }

/* Stepper — the signature element, tracks the real otpStage state machine */
.dc-stepper {
  display: flex;
  align-items: flex-start;
  margin: 4px 4px 20px;
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
  font-size: 13px;
  font-weight: 700;
  background: #fff;
  border: 2px solid var(--dc-border);
  color: var(--dc-ink-soft);
  z-index: 1;
}
.dc-step.is-done .dc-step-dot {
  background: var(--dc-green);
  border-color: var(--dc-green);
  color: #fff;
}
.dc-step.is-active .dc-step-dot {
  border-color: var(--dc-navy);
  color: var(--dc-navy);
  box-shadow: 0 0 0 4px var(--dc-navy-soft);
}
.dc-step-label {
  margin-top: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--dc-ink-soft);
  text-align: center;
  padding: 0 4px;
}
.dc-step.is-active .dc-step-label,
.dc-step.is-done .dc-step-label { color: var(--dc-ink); }
.dc-step-line {
  position: absolute;
  top: 14px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--dc-border);
  z-index: 0;
}
.dc-step.is-done .dc-step-line { background: var(--dc-green); }

/* Layout */
.dc-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 768px) {
  .dc-layout { grid-template-columns: 1fr 1fr; align-items: start; }
}
.dc-otp-panel { grid-column: 1 / -1; }

.dc-page .dc-panel {
  border: 1px solid var(--dc-border);
  border-radius: 16px;
  box-shadow: var(--dc-card-shadow);
  background: #fff;
}

.dc-panel-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.dc-panel-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--dc-ink-soft);
  margin: 0;
}
.dc-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.dc-avatar-shop { background: var(--dc-navy-soft); color: var(--dc-navy); }
.dc-avatar-customer { background: var(--dc-navy-soft); color: var(--dc-navy); }
.dc-avatar-order { background: var(--dc-navy-soft); color: var(--dc-navy); }
.dc-avatar-otp { background: var(--dc-green-soft); color: var(--dc-green); }

.dc-detail-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px dashed var(--dc-border);
  font-size: 14px;
}
.dc-detail-row:last-of-type { border-bottom: none; }
.dc-detail-label { color: var(--dc-ink-soft); flex-shrink: 0; }
.dc-detail-value { text-align: right; font-weight: 600; }

.dc-summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 5px 0;
  color: var(--dc-ink-soft);
}
.dc-summary-chip {
  background: var(--dc-navy-soft);
  color: var(--dc-navy);
  font-weight: 700;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 999px;
}
.dc-summary-total {
  font-weight: 800;
  font-size: 16px;
  color: var(--dc-ink);
  border-top: 1px solid var(--dc-border);
  margin-top: 6px;
  padding-top: 10px;
}

.dc-cash-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--dc-amber-soft);
  color: var(--dc-amber);
  border-radius: 12px;
  padding: 12px 14px;
  margin-top: 12px;
  font-size: 20px;
}
.dc-cash-alert-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; }
.dc-cash-alert-amount { font-size: 20px; font-weight: 800; line-height: 1.2; }

.dc-cash-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: var(--dc-amber-soft);
  border: 1px solid #F0D6A8;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  color: var(--dc-ink);
  cursor: pointer;
}
.dc-cash-check input { margin-top: 3px; flex-shrink: 0; }

.dc-alert-error {
  background: var(--dc-red-soft);
  color: var(--dc-red);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13.5px;
  font-weight: 600;
  margin-bottom: 12px;
}

/* OTP boxes */
.dc-otp-boxes {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}
.dc-otp-box {
  width: 44px;
  height: 54px;
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  font-family: 'Manrope', sans-serif;
  color: var(--dc-navy);
  border: 1.5px solid var(--dc-border);
  border-radius: 10px;
  outline: none;
  background: #FAFBFD;
}
.dc-otp-box:focus {
  border-color: var(--dc-navy);
  background: #fff;
  box-shadow: 0 0 0 3px var(--dc-navy-soft);
}
@media (min-width: 400px) {
  .dc-otp-box { width: 48px; }
}

/* Buttons */
.dc-page .dc-btn-primary {
  background: var(--dc-navy);
  border: 1px solid var(--dc-navy);
  color: #fff;
  font-weight: 700;
  border-radius: 10px;
  padding: 10px 16px;
  transition: transform .08s ease, box-shadow .15s ease;
}
.dc-page .dc-btn-primary:hover:not(:disabled) {
  background: #0E3247;
  box-shadow: 0 4px 12px rgba(18,59,84,.25);
}
.dc-page .dc-btn-primary:disabled { opacity: .5; }

.dc-page .dc-btn-ghost {
  background: #fff;
  border: 1px solid var(--dc-border);
  color: var(--dc-navy);
  font-weight: 600;
  border-radius: 10px;
}
.dc-page .dc-btn-ghost:hover { background: var(--dc-navy-soft); border-color: var(--dc-navy-soft); }

.dc-page .dc-btn-ghost-alt {
  background: #fff;
  border: 1px solid var(--dc-border);
  color: var(--dc-ink-soft);
  font-weight: 600;
  border-radius: 10px;
}
.dc-page .dc-btn-ghost-alt:hover { background: #F5F6F8; }

.dc-page .dc-btn-link {
  color: var(--dc-navy);
  font-weight: 700;
  font-size: 13.5px;
  text-decoration: none;
}
.dc-page .dc-btn-link:hover { text-decoration: underline; }
.dc-page .dc-btn-link:disabled { color: var(--dc-ink-soft); }

/* Success state */
.dc-success { text-align: center; padding: 20px 8px; }
.dc-success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--dc-green-soft);
  color: var(--dc-green);
  font-size: 28px;
  margin-bottom: 10px;
}
.dc-success-title { font-weight: 800; font-size: 17px; }
.dc-success-sub { color: var(--dc-ink-soft); font-size: 13.5px; margin-top: 4px; }

/* Empty state */
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