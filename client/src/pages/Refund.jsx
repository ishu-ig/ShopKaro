import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeroSection from "../Components/HeroSection";

// Customer-facing refund status page. Route example: /refund/:_id  (_id = return id)
// The refund itself is started by the admin (Razorpay), so this page only shows
// where the customer's money is.

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .pay-root {
    min-height: 100vh; background: #0a0a0f;
    display: flex; align-items: center; justify-content: center;
    padding: 60px 20px 120px; position: relative; overflow: hidden;
  }
  .pay-root::before {
    content: ''; position: absolute; top: -200px; right: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .pay-root::after {
    content: ''; position: absolute; bottom: -150px; left: -150px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%);
    pointer-events: none;
  }

  .pay-card {
    width: 100%; max-width: 420px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(201,168,76,0.15);
    border-radius: 4px; padding: 48px 44px; position: relative;
    animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes cardIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  .pay-card::before {
    content: ''; position: absolute; top: 0; left: 44px; right: 44px;
    height: 1px; background: linear-gradient(90deg, transparent, #c9a84c, transparent);
  }

  .pay-header { text-align: center; margin-bottom: 40px; }
  .pay-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 56px; height: 56px; border: 1px solid rgba(201,168,76,0.3);
    border-radius: 50%; color: #c9a84c; margin-bottom: 20px;
  }
  .pay-icon.done { border-color: rgba(120,200,150,0.5); color: #78c896; }
  .pay-title {
    font-family: 'Cormorant Garamond', serif; font-size: 2rem;
    font-weight: 300; color: #f0ede6; margin: 0 0 6px; line-height: 1.2;
  }
  .pay-title em { font-style: italic; color: #c9a84c; }
  .pay-subtitle {
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    font-weight: 300; color: rgba(240,237,230,0.3);
    letter-spacing: 1.5px; text-transform: uppercase; margin: 0;
  }

  .pay-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 0 0 32px; }

  .pay-summary { margin-bottom: 32px; }
  .pay-summary-row {
    display: flex; justify-content: space-between; align-items: center;
    gap: 16px; margin-bottom: 12px;
  }
  .pay-summary-label {
    font-family: 'DM Sans', sans-serif; font-size: 11px;
    font-weight: 300; color: rgba(240,237,230,0.35);
    letter-spacing: 1px; text-transform: uppercase; flex-shrink: 0;
  }
  .pay-summary-value {
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    font-weight: 400; color: rgba(240,237,230,0.6); text-align: right;
    word-break: break-all;
  }
  .pay-total-row {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06);
    margin-top: 4px;
  }
  .pay-total-label {
    font-family: 'Cormorant Garamond', serif; font-size: 1.1rem;
    font-weight: 400; color: rgba(240,237,230,0.6);
  }
  .pay-total-amount {
    font-family: 'Cormorant Garamond', serif; font-size: 1.9rem;
    font-weight: 400; color: #f0ede6;
  }
  .pay-total-amount span { font-size: 1rem; color: #c9a84c; margin-right: 2px; }

  /* progress steps */
  .rf-steps { margin: 0 0 32px; padding: 0; list-style: none; }
  .rf-step {
    display: flex; align-items: center; gap: 14px; position: relative;
    padding-bottom: 16px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 300;
    letter-spacing: 0.5px; color: rgba(240,237,230,0.25);
  }
  .rf-step:last-child { padding-bottom: 0; }
  .rf-step::before {
    content: ''; position: absolute; left: 7px; top: 18px; bottom: -2px;
    width: 1px; background: rgba(255,255,255,0.08);
  }
  .rf-step:last-child::before { display: none; }
  .rf-dot {
    width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.15); background: #0a0a0f; z-index: 1;
  }
  .rf-step.done { color: rgba(240,237,230,0.6); }
  .rf-step.done .rf-dot { background: #c9a84c; border-color: #c9a84c; }
  .rf-step.done::before { background: rgba(201,168,76,0.5); }
  .rf-step.active { color: #f0ede6; }
  .rf-step.active .rf-dot { border-color: #c9a84c; box-shadow: 0 0 0 4px rgba(201,168,76,0.15); }

  .rf-state {
    text-align: center; border: 1px solid rgba(201,168,76,0.2);
    border-radius: 2px; padding: 14px 16px; margin-bottom: 20px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 300;
    color: rgba(240,237,230,0.55); line-height: 1.6;
  }
  .rf-state strong { display: block; color: #f0ede6; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; font-size: 11px; margin-bottom: 4px; }
  .rf-state.success { border-color: rgba(120,200,150,0.35); }
  .rf-state.fail { border-color: rgba(220,120,120,0.35); }

  .pay-btn {
    width: 100%; background: #c9a84c; color: #0a0a0f; border: none;
    border-radius: 2px; padding: 16px;
    font-family: 'DM Sans', sans-serif; font-size: 11px;
    font-weight: 500; letter-spacing: 3px; text-transform: uppercase;
    cursor: pointer; transition: background 0.2s, transform 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .pay-btn:hover { background: #dbb85a; transform: translateY(-1px); }
  .pay-btn:active { transform: translateY(0); }

  .pay-note {
    text-align: center; margin-top: 20px;
    font-family: 'DM Sans', sans-serif; font-size: 11px;
    color: rgba(240,237,230,0.2); line-height: 1.6;
  }
`;

const STEPS = [
    { key: "pending", label: "Return requested" },
    { key: "approved", label: "Return approved" },
    { key: "picked_up", label: "Item picked up" },
    { key: "received", label: "Item received at shop" },
    { key: "completed", label: "Refund issued" },
];

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function Refund() {
    const { _id } = useParams(); // return request id
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [errorText, setErrorText] = useState("");

    // Fetch only this return (the server checks that it belongs to the logged-in customer)
    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const r = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/return/${_id}`, {
                    headers: { authorization: localStorage.getItem("token") },
                });
                const res = await r.json();
                if (cancelled) return;
                if (res.result === "Done" && res.data) {
                    setData(res.data);
                    setErrorText("");
                } else {
                    setData(null);
                    setErrorText(typeof res.reason === "string" ? res.reason : "");
                }
            } catch (e) {
                console.error(e);
                if (!cancelled) {
                    setData(null);
                    setErrorText("Couldn't load refund details. Please try again.");
                }
            } finally {
                if (!cancelled) setLoaded(true); // always stop the spinner
            }
        }
        load();
        return () => { cancelled = true; };
    }, [_id]);

    const status = data?.status;
    const isRejected = status === "rejected";
    const isCancelled = status === "cancelled";
    const isRefunded = status === "completed";
    const stepIndex = STEPS.findIndex((s) => s.key === status);

    // Heading state shown above the details
    let stateBox = null;
    if (isRefunded) {
        if (data.refundStatus === "failed") {
            stateBox = (
                <div className="rf-state fail">
                    <strong>Refund failed</strong>
                    Your refund could not be processed. Please contact support with your return ID.
                </div>
            );
        } else if (!data.refundId) {
            // Completed by the shop without an online refund (e.g. cash on delivery)
            stateBox = (
                <div className="rf-state success">
                    <strong>Return completed</strong>
                    Your return is complete. If you paid by cash, the shop has refunded you directly.
                </div>
            );
        } else {
            stateBox = (
                <div className="rf-state success">
                    <strong>{data.refundStatus === "processed" ? "Refund processed" : "Refund initiated"}</strong>
                    {data.refundStatus === "processed"
                        ? "The money has been sent to your original payment method."
                        : "The money is on its way to your original payment method. Banks usually take a few business days to show it."}
                </div>
            );
        }
    } else if (isRejected || isCancelled) {
        stateBox = (
            <div className="rf-state fail">
                <strong>{isRejected ? "Return rejected" : "Return cancelled"}</strong>
                No refund will be issued for this return request.
            </div>
        );
    } else if (status === "received") {
        stateBox = (
            <div className="rf-state">
                <strong>Refund pending</strong>
                We have received your item. Your refund will be issued shortly.
            </div>
        );
    } else if (status) {
        stateBox = (
            <div className="rf-state">
                <strong>Refund not started</strong>
                Your refund is issued after the returned item reaches the shop.
            </div>
        );
    }

    return (
        <>
            <style>{styles}</style>
            <HeroSection title="Refund Status" />
            <div className="pay-root">
                {!loaded ? (
                    <div className="pay-card">
                        <div className="pay-header" style={{ marginBottom: 0 }}>
                            <p className="pay-subtitle">Loading refund details…</p>
                        </div>
                    </div>
                ) : !data ? (
                    <div className="pay-card">
                        <div className="pay-header">
                            <h1 className="pay-title">Return <em>not found</em></h1>
                            <p className="pay-subtitle">{errorText || "Check the link and try again"}</p>
                        </div>
                        <button className="pay-btn" onClick={() => navigate(-1)}>Go Back</button>
                    </div>
                ) : (
                    <div className="pay-card">
                        <div className="pay-header">
                            <div className={`pay-icon ${isRefunded ? "done" : ""}`}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                    {isRefunded ? (
                                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                                    ) : (
                                        <>
                                            <path d="M3 12a9 9 0 1 0 3-6.7" />
                                            <path d="M3 4v5h5" />
                                        </>
                                    )}
                                </svg>
                            </div>
                            <h1 className="pay-title">Refund <em>Status</em></h1>
                            <p className="pay-subtitle">Return #{data._id?.slice(-6).toUpperCase()}</p>
                        </div>

                        <div className="pay-divider" />

                        {stateBox}

                        {!isRejected && !isCancelled && (
                            <ol className="rf-steps">
                                {STEPS.map((s, i) => {
                                    const done = i < stepIndex || isRefunded;
                                    const active = i === stepIndex && !isRefunded;
                                    return (
                                        <li key={s.key} className={`rf-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
                                            <span className="rf-dot" />
                                            {s.label}
                                        </li>
                                    );
                                })}
                            </ol>
                        )}

                        <div className="pay-summary">
                            <div className="pay-summary-row">
                                <span className="pay-summary-label">Product</span>
                                <span className="pay-summary-value">{data.product?.name || "—"}</span>
                            </div>
                            <div className="pay-summary-row">
                                <span className="pay-summary-label">Requested</span>
                                <span className="pay-summary-value">{fmtDate(data.createdAt)}</span>
                            </div>
                            {data.order?.paymentMode && (
                                <div className="pay-summary-row">
                                    <span className="pay-summary-label">Paid via</span>
                                    <span className="pay-summary-value">{data.order.paymentMode}</span>
                                </div>
                            )}
                            {isRefunded && data.refundId && (
                                <>
                                    <div className="pay-summary-row">
                                        <span className="pay-summary-label">Refunded on</span>
                                        <span className="pay-summary-value">{fmtDate(data.refundedAt)}</span>
                                    </div>
                                    <div className="pay-summary-row">
                                        <span className="pay-summary-label">Refund ID</span>
                                        <span className="pay-summary-value">{data.refundId}</span>
                                    </div>
                                </>
                            )}
                            {isRefunded && data.refundAmount ? (
                                <div className="pay-total-row">
                                    <span className="pay-total-label">Refund Amount</span>
                                    <span className="pay-total-amount">
                                        <span>₹</span>{Number(data.refundAmount).toLocaleString()}
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        <button className="pay-btn" onClick={() => navigate(-1)}>Back</button>

                        <p className="pay-note">
                            Refunds go back to the original payment method.
                            Need help? Quote your return ID when you contact us.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}