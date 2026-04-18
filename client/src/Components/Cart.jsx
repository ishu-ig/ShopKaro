import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { deleteCart, getCart, updateCart } from '../Redux/ActionCreartors/CartActionCreators';
import { createCheckout } from '../Redux/ActionCreartors/CheckoutActionCreators';
import { updateProduct, getProduct } from '../Redux/ActionCreartors/ProductActionCreators';

const MetaChip = ({ label }) => label ? (
  <span style={{ display: 'inline-block', background: 'rgba(200,64,10,0.07)', color: '#C8400A', borderRadius: 50, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 600, marginRight: 4, marginBottom: 4 }}>
    {label}
  </span>
) : null;

const QtyBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(200,64,10,0.25)', background: 'white', color: '#C8400A', fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }}
    onMouseEnter={e => { e.currentTarget.style.background = '#C8400A'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#C8400A'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#C8400A'; e.currentTarget.style.borderColor = 'rgba(200,64,10,0.25)'; }}
  >{children}</button>
);

export default function Cart({ title, data }) {
  const [cart, setCart]         = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal]       = useState(0);
  const [mode, setMode]         = useState('COD');

  const CartStateData    = useSelector(s => s.CartStateData);
  const ProductStateData = useSelector(s => s.ProductStateData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    if (option === 'DEC' && item.qty > 1)                               { item.qty--; item.total -= item.product?.finalPrice; }
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

  /* ─ empty ─ */
  if (!cart.length) return (
    <div style={{ textAlign: 'center', padding: '56px 16px' }}>
      <div style={{ fontSize: '4rem', marginBottom: 14 }}>🛒</div>
      <h3 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 800, color: '#1C1009', marginBottom: 8, fontSize: 'clamp(1.2rem,4vw,1.6rem)' }}>Your cart is empty</h3>
      <p style={{ color: '#7A6E65', marginBottom: 22, fontSize: '0.9rem' }}>Looks like you haven't added anything yet.</p>
      <Link to="/product" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#C8400A,#E86834)', color: 'white', textDecoration: 'none', borderRadius: 50, padding: '12px 32px', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(200,64,10,0.25)' }}>
        Browse Products →
      </Link>
    </div>
  );

  return (
    <div>
      {/* Heading row */}
      {!isCheckout && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
          <div>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', color: '#C8400A', textTransform: 'uppercase', marginBottom: 2 }}>Shopping</p>
            <h2 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: 'clamp(1.25rem,3vw,1.75rem)', color: '#1C1009', margin: 0 }}>Your Cart</h2>
          </div>
          <span style={{ background: 'linear-gradient(135deg,#C8400A,#E86834)', color: 'white', borderRadius: 50, padding: '3px 13px', fontSize: '0.74rem', fontWeight: 700 }}>
            {cart.length} item{cart.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="row g-3 align-items-start">

        {/* ── Items column ── */}
        <div className={isCheckout ? 'col-12' : 'col-lg-8'}>
          {cart.map(item => (
            <div key={item._id}
              style={{ background: 'white', borderRadius: 14, border: '1px solid rgba(200,64,10,0.09)', boxShadow: '0 2px 12px rgba(28,16,9,0.06)', marginBottom: 10, overflow: 'hidden', transition: 'box-shadow 0.25s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(28,16,9,0.11)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(28,16,9,0.06)'}
            >
              {/* Single responsive row — wraps naturally on small screens */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', flexWrap: 'wrap' }}>

                {/* Thumbnail */}
                <Link to={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`} target="_blank" rel="noreferrer" style={{ flexShrink: 0 }}>
                  <img
                    src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`}
                    alt={item.product?.name}
                    style={{ width: 68, height: 68, borderRadius: 10, objectFit: 'cover', border: '2px solid rgba(200,64,10,0.1)', display: 'block' }}
                  />
                </Link>

                {/* Name + chips — grows to fill space */}
                <div style={{ flex: '1 1 140px', minWidth: 0 }}>
                  <div style={{ fontFamily: 'Playfair Display,serif', fontWeight: 700, fontSize: '0.93rem', color: '#1C1009', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.product?.name}
                  </div>
                  <div>
                    <MetaChip label={item.product?.brand?.name} />
                    <MetaChip label={item.product?.color} />
                    {item.product?.size && <MetaChip label={`Size: ${item.product?.size}`} />}
                  </div>
                  {!isCheckout && item.product?.stockQuantity !== undefined && (
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: 2, color: item.product?.stockQuantity > 5 ? '#059669' : '#f59e0b' }}>
                      {item.product?.stockQuantity ? `${item.product.stockQuantity} left` : '⚠ Out of stock'}
                    </div>
                  )}
                </div>

                {/* Qty controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  {!isCheckout ? (
                    <>
                      <QtyBtn onClick={() => updateRecord(item._id, 'DEC')}>−</QtyBtn>
                      <span style={{ minWidth: 26, textAlign: 'center', fontWeight: 700, fontSize: '0.95rem', color: '#1C1009' }}>{item.qty}</span>
                      <QtyBtn onClick={() => updateRecord(item._id, 'INC')}>+</QtyBtn>
                    </>
                  ) : (
                    <span style={{ background: 'rgba(200,64,10,0.07)', borderRadius: 8, padding: '4px 10px', fontWeight: 700, fontSize: '0.88rem', color: '#1C1009' }}>×{item.qty}</span>
                  )}
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.7rem', color: '#7A6E65', marginBottom: 1 }}>₹{item.product?.finalPrice} ea.</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#C8400A', whiteSpace: 'nowrap' }}>₹{item.total}</div>
                </div>

                {/* Delete */}
                {!isCheckout && (
                  <button
                    onClick={() => deleteRecord(item._id)}
                    title="Remove"
                    style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff0f3', border: 'none', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f43f5e'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff0f3'; e.currentTarget.style.color = '#f43f5e'; }}
                  >
                    <i className="fa fa-trash" style={{ fontSize: '0.72rem' }}></i>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Summary column ── */}
        <div className={isCheckout ? 'col-12 col-sm-10 col-md-8 col-lg-6 mx-auto' : 'col-lg-4'}>
          <div style={{ background: 'white', borderRadius: 18, border: '1px solid rgba(200,64,10,0.09)', boxShadow: '0 4px 24px rgba(28,16,9,0.08)', padding: '22px 20px' }}>

            <div style={{ fontFamily: 'Playfair Display,serif', fontWeight: 800, fontSize: '1.05rem', color: '#1C1009', paddingBottom: 13, marginBottom: 14, borderBottom: '1px solid rgba(200,64,10,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa fa-receipt" style={{ color: '#C8400A', fontSize: '0.85rem' }}></i>
              Order Summary
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.87rem' }}>
              <span style={{ color: '#7A6E65' }}>Subtotal ({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
              <span style={{ fontWeight: 600, color: '#1C1009' }}>₹{subtotal}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: '0.87rem' }}>
              <span style={{ color: '#7A6E65' }}>Delivery</span>
              {shipping === 0
                ? <span style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', borderRadius: 50, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700 }}>FREE</span>
                : <span style={{ fontWeight: 600, color: '#1C1009' }}>₹{shipping}</span>
              }
            </div>

            {shipping > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: 10, padding: '8px 12px', marginBottom: 10, fontSize: '0.74rem', color: '#92400e' }}>
                <i className="fa fa-info-circle me-1"></i> Add ₹{1000 - subtotal} more for free delivery!
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid rgba(200,64,10,0.12)', paddingTop: 13, marginTop: 6, marginBottom: 4 }}>
              <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 800, fontSize: '1rem', color: '#1C1009' }}>Total</span>
              <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 900, fontSize: '1.3rem', color: '#C8400A' }}>₹{total}</span>
            </div>

            {isCheckout && (
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#7A6E65', marginBottom: 5, display: 'block', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Payment Method
                </label>
                <select
                  style={{ border: '1.5px solid rgba(200,64,10,0.2)', borderRadius: 10, padding: '10px 13px', fontSize: '0.87rem', width: '100%', outline: 'none', color: '#1C1009', background: 'white', cursor: 'pointer' }}
                  onChange={e => setMode(e.target.value)}
                >
                  <option value="COD">💵 Cash on Delivery</option>
                  <option value="Net Banking">💳 Net Banking / UPI / Card</option>
                </select>
              </div>
            )}

            {!isCheckout ? (
              <Link to="/checkout"
                style={{ display: 'block', textAlign: 'center', marginTop: 16, padding: '12px 0', background: 'linear-gradient(135deg,#C8400A,#E86834)', color: 'white', textDecoration: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 8px 18px rgba(200,64,10,0.25)', transition: 'opacity 0.2s,transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
              >
                Proceed to Checkout →
              </Link>
            ) : (
              <button onClick={placeOrder}
                style={{ display: 'block', width: '100%', marginTop: 16, padding: '12px 0', background: 'linear-gradient(135deg,#059669,#10b981)', color: 'white', border: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 8px 18px rgba(16,185,129,0.25)', cursor: 'pointer', transition: 'opacity 0.2s,transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
              >
                <i className="fa fa-check-circle me-2"></i>Place Order
              </button>
            )}

            {!isCheckout && (
              <Link to="/product"
                style={{ display: 'block', textAlign: 'center', marginTop: 11, fontSize: '0.81rem', color: '#7A6E65', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#C8400A'}
                onMouseLeave={e => e.currentTarget.style.color = '#7A6E65'}
              >
                ← Continue Shopping
              </Link>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}