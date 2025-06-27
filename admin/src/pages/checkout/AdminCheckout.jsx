import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net';
import { deleteCheckout, getCheckout } from '../../Redux/ActionCreartors/CheckoutActionCreators';

export default function AdminCheckout() {
    const CheckoutStateData = useSelector(state => state.CheckoutStateData);
    const dispatch = useDispatch();
    const [expandedRow, setExpandedRow] = useState(null);

    const deleteRecord = (id) => {
        if (window.confirm("Are You Sure To Delete This Order?")) {
            dispatch(deleteCheckout({ id: id }));
            getAPIData();
        }
    };

    const getAPIData = () => {
        dispatch(getCheckout());
    };

    useEffect(() => {
        getAPIData();
    }, []);
    
    useEffect(() => {
        if ($.fn.DataTable.isDataTable('#DataTable')) {
            $('#DataTable').DataTable().destroy();
        }
        if (CheckoutStateData.length > 0) {
            $('#DataTable').DataTable();
        }
    }, [CheckoutStateData]); // Run when data is updated

    return (
        <div className="container-fluid">
            <h5 className="bg-primary text-light text-center p-3">Checkout</h5>
            <div className="table-responsive">
                <table id="DataTable" className="table table-striped table-hover table-bordered text-center">
                    <thead className="text-light" style={{ backgroundColor: "#1F2A40" }}>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Order Status</th>
                            <th>Payment Mode</th>
                            <th>Payment Status</th>
                            <th>Total</th>
                            <th>Date</th>
                            <th>Products</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {CheckoutStateData?.map((order) => (
                            <>
                                <tr key={order?._id}>
                                    <td className="fw-bold">{order?._id}</td>
                                    <td>{order?.user?.name || "N/A"}</td>
                                    <td className={`fw-bold ${order?.orderStatus !== "Cancelled" ? null : "text-danger"}`}>{order?.orderStatus}</td>
                                    <td>{order?.paymentMode}</td>
                                    <td>
                                        <span className={`fw-bold ${order?.paymentStatus === "Pending" ? "text-danger" : "text-success"}`}>
                                            {order?.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="fw-bold text-primary">₹{order?.total}</td>
                                    <td>{new Date(order?.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm bg-primary text-light"
                                            onClick={() => setExpandedRow(expandedRow === order?._id ? null : order?._id)}
                                        >
                                            {expandedRow === order?._id ? "Hide Products" : "View Products"}
                                        </button>
                                    </td>
                                    <td>
                                        <Link to={`/checkout/view/${order?._id}`} className="btn btn-primary text-light btn-sm" title="View Order">
                                            <i className="fa fa-eye"></i>
                                        </Link>
                                    </td>
                                </tr>

                                {expandedRow === order?._id && (
                                    <tr key={`details-${order?._id}`}>
                                        <td colSpan="9">
                                            <div className="card p-3 border">
                                                <h6 className="text-center mb-3 bg-primary p-2 text-light">Order Items</h6>
                                                <div className="table-responsive">
                                                    <table className="table table-sm table-bordered text-center">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>Name</th>
                                                                <th>Quantity</th>
                                                                <th>Price</th>
                                                                <th>Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order?.products?.map((item) => (
                                                                <tr key={item?._id}>
                                                                    <td>{item?.product?.name || "N/A"}</td>
                                                                    <td>{item?.qty}</td>
                                                                    <td>₹{item?.product?.finalPrice || 0}</td>
                                                                    <td>₹{item?.total || 0}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
