import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay, Thumbs } from "swiper/modules";

import HeroSection from "../Components/HeroSection";
import ProductSlider from "../Components/ProductSlider";

import { getProduct } from "../Redux/ActionCreartors/ProductActionCreators";
import {
  getCart,
  createCart,
} from "../Redux/ActionCreartors/CartActionCreators";
import {
  getWishlist,
  createWishlist,
} from "../Redux/ActionCreartors/WishlistActionCreators";



export default function ProductPage() {
  const { _id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const ProductStateData = useSelector((state) => state.ProductStateData) || [];
  const CartStateData = useSelector((state) => state.CartStateData) || [];
  const WishlistStateData =
    useSelector((state) => state.WishlistStateData) || [];

  const [data, setData] = useState({ pic: [], reviews: [] });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [qty, setQty] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [tab, setTab] = useState("description");

  // Review form state
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
        setData({ ...item, reviews: item.reviews || [] });
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

  const addToCart = () => {
    const item = CartStateData.find(
      (x) =>
        x.product?._id === _id &&
        x.user?._id === localStorage.getItem("userid"),
    );
    if (!item)
      dispatch(
        createCart({
          user: localStorage.getItem("userid"),
          product: data._id,
          qty,
          total: data.finalPrice * qty,
        }),
      );
    navigate("/cart");
  };

  const addToWishlist = () => {
    const item = WishlistStateData.find(
      (x) =>
        x.product?._id === _id &&
        x.user?._id === localStorage.getItem("userid"),
    );
    if (!item)
      dispatch(
        createWishlist({
          user: localStorage.getItem("userid"),
          product: data._id,
        }),
      );
    navigate("/wishlist");
  };

  const savings = data.basePrice - data.finalPrice;

  // Expected delivery: 4 days for online, 6 for COD (shown as a range on product page)
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
            authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({
            user: localStorage.getItem("userid"),
            name: localStorage.getItem("name") || "Anonymous",
            rating: reviewRating,
            comment: reviewComment.trim(),
          }),
        },
      );
      const json = await res.json();
      if (json.result === "Done") {
        setData((prev) => ({ ...prev, reviews: json.data }));
        setReviewComment("");
        setReviewRating(5);
        setReviewSuccess("Your review has been submitted!");
      } else {
        setReviewError(json.reason || "Something went wrong.");
      }
    } catch {
      setReviewError("Could not connect to server.");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <>
      {" "}
      <div className="sk-pp">
        <div className="d-none d-lg-block">
          <HeroSection title={data.name || "Product"} />
        </div>

        <div className="container py-4">
          {/* Breadcrumb */}
          <div className="sk-breadcrumb">
            <a href="/">Home</a>
            <span className="sk-breadcrumb-sep">&#9670;</span>
            <a href="/shop">Shop</a>
            {data.maincategory?.name && (
              <>
                <span className="sk-breadcrumb-sep">&#9670;</span>
                <a href={`/shop?mc=${data.maincategory.name}`}>
                  {data.maincategory.name}
                </a>
              </>
            )}
            <span className="sk-breadcrumb-sep">&#9670;</span>
            <span>{data.name}</span>
          </div>

          <div className="row g-4 mt-1">
            {/* Gallery */}
            <div className="col-lg-5 col-md-12">
              <div className="sk-gallery-main">
                {data.discount > 0 && (
                  <div className="sk-discount-ribbon">{data.discount}% OFF</div>
                )}
                <Swiper
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
                  {data.pic.map((item, index) => (
                    <SwiperSlide key={index}>
                      <img src={item} alt={data.name} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              {data.pic.length > 1 && (
                <div className="sk-gallery-thumbs mt-2">
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    slidesPerView={4}
                    spaceBetween={8}
                    watchSlidesProgress
                    modules={[Thumbs]}
                  >
                    {data.pic.map((item, index) => (
                      <SwiperSlide key={index}>
                        <img src={item} alt="" />
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
                    ₹{data.finalPrice?.toLocaleString()}
                  </span>
                  {data.basePrice > data.finalPrice && (
                    <span className="sk-pp-original">
                      ₹{data.basePrice?.toLocaleString()}
                    </span>
                  )}
                  {data.discount > 0 && (
                    <span className="sk-pp-savings">
                      Save {data.discount}% · ₹{savings?.toLocaleString()} off
                    </span>
                  )}
                </div>

                <div className="sk-pp-meta">
                  {data.color && (
                    <div className="sk-pp-meta-item">
                      <span className="label">Color</span>
                      <span className="value">{data.color}</span>
                    </div>
                  )}
                  {data.size && (
                    <div className="sk-pp-meta-item">
                      <span className="label">Size</span>
                      <span className="value">{data.size}</span>
                    </div>
                  )}
                  <div className="sk-pp-meta-item">
                    <span className="label">Availability</span>
                    <span
                      className={`sk-stock-badge ${data.stock ? "in" : "out"}`}
                    >
                      <i className="fa fa-circle" style={{ fontSize: 7 }} />
                      {data.stock
                        ? `In Stock (${data.stockQuantity} left)`
                        : "Out of Stock"}
                    </span>
                  </div>
                </div>

                {data.stock && (
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
                              qty < data.stockQuantity && setQty(qty + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="sk-qty-total">
                        Total &nbsp;
                        <strong>
                          ₹{(data.finalPrice * qty).toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    <div className="sk-pp-actions">
                      <button
                        className="sk-pp-btn sk-pp-btn-primary"
                        onClick={addToCart}
                      >
                        <i className="fa fa-shopping-cart" />
                        Add to Cart
                      </button>
                      <button
                        className="sk-pp-btn sk-pp-btn-wish"
                        onClick={addToWishlist}
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

                {/* Expected Delivery */}
                <div
                  style={{
                    marginTop: 16,
                    padding: "12px 16px",
                    background: "rgba(200,64,10,0.04)",
                    borderRadius: 12,
                    border: "1px solid rgba(200,64,10,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <i
                    className="fa fa-calendar-check"
                    style={{ color: "#C8400A", fontSize: 16 }}
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
                      <span style={{ color: "#C8400A" }}>
                        {deliveryDate(4)}
                      </span>
                      &nbsp;·&nbsp; COD: by{" "}
                      <span style={{ color: "#C8400A" }}>
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
                {/* Review list */}
                {!data.reviews?.length ? (
                  <p style={{ fontSize: 13, color: "#bbb", marginBottom: 24 }}>
                    No reviews yet. Be the first to review this product.
                  </p>
                ) : (
                  <div style={{ marginBottom: 28 }}>
                    {/* Average rating summary */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        marginBottom: 20,
                        padding: "14px 18px",
                        background: "rgba(200,64,10,0.04)",
                        borderRadius: 14,
                        border: "1px solid rgba(200,64,10,0.08)",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontFamily: "Playfair Display,serif",
                            fontWeight: 900,
                            fontSize: "2.4rem",
                            color: "#C8400A",
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

                    {data.reviews.map((rev, i) => (
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
                                color: "#C8400A",
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
                  </div>
                )}

                {/* Review form */}
                <div
                  style={{
                    background: "rgba(200,64,10,0.03)",
                    borderRadius: 16,
                    border: "1px solid rgba(200,64,10,0.08)",
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

                  {/* Star picker */}
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

                  {/* Comment box */}
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

                  {/* Feedback messages */}
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
                        : "linear-gradient(135deg,#C8400A,#E86834)",
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
      </div>
    </>
  );
}
