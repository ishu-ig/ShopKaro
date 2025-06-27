import React, { useEffect, useState } from 'react'
import HeroSection from '../Components/HeroSection'

import { useDispatch, useSelector } from 'react-redux'
import { getCheckout, updateCheckout } from '../Redux/ActionCreartors/CheckoutActionCreators'
import { updateProduct } from '../Redux/ActionCreartors/ProductActionCreators'
import { Link, useNavigate } from 'react-router-dom'

export default function OrderPage() {
  let CheckoutStateData = useSelector(state => state.CheckoutStateData)
  let ProductStateData = useSelector(state => state.ProductStateData)
  let [orders, setOrders] = useState([])
  let dispatch = useDispatch()
  let navigate = useNavigate()

  useEffect(() => {
    (() => {
      dispatch(getCheckout())
      if (CheckoutStateData.length) {
        setOrders(CheckoutStateData)
      }
    })()
  }, [CheckoutStateData.length])

  function updateOrder(_id) {
    if (window.confirm("Are you sure you want to cancel your Order?")) {
      let item = orders.find(x => x._id === _id);
      if (!item) return;

      // Update order status to "Cancelled"
      const updatedItem = { ...item, orderStatus: "Cancelled" };
      dispatch(updateCheckout(updatedItem));

      // Restore stock for each product in the order
      item.products.forEach((prod) => {
        orders.forEach(item => {
          let product = ProductStateData.find(x => x._id === item.product._id)

          product.stockQuantity += item.qty
          product.stock = true

          dispatch(updateProduct(product))
          navigate(0)

        })
      });
    }
  }

  return (
    <>
      <HeroSection title="Order List" />
      <div className="container my-4">
        <h5 className='bg-primary text-light text-center py-2 rounded'>Your Order</h5>
        <div className="container">
          {Array.isArray(orders) && orders.length ? (
            orders.map((item) => (
              <div key={item?._id} className="mb-4 p-3 card shadow-sm rounded" style={{ backgroundColor: '#F8F8F8' }}>
                {/* Order Header */}
                <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded">
                  <div>
                    <h6 className="mb-0">
                      <strong>Order Id</strong> {item?._id}
                    </h6>
                    <p className="text-muted mb-0 mt-2"><strong>Created At:</strong> {new Date(item?.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`badge fs-5 ${item?.orderStatus !== "Cancelled" ? "bg-success" : "bg-danger"}`}>
                    {item?.orderStatus === "Cancelled" ? "Cancelled" : item?.orderStatus}
                  </span>
                </div>

                {/* Order Details Table */}
                <div className="table-responsive">
                  <table className="table table-bordered mt-2 text-center">
                    <thead className="table-primary">
                      <tr>
                        <th>Product</th>
                        <th>Price (₹)</th>
                        <th>Quanyity</th>
                        <th>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        item?.products?.map((prod) => (
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

                {/* Payment & Action Section */}
                <div className="d-flex justify-content-between align-items-center p-3 border-top flex-wrap">
                  <div>
                    <p className="mb-1"><strong>Payment Mode:</strong> {item?.paymentMode || "N/A"}</p>
                    <p>
                      <strong>Payment Status:</strong>
                      <span className={`fw-bold ms-1 ${item?.paymentStatus === "Pending" ? "text-danger" : "text-success"}`}>
                        {item?.paymentStatus || "N/A"}
                      </span>
                    </p>
                  </div>
                  <div className="text-end">
                    <h5 className="fw-bold">Total Amount: ₹{item?.total}</h5>
                    {!["Order is Under Process", "Out For Delivery", "Order is Packed", "Delivered", "Cancelled"].includes(item.orderStatus) && (
                      <button onClick={() => updateOrder(item?._id)} className="btn btn-outline-danger mt-2">
                        Cancel Order
                      </button>
                    )}
                    <Link to={`/order-detail/${item?._id}`} className="btn btn-outline-primary mt-2">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-5 text-center">
              <h3>No Order is Placed</h3>
              <Link to="/product" className="btn btn-primary mt-2">Shop Now</Link>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginBottom: "100px" }}></div>

    </>
  )
}
