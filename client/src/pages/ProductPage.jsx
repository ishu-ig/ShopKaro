import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay, Thumbs } from "swiper/modules";

import HeroSection from "../Components/HeroSection";
import ProductSlider from "../Components/ProductSlider";

import { getProduct } from "../Redux/ActionCreators/ProductActionCreators";
import {
  getCart,
  createCart,
} from "../Redux/ActionCreators/CartActionCreators";
import {
  getWishlist,
  createWishlist,
} from "../Redux/ActionCreators/WishlistActionCreators";

const REVIEWS_PAGE_SIZE = 4;

export default function ProductPage() {
  const { _id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const ProductStateData = useSelector((state) => state.ProductStateData) || [];
  const CartStateData = useSelector((state) => state.CartStateData) || [];
  const WishlistStateData =
    useSelector((state) => state.WishlistStateData) || [];

  const [data, setData] = useState({ variants: [], reviews: [] });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [qty, setQty] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [tab, setTab] = useState("description");

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [visibleReviews, setVisibleReviews] = useState(REVIEWS_PAGE_SIZE);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    dispatch(getProduct());
  }, [dispatch]);

  useEffect(() => {
    if (ProductStateData.length > 0) {
      const item = ProductStateData.find((x) => x._id === _id);
      if (item) {
        setData({ ...item, reviews: item.reviews || [], variants: item.variants || [] });
        setSelectedVariant(item.variants?.[0] || null);
        setThumbsSwiper(null);
        setQty(1);
        setVisibleReviews(REVIEWS_PAGE_SIZE);
        setRelatedProducts(
          ProductStateData.filter(
            (x) =>
              x.active &&
              x.maincategory?.name === item.maincategory?.name &&
              x._id !== item._id,
          ),
        );
      }
    }
  }, [ProductStateData, _id]);

  useEffect(() => {
    dispatch(getCart());
    dispatch(getWishlist());
  }, [dispatch]);

  const colorOptions = [...new Set(data.variants.map((v) => v.color))];
  const sizeOptions = [...new Set(data.variants.map((v) => v.size))];

  const findVariant = (color, size) => {
    return (
      data.variants.find((v) => v.color === color && v.size === size) ||
      data.variants.find((v) => v.color === color) ||
      data.variants.find((v) => v.size === size) ||
      data.variants[0] ||
      null
    );
  };

  const selectColor = (color) => {
    const variant = findVariant(color, selectedVariant?.size);
    setSelectedVariant(variant);
    setQty(1);
    setThumbsSwiper(null);
  };

  const selectSize = (size) => {
    const variant = findVariant(selectedVariant?.color, size);
    setSelectedVariant(variant);
    setQty(1);
    setThumbsSwiper(null);
  };

  // FIX: this was checking CartStateData to decide whether the item was
  // already wishlisted — wrong array entirely, so a product already sitting
  // in the wishlist could get re-added (and one already in the cart could
  // silently be skipped). It should check WishlistStateData. Also dropped
  // the stray console.log() calls that were being passed in as extra
  // (unused) arguments to dispatch(), and qty/total, which aren't fields on
  // the Wishlist schema (only user, product, variant).
  const addToWishlist = () => {
    if (!selectedVariant) return;
    const item = WishlistStateData.find(
      (x) =>
        x.product?._id === _id &&
        String(x.variant?._id || x.variant) === String(selectedVariant._id) &&
        x.user?._id === localStorage.getItem("userid"),
    );
    if (!item) {
      dispatch(
        createWishlist({
          user: localStorage.getItem("userid"),
          product: data._id,
          variant: selectedVariant._id,
        }),
      );
    }
    navigate("/wishlist");
  };

  const isInCart = CartStateData.some(
    (x) =>
      String(x.product?._id || x.product) === String(_id) &&
      (!selectedVariant?._id || String(x.variant?._id || x.variant) === String(selectedVariant._id)) &&
      String(x.user?._id || x.user) === String(localStorage.getItem("userid")),
  );

  const addToCart = () => {
    const userId = localStorage.getItem("userid");
    if (!userId) {
      navigate("/login");
      return;
    }
    if (!selectedVariant) return;

    const existing = CartStateData.find(
      (x) =>
        String(x.product?._id || x.product) === String(_id) &&
        String(x.variant?._id || x.variant) === String(selectedVariant._id) &&
        String(x.user?._id || x.user) === String(userId),
    );
    if (!existing) {
      dispatch(
        createCart({
          user: userId,
          product: data._id,
          variant: selectedVariant._id,
          qty,
          total: selectedVariant.finalPrice * qty,
        }),
      );
    }
    navigate("/cart");
  };


  const basePrice = selectedVariant?.price ?? selectedVariant?.finalPrice ?? 0;
  const finalPrice = selectedVariant?.finalPrice ?? 0;
  const savings = basePrice - finalPrice;  
  const gallery = (selectedVariant?.pic?.length ? selectedVariant.pic : data.variants?.find(v => v.pic?.length)?.pic) || [];

  const deliveryDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const submitReview = async () => {
    setReviewError("");
    setReviewSuccess("");
    if (!localStorage.getItem("token")) {
      setReviewError("Please login to submit a review.");
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError("Comment cannot be empty.");
      return;
    }
    setReviewLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/api/product/${_id}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            rating: reviewRating,
            comment: reviewComment.trim(),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.message || "Failed to submit review.");
      } else {
        setReviewSuccess("Review submitted successfully!");
        setReviewComment("");
        setReviewRating(5);
        dispatch(getProduct());
      }
    } catch {
      setReviewError("Something went wrong. Please try again.");
    } finally {
      setReviewLoading(false);
    }
  };

  const isOutOfStock = selectedVariant?.stockQuantity === 0;

  return (
    <>
      <section className="sk-product-page">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="sk-pp-breadcrumb" aria-label="breadcrumb">
            <Link to="/">Home</Link>
            <span className="sk-pp-bc-sep">/</span>
            <Link to="/shop">Shop</Link>
            {data.maincategory && (
              <>
                <span className="sk-pp-bc-sep">/</span>
                <Link to={`/shop?mc=${data.maincategory.name}`}>
                  {data.maincategory.name}
                </Link>
              </>
            )}
            {data.subcategory && (
              <>
                <span className="sk-pp-bc-sep">/</span>
                <Link to={`/shop?sc=${data.subcategory.name}`}>
                  {data.subcategory.name}
                </Link>
              </>
            )}
            <span className="sk-pp-bc-sep">/</span>
            <span className="sk-pp-bc-current">{data.name}</span>
          </nav>

          <div className="row g-4 mt-1">
            {/* Gallery */}
            <div className="col-lg-5 col-md-12">
              <div className="sk-gallery-main">
                {data.discount > 0 && (
                  <div className="sk-discount-ribbon">{data.discount}% OFF</div>
                )}
                {gallery.length > 1 ? (
                  <Swiper
                    key={selectedVariant?._id || "no-variant"}
                    slidesPerView={1}
                    loop
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 4000 }}
                    thumbs={{
                      swiper:
                        thumbsSwiper && !thumbsSwiper.destroyed
                          ? thumbsSwiper
                          : null,
                    }}
                    modules={[Pagination, Autoplay, Thumbs]}
                  >
                    {gallery.map((item, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={item}
                          alt={data.name}
                          onError={(e) => { e.currentTarget.src = "/img/noimage.jpg"; }}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : gallery.length === 1 ? (
                  <img
                    src={gallery[0]}
                    alt={data.name}
                    className="sk-gallery-single"
                    onError={(e) => { e.currentTarget.src = "/img/noimage.jpg"; }}
                  />
                ) : (
                  <div className="sk-gallery-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#c9a84c" strokeWidth="1.5" />
                      <circle cx="8" cy="10" r="1.5" fill="#c9a84c" />
                      <path
                        d="M2 17l5-5 4 4 3-3 8 8"
                        stroke="#c9a84c"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>No image available</span>
                  </div>
                )}
              </div>
              {gallery.length > 1 && (
                <div className="sk-gallery-thumbs mt-2">
                  <Swiper
                    key={`thumbs-${selectedVariant?._id || "no-variant"}`}
                    onSwiper={setThumbsSwiper}
                    slidesPerView={4}
                    spaceBetween={8}
                    watchSlidesProgress
                    modules={[Thumbs]}
                  >
                    {gallery.map((item, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={item}
                          alt=""
                          onError={(e) => { e.currentTarget.src = "/img/noimage.jpg"; }}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="col-lg-7 col-md-12">
              <div className="sk-pp-info">
                <div className="sk-pp-breadcrumb-tags">
                  {data.maincategory?.name && (
                    <span className="sk-tag">{data.maincategory.name}</span>
                  )}
                  {data.subcategory?.name && (
                    <span className="sk-tag">{data.subcategory.name}</span>
                  )}
                  {data.brand?.name && (
                    <span className="sk-tag gold">{data.brand.name}</span>
                  )}
                </div>

                <h1 className="sk-pp-name">{data.name}</h1>

                <div className="sk-pp-pricing">
                  <span className="sk-pp-final">
                    ₹{finalPrice?.toLocaleString()}
                  </span>
                  {basePrice > finalPrice && (
                    <span className="sk-pp-original">
                      ₹{basePrice?.toLocaleString()}
                    </span>
                  )}
                  {data.discount > 0 && (
                    <span className="sk-pp-savings">
                      Save {data.discount}% · ₹{savings?.toLocaleString()} off
                    </span>
                  )}
                </div>

                {colorOptions.length > 0 && (
                  <div className="sk-pp-meta-item" style={{ marginBottom: 14 }}>
                    <span className="label" style={{ display: "block", marginBottom: 6 }}>
                      Color
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => selectColor(color)}
                          className={`sk-variant-swatch ${
                            selectedVariant?.color === color ? "active" : ""
                          }`}
                          style={{
                            padding: "7px 16px",
                            borderRadius: 20,
                            border:
                              selectedVariant?.color === color
                                ? "2px solid #c9a84c"
                                : "1px solid #ddd6c8",
                            background:
                              selectedVariant?.color === color
                                ? "rgba(201,168,76,0.14)"
                                : "#fff",
                            color:
                              selectedVariant?.color === color
                                ? "#0d1b2a"
                                : "#444455",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: selectedVariant?.color === color ? "0 2px 8px rgba(201,168,76,0.25)" : "none",
                          }}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {sizeOptions.length > 0 && (
                  <div className="sk-pp-meta-item" style={{ marginBottom: 14 }}>
                    <span className="label" style={{ display: "block", marginBottom: 6 }}>
                      Size
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {sizeOptions.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => selectSize(size)}
                          className={`sk-variant-swatch ${
                            selectedVariant?.size === size ? "active" : ""
                          }`}
                          style={{
                            padding: "7px 16px",
                            borderRadius: 20,
                            border:
                              selectedVariant?.size === size
                                ? "2px solid #c9a84c"
                                : "1px solid #ddd6c8",
                            background:
                              selectedVariant?.size === size
                                ? "rgba(201,168,76,0.14)"
                                : "#fff",
                            color:
                              selectedVariant?.size === size
                                ? "#0d1b2a"
                                : "#444455",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: selectedVariant?.size === size ? "0 2px 8px rgba(201,168,76,0.25)" : "none",
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="sk-pp-meta">
                  <div className="sk-pp-meta-item">
                    <span className="label">Availability</span>
                    <span
                      className={`sk-stock-badge ${selectedVariant?.stock ? "in" : "out"}`}
                    >
                      <i className="fa fa-circle" style={{ fontSize: 7 }} />
                      {selectedVariant?.stock
                        ? `In Stock (${selectedVariant.stockQuantity} left)`
                        : "Out of Stock"}
                    </span>
                  </div>
                </div>

                {selectedVariant?.stock && (
                  <>
                    <div className="sk-qty-wrap">
                      <div>
                        <div className="sk-qty-label">Quantity</div>
                        <div className="sk-qty-control">
                          <button
                            className="sk-qty-btn"
                            onClick={() => qty > 1 && setQty(qty - 1)}
                          >
                            −
                          </button>
                          <span className="sk-qty-val">{qty}</span>
                          <button
                            className="sk-qty-btn"
                            onClick={() =>
                              qty < selectedVariant.stockQuantity && setQty(qty + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="sk-qty-total">
                        Total &nbsp;
                        <strong>
                          ₹{(finalPrice * qty).toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    {/* FIX: forced position/z-index/pointer-events inline —
                        inline styles win over any external stylesheet rule
                        that might otherwise be causing something to sit on
                        top of these buttons and intercept the click. */}
                    <div
                      className="sk-pp-actions"
                      style={{ position: "relative", zIndex: 50, pointerEvents: "auto" }}
                    >
                      <button
                        className="sk-pp-btn sk-pp-btn-primary"
                        onClick={addToCart}
                        style={{
                          position: "relative",
                          zIndex: 51,
                          pointerEvents: "auto",
                          ...(isInCart ? { background: "#27a85a", borderColor: "#27a85a" } : {})
                        }}
                      >
                        <i className={`fa ${isInCart ? "fa-check" : "fa-shopping-cart"}`} />
                        {isInCart ? "In Cart (View Cart)" : "Add to Cart"}
                      </button>
                      <button
                        className="sk-pp-btn sk-pp-btn-wish"
                        onClick={addToWishlist}
                        style={{ position: "relative", zIndex: 51, pointerEvents: "auto" }}
                      >
                        <i className="fa fa-heart" />
                      </button>
                    </div>
                  </>
                )}

                <div className="sk-trust-badges">
                  <div className="sk-trust-badge">
                    <i className="fa fa-shield-alt" /> Secure Payment
                  </div>
                  <div className="sk-trust-badge">
                    <i className="fa fa-truck" /> Fast Delivery
                  </div>
                  <div className="sk-trust-badge">
                    <i className="fa fa-undo" /> Easy Returns
                  </div>
                  <div className="sk-trust-badge">
                    <i className="fa fa-headphones" /> 24/7 Support
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    padding: "12px 16px",
                    background: "rgba(200,64,10,0.04)",
                    borderRadius: 12,
                    border: "1px solid rgba(201,168,76,0.12)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <i
                    className="fa fa-calendar-check"
                    style={{ color: "var(--sk-gold, #c9a84c)", fontSize: 16 }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#7A6E65",
                      }}
                    >
                      Expected Delivery
                    </div>
                    <div
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "#1C1009",
                        marginTop: 2,
                      }}
                    >
                      Online: by{" "}
                      <span style={{ color: "var(--sk-gold, #c9a84c)" }}>
                        {deliveryDate(4)}
                      </span>
                      &nbsp;·&nbsp; COD: by{" "}
                      <span style={{ color: "var(--sk-gold, #c9a84c)" }}>
                        {deliveryDate(6)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="sk-tabs">
            <div className="sk-tab-nav">
              <button
                className={`sk-tab-btn ${tab === "description" ? "active" : ""}`}
                onClick={() => setTab("description")}
              >
                Description
              </button>
              <button
                className={`sk-tab-btn ${tab === "reviews" ? "active" : ""}`}
                onClick={() => setTab("reviews")}
              >
                Reviews ({data.reviews?.length || 0})
              </button>
            </div>

            {tab === "description" && (
              <div
                className="sk-description"
                dangerouslySetInnerHTML={{
                  __html:
                    data.description || "<p>No description available.</p>",
                }}
              />
            )}

            {tab === "reviews" && (
              <div>
                {!data.reviews?.length ? (
                  <p style={{ fontSize: 13, color: "#bbb", marginBottom: 24 }}>
                    No reviews yet. Be the first to review this product.
                  </p>
                ) : (
                  <div style={{ marginBottom: 28 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        marginBottom: 20,
                        padding: "14px 18px",
                        background: "rgba(200,64,10,0.04)",
                        borderRadius: 14,
                        border: "1px solid rgba(201,168,76,0.1)",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontFamily: "Playfair Display,serif",
                            fontWeight: 900,
                            fontSize: "2.4rem",
                            color: "var(--sk-gold, #c9a84c)",
                            lineHeight: 1,
                          }}
                        >
                          {(
                            data.reviews.reduce((s, r) => s + r.rating, 0) /
                            data.reviews.length
                          ).toFixed(1)}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "#7A6E65",
                            marginTop: 3,
                          }}
                        >
                          out of 5
                        </div>
                      </div>
                      <div>
                        <div
                          style={{ display: "flex", gap: 3, marginBottom: 4 }}
                        >
                          {[1, 2, 3, 4, 5].map((s) => (
                            <i
                              key={s}
                              className="fa fa-star"
                              style={{
                                fontSize: 14,
                                color:
                                  data.reviews.reduce(
                                    (a, r) => a + r.rating,
                                    0,
                                  ) /
                                    data.reviews.length >=
                                  s
                                    ? "#f59e0b"
                                    : "#e5e7eb",
                              }}
                            />
                          ))}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#7A6E65" }}>
                          {data.reviews.length} review
                          {data.reviews.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    {data.reviews.slice(0, visibleReviews).map((rev, i) => (
                      <div
                        key={i}
                        className="sk-review-item"
                        style={{
                          padding: "14px 0",
                          borderBottom: "1px solid rgba(200,64,10,0.07)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "rgba(200,64,10,0.12)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                color: "var(--sk-gold, #c9a84c)",
                                flexShrink: 0,
                              }}
                            >
                              {(rev.name || "A")[0].toUpperCase()}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: "0.88rem",
                                  color: "#1C1009",
                                }}
                              >
                                {rev.name || "Anonymous"}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.72rem",
                                  color: "#7A6E65",
                                }}
                              >
                                {new Date(rev.date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 2 }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <i
                                key={s}
                                className="fa fa-star"
                                style={{
                                  fontSize: 12,
                                  color:
                                    rev.rating >= s ? "#f59e0b" : "#e5e7eb",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <p
                          style={{
                            fontSize: "0.88rem",
                            color: "#555",
                            margin: 0,
                            lineHeight: 1.7,
                          }}
                        >
                          {rev.comment}
                        </p>
                      </div>
                    ))}

                    {(visibleReviews < data.reviews.length || visibleReviews > REVIEWS_PAGE_SIZE) && (
                      <div style={{ textAlign: "center", marginTop: 18, display: "flex", gap: 12, justifyContent: "center" }}>
                        {visibleReviews < data.reviews.length && (
                          <button
                            type="button"
                            onClick={() => setVisibleReviews((v) => v + REVIEWS_PAGE_SIZE)}
                            style={{
                              padding: "9px 22px",
                              background: "#fff",
                              color: "var(--sk-gold, #c9a84c)",
                              border: "1.5px solid var(--sk-gold, #c9a84c)",
                              borderRadius: 50,
                              fontWeight: 700,
                              fontSize: "0.84rem",
                              cursor: "pointer",
                            }}
                          >
                            Show More Reviews
                            <span style={{ color: "#a89b8f", fontWeight: 600, marginLeft: 6 }}>
                              ({data.reviews.length - visibleReviews} left)
                            </span>
                          </button>
                        )}
                        {visibleReviews > REVIEWS_PAGE_SIZE && (
                          <button
                            type="button"
                            onClick={() => setVisibleReviews(REVIEWS_PAGE_SIZE)}
                            style={{
                              padding: "9px 22px",
                              background: "transparent",
                              color: "#7A6E65",
                              border: "1.5px solid #ddd",
                              borderRadius: 50,
                              fontWeight: 700,
                              fontSize: "0.84rem",
                              cursor: "pointer",
                            }}
                          >
                            Show Less
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div
                  style={{
                    background: "rgba(200,64,10,0.03)",
                    borderRadius: 16,
                    border: "1px solid rgba(201,168,76,0.1)",
                    padding: "20px 22px",
                  }}
                >
                  <h6
                    style={{
                      fontFamily: "Playfair Display,serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#1C1009",
                      marginBottom: 16,
                    }}
                  >
                    Write a Review
                  </h6>

                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#7A6E65",
                        marginBottom: 8,
                      }}
                    >
                      Your Rating
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <i
                          key={s}
                          className="fa fa-star"
                          onClick={() => setReviewRating(s)}
                          style={{
                            fontSize: 24,
                            cursor: "pointer",
                            color: reviewRating >= s ? "#f59e0b" : "#e5e7eb",
                            transition: "color 0.15s",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#7A6E65",
                        marginBottom: 8,
                      }}
                    >
                      Your Comment
                    </div>
                    <textarea
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts about this product..."
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        border: "1.5px solid rgba(200,64,10,0.15)",
                        padding: "10px 14px",
                        fontSize: "0.88rem",
                        color: "#1C1009",
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                        background: "white",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {reviewError && (
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "#e11d48",
                        background: "rgba(244,63,94,0.07)",
                        padding: "8px 14px",
                        borderRadius: 8,
                        marginBottom: 12,
                      }}
                    >
                      <i className="fa fa-exclamation-circle me-2" />
                      {reviewError}
                    </div>
                  )}
                  {reviewSuccess && (
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "#059669",
                        background: "rgba(16,185,129,0.07)",
                        padding: "8px 14px",
                        borderRadius: 8,
                        marginBottom: 12,
                      }}
                    >
                      <i className="fa fa-check-circle me-2" />
                      {reviewSuccess}
                    </div>
                  )}

                  <button
                    onClick={submitReview}
                    disabled={reviewLoading}
                    style={{
                      padding: "10px 28px",
                      background: reviewLoading
                        ? "#ccc"
                        : "linear-gradient(135deg,var(--sk-gold, #c9a84c),var(--sk-gold-bright, #e8c873))",
                      color: "white",
                      border: "none",
                      borderRadius: 50,
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      cursor: reviewLoading ? "not-allowed" : "pointer",
                      transition: "opacity 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {reviewLoading ? (
                      <>
                        <i className="fa fa-spinner fa-spin" /> Submitting…
                      </>
                    ) : (
                      <>
                        <i className="fa fa-paper-plane" /> Submit Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Related */}
          <div className="mt-2">
            <ProductSlider
              title="Related Products"
              data={relatedProducts || []}
            />
          </div>
        </div>
      </section>
    </>
  );
}