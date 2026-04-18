import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCheckout } from '../Redux/ActionCreartors/CheckoutActionCreators';

const STATUS_STEPS = ["Ordered", "Packed", "Shipped", "Out for Delivery", "Delivered"];

const STATUS_ICONS = {
  "Ordered":          "fa-file-alt",
  "Packed":           "fa-box",
  "Shipped":          "fa-truck",
  "Out for Delivery": "fa-map-marker-alt",
  "Delivered":        "fa-check-circle",
};

function InfoRow({ label, value }) {
  return (
    <div className="od-info-row">
      <span className="od-info-label">{label}</span>
      <span className="od-info-value">{value || '—'}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const { _id } = useParams();
  const CheckoutStateData = useSelector(state => state.CheckoutStateData);
  const [order, setOrder] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => { dispatch(getCheckout()); }, [dispatch]);

  useEffect(() => {
    if (CheckoutStateData.length) {
      const found = CheckoutStateData.find(o => o._id === _id);
      setOrder(found || {});
    }
  }, [CheckoutStateData, _id]);

  const generateInvoice = async () => {
    try {
      let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/invoice/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: _id }),
      });
      const data = await response.json();
      if (response.ok && data.invoice?.invoiceNumber) {
        window.open(`${process.env.REACT_APP_BACKEND_SERVER}/invoices/${data.invoice.invoiceNumber}.pdf`, '_blank');
      } else {
        alert('Invoice generation failed.');
      }
    } catch (err) {
      alert('Error generating invoice.');
    }
  };

  if (!order) return (
    <>
      <style>{`.od-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;gap:16px}.od-spinner{width:44px;height:44px;border:3px solid #f0ece4;border-top-color:#c9a84c;border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div className="od-loading">
        <div className="od-spinner" />
        <span style={{ fontSize: 14, color: '#888', letterSpacing: 1 }}>Loading order…</span>
      </div>
    </>
  );

  const currentIndex = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';
  const isDelivered = order.orderStatus === 'Delivered';

  return (
    <>

      <div className="od-wrap">
        <div className="container">

          {/* Header */}
          <div className="od-page-header">
            <div className="od-page-header-left">
              <div className="od-page-icon"><i className="fa fa-receipt" /></div>
              <div>
                <div className="od-page-title">Order Details</div>
                <div className="od-page-sub">#{order._id?.slice(-8)?.toUpperCase()}</div>
              </div>
            </div>
            <div className={`od-status-pill ${isDelivered ? 'delivered' : isCancelled ? 'cancelled' : 'processing'}`}>
              <i className={`fa ${isDelivered ? 'fa-check' : isCancelled ? 'fa-times' : 'fa-clock'}`} style={{ fontSize: 10 }} />
              {order.orderStatus}
            </div>
          </div>

          {/* Order Summary */}
          <div className="od-card wow fadeIn" data-wow-delay=".1s">
            <div className="od-card-header">
              <div className="od-card-header-icon"><i className="fa fa-info" /></div>
              <h6 className="od-card-header-title">Order Summary</h6>
            </div>
            <div className="od-card-body">
              <div className="od-summary-grid">
                <div className="od-summary-item">
                  <div className="od-summary-item-label">Order ID</div>
                  <div className="od-summary-item-value" style={{ fontSize: 12, wordBreak: 'break-all' }}>{order._id}</div>
                </div>
                <div className="od-summary-item">
                  <div className="od-summary-item-label">Order Date</div>
                  <div className="od-summary-item-value">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  </div>
                </div>
                <div className="od-summary-item">
                  <div className="od-summary-item-label">Payment Status</div>
                  <div>
                    <span className={`od-pay-pill ${order.paymentStatus === 'Pending' ? 'pending' : 'paid'}`}>
                      <i className={`fa ${order.paymentStatus === 'Pending' ? 'fa-clock' : 'fa-check'}`} style={{ fontSize: 10 }} />
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="od-summary-item">
                  <div className="od-summary-item-label">Payment Mode</div>
                  <div className="od-summary-item-value">{order.paymentMode}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Tracker */}
          {!isCancelled && (
            <div className="od-card wow fadeIn" data-wow-delay=".2s">
              <div className="od-card-header">
                <div className="od-card-header-icon"><i className="fa fa-map-marked-alt" /></div>
                <h6 className="od-card-header-title">Order Progress</h6>
              </div>
              <div className="od-card-body">
                <div className="od-tracker">
                  {STATUS_STEPS.map((step, index) => {
                    const done    = currentIndex > index;
                    const current = currentIndex === index;
                    return (
                      <div
                        key={step}
                        className={`od-tracker-step ${done ? 'completed' : current ? 'current' : ''}`}
                      >
                        <div className="od-tracker-circle">
                          {done
                            ? <i className="fa fa-check" style={{ fontSize: 12 }} />
                            : <i className={`fa ${STATUS_ICONS[step]}`} />
                          }
                        </div>
                        <span className="od-tracker-label">{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="od-card" style={{ border: '1.5px solid rgba(220,53,69,0.2)' }}>
              <div className="od-card-body" style={{ textAlign: 'center', padding: '28px' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(220,53,69,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#dc3545', fontSize: 22 }}>
                  <i className="fa fa-times" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#dc3545', marginBottom: 4 }}>Order Cancelled</div>
                <div style={{ fontSize: 13, color: '#888' }}>This order has been cancelled.</div>
              </div>
            </div>
          )}

          {/* Address */}
          <div className="od-card wow fadeIn" data-wow-delay=".3s">
            <div className="od-card-header">
              <div className="od-card-header-icon"><i className="fa fa-map-marker-alt" /></div>
              <h6 className="od-card-header-title">Delivery Address</h6>
            </div>
            <div className="od-card-body">
              <InfoRow label="Name"    value={order.user?.name} />
              <InfoRow label="Email"   value={order.user?.email} />
              <InfoRow label="Phone"   value={order.user?.phone} />
              <InfoRow label="Address" value={order.user?.address} />
              <InfoRow label="City"    value={order.user?.city} />
              <InfoRow label="State"   value={order.user?.state} />
              <InfoRow label="Pincode" value={order.user?.pin} />
            </div>
          </div>

          {/* Products */}
          <div className="od-card wow fadeIn" data-wow-delay=".4s">
            <div className="od-card-header">
              <div className="od-card-header-icon"><i className="fa fa-box-open" /></div>
              <h6 className="od-card-header-title">Ordered Products</h6>
            </div>
            <div className="od-card-body" style={{ padding: '0 24px 8px' }}>
              {order.products?.length > 0 ? (
                <table className="od-products-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.products.map((prod) => (
                      <tr key={prod._id}>
                        <td><span className="od-product-name">{prod.product?.name}</span></td>
                        <td>₹{prod.product?.finalPrice?.toLocaleString()}</td>
                        <td>{prod.qty}</td>
                        <td style={{ fontWeight: 700, color: '#0d1b2a' }}>₹{prod.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: 'center', color: '#bbb', padding: '24px 0', fontSize: 14 }}>No products found.</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="od-footer-bar wow fadeIn" data-wow-delay=".5s">
            <div>
              <div className="od-total-label">Order Total</div>
              <div className="od-total-amount">₹{order.total?.toLocaleString()}</div>
            </div>
            <div className="od-footer-actions">
              {!isCancelled && (
                <button onClick={generateInvoice} className="od-btn primary">
                  <i className="fa fa-file-invoice" style={{ fontSize: 12 }} />
                  Download Invoice
                </button>
              )}
              <Link to="/order" className="od-btn outline">
                <i className="fa fa-arrow-left" style={{ fontSize: 11 }} />
                My Orders
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}