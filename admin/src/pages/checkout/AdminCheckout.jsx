import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net';
import { deleteCheckout, getCheckout } from '../../Redux/ActionCreators/CheckoutActionCreators';

export default function AdminCheckout() {
    const CheckoutStateData = useSelector(state => state.CheckoutStateData);
    const dispatch = useDispatch();

    const deleteRecord = (_id) => {
        if (window.confirm("Are you sure you want to delete this order?")) {
            dispatch(deleteCheckout({ _id }));
            getAPIData();
        }
    };

    function getAPIData() {
        dispatch(getCheckout());
        const time = setTimeout(() => {
            if (!$.fn.DataTable.isDataTable('#DataTable')) {
                $('#DataTable').DataTable({ responsive: true, order: [[6, 'desc']] });
            }
        }, 500);
        return time;
    }

    useEffect(() => {
        const time = getAPIData();
        return () => clearTimeout(time);
    }, [CheckoutStateData.length]);

    const statusColors = {
        "Ordered": "info", "Packed": "warning", "Shipped": "warning",
        "Out for Delivery": "warning", "Delivered": "success", "Cancelled": "danger"
    };

    return (
        <div className="fade-in-up">
            <div className="page-header mb-4">
                <h5 className='text-light bg-primary'><i className="fas fa-shopping-cart me-2  "></i>Checkout Orders</h5>
                <span style={{ fontSize: "14px", background: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: "20px" }}>
                    {CheckoutStateData?.length} orders
                </span>
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table id="DataTable" className="table" style={{ width: "100%" }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Order Status</th>
                                <th>Payment</th>
                                <th>Total</th>
                                <th>Date</th>
                                <th>Products</th>
                                <th>View</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CheckoutStateData?.map((order) => (
                                <tr key={order?._id}>
                                    <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-muted)", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {order?._id}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{order?.user?.name || "N/A"}</td>
                                    <td>
                                        <span className={`badge-status ${statusColors[order?.orderStatus] || "info"}`}>
                                            {order?.orderStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: "12px" }}>
                                            <div style={{ color: "var(--text-muted)", marginBottom: "2px" }}>{order?.paymentMode}</div>
                                            <span className={`badge-status ${order?.paymentStatus === "Pending" ? "danger" : "success"}`} style={{ fontSize: "11px" }}>
                                                {order?.paymentStatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: "var(--primary)" }}>₹{order?.total}</td>
                                    <td style={{ whiteSpace: "nowrap", color: "var(--text-muted)", fontSize: "13px" }}>
                                        {new Date(order?.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <Link to={`/checkout/product/${order?._id}`} className="btn btn-primary btn-sm text-light">
                                            <i className="fas fa-boxes me-1"></i>
                                            <span className="d-none d-sm-inline">Items</span>
                                        </Link>
                                    </td>
                                    <td>
                                        <Link to={`/checkout/view/${order?._id}`} className="btn btn-primary btn-sm text-light">
                                            <i className="fas fa-eye"></i>
                                        </Link>
                                    </td>
                                    <td>
                                        <button className='btn btn-danger btn-sm' onClick={() => deleteRecord(order._id)}>
                                            <i className='fas fa-trash'></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}