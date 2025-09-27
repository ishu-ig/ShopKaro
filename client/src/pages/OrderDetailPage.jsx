import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCheckout } from '../Redux/ActionCreartors/CheckoutActionCreators';

export default function OrderDetailPage() {
    const { _id } = useParams();  // Order ID from URL
    const CheckoutStateData = useSelector(state => state.CheckoutStateData);
    const [order, setOrder] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getCheckout());
    }, [dispatch]);

    useEffect(() => {
        if (CheckoutStateData.length) {
            const foundOrder = CheckoutStateData.find(order => order._id === _id);
            setOrder(foundOrder || {});
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
                alert('Invoice generated!');
                downloadInvoice(data.invoice.invoiceNumber);
            } else {
                alert('Invoice generation failed.');
            }
        } catch (err) {
            console.error('Error generating invoice:', err);
            alert('Error generating invoice.');
        }
    };

    // ✅ Open PDF in a new tab
    const downloadInvoice = (invoiceNumber) => {
        const invoiceUrl = `${process.env.REACT_APP_BACKEND_SERVER}/invoices/${invoiceNumber}.pdf`;
        window.open(invoiceUrl, '_blank');
    };

    if (!order) {
        return (
            <div className="container text-center my-5">
                <h3>Loading Order Details...</h3>
            </div>
        );
    }

    return (
        <>
            <div className="container my-4">
                <h3 className="bg-primary text-light text-center mb-4 p-2">Order Details</h3>

                {/* Order Summary */}
                <div className="card shadow-sm p-3 mb-4">
                    <div className="card-body">
                        <h5><strong>Order ID:</strong> {order._id}</h5>
                        <p><strong>Order Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</p>
                        <p>
                            <strong>Order Status:</strong>{" "}
                            <span className={`fw-bold ${order.orderStatus === "Delivered" ? "text-success" : "text-danger"}`}>
                                {order.orderStatus}
                            </span>
                        </p>
                        <p>
                            <strong>Payment Status:</strong>{" "}
                            <span className={`fw-bold ${order.paymentStatus === "Pending" ? "text-danger" : "text-success"}`}>
                                {order.paymentStatus}
                            </span>
                        </p>
                        <p><strong>Payment Mode:</strong> {order.paymentMode}</p>
                    </div>
                </div>

                {/* User & Addresponses */}
                <div className="card shadow-sm p-3 mb-4">
                    <div className="card-body">
                        <h5 className="mb-3">User & Addresponses Details</h5>
                        <table className="table table-bordered">
                            <tbody>
                                <tr><th>Name</th><td>{order.user?.name}</td></tr>
                                <tr><th>Email</th><td>{order.user?.email}</td></tr>
                                <tr><th>Phone</th><td>{order.user?.phone}</td></tr>
                                <tr><th>Street</th><td>{order.user?.addresponses}</td></tr>
                                <tr><th>City</th><td>{order.user?.city}</td></tr>
                                <tr><th>State</th><td>{order.user?.state}</td></tr>
                                <tr><th>Pincode</th><td>{order.user?.pin}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Product List */}
                <div className="card shadow-sm p-3 mb-4">
                    <div className="card-body">
                        <h5 className="mb-3">Ordered Products</h5>
                        {order?.products?.length > 0 ? (
                            <table className="table table-bordered">
                                <thead className="table-light text-center">
                                    <tr>
                                        <th>Product</th>
                                        <th>Price (₹)</th>
                                        <th>Quantity</th>
                                        <th>Total (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-center">
                                    {order.products.map((prod) => (
                                        <tr key={prod._id}>
                                            <td>{prod.product?.name}</td>
                                            <td>{prod.product?.finalPrice}</td>
                                            <td>{prod.qty}</td>
                                            <td>{prod.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-muted">No products found for this order.</p>
                        )}
                    </div>
                </div>

                {/* Total + Invoice Button */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4><strong>Total Amount:</strong> ₹{order.total}</h4>
                    <div className='btn-group'>
                        <button onClick={generateInvoice} className="btn btn-success me-2">
                            View Invoice
                        </button>
                        <Link to="/order" className="btn btn-outline-primary">Back to Orders</Link>
                    </div>
                </div>
            </div>
            <div style={{ marginBottom: "100px" }}></div>
        </>
    );
}
