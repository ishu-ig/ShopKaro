import React, { useEffect, useState } from "react";
import { useRazorpay } from "react-razorpay";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getCheckout } from "../Redux/ActionCreartors/CheckoutActionCreators";
import HeroSection from "../Components/HeroSection";

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
    margin-bottom: 12px;
  }
  .pay-summary-label {
    font-family: 'DM Sans', sans-serif; font-size: 11px;
    font-weight: 300; color: rgba(240,237,230,0.35);
    letter-spacing: 1px; text-transform: uppercase;
  }
  .pay-summary-value {
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    font-weight: 400; color: rgba(240,237,230,0.6);
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

  .pay-secure {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-bottom: 20px;
    font-family: 'DM Sans', sans-serif; font-size: 11px;
    color: rgba(240,237,230,0.25); letter-spacing: 0.5px;
  }
  .pay-secure svg { color: rgba(201,168,76,0.4); }

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
  .pay-note a { color: rgba(201,168,76,0.5); text-decoration: none; }
  .pay-note a:hover { color: #c9a84c; }
`;

export default function Payment() {
    const [checkout, setCheckout] = useState({});
    const { Razorpay } = useRazorpay();
    const navigate = useNavigate();
    const { _id } = useParams();
    const dispatch = useDispatch();
    const CheckoutStateData = useSelector(state => state.CheckoutStateData);

    function getData() {
        dispatch(getCheckout());
        if (CheckoutStateData.length) {
            const result = _id === "-1"
                ? CheckoutStateData[0]
                : CheckoutStateData.find(item => item._id === _id);
            setCheckout(result);
        }
    }

    useEffect(() => { getData(); }, [CheckoutStateData.length]);

    const initPayment = (data) => {
        const options = {
            key: "rzp_test_hPWsSLPsp2DADQ",
            amount: data.amount,
            currency: "INR",
            order_id: data._id,
            prefill: {
                name: checkout?.user?.name,
                email: checkout?.user?.email,
                contact: checkout?.user?.phone,
            },
            handler: async (response) => {
                try {
                    let res = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/checkout/verify`, {
                        method: "post",
                        headers: { "content-type": "application/json", "authorization": localStorage.getItem("token") },
                        body: JSON.stringify({ razorpay_payment_id: response.razorpay_payment_id, checkid: checkout._id })
                    });
                    res = await res.json();
                    if (res.result === "Done") { dispatch(getCheckout()); navigate("/confirmation"); }
                } catch (err) { console.log(err); }
            },
            theme: { color: "#c9a84c" },
        };
        const rzp = new Razorpay(options);
        rzp.open();
    };

    const handlePayment = async () => {
        try {
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/checkout/order`, {
                method: "post",
                headers: { "Content-Type": "application/json", authorization: localStorage.getItem("token") },
                body: JSON.stringify({ amount: checkout.total })
            });
            response = await response.json();
            initPayment(response.data);
        } catch (err) { console.log(err); }
    };

    return (
        <>
            <style>{styles}</style>
            <HeroSection title="Complete Payment" />
            <div className="pay-root">
                {checkout && (
                    <div className="pay-card">
                        <div className="pay-header">
                            <div className="pay-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                                    <path d="M2 10h20"/>
                                    <path d="M6 15h4"/>
                                </svg>
                            </div>
                            <h1 className="pay-title">Secure <em>Payment</em></h1>
                            <p className="pay-subtitle">Complete your order</p>
                        </div>

                        <div className="pay-divider" />

                        {checkout.user && (
                            <div className="pay-summary">
                                <div className="pay-summary-row">
                                    <span className="pay-summary-label">Customer</span>
                                    <span className="pay-summary-value">{checkout.user.name}</span>
                                </div>
                                <div className="pay-summary-row">
                                    <span className="pay-summary-label">Email</span>
                                    <span className="pay-summary-value">{checkout.user.email}</span>
                                </div>
                                <div className="pay-summary-row">
                                    <span className="pay-summary-label">Phone</span>
                                    <span className="pay-summary-value">{checkout.user.phone}</span>
                                </div>
                                <div className="pay-total-row">
                                    <span className="pay-total-label">Total Amount</span>
                                    <span className="pay-total-amount"><span>₹</span>{checkout.total?.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <div className="pay-secure">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
                                <path d="M6 1L1.5 3v3c0 2.76 1.95 5.34 4.5 6 2.55-.66 4.5-3.24 4.5-6V3L6 1z"/>
                            </svg>
                            256-bit SSL encrypted • Powered by Razorpay
                        </div>

                        <button onClick={handlePayment} className="pay-btn">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                                <rect x="1" y="3.5" width="14" height="9" rx="1.5"/>
                                <path d="M1 7h14"/>
                            </svg>
                            Pay ₹{checkout.total?.toLocaleString()} Now
                        </button>

                        <p className="pay-note">
                            By completing this payment you agree to our{' '}
                            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}