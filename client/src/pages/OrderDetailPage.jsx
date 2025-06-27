import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCheckout } from '../Redux/ActionCreartors/CheckoutActionCreators';

export default function OrderDetailPage() {
    const { _id } = useParams();  // Get Order ID from URL
    const CheckoutStateData = useSelector(state => state.CheckoutStateData);
    const [order, setOrder] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getCheckout());
    }, [dispatch]);

    useEffect(() => {
        if (CheckoutStateData.length) {
            let foundOrder = CheckoutStateData.find(x => x._id === _id);
            setOrder(foundOrder || {});  // Ensure order is not undefined
        }
    }, [CheckoutStateData, _id]);

    if (!order) {
        return <div className="container text-center my-5"><h3>Loading Order Details...</h3></div>;
    }

    return (
        <>
            <div className="container my-4">
            <h3 className=" bg-primary text-light text-center mb-4 p-2">Order Details</h3>

            {/* Order Summary Section */}
            <div className="card shadow-sm p-3 mb-4">
                <div className="card-body">
                    <h5><strong>Order ID:</strong> {order._id || "N/A"}</h5>
                    <p><strong>Order Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</p>
                    <p>
                        <strong>Order Status:</strong>{" "}
                        <span className={`fw-bold ${order.orderStatus === "Delivered" ? "text-success" : "text-danger"}`}>
                            {order.orderStatus || "N/A"}
                        </span>
                    </p>
                    <p>
                        <strong>Payment Status:</strong>{" "}
                        <span className={`fw-bold ${order.paymentStatus === "Pending" ? "text-danger" : "text-success"}`}>
                            {order.paymentStatus || "N/A"}
                        </span>
                    </p>
                    <p><strong>Payment Mode:</strong> {order.paymentMode || "N/A"}</p>
                </div>
            </div>

            {/* User & Address Details in Table Format */}
            <div className="card shadow-sm p-3 mb-4">
                <div className="card-body">
                    <h5 className="mb-3">User & Address Details</h5>
                    <table className="table table-bordered">
                        <tbody>
                            <tr>
                                <th>Name</th>
                                <td>{order.user?.name || "N/A"}</td>
                            </tr>
                            <tr>
                                <th>Email</th>
                                <td>{order.user?.email || "N/A"}</td>
                            </tr>
                            <tr>
                                <th>Phone</th>
                                <td>{order.user?.phone || "N/A"}</td>
                            </tr>
                            <tr>
                                <th>Street</th>
                                <td>{order.user?.address || "N/A"}</td>
                            </tr>
                            <tr>
                                <th>City</th>
                                <td>{order.user?.city || "N/A"}</td>
                            </tr>
                            <tr>
                                <th>State</th>
                                <td>{order.user?.state || "N/A"}</td>
                            </tr>
                            <tr>
                                <th>Pincode</th>
                                <td>{order.user?.pin || "N/A"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product List Section */}
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
                                        <td>{prod.product?.name || "Unknown"}</td>
                                        <td>{prod.product?.finalPrice || 0}</td>
                                        <td>{prod.qty || 1}</td>
                                        <td>{prod.total || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-muted">No products found for this order.</p>
                    )}
                </div>
            </div>

            {/* Total Price & Back Button */}
            <div className="d-flex justify-content-between align-items-center">
                <h4><strong>Total Amount:</strong> ₹{order.total || "N/A"}</h4>
                <Link to="/order" className="btn btn-outline-primary">Back to Orders</Link>
            </div>
        </div>
        <div style={{marginBottom:"100px"}}></div>
        </>
    );
}
