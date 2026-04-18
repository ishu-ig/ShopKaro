import React, { useEffect, useState } from 'react';
import HeroSection from '../Components/HeroSection';
import { useDispatch, useSelector } from 'react-redux';
import { deleteWishlist, getWishlist } from '../Redux/ActionCreartors/WishlistActionCreators';
import { Link } from 'react-router-dom';

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const WishlistStateData = useSelector(state => state.WishlistStateData);
    const dispatch = useDispatch();

    function deleteRecord(_id) {
        if (window.confirm("Remove this item from your wishlist?")) {
            dispatch(deleteWishlist({ _id }));
            getAPIData();
        }
    }

    function getAPIData() {
        dispatch(getWishlist());
        if (WishlistStateData.length) setWishlist(WishlistStateData);
        else setWishlist([]);
    }

    useEffect(() => {
        getAPIData();
    }, [WishlistStateData.length]);

    return (
        <>
            {/* <style>{styles}</style> */}
            <HeroSection title="My Wishlist" />
            <div className="wl-root">
                <div className="wl-container">
                    <div className="wl-header">
                        <div className="wl-header-left">
                            <p className="wl-eyebrow">My Collection</p>
                            <h1 className="wl-title">Wish<em>list</em></h1>
                            {wishlist.length > 0 && (
                                <p className="wl-count">{wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved</p>
                            )}
                        </div>
                        <Link to="/shop" className="wl-shop-link">Continue Shopping →</Link>
                    </div>

                    {wishlist.length ? (
                        <div className="wl-table-wrap">
                            <table className="wl-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Product</th>
                                        <th>Color</th>
                                        <th>Size</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th className="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {wishlist.map(item => (
                                        <tr key={item._id}>
                                            <td className="wl-img-cell">
                                                <Link
                                                    to={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="wl-img-link"
                                                >
                                                    <img
                                                        src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`}
                                                        alt={item.product?.name}
                                                        className="wl-img"
                                                    />
                                                </Link>
                                            </td>
                                            <td>
                                                <div className="wl-product-name">{item.product?.name}</div>
                                                <div className="wl-product-brand">{item.product?.brand?.name}</div>
                                            </td>
                                            <td>
                                                <span className="wl-badge wl-badge-color">{item.product?.color || "—"}</span>
                                            </td>
                                            <td>
                                                <span className="wl-badge wl-badge-size">{item.product?.size || "—"}</span>
                                            </td>
                                            <td>
                                                <span className="wl-price">₹{item.product?.finalPrice?.toLocaleString()}</span>
                                            </td>
                                            <td>
                                                {item.product?.stockQuantity === 0
                                                    ? <span className="wl-stock-out">Out of Stock</span>
                                                    : <span className="wl-stock-ok">{item.product?.stockQuantity} left</span>
                                                }
                                            </td>
                                            <td style={{textAlign: 'center'}}>
                                                <div style={{display:'flex', gap: 8, justifyContent:'center'}}>
                                                    <Link to={`/product/${item.product?._id}`} className="wl-btn-cart">
                                                        <i className="fa fa-shopping-cart" />
                                                    </Link>
                                                    <button className="wl-btn-delete" onClick={() => deleteRecord(item._id)}>
                                                        <i className="fa fa-trash" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="wl-empty">
                            <div className="wl-empty-icon">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
                                    <path d="M16 28s-12-7.5-12-16a8 8 0 0 1 12-6.9A8 8 0 0 1 28 12c0 8.5-12 16-12 16z"/>
                                </svg>
                            </div>
                            <h2 className="wl-empty-title">Your wishlist is empty</h2>
                            <p className="wl-empty-desc">Save items you love and revisit them anytime.</p>
                            <Link to="/shop" className="wl-empty-btn">
                                Explore Products →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}