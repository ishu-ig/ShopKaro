import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { deleteCart, getCart, updateCart } from '../Redux/ActionCreartors/CartActionCreators';
import { createCheckout } from '../Redux/ActionCreartors/CheckoutActionCreators';
import { updateProduct, getProduct } from '../Redux/ActionCreartors/ProductActionCreators';

/* ─────────────────────────────────────────────
   DESIGN TOKENS — Luxury Monochromatic + Gold
───────────────────────────────────────────── */
const T = {
  /* Base */
  bg:           '#0D0D0D',
  surface:      '#141414',
  surfaceRaised:'#1C1C1C',
  surfaceHover: '#222222',
  glass:        'rgba(255,255,255,0.03)',
  glassHover:   'rgba(255,255,255,0.06)',

  /* Borders */
  border:       'rgba(255,255,255,0.07)',
  borderMid:    'rgba(255,255,255,0.12)',
  borderStrong: 'rgba(255,255,255,0.18)',

  /* Gold accent */
  gold:         '#C9A84C',
  goldLight:    '#E2C47A',
  goldDeep:     '#A07830',
  goldGlow:     'rgba(201,168,76,0.15)',
  goldGlowStrong:'rgba(201,168,76,0.25)',

  /* Text */
  textPrimary:  '#F0EDE8',
  textSub:      '#A09A92',
  textMuted:    '#5C5851',

  /* Status */
  green:        '#3DAA6E',
  greenSoft:    'rgba(61,170,110,0.12)',
  amber:        '#C9922A',
  amberSoft:    'rgba(201,146,42,0.1)',
  red:          '#C44040',
  redSoft:      'rgba(196,64,64,0.1)',

  /* Typography */
  serif: "'Playfair Display', 'Georgia', serif",
  sans:  "'Outfit', 'Helvetica Neue', sans-serif",
  mono:  "'JetBrains Mono', monospace",

  /* Effects */
  radius:    '14px',
  radiusSm:  '8px',
  radiusXs:  '5px',
  transition:'all 0.2s cubic-bezier(0.4,0,0.2,1)',
  shadow1:   '0 1px 3px rgba(0,0,0,0.4)',
  shadow2:   '0 4px 16px rgba(0,0,0,0.5)',
  shadow3:   '0 12px 40px rgba(0,0,0,0.6)',
  shadowGold:'0 8px 32px rgba(201,168,76,0.2)',
};

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Outfit:wght@300;400;500;600&display=swap');

  .c-root *, .c-root *::before, .c-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .c-root {
    font-family: ${T.sans};
    background: ${T.bg};
    min-height: 100vh;
    color: ${T.textPrimary};
    -webkit-font-smoothing: antialiased;
  }

  /* ── Scrollbar ── */
  .c-root ::-webkit-scrollbar { width: 4px; }
  .c-root ::-webkit-scrollbar-track { background: transparent; }
  .c-root ::-webkit-scrollbar-thumb { background: ${T.borderStrong}; border-radius: 4px; }

  /* ── Noise grain overlay ── */
  .c-root::before {
    content: '';
    position: fixed;
    inset: 0;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Item Card ── */
  .c-item {
    position: relative;
    background: ${T.surface};
    border: 1px solid ${T.border};
    border-radius: ${T.radius};
    margin-bottom: 10px;
    overflow: hidden;
    transition: ${T.transition};
    animation: fadeUp 0.4s ease both;
  }
  .c-item:hover {
    background: ${T.surfaceRaised};
    border-color: ${T.borderMid};
    box-shadow: ${T.shadow2};
    transform: translateY(-1px);
  }
  .c-item::after {
    content: '';
    position: absolute;
    bottom: 0; left: 20px; right: 20px;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${T.border}, transparent);
  }

  /* Gold accent line on hover */
  .c-item::before {
    content: '';
    position: absolute;
    left: 0; top: 16px; bottom: 16px;
    width: 2px;
    border-radius: 0 2px 2px 0;
    background: ${T.gold};
    opacity: 0;
    transition: opacity 0.2s;
  }
  .c-item:hover::before { opacity: 1; }

  /* ── Qty Controls ── */
  .qty-ctrl {
    display: flex;
    align-items: center;
    gap: 0;
    border: 1px solid ${T.borderMid};
    border-radius: 999px;
    overflow: hidden;
    background: ${T.surface};
  }
  .qty-btn {
    width: 32px; height: 32px;
    border: none;
    background: transparent;
    color: ${T.textSub};
    font-size: 1rem;
    font-weight: 400;
    cursor: pointer;
    transition: ${T.transition};
    display: flex; align-items: center; justify-content: center;
    font-family: ${T.sans};
    flex-shrink: 0;
  }
  .qty-btn:hover {
    background: ${T.goldGlow};
    color: ${T.gold};
  }
  .qty-val {
    min-width: 30px;
    text-align: center;
    font-size: 0.82rem;
    font-weight: 600;
    color: ${T.textPrimary};
    border-left: 1px solid ${T.border};
    border-right: 1px solid ${T.border};
    height: 32px;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── Delete btn ── */
  .del-btn {
    width: 30px; height: 30px;
    border-radius: 50%;
    border: 1px solid rgba(196,64,64,0.2);
    background: ${T.redSoft};
    color: ${T.red};
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: ${T.transition};
    flex-shrink: 0;
    opacity: 0;
  }
  .c-item:hover .del-btn { opacity: 1; }
  .del-btn:hover {
    background: ${T.red};
    color: #fff;
    border-color: ${T.red};
    transform: scale(1.1);
  }

  /* ── Summary card ── */
  /* In GLOBAL_CSS, update sum-card */
.sum-card {
  background: ${T.surface};
  border: 1px solid ${T.border};
  border-radius: ${T.radius};
  padding: 28px 24px;
  max-width: 100%;   /* ← add this */
  width: 100%;       /* ← add this */
  position: sticky;
  top: 24px;
  animation: fadeUp 0.5s 0.15s ease both;
  overflow: hidden;
}
  .sum-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, ${T.gold} 40%, ${T.goldLight} 60%, transparent 100%);
  }

  /* ── CTA buttons ── */
  .btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 13px 0;
    background: ${T.gold};
    color: #0D0D0D;
    border: none;
    border-radius: 999px;
    font-family: ${T.sans};
    font-weight: 600;
    font-size: 0.82rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    box-shadow: ${T.shadowGold};
    transition: ${T.transition};
    margin-top: 20px;
  }
  .btn-primary:hover {
    background: ${T.goldLight};
    transform: translateY(-1px);
    box-shadow: 0 12px 36px rgba(201,168,76,0.3);
    color: #0D0D0D;
  }
  .btn-primary:active { transform: scale(0.98); }

  .btn-success {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 13px 0;
    background: ${T.green};
    color: #fff;
    border: none;
    border-radius: 999px;
    font-family: ${T.sans};
    font-weight: 600;
    font-size: 0.82rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
    cursor: pointer;
    transition: ${T.transition};
    margin-top: 20px;
  }
  .btn-success:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  /* ── Payment select ── */
  .pay-select {
    width: 100%;
    padding: 10px 38px 10px 14px;
    border: 1px solid ${T.borderMid};
    border-radius: ${T.radiusSm};
    background: ${T.surfaceRaised};
    color: ${T.textPrimary};
    font-family: ${T.sans};
    font-size: 0.84rem;
    outline: none;
    cursor: pointer;
    transition: border-color 0.18s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%235C5851' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
  }
  .pay-select:focus { border-color: ${T.gold}; }

  /* ── Hairline divider ── */
  .divider {
    height: 1px;
    background: ${T.border};
    margin: 16px 0;
  }

  /* ── Summary rows ── */
  .sum-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 0.83rem;
  }

  /* ── Badges / chips ── */
  .chip {
    display: inline-block;
    background: ${T.glass};
    border: 1px solid ${T.border};
    border-radius: 999px;
    padding: 2px 9px;
    font-size: 0.65rem;
    font-weight: 500;
    color: ${T.textSub};
    letter-spacing: 0.04em;
    margin-right: 4px;
  }

  .badge-gold {
    background: ${T.goldGlow};
    border: 1px solid rgba(201,168,76,0.25);
    border-radius: 999px;
    padding: 3px 10px;
    font-size: 0.65rem;
    font-weight: 600;
    color: ${T.gold};
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .badge-free {
    background: ${T.greenSoft};
    border: 1px solid rgba(61,170,110,0.2);
    border-radius: 999px;
    padding: 3px 10px;
    font-size: 0.65rem;
    font-weight: 600;
    color: ${T.green};
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .qty-badge {
    background: ${T.glass};
    border: 1px solid ${T.border};
    border-radius: ${T.radiusSm};
    padding: 4px 12px;
    font-size: 0.82rem;
    font-weight: 600;
    color: ${T.textPrimary};
    font-family: ${T.mono};
  }

  /* ── Nudge strip ── */
  .nudge-strip {
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${T.amberSoft};
    border: 1px solid rgba(201,146,42,0.15);
    border-radius: ${T.radiusSm};
    padding: 9px 13px;
    font-size: 0.74rem;
    color: ${T.amber};
    margin-bottom: 10px;
  }

  /* ── Trust row ── */
  .trust-row {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding-top: 16px;
    border-top: 1px solid ${T.border};
    margin-top: 18px;
  }
  .trust-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 80px;
  }
  .trust-icon {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: ${T.glass};
    border: 1px solid ${T.border};
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem;
    color: ${T.gold};
  }
  .col-md-8 {
        flex: 0 0 auto;
        /* width: 100% !important; */
}

  /* ── Continue link ── */
  .back-link {
    display: block;
    text-align: center;
    margin-top: 14px;
    font-size: 0.76rem;
    color: ${T.textMuted};
    text-decoration: none;
    transition: color 0.18s;
    letter-spacing: 0.03em;
  }
  .back-link:hover { color: ${T.gold}; }

  /* ── Stagger delays ── */
  .c-item:nth-child(1) { animation-delay: 0.05s; }
  .c-item:nth-child(2) { animation-delay: 0.1s; }
  .c-item:nth-child(3) { animation-delay: 0.15s; }
  .c-item:nth-child(4) { animation-delay: 0.2s; }
  .c-item:nth-child(5) { animation-delay: 0.25s; }

  /* ── Keyframes ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .float-anim { animation: float 4s ease-in-out infinite; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .sum-card { position: static; }
    .del-btn  { opacity: 1 !important; }
    .col-md-8 {
        flex: 0 0 auto;
        /* width: 100% !important; */
  }
`;

/* ─────────────────────────────────────────────
   ICON COMPONENTS (inline SVG — no dep)
───────────────────────────────────────────── */
const IconTrash = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconReceipt = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l3-2 2 2 2-2 2 2 2-2 3 2V2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/>
  </svg>
);
const IconTruck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconShield = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconRefund = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.42"/>
  </svg>
);
const IconHeadset = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
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
    dispatch(createCheckout({
      user: localStorage.getItem('userid'),
      orderStatus: 'Ordered',
      paymentMode: mode,
      paymentStatus: 'Pending',
      subtotal, shipping, total,
      date: new Date(),
      products: [...cart]
    }));
    cart.forEach(ci => {
      const p = ProductStateData.find(x => x._id === ci.product._id);
      if (p) {
        p.stockQuantity -= ci.qty;
        p.stock = p.stockQuantity > 0;
        dispatch(updateProduct(p));
        dispatch(deleteCart({ _id: ci._id }));
      }
    });
    navigate(mode === 'COD' ? '/confirmation' : '/payment/-1');
  }

  useEffect(() => { getAPIData(); }, [CartStateData.length]);
  useEffect(() => { dispatch(getProduct()); }, [ProductStateData.length]);

  /* ── Empty State ── */
  if (!cart.length) return (
    <div className="c-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ textAlign: 'center', padding: '60px 24px', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Glow blob */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="float-anim" style={{
          width: 88, height: 88,
          borderRadius: '50%',
          border: `1px solid rgba(201,168,76,0.25)`,
          background: 'rgba(201,168,76,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          fontSize: '2rem',
        }}>
          🛒
        </div>

        <div style={{
          fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.2em',
          color: T.gold, textTransform: 'uppercase', marginBottom: 14,
        }}>
          Empty Basket
        </div>

        <h3 style={{
          fontFamily: T.serif, fontWeight: 600, fontStyle: 'italic',
          fontSize: 'clamp(1.7rem,5vw,2.3rem)', color: T.textPrimary,
          lineHeight: 1.2, marginBottom: 14,
        }}>
          Your cart awaits
        </h3>

        <p style={{ color: T.textSub, fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 32 }}>
          Discover our curated selection — something extraordinary is waiting for you.
        </p>

        <Link to="/product" className="btn-primary" style={{ maxWidth: 240, margin: '0 auto' }}>
          Browse the Menu <IconArrow />
        </Link>
      </div>
    </div>
  );

  /* ── Main Render ── */
  return (
    <div className="c-root">
      <style>{GLOBAL_CSS}</style>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 16px 80px', position: 'relative', zIndex: 1 }}>

        {/* ── Page Header ── */}
        {!isCheckout && (
          <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${T.border}` }}>
            <div style={{
              fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.22em',
              color: T.gold, textTransform: 'uppercase', marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ display: 'block', width: 20, height: 1, background: T.gold }} />
              Shopping Basket
              <span style={{ display: 'block', flex: 1, height: 1, background: `linear-gradient(90deg, ${T.border}, transparent)` }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
              <h1 style={{
                fontFamily: T.serif, fontWeight: 600, fontStyle: 'italic',
                fontSize: 'clamp(2rem,5vw,3rem)', color: T.textPrimary,
                lineHeight: 1, letterSpacing: '-0.01em',
              }}>
                Your Cart
              </h1>
              <span className="badge-gold">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        <div className="row g-4 align-items-start">

          {/* ─────────── Items Column ─────────── */}
          <div className={isCheckout ? 'col-12' : 'col-lg-7 col-xl-8'}>
            {cart.map((item, idx) => (
              <div key={item._id} className="c-item" style={{ animationDelay: `${0.05 + idx * 0.055}s` }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px', flexWrap: 'wrap',
                }}>

                  {/* Thumbnail */}
                  <Link
                    to={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`}
                    target="_blank" rel="noreferrer"
                    style={{ flexShrink: 0 }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`}
                        alt={item.product?.name}
                        style={{
                          width: 72, height: 72,
                          borderRadius: 10,
                          objectFit: 'cover',
                          border: `1px solid ${T.border}`,
                          display: 'block',
                          transition: T.transition,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = T.gold; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = T.border; }}
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div style={{ flex: '1 1 140px', minWidth: 0 }}>
                    <div style={{
                      fontFamily: T.serif, fontWeight: 600, fontStyle: 'italic',
                      fontSize: '1rem', color: T.textPrimary,
                      marginBottom: 6, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.product?.name}
                    </div>

                    <div style={{ marginBottom: 4 }}>
                      {item.product?.brand?.name && <span className="chip">{item.product.brand.name}</span>}
                      {item.product?.color        && <span className="chip">{item.product.color}</span>}
                      {item.product?.size          && <span className="chip">Size {item.product.size}</span>}
                    </div>

                    {!isCheckout && item.product?.stockQuantity !== undefined && (
                      <div style={{
                        fontSize: '0.68rem', fontWeight: 500,
                        color: item.product?.stockQuantity > 5 ? T.green : T.amber,
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                        <span style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: 'currentColor', display: 'inline-block', flexShrink: 0,
                        }} />
                        {item.product?.stockQuantity
                          ? `${item.product.stockQuantity} in stock`
                          : 'Out of stock'}
                      </div>
                    )}
                  </div>

                  {/* Qty Control */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {!isCheckout ? (
                      <div className="qty-ctrl">
                        <button className="qty-btn" onClick={() => updateRecord(item._id, 'DEC')}>−</button>
                        <span className="qty-val">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateRecord(item._id, 'INC')}>+</button>
                      </div>
                    ) : (
                      <span className="qty-badge">×{item.qty}</span>
                    )}
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 72 }}>
                    <div style={{ fontSize: '0.68rem', color: T.textMuted, marginBottom: 4 }}>
                      ₹{item.product?.finalPrice} each
                    </div>
                    <div style={{
                      fontFamily: T.serif, fontWeight: 700,
                      fontSize: '1.2rem', color: T.gold,
                    }}>
                      ₹{item.total}
                    </div>
                  </div>

                  {/* Delete */}
                  {!isCheckout && (
                    <button className="del-btn" onClick={() => deleteRecord(item._id)} title="Remove item">
                      <IconTrash />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ─────────── Summary Column ─────────── */}
          <div className={isCheckout ? 'col-12' : 'col-lg-5 col-xl-4'}>
            <div className="sum-card">

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: T.goldGlow,
                  border: `1px solid rgba(201,168,76,0.2)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: T.gold,
                }}>
                  <IconReceipt />
                </div>
                <span style={{
                  fontFamily: T.serif, fontWeight: 600, fontStyle: 'italic',
                  fontSize: '1.15rem', color: T.textPrimary,
                }}>
                  Order Summary
                </span>
              </div>

              <div className="divider" />

              {/* Rows */}
              <div className="sum-row">
                <span style={{ color: T.textSub, fontSize: '0.82rem' }}>
                  Subtotal
                  <span style={{ color: T.textMuted, marginLeft: 4 }}>
                    ({cart.length} item{cart.length !== 1 ? 's' : ''})
                  </span>
                </span>
                <span style={{ fontWeight: 500, color: T.textPrimary, fontSize: '0.86rem' }}>
                  ₹{subtotal}
                </span>
              </div>

              <div className="sum-row">
                <span style={{ color: T.textSub, fontSize: '0.82rem' }}>Delivery</span>
                {shipping === 0
                  ? <span className="badge-free">Free</span>
                  : <span style={{ fontWeight: 500, color: T.textPrimary, fontSize: '0.86rem' }}>₹{shipping}</span>
                }
              </div>

              {/* Nudge strip */}
              {shipping > 0 && (
                <div className="nudge-strip">
                  <span style={{ flexShrink: 0, color: T.amber }}><IconTruck /></span>
                  <span>Add <strong>₹{1000 - subtotal}</strong> more for free delivery</span>
                </div>
              )}

              <div className="divider" />

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{
                  fontFamily: T.serif, fontStyle: 'italic',
                  fontSize: '1rem', color: T.textPrimary, fontWeight: 600,
                }}>
                  Total
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: T.serif, fontWeight: 700,
                    fontSize: '2rem', color: T.gold, letterSpacing: '-0.02em', lineHeight: 1,
                  }}>
                    ₹{total}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: T.textMuted, marginTop: 2 }}>
                    incl. all taxes
                  </div>
                </div>
              </div>

              {/* Payment selector (Checkout mode) */}
              {isCheckout && (
                <div style={{ marginTop: 20 }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: '0.65rem', fontWeight: 600,
                    color: T.textMuted, textTransform: 'uppercase',
                    letterSpacing: '0.14em', marginBottom: 8,
                  }}>
                    <span style={{ color: T.gold, fontSize: '0.7rem' }}>⚿</span>
                    Payment Method
                  </label>
                  <select className="pay-select" onChange={e => setMode(e.target.value)}>
                    <option value="COD">Cash on Delivery</option>
                    <option value="Net Banking">Net Banking / UPI / Card</option>
                  </select>
                </div>
              )}

              {/* CTA */}
              {!isCheckout ? (
                <Link to="/checkout" className="btn-primary">
                  Proceed to Checkout <IconArrow />
                </Link>
              ) : (
                <button className="btn-success" onClick={placeOrder}>
                  <IconCheck /> Place Order
                </button>
              )}

              {!isCheckout && (
                <Link to="/product" className="back-link">← Continue Shopping</Link>
              )}

              {/* Trust badges */}
              {isCheckout && (
                <div className="trust-row">
                  {[
                    { icon: <IconShield />, label: 'Secure' },
                    { icon: <IconRefund />, label: 'Easy Returns' },
                    { icon: <IconHeadset />, label: '24/7 Support' },
                  ].map(b => (
                    <div key={b.label} className="trust-item">
                      <div className="trust-icon">{b.icon}</div>
                      <span style={{ fontSize: '0.6rem', color: T.textMuted, fontWeight: 500, letterSpacing: '0.05em' }}>
                        {b.label}
                      </span>
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