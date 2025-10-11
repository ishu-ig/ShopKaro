import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { deleteCart, getCart, updateCart } from '../Redux/ActionCreartors/CartActionCreators';
import { createCheckout } from '../Redux/ActionCreartors/CheckoutActionCreators';
import { updateProduct, getProduct } from '../Redux/ActionCreartors/ProductActionCreators';

export default function Cart({ title, data }) {
    const [cart, setCart] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [shipping, setShipping] = useState(0);
    const [total, setTotal] = useState(0);
    const [mode, setMode] = useState("COD");

    const CartStateData = useSelector((state) => state.CartStateData);
    const ProductStateData = useSelector((state) => state.ProductStateData);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    function placeOrder() {
        const item = {
            user: localStorage.getItem("userid"),
            orderStatus: "Ordered",
            paymentMode: mode,
            paymentStatus: "Pending",
            subtotal,
            shipping,
            total,
            date: new Date(),
            products: [...cart],
        };
        dispatch(createCheckout(item));

        cart.forEach((cartItem) => {
            let product = ProductStateData.find((x) => x._id === cartItem.product._id);
            product.stockQuantity -= cartItem.qty;
            product.stock = product.stockQuantity === 0 ? false : true;
            dispatch(updateProduct(product));
            dispatch(deleteCart({ _id: cartItem._id }));
        });

        if (mode === "COD") navigate("/confirmation");
        else navigate("/payment/-1");
    }

    function deleteRecord(_id) {
        if (window.confirm("Are you sure you want to remove this item?")) {
            dispatch(deleteCart({ _id }));
            getAPIData();
        }
    }

    function updateRecord(_id, option) {
        const item = cart.find((x) => x._id === _id);
        const index = cart.findIndex((x) => x._id === _id);
        if (!item) return;

        if (option === "DEC" && item.qty > 1) {
            item.qty -= 1;
            item.total -= item.product?.finalPrice;
        } else if (option === "INC" && item.qty < item.product?.stockQuantity) {
            item.qty += 1;
            item.total += item.product?.finalPrice;
        }

        dispatch(updateCart({ ...item }));
        cart[index] = { ...item };
        calculate(cart);
    }

    function calculate(data) {
        let sub = data.reduce((sum, x) => sum + x.total, 0);
        if (sub > 0 && sub < 1000) {
            setShipping(150);
            setTotal(sub + 150);
        } else {
            setShipping(0);
            setTotal(sub);
        }
        setSubtotal(sub);
    }

    function getAPIData() {
        dispatch(getCart());
        if (data) {
            setCart(data);
            calculate(data);
        } else if (CartStateData.length) {
            setCart(CartStateData);
            calculate(CartStateData);
        } else {
            setCart([]);
            calculate([]);
        }
    }

    useEffect(() => {
        getAPIData();
    }, [CartStateData.length]);

    useEffect(() => {
        dispatch(getProduct());
    }, [ProductStateData.length]);

    return (
        <>
            {/* Section Header */}
            <h5 className="bg-primary text-center p-3 text-light rounded shadow-sm mt-4">
                {title === "Cart" ? "Cart Section" : cart.length ? "Items In Order" : "Item In Cart"}
            </h5>

            {cart.length ? (
                <>
                    {/* Desktop Table */}
                    <div className="table-responsive d-none d-md-block">
                        <table className="table table-hover table-bordered border-primary align-middle">
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
                                            <Link
                                                to={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <img
                                                    src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`}
                                                    className="rounded shadow-sm"
                                                    height={60}
                                                    width={85}
                                                    alt="Product"
                                                />
                                            </Link>
                                        </td>
                                        <td>{item.product?.name}</td>
                                        <td>{item.product?.brand?.name}</td>
                                        <td>{item.product?.color}</td>
                                        <td>{item.product?.size}</td>
                                        {title !== "Checkout" && (
                                            <td>
                                                {item.product?.stockQuantity
                                                    ? `${item.product?.stockQuantity} Left`
                                                    : "Out Of Stock"}
                                            </td>
                                        )}
                                        <td>&#8377;{item.product?.finalPrice}</td>
                                        <td>
                                            <div className="d-flex align-items-center justify-content-center">
                                                {title !== "Checkout" && (
                                                    <button
                                                        className="btn btn-outline-primary btn-sm me-2"
                                                        onClick={() => updateRecord(item._id, "DEC")}
                                                    >
                                                        -
                                                    </button>
                                                )}
                                                <span className="fw-bold">{item.qty}</span>
                                                {title !== "Checkout" && (
                                                    <button
                                                        className="btn btn-outline-primary btn-sm ms-2"
                                                        onClick={() => updateRecord(item._id, "INC")}
                                                    >
                                                        +
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td>&#8377;{item.total}</td>
                                        {title !== "Checkout" && (
                                            <td>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => deleteRecord(item._id)}
                                                >
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="d-block d-md-none">
                        {cart.map((item) => (
                            <div key={item._id} className="mb-3 card shadow-sm">
                                <div className="table-responsive">
                                    <table className="table table-bordered align-middle mb-0">
                                        <tbody>
                                            {/* Full width image row */}
                                            <tr>
                                                <td colSpan="2" className="text-center">
                                                    <img
                                                        src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`}
                                                        alt="Product"
                                                        style={{ width: "100%", maxWidth: "250px", borderRadius: 6 }}
                                                    />
                                                </td>
                                            </tr>

                                            <tr>
                                                <th>Name</th>
                                                <td>{item.product?.name}</td>
                                            </tr>
                                            <tr>
                                                <th>Brand</th>
                                                <td>{item.product?.brand?.name}</td>
                                            </tr>
                                            <tr>
                                                <th>Color/Size</th>
                                                <td>
                                                    {item.product?.color}/{item.product?.size}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Qty</th>
                                                <td>
                                                    {title !== "Checkout" ? (
                                                        <div className="d-flex ">
                                                            <button
                                                                className="btn btn-outline-primary btn-sm me-2 w-25 me-3"
                                                                onClick={() => updateRecord(item._id, "DEC")}
                                                            >
                                                                -
                                                            </button>
                                                            <span className="fw-bold">{item.qty}</span>
                                                            <button
                                                                className="btn btn-outline-primary btn-sm ms-2 w-25 ms-3"
                                                                onClick={() => updateRecord(item._id, "INC")}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="fw-bold">{item.qty}</span>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Price</th>
                                                <td>&#8377;{item.product?.finalPrice}</td>
                                            </tr>
                                            <tr>
                                                <th>Total</th>
                                                <td className="fw-bold">&#8377;{item.total}</td>
                                            </tr>
                                            {title !== "Checkout" && (
                                                <tr>
                                                    <td colSpan="2">
                                                        <button
                                                            className="btn btn-danger w-100"
                                                            onClick={() => deleteRecord(item._id)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* Summary */}
                    <div className="row mb-3">
                        <div className={`${title !== "Checkout" ? "col-md-6" : "col-md-12"}`}>
                            <table className="table table-bordered border-primary">
                                <tbody>
                                    <tr>
                                        <th>Subtotal</th>
                                        <td>&#8377;{subtotal}</td>
                                    </tr>
                                    <tr>
                                        <th>Shipping</th>
                                        <td>&#8377;{shipping}</td>
                                    </tr>
                                    <tr className="table-light">
                                        <th>Total</th>
                                        <td className="fw-bold fs-5">&#8377;{total}</td>
                                    </tr>
                                    {title === "Checkout" && (
                                        <tr>
                                            <th>Payment Mode</th>
                                            <td>
                                                <select
                                                    className="form-select border-primary"
                                                    onChange={(e) => setMode(e.target.value)}
                                                >
                                                    <option value="COD">Cash On Delivery</option>
                                                    <option value="Net Banking">Net Banking/UPI/Card</option>
                                                </select>
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td colSpan={2}>
                                            {title !== "Checkout" ? (
                                                <Link to="/checkout" className="btn btn-primary w-100">
                                                    Proceed To Checkout
                                                </Link>
                                            ) : (
                                                <button
                                                    className="btn btn-success w-100"
                                                    onClick={placeOrder}
                                                >
                                                    Place Order
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="py-5 text-center">
                    <h3>No Items in Cart</h3>
                    <Link to="/product" className="btn btn-primary mt-3">
                        Shop Now
                    </Link>
                </div>
            )}
        </>
    );
}
