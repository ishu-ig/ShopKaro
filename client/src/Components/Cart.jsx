import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { deleteCart, getCart, updateCart } from '../Redux/ActionCreartors/CartActionCreators';
import { createCheckout } from '../Redux/ActionCreartors/CheckoutActionCreators';
import { updateProduct, getProduct } from '../Redux/ActionCreartors/ProductActionCreators';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  // Core palette — warm parchment + terracotta
  bg:          '#F7F2EC',
  surface:     '#FDFAF6',
  surfaceDeep: '#F2EBE0',
  border:      'rgba(160,110,60,0.14)',
  borderStrong:'rgba(160,110,60,0.28)',
  primary:     '#B5370A',
  primaryMid:  '#C8400A',
  primaryGlow: 'rgba(181,55,10,0.12)',
  accent:      '#E07B3A',
  accentSoft:  'rgba(224,123,58,0.1)',
  dark:        '#1A0F08',
  mid:         '#5C3D25',
  muted:       '#9E7A58',
  mutedLight:  '#C4A882',
  green:       '#1A7A4A',
  greenSoft:   'rgba(26,122,74,0.1)',
  amber:       '#92600A',
  amberSoft:   'rgba(146,96,10,0.1)',
  red:         '#C0202A',
  redSoft:     'rgba(192,32,42,0.08)',
  white:       '#FFFFFF',
  shadow1:     '0 1px 4px rgba(26,15,8,0.06)',
  shadow2:     '0 4px 20px rgba(26,15,8,0.09)',
  shadow3:     '0 12px 40px rgba(26,15,8,0.12)',
  shadowPrimary: '0 8px 28px rgba(181,55,10,0.28)',
  radius:      '16px',
  radiusSm:    '10px',
  radiusXs:    '6px',
  transition:  'all 0.22s cubic-bezier(0.4,0,0.2,1)',
  serif:       "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
  sans:        "'DM Sans', 'Segoe UI', sans-serif",
};

/* ─────────────────────────────────────────────
   GLOBAL STYLES (injected once)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .cart-root * { box-sizing: border-box; }

  .cart-root {
    font-family: ${T.sans};
    background: ${T.bg};
    min-height: 100vh;
    color: ${T.dark};
  }

  /* Item card */
  .cart-item-card {
    background: ${T.surface};
    border: 1px solid ${T.border};
    border-radius: ${T.radius};
    box-shadow: ${T.shadow1};
    margin-bottom: 12px;
    overflow: hidden;
    transition: ${T.transition};
    position: relative;
  }
  .cart-item-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, ${T.primaryMid}, ${T.accent});
    opacity: 0;
    transition: opacity 0.22s;
  }
  .cart-item-card:hover {
    box-shadow: ${T.shadow3};
    transform: translateY(-1px);
    border-color: ${T.borderStrong};
  }
  .cart-item-card:hover::before { opacity: 1; }

  /* Qty buttons */
  .qty-btn {
    width: 34px; height: 34px;
    border-radius: 50%;
    border: 1.5px solid ${T.borderStrong};
    background: ${T.surface};
    color: ${T.primary};
    font-weight: 700;
    font-size: 1.1rem;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: ${T.transition};
    font-family: ${T.sans};
    flex-shrink: 0;
  }
  .qty-btn:hover {
    background: ${T.primary};
    color: ${T.white};
    border-color: ${T.primary};
    box-shadow: 0 4px 12px rgba(181,55,10,0.3);
    transform: scale(1.08);
  }

  /* Delete button */
  .del-btn {
    width: 34px; height: 34px;
    border-radius: 50%;
    border: 1.5px solid rgba(192,32,42,0.2);
    background: ${T.redSoft};
    color: ${T.red};
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: ${T.transition};
    flex-shrink: 0;
  }
  .del-btn:hover {
    background: ${T.red};
    color: ${T.white};
    border-color: ${T.red};
    transform: scale(1.08);
  }

  /* CTA buttons */
  .btn-checkout {
    display: block;
    width: 100%;
    padding: 14px 0;
    background: linear-gradient(135deg, ${T.primary} 0%, ${T.accent} 100%);
    color: ${T.white};
    border: none;
    border-radius: 50px;
    font-family: ${T.sans};
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.04em;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    box-shadow: ${T.shadowPrimary};
    transition: ${T.transition};
    margin-top: 18px;
  }
  .btn-checkout:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(181,55,10,0.36);
    color: ${T.white};
  }

  .btn-place {
    display: block;
    width: 100%;
    padding: 14px 0;
    background: linear-gradient(135deg, ${T.green} 0%, #22c55e 100%);
    color: ${T.white};
    border: none;
    border-radius: 50px;
    font-family: ${T.sans};
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.04em;
    text-align: center;
    cursor: pointer;
    box-shadow: 0 8px 28px rgba(26,122,74,0.3);
    transition: ${T.transition};
    margin-top: 18px;
  }
  .btn-place:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  /* Payment select */
  .pay-select {
    border: 1.5px solid ${T.borderStrong};
    border-radius: ${T.radiusSm};
    padding: 11px 14px;
    font-family: ${T.sans};
    font-size: 0.88rem;
    width: 100%;
    outline: none;
    color: ${T.dark};
    background: ${T.surface};
    cursor: pointer;
    transition: border-color 0.18s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239E7A58' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
  }
  .pay-select:focus { border-color: ${T.primary}; }

  /* Decorative rule */
  .cart-rule {
    height: 1px;
    background: linear-gradient(90deg, transparent, ${T.borderStrong}, transparent);
    margin: 14px 0;
  }

  /* Summary card detail rows */
  .sum-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 0.87rem;
  }

  /* Badge chips */
  .meta-chip {
    display: inline-block;
    background: ${T.accentSoft};
    color: ${T.primaryMid};
    border-radius: 50px;
    padding: 2px 9px;
    font-size: 0.68rem;
    font-weight: 600;
    margin-right: 4px;
    margin-bottom: 3px;
    letter-spacing: 0.02em;
  }

  /* Qty badge (checkout mode) */
  .qty-badge {
    background: ${T.primaryGlow};
    border: 1px solid rgba(181,55,10,0.18);
    border-radius: 8px;
    padding: 5px 11px;
    font-weight: 700;
    font-size: 0.88rem;
    color: ${T.dark};
  }

  /* Staggered fade-in for items */
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cart-item-card { animation: slideUp 0.35s ease both; }
  .cart-item-card:nth-child(1) { animation-delay: 0.04s; }
  .cart-item-card:nth-child(2) { animation-delay: 0.09s; }
  .cart-item-card:nth-child(3) { animation-delay: 0.14s; }
  .cart-item-card:nth-child(4) { animation-delay: 0.19s; }
  .cart-item-card:nth-child(5) { animation-delay: 0.24s; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .summary-card { animation: fadeIn 0.4s 0.1s ease both; }

  /* Empty state */
  @keyframes float {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-10px); }
  }
  .empty-icon { animation: float 3s ease-in-out infinite; }

  .continue-link {
    display: block;
    text-align: center;
    margin-top: 12px;
    font-size: 0.82rem;
    color: ${T.muted};
    text-decoration: none;
    transition: color 0.18s;
    font-family: ${T.sans};
  }
  .continue-link:hover { color: ${T.primary}; }

  .free-badge {
    background: ${T.greenSoft};
    color: ${T.green};
    border-radius: 50px;
    padding: 3px 11px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.03em;
  }

  /* Ornamental corner for summary card */
  .summary-card {
    position: relative;
    overflow: hidden;
  }
  .summary-card::after {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 90px; height: 90px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(181,55,10,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
`;

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
const MetaChip = ({ label }) =>
  label ? <span className="meta-chip">{label}</span> : null;

const QtyBtn = ({ onClick, children }) => (
  <button className="qty-btn" onClick={onClick}>{children}</button>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Cart({ title, data }) {
  const [cart, setCart]         = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal]       = useState(0);
  const [mode, setMode]         = useState('COD');

  const CartStateData    = useSelector(s => s.CartStateData);
  const ProductStateData = useSelector(s => s.ProductStateData);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const isCheckout = title === 'Checkout';

  function calculate(arr) {
    const sub = arr.reduce((s, x) => s + x.total, 0);
    setSubtotal(sub);
    if (sub > 0 && sub < 1000) { setShipping(150); setTotal(sub + 150); }
    else { setShipping(0); setTotal(sub); }
  }

  function getAPIData() {
    dispatch(getCart());
    const src = data || (CartStateData.length ? CartStateData : []);
    setCart(src); calculate(src);
  }

  function deleteRecord(_id) {
    if (window.confirm('Remove this item from cart?')) { dispatch(deleteCart({ _id })); getAPIData(); }
  }

  function updateRecord(_id, option) {
    const item  = cart.find(x => x._id === _id);
    const index = cart.findIndex(x => x._id === _id);
    if (!item) return;
    if (option === 'DEC' && item.qty > 1)                                { item.qty--; item.total -= item.product?.finalPrice; }
    else if (option === 'INC' && item.qty < item.product?.stockQuantity) { item.qty++; item.total += item.product?.finalPrice; }
    dispatch(updateCart({ ...item }));
    cart[index] = { ...item };
    calculate([...cart]);
  }

  function placeOrder() {
    dispatch(createCheckout({ user: localStorage.getItem('userid'), orderStatus: 'Ordered', paymentMode: mode, paymentStatus: 'Pending', subtotal, shipping, total, date: new Date(), products: [...cart] }));
    cart.forEach(ci => {
      const p = ProductStateData.find(x => x._id === ci.product._id);
      if (p) { p.stockQuantity -= ci.qty; p.stock = p.stockQuantity > 0; dispatch(updateProduct(p)); dispatch(deleteCart({ _id: ci._id })); }
    });
    navigate(mode === 'COD' ? '/confirmation' : '/payment/-1');
  }

  useEffect(() => { getAPIData(); }, [CartStateData.length]);
  useEffect(() => { dispatch(getProduct()); }, [ProductStateData.length]);

  /* ── Empty State ── */
  if (!cart.length) return (
    <div className="cart-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ textAlign: 'center', padding: '48px 24px', maxWidth: 400 }}>
        <div className="empty-icon" style={{ fontSize: '5rem', marginBottom: 20, display: 'block' }}>🛒</div>
        <h3 style={{ fontFamily: T.serif, fontWeight: 700, fontSize: 'clamp(1.6rem,5vw,2.2rem)', color: T.dark, marginBottom: 10, lineHeight: 1.2, fontStyle: 'italic' }}>
          Your cart awaits
        </h3>
        <p style={{ color: T.muted, marginBottom: 28, fontSize: '0.92rem', lineHeight: 1.6 }}>
          Discover our curated selection of flavours — something extraordinary is waiting for you.
        </p>
        <Link to="/product" className="btn-checkout" style={{ maxWidth: 220, margin: '0 auto', marginTop: 0 }}>
          Browse the Menu →
        </Link>
      </div>
    </div>
  );

  /* ── Main Render ── */
  return (
    <div className="cart-root">
      <style>{GLOBAL_CSS}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 16px 80px' }}>

        {/* ── Page Header (Cart only) ── */}
        {!isCheckout && (
          <div style={{ marginBottom: 28 }}>
            {/* Decorative overline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ height: 2, width: 32, background: `linear-gradient(90deg, ${T.primary}, transparent)`, borderRadius: 2 }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', color: T.muted, textTransform: 'uppercase' }}>
                Shopping Basket
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: T.serif, fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: T.dark, margin: 0, lineHeight: 1 }}>
                Your Cart
              </h2>
              <span style={{ background: T.primary, color: T.white, borderRadius: 50, padding: '4px 14px', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.04em', marginBottom: 4 }}>
                {cart.length} item{cart.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        <div className="row g-4 align-items-start">

          {/* ─────────── Items Column ─────────── */}
          <div className={isCheckout ? 'col-12' : 'col-lg-7 col-xl-8'}>
            {cart.map((item, idx) => (
              <div key={item._id} className="cart-item-card" style={{ animationDelay: `${0.04 + idx * 0.05}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', flexWrap: 'wrap' }}>

                  {/* Thumbnail */}
                  <Link
                    to={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ flexShrink: 0 }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`}
                        alt={item.product?.name}
                        style={{ width: 76, height: 76, borderRadius: 12, objectFit: 'cover', border: `2px solid ${T.border}`, display: 'block', transition: T.transition }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      {/* Subtle shine overlay */}
                      <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
                    </div>
                  </Link>

                  {/* Info */}
                  <div style={{ flex: '1 1 140px', minWidth: 0 }}>
                    <div style={{ fontFamily: T.serif, fontWeight: 600, fontStyle: 'italic', fontSize: '1.02rem', color: T.dark, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product?.name}
                    </div>
                    <div>
                      <MetaChip label={item.product?.brand?.name} />
                      <MetaChip label={item.product?.color} />
                      {item.product?.size && <MetaChip label={`Size ${item.product?.size}`} />}
                    </div>
                    {!isCheckout && item.product?.stockQuantity !== undefined && (
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: 4, color: item.product?.stockQuantity > 5 ? T.green : T.amber, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
                        {item.product?.stockQuantity ? `${item.product.stockQuantity} in stock` : 'Out of stock'}
                      </div>
                    )}
                  </div>

                  {/* Qty */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {!isCheckout ? (
                      <>
                        <QtyBtn onClick={() => updateRecord(item._id, 'DEC')}>−</QtyBtn>
                        <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: '1rem', color: T.dark, fontFamily: T.serif }}>{item.qty}</span>
                        <QtyBtn onClick={() => updateRecord(item._id, 'INC')}>+</QtyBtn>
                      </>
                    ) : (
                      <span className="qty-badge">×{item.qty}</span>
                    )}
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 72 }}>
                    <div style={{ fontSize: '0.7rem', color: T.muted, marginBottom: 3 }}>
                      ₹{item.product?.finalPrice} ea.
                    </div>
                    <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.15rem', color: T.primary }}>
                      ₹{item.total}
                    </div>
                  </div>

                  {/* Delete */}
                  {!isCheckout && (
                    <button className="del-btn" onClick={() => deleteRecord(item._id)} title="Remove item">
                      <i className="fa fa-trash" style={{ fontSize: '0.72rem' }} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ─────────── Summary Column ─────────── */}
          <div className={isCheckout ? 'col-12 col-sm-10 col-md-7 col-lg-5 mx-auto' : 'col-lg-5 col-xl-4'}>
            <div
              className="summary-card"
              style={{
                background: T.surface,
                borderRadius: T.radius,
                border: `1px solid ${T.border}`,
                boxShadow: T.shadow2,
                padding: '24px 22px',
                position: 'sticky',
                top: 24,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: T.primaryGlow, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fa fa-receipt" style={{ color: T.primary, fontSize: '0.88rem' }} />
                </div>
                <span style={{ fontFamily: T.serif, fontWeight: 700, fontStyle: 'italic', fontSize: '1.2rem', color: T.dark }}>
                  Order Summary
                </span>
              </div>

              <div className="cart-rule" />

              {/* Rows */}
              <div className="sum-row">
                <span style={{ color: T.muted }}>Subtotal <span style={{ color: T.mutedLight, fontSize: '0.78rem' }}>({cart.length} item{cart.length !== 1 ? 's' : ''})</span></span>
                <span style={{ fontWeight: 600, color: T.dark }}>₹{subtotal}</span>
              </div>

              <div className="sum-row">
                <span style={{ color: T.muted }}>Delivery</span>
                {shipping === 0
                  ? <span className="free-badge">FREE</span>
                  : <span style={{ fontWeight: 600, color: T.dark }}>₹{shipping}</span>
                }
              </div>

              {/* Free shipping nudge */}
              {shipping > 0 && (
                <div style={{ background: T.amberSoft, border: `1px solid rgba(146,96,10,0.15)`, borderRadius: T.radiusSm, padding: '9px 13px', marginBottom: 8, fontSize: '0.75rem', color: T.amber, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <i className="fa fa-truck" style={{ flexShrink: 0 }} />
                  <span>Add <strong>₹{1000 - subtotal}</strong> more for free delivery</span>
                </div>
              )}

              <div className="cart-rule" style={{ background: `linear-gradient(90deg, transparent, ${T.primary}, transparent)`, opacity: 0.25 }} />

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontFamily: T.serif, fontWeight: 700, fontStyle: 'italic', fontSize: '1.05rem', color: T.dark }}>
                  Total
                </span>
                <span style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.55rem', color: T.primary, letterSpacing: '-0.02em' }}>
                  ₹{total}
                </span>
              </div>

              {/* Payment method (Checkout only) */}
              {isCheckout && (
                <div style={{ marginTop: 18 }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: T.muted, marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <i className="fa fa-lock" style={{ color: T.primary, fontSize: '0.65rem' }} />
                    Payment Method
                  </label>
                  <select className="pay-select" onChange={e => setMode(e.target.value)}>
                    <option value="COD">💵  Cash on Delivery</option>
                    <option value="Net Banking">💳  Net Banking / UPI / Card</option>
                  </select>
                </div>
              )}

              {/* CTA */}
              {!isCheckout ? (
                <Link to="/checkout" className="btn-checkout">
                  Proceed to Checkout →
                </Link>
              ) : (
                <button className="btn-place" onClick={placeOrder}>
                  <i className="fa fa-check-circle" style={{ marginRight: 8 }} />
                  Place Order
                </button>
              )}

              {!isCheckout && (
                <Link to="/product" className="continue-link">
                  ← Continue Shopping
                </Link>
              )}

              {/* Trust badges */}
              {isCheckout && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                  {[
                    { icon: 'fa-shield-alt', label: 'Secure' },
                    { icon: 'fa-undo', label: 'Easy Returns' },
                    { icon: 'fa-headset', label: '24/7 Support' },
                  ].map(b => (
                    <div key={b.label} style={{ textAlign: 'center' }}>
                      <i className={`fa ${b.icon}`} style={{ color: T.muted, fontSize: '0.9rem', display: 'block', marginBottom: 3 }} />
                      <span style={{ fontSize: '0.62rem', color: T.muted, fontWeight: 600, letterSpacing: '0.04em' }}>{b.label}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}