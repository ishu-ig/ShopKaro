import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { deleteCart, getCart, updateCart } from '../Redux/ActionCreartors/CartActionCreators';
import { createCheckout } from '../Redux/ActionCreartors/CheckoutActionCreators';
import { updateProduct, getProduct } from '../Redux/ActionCreartors/ProductActionCreators';

const S = {
  section: {
    padding: '48px 0 100px',
    background: 'linear-gradient(135deg, #FDF6EE 0%, #FFF8F3 100%)',
    minHeight: '100vh',
  },
  heading: {
    fontFamily: 'Playfair Display, serif',
    fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
    fontWeight: 900,
    color: 'var(--dark, #1C1009)',
    marginBottom: 0,
  },
  badge: {
    background: 'linear-gradient(135deg, var(--primary, #C8400A), #E86834)',
    color: 'white',
    borderRadius: 50,
    padding: '3px 14px',
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  // Cart item card
  itemCard: {
    background: 'white',
    borderRadius: 18,
    border: '1px solid rgba(200,64,10,0.09)',
    boxShadow: '0 2px 14px rgba(28,16,9,0.06)',
    padding: '20px 22px',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    transition: 'box-shadow 0.3s ease',
  },
  productImg: {
    width: 88,
    height: 88,
    borderRadius: 12,
    objectFit: 'cover',
    flexShrink: 0,
    border: '2px solid rgba(200,64,10,0.1)',
  },
  productName: {
    fontFamily: 'Playfair Display, serif',
    fontWeight: 700,
    fontSize: '1rem',
    color: '#1C1009',
    marginBottom: 4,
  },
  metaTag: {
    display: 'inline-block',
    background: 'rgba(200,64,10,0.07)',
    color: 'var(--primary, #C8400A)',
    borderRadius: 50,
    padding: '2px 10px',
    fontSize: '0.72rem',
    fontWeight: 600,
    marginRight: 5,
    marginBottom: 4,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    border: '2px solid rgba(200,64,10,0.25)',
    background: 'white',
    color: '#C8400A',
    fontWeight: 700,
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    lineHeight: 1,
    padding: 0,
  },
  qtyNum: {
    minWidth: 32,
    textAlign: 'center',
    fontWeight: 700,
    fontSize: '1rem',
    color: '#1C1009',
  },
  price: {
    fontWeight: 700,
    fontSize: '1.05rem',
    color: '#C8400A',
    whiteSpace: 'nowrap',
  },
  deleteBtn: {
    background: '#fff0f3',
    border: 'none',
    borderRadius: '50%',
    width: 34,
    height: 34,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#f43f5e',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  // Summary card
  summaryCard: {
    background: 'white',
    borderRadius: 20,
    border: '1px solid rgba(200,64,10,0.09)',
    boxShadow: '0 4px 24px rgba(28,16,9,0.08)',
    padding: '28px 24px',
  },
  summaryTitle: {
    fontFamily: 'Playfair Display, serif',
    fontWeight: 800,
    fontSize: '1.15rem',
    color: '#1C1009',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottom: '1px solid rgba(200,64,10,0.1)',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    fontSize: '0.9rem',
  },
  summaryLabel: { color: '#7A6E65' },
  summaryValue: { fontWeight: 600, color: '#1C1009' },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0 0',
    marginTop: 8,
    borderTop: '2px solid rgba(200,64,10,0.12)',
  },
  totalLabel: { fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: '1.05rem', color: '#1C1009' },
  totalValue: { fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: '1.4rem', color: '#C8400A' },
  checkoutBtn: {
    width: '100%',
    padding: '13px 0',
    background: 'linear-gradient(135deg, #C8400A, #E86834)',
    color: 'white',
    border: 'none',
    borderRadius: 50,
    fontWeight: 700,
    fontSize: '0.92rem',
    letterSpacing: '0.03em',
    cursor: 'pointer',
    transition: 'opacity 0.25s, transform 0.25s',
    marginTop: 20,
    boxShadow: '0 8px 20px rgba(200,64,10,0.25)',
  },
  placeOrderBtn: {
    width: '100%',
    padding: '13px 0',
    background: 'linear-gradient(135deg, #059669, #10b981)',
    color: 'white',
    border: 'none',
    borderRadius: 50,
    fontWeight: 700,
    fontSize: '0.92rem',
    letterSpacing: '0.03em',
    cursor: 'pointer',
    transition: 'opacity 0.25s, transform 0.25s',
    marginTop: 20,
    boxShadow: '0 8px 20px rgba(16,185,129,0.25)',
  },
  select: {
    border: '1.5px solid rgba(200,64,10,0.2)',
    borderRadius: 10,
    padding: '9px 14px',
    fontSize: '0.88rem',
    width: '100%',
    outline: 'none',
    color: '#1C1009',
    background: 'white',
    marginTop: 4,
  },
  freeBadge: {
    background: 'rgba(16,185,129,0.1)',
    color: '#059669',
    borderRadius: 50,
    padding: '2px 10px',
    fontSize: '0.72rem',
    fontWeight: 700,
  },
};

export default function Cart({ title, data }) {
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState("COD");

  const CartStateData = useSelector((state) => state.CartStateData);
  const ProductStateData = useSelector((state) => state.ProductStateData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function placeOrder() {
    const item = {
      user: localStorage.getItem("userid"),
      orderStatus: "Ordered",
      paymentMode: mode,
      paymentStatus: "Pending",
      subtotal, shipping, total,
      date: new Date(),
      products: [...cart],
    };
    dispatch(createCheckout(item));
    cart.forEach((cartItem) => {
      let product = ProductStateData.find((x) => x._id === cartItem.product._id);
      product.stockQuantity -= cartItem.qty;
      product.stock = product.stockQuantity === 0 ? false : true;
      dispatch(updateProduct(product));
      dispatch(deleteCart({ _id: cartItem._id }));
    });
    if (mode === "COD") navigate("/confirmation");
    else navigate("/payment/-1");
  }

  function deleteRecord(_id) {
    if (window.confirm("Remove this item from cart?")) {
      dispatch(deleteCart({ _id }));
      getAPIData();
    }
  }

  function updateRecord(_id, option) {
    const item = cart.find((x) => x._id === _id);
    const index = cart.findIndex((x) => x._id === _id);
    if (!item) return;
    if (option === "DEC" && item.qty > 1) {
      item.qty -= 1;
      item.total -= item.product?.finalPrice;
    } else if (option === "INC" && item.qty < item.product?.stockQuantity) {
      item.qty += 1;
      item.total += item.product?.finalPrice;
    }
    dispatch(updateCart({ ...item }));
    cart[index] = { ...item };
    calculate(cart);
  }

  function calculate(data) {
    let sub = data.reduce((sum, x) => sum + x.total, 0);
    if (sub > 0 && sub < 1000) { setShipping(150); setTotal(sub + 150); }
    else { setShipping(0); setTotal(sub); }
    setSubtotal(sub);
  }

  function getAPIData() {
    dispatch(getCart());
    if (data) { setCart(data); calculate(data); }
    else if (CartStateData.length) { setCart(CartStateData); calculate(CartStateData); }
    else { setCart([]); calculate([]); }
  }

  useEffect(() => { getAPIData(); }, [CartStateData.length]);
  useEffect(() => { dispatch(getProduct()); }, [ProductStateData.length]);

  const isCheckout = title === "Checkout";

  return (
    <div style={S.section}>
      <div className="container">

        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--primary,#C8400A)', textTransform: 'uppercase', marginBottom: 4 }}>
              {isCheckout ? 'Checkout' : 'Shopping'}
            </p>
            <h2 style={S.heading}>
              {isCheckout ? 'Order Summary' : title === "Cart" ? 'Your Cart' : 'Items in Order'}
            </h2>
          </div>
          {cart.length > 0 && (
            <span style={S.badge}>{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {cart.length ? (
          <div className="row g-4">
            {/* Items Column */}
            <div className={isCheckout ? 'col-12' : 'col-lg-8'}>

              {/* Desktop: card-based list */}
              <div className="d-none d-md-block">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    style={S.itemCard}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(28,16,9,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 14px rgba(28,16,9,0.06)'}
                  >
                    {/* Image */}
                    <Link to={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`} target="_blank" rel="noreferrer">
                      <img src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`} style={S.productImg} alt={item.product?.name} />
                    </Link>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={S.productName}>{item.product?.name}</div>
                      <div style={{ marginBottom: 8 }}>
                        {item.product?.brand?.name && <span style={S.metaTag}>{item.product?.brand?.name}</span>}
                        {item.product?.color && <span style={S.metaTag}>{item.product?.color}</span>}
                        {item.product?.size && <span style={S.metaTag}>Size: {item.product?.size}</span>}
                      </div>
                      {title !== "Checkout" && item.product?.stockQuantity !== undefined && (
                        <span style={{ fontSize: '0.75rem', color: item.product?.stockQuantity > 5 ? '#059669' : '#f59e0b', fontWeight: 600 }}>
                          {item.product?.stockQuantity ? `${item.product?.stockQuantity} left` : '⚠ Out of stock'}
                        </span>
                      )}
                    </div>

                    {/* Qty Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {!isCheckout ? (
                        <>
                          <button
                            style={S.qtyBtn}
                            onClick={() => updateRecord(item._id, "DEC")}
                            onMouseEnter={e => { e.currentTarget.style.background = '#C8400A'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#C8400A'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#C8400A'; e.currentTarget.style.borderColor = 'rgba(200,64,10,0.25)'; }}
                          >−</button>
                          <span style={S.qtyNum}>{item.qty}</span>
                          <button
                            style={S.qtyBtn}
                            onClick={() => updateRecord(item._id, "INC")}
                            onMouseEnter={e => { e.currentTarget.style.background = '#C8400A'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#C8400A'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#C8400A'; e.currentTarget.style.borderColor = 'rgba(200,64,10,0.25)'; }}
                          >+</button>
                        </>
                      ) : (
                        <span style={{ ...S.qtyNum, background: 'rgba(200,64,10,0.07)', borderRadius: 8, padding: '4px 12px' }}>×{item.qty}</span>
                      )}
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.75rem', color: '#7A6E65', marginBottom: 2 }}>₹{item.product?.finalPrice} each</div>
                      <div style={S.price}>₹{item.total}</div>
                    </div>

                    {/* Delete */}
                    {!isCheckout && (
                      <button
                        style={S.deleteBtn}
                        onClick={() => deleteRecord(item._id)}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f43f5e'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff0f3'; e.currentTarget.style.color = '#f43f5e'; }}
                        title="Remove item"
                      >
                        <i className="fa fa-trash" style={{ fontSize: '0.8rem' }}></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile Cards */}
              <div className="d-block d-md-none">
                {cart.map((item) => (
                  <div key={item._id} style={{ ...S.itemCard, flexDirection: 'column', alignItems: 'stretch', gap: 0, padding: 0, overflow: 'hidden' }}>
                    {/* Image */}
                    <div style={{ position: 'relative' }}>
                      <img
                        src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`}
                        alt={item.product?.name}
                        style={{ width: '100%', height: 180, objectFit: 'cover' }}
                      />
                      {!isCheckout && (
                        <button
                          style={{ ...S.deleteBtn, position: 'absolute', top: 10, right: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                          onClick={() => deleteRecord(item._id)}
                        >
                          <i className="fa fa-trash" style={{ fontSize: '0.8rem' }}></i>
                        </button>
                      )}
                    </div>
                    <div style={{ padding: '16px 18px 18px' }}>
                      <div style={S.productName}>{item.product?.name}</div>
                      <div style={{ marginBottom: 10 }}>
                        {item.product?.brand?.name && <span style={S.metaTag}>{item.product?.brand?.name}</span>}
                        {item.product?.color && <span style={S.metaTag}>{item.product?.color}</span>}
                        {item.product?.size && <span style={S.metaTag}>Size: {item.product?.size}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {!isCheckout ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button style={S.qtyBtn} onClick={() => updateRecord(item._id, "DEC")}>−</button>
                            <span style={S.qtyNum}>{item.qty}</span>
                            <button style={S.qtyBtn} onClick={() => updateRecord(item._id, "INC")}>+</button>
                          </div>
                        ) : (
                          <span style={{ ...S.qtyNum, background: 'rgba(200,64,10,0.07)', borderRadius: 8, padding: '4px 12px' }}>×{item.qty}</span>
                        )}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.75rem', color: '#7A6E65' }}>₹{item.product?.finalPrice} each</div>
                          <div style={S.price}>₹{item.total}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Column */}
            <div className={isCheckout ? 'col-12 col-md-6 mx-auto' : 'col-lg-4'}>
              <div style={S.summaryCard}>
                <div style={S.summaryTitle}>
                  <i className="fa fa-receipt me-2" style={{ color: '#C8400A', fontSize: '0.9rem' }}></i>
                  Order Summary
                </div>

                <div style={S.summaryRow}>
                  <span style={S.summaryLabel}>Subtotal ({cart.length} items)</span>
                  <span style={S.summaryValue}>₹{subtotal}</span>
                </div>

                <div style={S.summaryRow}>
                  <span style={S.summaryLabel}>Delivery</span>
                  {shipping === 0
                    ? <span style={S.freeBadge}>FREE</span>
                    : <span style={S.summaryValue}>₹{shipping}</span>
                  }
                </div>

                {shipping > 0 && (
                  <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: 10, padding: '8px 12px', marginBottom: 8, fontSize: '0.78rem', color: '#92400e' }}>
                    <i className="fa fa-info-circle me-2"></i>
                    Add ₹{1000 - subtotal} more for free delivery!
                  </div>
                )}

                <div style={S.totalRow}>
                  <span style={S.totalLabel}>Total</span>
                  <span style={S.totalValue}>₹{total}</span>
                </div>

                {isCheckout && (
                  <div style={{ marginTop: 18 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#7A6E65', marginBottom: 4, display: 'block' }}>
                      Payment Method
                    </label>
                    <select style={S.select} onChange={(e) => setMode(e.target.value)}>
                      <option value="COD">💵 Cash on Delivery</option>
                      <option value="Net Banking">💳 Net Banking / UPI / Card</option>
                    </select>
                  </div>
                )}

                {!isCheckout ? (
                  <Link
                    to="/checkout"
                    style={{ ...S.checkoutBtn, display: 'block', textAlign: 'center', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
                  >
                    Proceed to Checkout →
                  </Link>
                ) : (
                  <button
                    style={S.placeOrderBtn}
                    onClick={placeOrder}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
                  >
                    <i className="fa fa-check-circle me-2"></i>Place Order
                  </button>
                )}

                {!isCheckout && (
                  <Link to="/product" style={{ display: 'block', textAlign: 'center', marginTop: 14, fontSize: '0.84rem', color: '#7A6E65', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#C8400A'}
                    onMouseLeave={e => e.target.style.color = '#7A6E65'}
                  >
                    ← Continue Shopping
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart */
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '5rem', marginBottom: 20 }}>🛒</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 800, color: '#1C1009', marginBottom: 10 }}>Your cart is empty</h3>
            <p style={{ color: '#7A6E65', marginBottom: 28, fontSize: '0.95rem' }}>Looks like you haven't added anything yet.</p>
            <Link
              to="/product"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #C8400A, #E86834)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: 50,
                padding: '13px 36px',
                fontWeight: 700,
                fontSize: '0.92rem',
                boxShadow: '0 8px 20px rgba(200,64,10,0.25)',
                transition: 'opacity 0.2s',
              }}
            >
              Browse Products →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}