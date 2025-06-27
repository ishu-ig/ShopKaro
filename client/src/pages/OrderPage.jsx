import React, { useEffect, useState } from 'react';
import HeroSection from '../Components/HeroSection';

import { useDispatch, useSelector } from 'react-redux';
import { getCheckout, updateCheckout } from '../Redux/ActionCreartors/CheckoutActionCreators';
import { updateProduct } from '../Redux/ActionCreartors/ProductActionCreators';
import { Link, useNavigate } from 'react-router-dom';

export default function OrderPage() {
  const CheckoutStateData = useSelector((state) => state.CheckoutStateData);
  const ProductStateData = useSelector((state) => state.ProductStateData);
  const [orders, setOrders] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getCheckout());
    if (CheckoutStateData.length) {
      setOrders(CheckoutStateData);
    }
  }, [CheckoutStateData.length]);

  function updateOrder(_id) {
    if (window.confirm('Are you sure you want to cancel your Order?')) {
      const item = orders.find((x) => x._id === _id);
      if (!item) return;

      // Update order status
      const updatedItem = { ...item, orderStatus: 'Cancelled' };
      dispatch(updateCheckout(updatedItem));

      // Restore stock
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
  }

  return (
    <>
      <HeroSection title="Order List" />
      <div className="container my-4">
        <h5 className="bg-primary text-light text-center py-2 rounded">Your Order</h5>
        <div className="container">
          {Array.isArray(orders) && orders.length ? (
            orders.map((item) => (
              <div
                key={item?._id}
                className="mb-4 p-3 card shadow-sm rounded"
                style={{ backgroundColor: '#F8F8F8' }}
              >
                {/* Order Header */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center bg-light p-3 rounded gap-2">
                  <div>
                    <h6 className="mb-0">
                      <strong>Order Id:</strong> {item?._id}
                    </h6>
                    <p className="text-muted mb-0 mt-2">
                      <strong>Created At:</strong>{' '}
                      {new Date(item?.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`badge fs-6 mt-2 mt-md-0 ${
                      item?.orderStatus !== 'Cancelled' ? 'bg-success' : 'bg-danger'
                    }`}
                  >
                    {item?.orderStatus === 'Cancelled'
                      ? 'Cancelled'
                      : item?.orderStatus}
                  </span>
                </div>

                {/* Order Table */}
                <div className="table-responsive mt-2">
                  <table className="table table-bordered text-center">
                    <thead className="table-primary">
                      <tr>
                        <th>Product</th>
                        <th>Price (₹)</th>
                        <th>Qty</th>
                        <th>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item?.products?.map((prod) => (
                        <tr key={prod._id}>
                          <td>{prod.product.name}</td>
                          <td>{prod.product.finalPrice}</td>
                          <td>{prod.qty}</td>
                          <td>{prod.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Payment Info & Actions */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 border-top pt-3 px-2">
                  <div>
                    <p className="mb-1">
                      <strong>Payment Mode:</strong> {item?.paymentMode || 'N/A'}
                    </p>
                    <p className="mb-0">
                      <strong>Payment Status:</strong>{' '}
                      <span
                        className={`fw-bold ${
                          item?.paymentStatus === 'Pending'
                            ? 'text-danger'
                            : 'text-success'
                        }`}
                      >
                        {item?.paymentStatus || 'N/A'}
                      </span>
                    </p>
                  </div>

                  <div className="text-start text-md-end w-100 w-md-auto">
                    <h5 className="fw-bold">Total: ₹{item?.total}</h5>

                    {/* Cancel Button (if allowed) */}
                    {!['Order is Under Process', 'Out For Delivery', 'Order is Packed', 'Delivered', 'Cancelled'].includes(item.orderStatus) && (
                      <button
                        onClick={() => updateOrder(item?._id)}
                        className="btn btn-outline-danger mt-2 me-2 w-100 w-md-auto"
                      >
                        Cancel Order
                      </button>
                    )}

                    {/* View Details */}
                    <Link
                      to={`/order-detail/${item?._id}`}
                      className="btn btn-outline-primary mt-2 w-100 w-md-auto"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-5 text-center">
              <h3>No Order is Placed</h3>
              <Link to="/product" className="btn btn-primary mt-2">
                Shop Now
              </Link>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginBottom: '100px' }}></div>
    </>
  );
}
