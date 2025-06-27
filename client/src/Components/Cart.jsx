import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import { deleteCart, getCart, updateCart } from '../Redux/ActionCreartors/CartActionCreators'
import { createCheckout } from '../Redux/ActionCreartors/CheckoutActionCreators'
import { updateProduct, getProduct } from '../Redux/ActionCreartors/ProductActionCreators'

export default function Cart({ title, data }) {
    let [cart, setCart] = useState([])
    let [subtotal, setSubtotal] = useState(0)
    let [shipping, setShipping] = useState(0)
    let [total, setTotal] = useState(0)
    let [mode, setMode] = useState("COD")

    let navigate = useNavigate()

    let CartStateData = useSelector((state) => state.CartStateData)
    let ProductStateData = useSelector((state) => state.ProductStateData)
    let dispatch = useDispatch()

    function placeOrder() {
        let item = {
            user: localStorage.getItem("userid"),
            orderStatus: "Order is Placed",
            paymentMode: mode,
            paymentStatus: "Pending",
            subtotal: subtotal,
            shipping: shipping,
            total: total,
            date: new Date(),
            products: [...cart]
        }
        dispatch(createCheckout(item))

        cart.forEach(item => {
            let product = ProductStateData.find(x => x._id === item.product._id)

            product.stockQuantity -= item.qty
            product.stock = product.stockQuantity === 0 ? false : true

            dispatch(updateProduct(product))
            dispatch(deleteCart({ _id: item._id }))
        })
        if (mode === "COD")
            navigate("/confirmation")
        else
            navigate("/payment/-1")

    }
    function deleteRecord(_id) {
        if (window.confirm("Are You Sure to Remove that Item from Cart : ")) {
            dispatch(deleteCart({ _id: _id }))
            getAPIData()
        }
    }

    function updateRecord(_id, option) {
        var item = cart.find(x => x._id === _id)
        var index = cart.findIndex(x => x._id === _id)

        if (option === "DEC" && item.qty === 1)
            return
        else if (option === "DEC") {
            item.qty -= 1
            item.total -= item.product?.finalPrice
        }
        else if (option === "INC" && item.qty < item.product?.stockQuantity) {
            item.qty += 1
            item.total += item.product?.finalPrice
        }
        dispatch(updateCart({ ...item }))
        cart[index] = { ...item }
        calculate(cart)
    }

    function calculate(data) {
        let subtotal = 0
        data.forEach(x => subtotal += x.total)
        if (subtotal > 0 && subtotal < 1000) {
            setShipping(150)
            setTotal(subtotal + 150)
        }
        else {
            setShipping(0)
            setTotal(subtotal)
        }
        setSubtotal(subtotal)
    }
    function getAPIData() {
        dispatch(getCart())
        if (data) {
            setCart(data)
            calculate(data)
        }
        else if (CartStateData.length) {
            setCart(CartStateData)
            calculate(CartStateData)
        }
        else {
            setCart([])
            calculate([])
        }
    }
    useEffect(() => {
        getAPIData()
    }, [CartStateData.length])

    useEffect(() => {
        (() => {
            dispatch(getProduct())
        })()
    }, [ProductStateData.length])
    console.log(cart)
    return (
        <>
            {/* 🔹 Section Header */}
            <h5 className="bg-primary text-center p-3 text-light rounded shadow-sm mt-4">
                {title === "Cart" ? "Cart Section" : cart.length ? "Items In Order" : "Item In Cart"}
            </h5>

            <div className={`${title!=="Checkout" ? "mx-3" :null}`}>
            {cart.length ? (
                <div className='container-fluid'>
                    <div className="table-responsive">
                        <table className="table table-hover table-bordered align-middle">
                            <thead className="table-primary text-center">
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th>Brand</th>
                                    <th>Color</th>
                                    <th>Size</th>
                                    {title !== "Checkout" && <th>Stock</th>}
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    {title !== "Checkout" && <th>Action</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item) => (
                                    <tr key={item._id} className="text-center">
                                        <td>
                                            <Link to={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`} target="_blank" rel="noreferrer">
                                                <img src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`} className="rounded shadow-sm bg-dark" height={60} width={85} alt="Product" />
                                            </Link>
                                        </td>
                                        <td>{item.product?.name}</td>
                                        <td>{item.product?.brand?.name}</td>
                                        <td>{item.product?.color}</td>
                                        <td>{item.product?.size}</td>
                                        {title !== "Checkout" ? <td>{item.product?.stockQuantity ? `${item.product?.stockQuantity} Left in Stock` : "Out Of Stock"}</td> : null}
                                        <td>&#8377;{item.product?.finalPrice}</td>
                                        <td>
                                            <div className="d-flex align-items-center justify-content-center">
                                                {title !== "Checkout" && (
                                                    <button className="btn btn-outline-primary btn-sm me-2" onClick={() => updateRecord(item._id, "DEC")}>
                                                        <i className="fa fa-minus"></i>
                                                    </button>
                                                )}
                                                <span className="fw-bold">{item?.qty}</span>
                                                {title !== "Checkout" && (
                                                    <button className="btn btn-outline-primary btn-sm ms-2" onClick={() => updateRecord(item._id, "INC")}>
                                                        <i className="fa fa-plus"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td>&#8377;{item?.total}</td>
                                        {title !== "Checkout" && (
                                            <td>
                                                <button className="btn btn-outline-danger btn-sm" onClick={() => deleteRecord(item._id)}>
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="row mb-3">
                        <div className={`col-md-6 mb-3 ${title === "Checkout" ? "col-md-12" : ""}`}>
                            <div className="card shadow p-3">
                                <table className="table">
                                    <tbody>
                                        <tr><th>Subtotal</th><td className="fw-bold">&#8377;{subtotal}</td></tr>
                                        <tr><th>Shipping</th><td className="fw-bold">&#8377;{shipping}</td></tr>
                                        <tr className="table-light"><th>Total</th><td className="fw-bold fs-5">&#8377;{total}</td></tr>
                                        {title === "Checkout" && (
                                            <tr><th>Payment Mode</th>
                                                <td><select className="form-select border-primary" onChange={(e) => setMode(e.target.value)}>
                                                    <option value="COD">Cash On Delivery</option>
                                                    <option value="Net Banking">Net Banking/UPI/Card</option>
                                                </select></td>
                                            </tr>
                                        )}
                                        <tr><td colSpan={2}>
                                            {title !== "Checkout" ? <Link to="/checkout" className="btn btn-primary w-100">Proceed To Checkout</Link> :
                                                <button className="btn btn-success w-100" onClick={placeOrder}>Place Order</button>}
                                        </td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-5 text-center"><h3>No Items</h3></div>
            )}
            </div>
        </>
    )
}
