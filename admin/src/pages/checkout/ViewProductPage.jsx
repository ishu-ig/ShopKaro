// ViewProductPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { getCheckout } from '../../Redux/ActionCreators/CheckoutActionCreators';

export function ViewProductPage() {
    const { _id } = useParams();
    const CheckoutStateData = useSelector(state => state.CheckoutStateData);
    const dispatch = useDispatch();
    const [order, setOrder] = useState(null);

    useEffect(() => { dispatch(getCheckout()); }, [dispatch]);

    useEffect(() => {
        if (CheckoutStateData.length > 0) {
            const found = CheckoutStateData.find(o => o._id === _id);
            setOrder(found || null);
        }
    }, [CheckoutStateData, _id]);

    if (!order) return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
            <div className="text-center"><div className="spinner-border text-primary mb-3"></div><p className="text-muted">Loading items...</p></div>
        </div>
    );

    const subtotal = order?.products?.reduce((sum, i) => sum + (i?.total || 0), 0);

    return (
        <div className="fade-in-up">
            <div className="page-header mb-4">
                <div>
                    <h5><i className="fas fa-boxes me-2"></i>Order Items</h5>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>
                        {order?.products?.length} item(s) · Order #{order?._id?.slice(-8)}
                    </div>
                </div>
                <Link to="/checkout" className="text-white-50"><i className="fas fa-arrow-left"></i></Link>
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product Name</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order?.products?.map((item, idx) => (
                                <tr key={item?._id}>
                                    <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{idx + 1}</td>
                                    <td style={{ fontWeight: 600 }}>{item?.product?.name || "N/A"}</td>
                                    <td>
                                        <span style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "3px 10px", borderRadius: "20px", fontSize: "13px", fontWeight: 600 }}>
                                            ×{item?.qty}
                                        </span>
                                    </td>
                                    <td>₹{item?.product?.finalPrice || 0}</td>
                                    <td style={{ fontWeight: 700, color: "var(--primary)" }}>₹{item?.total || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: "var(--bg)" }}>
                                <td colSpan={4} style={{ fontWeight: 700, textAlign: "right", padding: "14px 16px" }}>Order Total</td>
                                <td style={{ fontWeight: 700, fontSize: "16px", color: "var(--primary)", padding: "14px 16px" }}>₹{subtotal}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ViewProductPage;