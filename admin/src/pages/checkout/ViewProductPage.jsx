import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { getCheckout } from '../../Redux/ActionCreartors/CheckoutActionCreators';

export default function ViewProductPage() {
    const { _id } = useParams(); // get the _id from URL
    const CheckoutStateData = useSelector(state => state.CheckoutStateData);
    const dispatch = useDispatch();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        dispatch(getCheckout());
    }, [dispatch]);

    useEffect(() => {
        if (CheckoutStateData.length > 0) {
            const foundOrder = CheckoutStateData.find(order => order._id === _id);
            setOrder(foundOrder || null);
        }
    }, [CheckoutStateData, _id]);

    if (!order) {
        return <div className="text-center p-5">Loading Order Details...</div>;
    }

    return (
        <div className="container-fluid">
            <h5 className="bg-primary text-light text-center p-3">
                Order Items - {order?._id}
                <Link to="/checkout" className="float-end text-light">
                    <i className="fa fa-arrow-left"></i>
                </Link>
            </h5>
            <div className="table-responsive">
                <table className="table table-striped table-hover table-bordered text-center">
                    <thead className="text-light" style={{ backgroundColor: "#1F2A40" }}>
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
    );
}
