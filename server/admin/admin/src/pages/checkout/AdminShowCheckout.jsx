import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCheckout, updateCheckout } from "../../Redux/ActionCreartors/CheckoutActionCreators";

export default function AdminCheckoutShow() {
    let { _id } = useParams();
    let CheckoutStateData = useSelector((state) => state.CheckoutStateData);
    let dispatch = useDispatch();
    let navigate = useNavigate()

    let [data, setData] = useState(null);
    let [orderStatus, setOrderStatus] = useState("");
    let [paymentStatus, setPaymentStatus] = useState("");

    useEffect(() => {
        dispatch(getCheckout());
    }, [dispatch]);

    useEffect(() => {
        if (CheckoutStateData?.length) {
            let item = CheckoutStateData.find((x) => x._id === _id);
            if (item) {
                setData({ ...item });
                setOrderStatus(item.orderStatus);
                setPaymentStatus(item.paymentStatus);
            } else {
                alert("Invalid Checkout Id");
            }
        }
    }, [_id, CheckoutStateData]);

    function updateRecord() {
        if (window.confirm("Are You Sure To Update The Status?")) {
            const updatedData = { ...data, orderStatus, paymentStatus };
            dispatch(updateCheckout(updatedData));
            setData(updatedData); // manually update local state to reflect changes
        }
    }

    if (!data) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div className="container-fluid">
            <h5 className="bg-primary text-light text-center p-3 mb-3">
                Checkout Details
                <Link to="/checkout" className="float-end text-light">
                    <i className="fa fa-arrow-left"></i>
                </Link>
            </h5>
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <tbody>
                        <tr>
                            <th>Id</th>
                            <td>{data?._id}</td>
                        </tr>
                        <tr>
                            <th>User Detail</th>
                            <td>
                                <div className="card p-3 bg-light">
                                    <strong>{data?.user?.name}</strong>
                                    <p className="mb-1">
                                        <i className="fa fa-envelope"></i> {data?.user?.email}
                                    </p>
                                    <p className="mb-1">
                                        <i className="fa fa-phone"></i> {data?.user?.phone}
                                    </p>
                                    <p className="mb-1">
                                        <i className="fa fa-map-marker"></i> {data?.user?.address}, {data?.user?.city}, {data?.user?.state}, {data?.user?.pin}
                                    </p>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Order Status</th>
                            <td className={`fw-bold ${data?.orderStatus === "Cancelled" ? "text-danger" : "text-success"}`}>
                                {data?.orderStatus}
                                {data?.orderStatus !== "Delivered" && data?.orderStatus !== "Cancelled" ? (
                                    <select
                                        name="orderStatus"
                                        className="form-select border-3 border-primary w-75 mt-2"
                                        value={orderStatus}
                                        onChange={(e) => setOrderStatus(e.target.value)}
                                    >
                                        <option value="Order Is Placed">Order Is Placed</option>
                                        <option value="Order Is Ready For Delivery">Order Is Ready For Delivery</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                ) : null}
                            </td>
                        </tr>
                        <tr>
                            <th>Payment Mode</th>
                            <td>{data?.paymentMode}</td>
                        </tr>
                        <tr>
                            <th>Payment Status</th>
                            <td>
                                <span className={`fw-bold ${data?.paymentStatus === "Pending" ? "text-danger" : "text-success"}`}>
                                    {data?.paymentStatus}
                                </span>
                                {data?.paymentStatus !== "Done" && data?.orderStatus !== "Cancelled" ? (
                                    <select
                                        name="paymentStatus"
                                        className="form-select border-3 border-primary w-75 mt-2"
                                        value={paymentStatus}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Done">Done</option>
                                    </select>
                                ) : null}
                            </td>
                        </tr>
                        <tr>
                            <th>Subtotal</th>
                            <td>₹{data?.subtotal}</td>
                        </tr>
                        <tr>
                            <th>Delivery Charge</th>
                            <td>₹{data?.deliveryCharge || 0}</td>
                        </tr>
                        <tr>
                            <th>Total</th>
                            <td>₹{data?.total}</td>
                        </tr>
                        <tr>
                            <th>Order Date</th>
                            <td>{new Date(data?.createdAt).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                {data?.orderStatus !== "Delivered" || data?.paymentStatus === "Pending" ? (
                                    <button className="btn btn-primary w-100 text-light" onClick={updateRecord}>
                                        Update
                                    </button>
                                ) : null}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}