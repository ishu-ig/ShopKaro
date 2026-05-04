import React, { useEffect, useState } from 'react';
import HeroSection from '../Components/HeroSection';
import { useDispatch, useSelector } from 'react-redux';
import { getCheckout, updateCheckout } from '../Redux/ActionCreartors/CheckoutActionCreators';
import { updateProduct } from '../Redux/ActionCreartors/ProductActionCreators';
import { Link, useNavigate } from 'react-router-dom';

const STATUS_COLOR = {
  'Delivered':        { bg: 'rgba(16,185,129,0.1)',  color: '#059669', dot: '#10b981' },
  'Cancelled':        { bg: 'rgba(244,63,94,0.1)',   color: '#e11d48', dot: '#f43f5e' },
  'Ordered':          { bg: 'rgba(200,64,10,0.1)',   color: '#c8400a', dot: '#e86834' },
  'Shipped':          { bg: 'rgba(59,130,246,0.1)',  color: '#2563eb', dot: '#3b82f6' },
  'Packed':           { bg: 'rgba(245,158,11,0.1)',  color: '#d97706', dot: '#f59e0b' },
  'Out for Delivery': { bg: 'rgba(139,92,246,0.1)',  color: '#7c3aed', dot: '#8b5cf6' },
};
const DEFAULT_STATUS = { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', dot: '#9ca3af' };

export default function OrderPage() {
  const CheckoutStateData = useSelector((state) => state.CheckoutStateData);
  const ProductStateData  = useSelector((state) => state.ProductStateData);
  const [orders, setOrders] = useState([]);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  useEffect(() => {
    dispatch(getCheckout());
    if (CheckoutStateData.length) setOrders(CheckoutStateData);
  }, [CheckoutStateData.length]);

  function updateOrder(_id) {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    const item = orders.find((x) => x._id === _id);
    if (!item) return;
    const updatedItem = {
      ...item,
      orderStatus: 'Cancelled',
      paymentStatus: item.paymentStatus === 'Done' ? 'Refund Initialized' : item.paymentStatus,
    };
    dispatch(updateCheckout(updatedItem));
    item.products.forEach((prod) => {
      const product = ProductStateData.find((x) => x._id === prod.product._id);
      if (product) {
        product.stockQuantity += prod.qty;
        product.stock = true;
        dispatch(updateProduct(product));
      }
    });
    navigate(0);
  }

  const canCancel = (status) =>
    !['Order is Under Process','Out For Delivery','Order is Packed','Delivered','Cancelled'].includes(status);

  return (
    <>
      <HeroSection title="My Orders" />
      <div style={{ padding:'48px 0 100px', background:'linear-gradient(135deg,#FDF6EE 0%,#FFF8F3 100%)', minHeight:'100vh' }}>
        <div className="container">

          {/* Page heading */}
          <div className="mb-4">
            <p style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.14em', color:'#C8400A', textTransform:'uppercase', marginBottom:4 }}>Account</p>
            <h2 style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:'clamp(1.6rem,3vw,2.2rem)', color:'#1C1009', margin:0 }}>Your Orders</h2>
          </div>

          {orders.length ? orders.map((item) => {
            const s = STATUS_COLOR[item?.orderStatus] || DEFAULT_STATUS;
            return (
              <div
                key={item?._id}
                style={{ background:'white', borderRadius:20, border:'1px solid rgba(200,64,10,0.08)', boxShadow:'0 2px 16px rgba(28,16,9,0.07)', marginBottom:20, overflow:'hidden', transition:'box-shadow 0.3s ease' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(28,16,9,0.12)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 16px rgba(28,16,9,0.07)'}
              >
                {/* Order header */}
                <div style={{ padding:'18px 24px', borderBottom:'1px solid rgba(200,64,10,0.08)', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12, background:'#FFFBF7' }}>
                  <div>
                    <div style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.1em', color:'#7A6E65', textTransform:'uppercase', marginBottom:3 }}>Order ID</div>
                    <div style={{ fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:'0.95rem', color:'#1C1009', wordBreak:'break-all' }}>#{item?._id?.slice(-10)?.toUpperCase()}</div>
                    <div style={{ fontSize:'0.78rem', color:'#7A6E65', marginTop:3 }}>
                      <i className="fa fa-calendar-alt me-1" style={{ color:'#C8400A' }}></i>
                      {new Date(item?.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                    </div>
                  </div>
                  {/* Status badge */}
                  <span style={{ background:s.bg, color:s.color, borderRadius:50, padding:'6px 16px', fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.04em', display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:s.dot, display:'inline-block' }} />
                    {item?.orderStatus}
                  </span>
                </div>

                {/* Products grid */}
                <div style={{ padding:'16px 24px' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
                    {item?.products?.map((prod) => (
                      <Link
                        key={prod._id}
                        to={`/product/${prod.product?._id}`}
                        style={{ textDecoration:'none' }}
                      >
                        <div
                          style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(200,64,10,0.03)', borderRadius:12, padding:'10px 14px', border:'1px solid rgba(200,64,10,0.07)', cursor:'pointer', transition:'background 0.2s, border-color 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background='rgba(200,64,10,0.08)'; e.currentTarget.style.borderColor='rgba(200,64,10,0.2)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background='rgba(200,64,10,0.03)'; e.currentTarget.style.borderColor='rgba(200,64,10,0.07)'; }}
                        >
                          {/* Product image */}
                          {prod.product?.pic?.[0] ? (
                            <img
                              src={`${process.env.REACT_APP_BACKEND_SERVER}/${prod.product.pic[0].replace(/\\/g, '/')}`}
                              alt={prod.product?.name}
                              style={{ width:44, height:44, borderRadius:8, objectFit:'cover', flexShrink:0, border:'1px solid rgba(200,64,10,0.12)' }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          {/* Fallback icon */}
                          <div style={{ width:44, height:44, borderRadius:8, background:'rgba(200,64,10,0.08)', display: prod.product?.pic?.[0] ? 'none' : 'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <i className="fa fa-box" style={{ color:'#C8400A', fontSize:'0.85rem' }}></i>
                          </div>

                          <div style={{ minWidth:0 }}>
                            <div style={{ fontWeight:600, fontSize:'0.85rem', color:'#1C1009', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{prod.product?.name}</div>
                            <div style={{ fontSize:'0.75rem', color:'#7A6E65' }}>×{prod.qty} · <span style={{ color:'#C8400A', fontWeight:700 }}>₹{prod.total?.toLocaleString()}</span></div>
                            <div style={{ fontSize:'0.68rem', color:'#C8400A', marginTop:2, display:'flex', alignItems:'center', gap:3 }}>
                              <i className="fa fa-external-link-alt" style={{ fontSize:'0.6rem' }}></i> View product
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Footer row */}
                <div style={{ padding:'14px 24px 18px', borderTop:'1px solid rgba(200,64,10,0.08)', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:14 }}>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:20 }}>
                    <div>
                      <div style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', color:'#7A6E65', textTransform:'uppercase', marginBottom:2 }}>Expected Delivery</div>
                      <div style={{ fontSize:'0.85rem', fontWeight:600, color:'#1C1009' }}>
                        {item?.expectedDelivery
                          ? new Date(item.expectedDelivery).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })
                          : '3–6 business days'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', color:'#7A6E65', textTransform:'uppercase', marginBottom:2 }}>Payment</div>
                      <div style={{ fontSize:'0.85rem', fontWeight:600, color:'#1C1009' }}>{item?.paymentMode}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', color:'#7A6E65', textTransform:'uppercase', marginBottom:2 }}>Status</div>
                      <div style={{ fontSize:'0.85rem', fontWeight:700, color: item?.paymentStatus === 'Pending' ? '#e11d48' : '#059669' }}>{item?.paymentStatus}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.1em', color:'#7A6E65', textTransform:'uppercase', marginBottom:2 }}>Total</div>
                      <div style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:'1.1rem', color:'#C8400A' }}>₹{item?.total?.toLocaleString()}</div>
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    {canCancel(item?.orderStatus) && (
                      <button
                        onClick={() => updateOrder(item?._id)}
                        style={{ padding:'9px 20px', background:'transparent', border:'1.5px solid rgba(244,63,94,0.4)', color:'#e11d48', borderRadius:50, fontWeight:700, fontSize:'0.82rem', cursor:'pointer', transition:'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='#f43f5e'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#f43f5e'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#e11d48'; e.currentTarget.style.borderColor='rgba(244,63,94,0.4)'; }}
                      >
                        <i className="fa fa-times me-2" style={{ fontSize:'0.75rem' }}></i>Cancel
                      </button>
                    )}
                    <Link
                      to={`/order-detail/${item?._id}`}
                      style={{ padding:'9px 20px', background:'linear-gradient(135deg,#C8400A,#E86834)', color:'white', borderRadius:50, fontWeight:700, fontSize:'0.82rem', textDecoration:'none', transition:'opacity 0.2s', boxShadow:'0 4px 14px rgba(200,64,10,0.2)' }}
                      onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity='1'}
                    >
                      <i className="fa fa-eye me-2" style={{ fontSize:'0.75rem' }}></i>View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ textAlign:'center', padding:'80px 20px' }}>
              <div style={{ fontSize:'4.5rem', marginBottom:18 }}>📦</div>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontWeight:800, color:'#1C1009', marginBottom:10 }}>No orders yet</h3>
              <p style={{ color:'#7A6E65', marginBottom:28, fontSize:'0.95rem' }}>Looks like you haven't placed any orders.</p>
              <Link to="/product" style={{ display:'inline-block', background:'linear-gradient(135deg,#C8400A,#E86834)', color:'white', textDecoration:'none', borderRadius:50, padding:'13px 36px', fontWeight:700, fontSize:'0.92rem', boxShadow:'0 8px 20px rgba(200,64,10,0.25)' }}>
                Browse Products →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}