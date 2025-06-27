import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Product({ title, data }) {
    const [visibleCount, setVisibleCount] = useState(21);

    const loadMoreProducts = () => {
        setVisibleCount((prevCount) => prevCount + 21);
    };

    const viewLessProducts = () => {
        setVisibleCount(21);
    };

    return (
        <>
            <div className="container-fluid py-5 bg-light">
                <div className="container">
                    {/* Section Title */}
                    {title !== "Shop" && (
                        <div
                            className="text-center mx-auto pb-5 wow animate__animated animate__fadeIn"
                            data-wow-delay=".3s"
                            style={{ maxWidth: "600px" }}
                        >
                            <h5 className="text-primary fw-bold fs-4">Our Products</h5>
                            <h1 className="fw-bold text-dark">For {title}</h1>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="row g-4">
                        {data.slice(0, visibleCount).map((item) => (
                            <div
                                key={item?._id}
                                className="col-md-6 col-lg-4 wow animate__animated animate__zoomIn"
                                data-wow-delay=".3s"
                            >
                                <div className="product-card position-relative overflow-hidden shadow-lg rounded">
                                    {/* Product Image */}
                                    <Link to={`/product/${item._id}`}>
                                    <img
                                        src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.pic[0]}`}
                                        className="img-fluid w-100 product-img"
                                        alt={item.name}
                                        style={{ height: 300, objectFit: "cover" }}
                                    />
                                    </Link>
                                    {/* Price Always Visible (Mobile & Desktop) */}
                                    <div className="d-block d-md-none text-center py-2 bg-white">
                                        <p className="m-0">
                                            <del className="text-danger">&#8377;{item.basePrice}</del>
                                            <span className="ms-2">&#8377;{item.finalPrice}</span>
                                            <sup className="text-success"> {item.discount}% Off</sup>
                                        </p>
                                    </div>

                                    {/* Hover Overlay (Desktop Only) */}
                                    <div
                                        className="product-content position-absolute w-100 h-100 top-0 start-0 d-none d-md-flex flex-column justify-content-center align-items-center text-center"
                                        style={{ backgroundColor: "rgba(0, 0, 0, 0.25)" }} // less dark overlay
                                    >
                                        <Link to={`/product/${item._id}`} className="text-decoration-none">
                                            <h6 className="text-light fw-bold">{item.name}</h6>
                                            <p className="m-0 text-light">
                                                <del className="text-danger">&#8377;{item.basePrice}</del>
                                                <span className="ms-2">&#8377;{item.finalPrice}</span>
                                                <sup className="text-success"> {item.discount}% Off</sup>
                                            </p>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Load More / View Less Buttons */}
                    <div className="row">
                        {visibleCount < data.length && (
                            <button
                                className="mx-auto btn btn-primary text-white px-5 py-3 w-25 mt-4 rounded-pill shadow-sm fw-bold"
                                onClick={loadMoreProducts}
                            >
                                Load More
                            </button>
                        )}

                        {visibleCount > 21 && (
                            <button
                                className="mx-auto btn btn-secondary text-white px-5 py-3 w-25 mt-2 rounded-pill shadow-sm fw-bold"
                                onClick={viewLessProducts}
                            >
                                View Less
                            </button>
                        )}
                    </div>

                    {/* View More Link */}
                    {title !== "Shop" && (
                        <div className="row">
                            <Link
                                to={`/shop?mc=${title}`}
                                className="mx-auto btn btn-dark text-white px-5 py-3 w-25 mt-4 rounded-pill shadow-sm fw-bold"
                            >
                                View More
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <div style={{ marginBottom: 100 }}></div>
        </>
    );
}
