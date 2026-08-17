import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createCart } from "../Redux/ActionCreators/CartActionCreators";

export default function Product({ title, data }) {
  const [visibleCount, setVisibleCount] = useState(21);
  const [addedId, setAddedId] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const CartStateData = useSelector((state) => state.CartStateData) || [];

  // Guard against data being undefined/null/not-an-array
  const products = Array.isArray(data) ? data : [];

  const handleAddToCart = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    const userId = localStorage.getItem("userid");
    if (!userId) {
      navigate("/login");
      return;
    }

    const variant = item.variants?.[0];
    if (!variant) {
      navigate(`/product/${item._id}`);
      return;
    }

    const existing = CartStateData.find(
      (x) =>
        String(x.product?._id || x.product) === String(item._id) &&
        (!variant._id || String(x.variant?._id || x.variant) === String(variant._id)) &&
        String(x.user?._id || x.user) === String(userId)
    );

    if (existing) {
      navigate("/cart");
      return;
    }

    const finalPrice = variant.finalPrice ?? variant.price ?? 0;
    dispatch(
      createCart({
        user: userId,
        product: item._id,
        variant: variant._id,
        qty: 1,
        total: finalPrice,
      })
    );

    // Trigger visual "Added ✓" feedback
    setAddedId(item._id);
    setTimeout(() => {
      setAddedId(null);
    }, 1600);
  };

  return (
    <>
      <div className="sk-product-section py-4">
        <div className="container">
          {title !== "Shop" && (
            <div className="text-center mb-5">
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#c9a84c",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Curated Collection
              </span>
              <h2
                className="sk-section-title mb-2"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 800,
                  fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                  color: "#0d1b2a",
                }}
              >
                Products for <em style={{ fontStyle: "italic", color: "#c9a84c" }}>{title}</em>
              </h2>
              <div
                style={{
                  width: 48,
                  height: 3,
                  background: "linear-gradient(90deg, #c9a84c, #e8c873)",
                  margin: "12px auto 0",
                  borderRadius: 2,
                }}
              />
            </div>
          )}

          <div className="row g-2 g-sm-3 g-md-4">
            {products.slice(0, visibleCount).map((item, index) => {
              if (!item) return null;

              const variant = item.variants?.[0] || {};
              const thumb = variant.pic?.[0] || item.variants?.find(v => v.pic?.[0])?.pic?.[0] || (typeof item.pic === 'string' ? item.pic : item.pic?.[0]) || "/img/noimage.jpg";
              const basePrice = variant.price ?? variant.finalPrice ?? 0;
              const finalPrice = variant.finalPrice ?? basePrice;
              const discount = item.discount || (basePrice > finalPrice ? Math.round(((basePrice - finalPrice) / basePrice) * 100) : 0);
              const key = item._id ?? index;
              const userId = localStorage.getItem("userid");
              const inCart = CartStateData.some(
                (x) =>
                  String(x.product?._id || x.product) === String(item._id) &&
                  (!variant._id || String(x.variant?._id || x.variant) === String(variant._id)) &&
                  String(x.user?._id || x.user) === String(userId)
              );

              return (
                <div key={key} className="col-6 col-md-4 col-lg-3">
                  <div
                    className="sk-pcard h-100 d-flex flex-column"
                    style={{
                      borderRadius: 14,
                      background: "#ffffff",
                      border: "1px solid #eee8dc",
                      overflow: "hidden",
                      transition: "all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)",
                      position: "relative",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* Image Area - Clicking photo opens product details */}
                    <div
                      className="sk-pcard-img-wrap position-relative"
                      style={{
                        aspectRatio: "3/4",
                        overflow: "hidden",
                        background: "#f4f1ea",
                        cursor: "pointer",
                      }}
                    >
                      <Link to={`/product/${item._id || item.id}`} className="d-block w-100 h-100" style={{ cursor: "pointer", position: "relative", zIndex: 1 }}>
                        <img
                          src={thumb}
                          alt={item.name || "Product"}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "/img/noimage.jpg";
                          }}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.5s ease",
                            cursor: "pointer",
                          }}
                        />
                      </Link>

                      {discount > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            background: "linear-gradient(135deg, #c9a84c, #b38b29)",
                            color: "#070d14",
                            fontSize: "clamp(0.62rem, 1.8vw, 0.72rem)",
                            fontWeight: 800,
                            padding: "3px 7px",
                            borderRadius: 6,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                            zIndex: 2,
                            pointerEvents: "none",
                          }}
                        >
                          {discount}% OFF
                        </span>
                      )}

                      {/* Hover Overlay Actions */}
                      <div
                        className="sk-pcard-overlay d-none d-md-flex"
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: 10,
                          background: "linear-gradient(to top, rgba(7,13,20,0.85) 0%, transparent 100%)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          opacity: 0,
                          transform: "translateY(8px)",
                          transition: "all 0.25s ease",
                          zIndex: 3,
                          pointerEvents: "none",
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, item)}
                          className="btn btn-sm rounded-pill px-3 py-2 font-weight-bold w-100"
                          style={{
                            background: inCart || addedId === item._id ? "#27a85a" : "linear-gradient(135deg, #c9a84c, #e8c873)",
                            color: inCart || addedId === item._id ? "#fff" : "#070d14",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            border: "none",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                            transition: "all 0.2s ease",
                            pointerEvents: "auto",
                          }}
                        >
                          <i className={`fa ${inCart || addedId === item._id ? "fa-check" : "fa-shopping-cart"} me-1`}></i>
                          {inCart ? "In Cart" : addedId === item._id ? "Added ✓" : "Add to Cart"}
                        </button>
                        <Link
                          to={`/product/${item._id || item.id}`}
                          className="btn btn-sm rounded-pill px-3 py-2 text-white font-weight-bold w-100 text-center"
                          style={{
                            background: "rgba(255,255,255,0.12)",
                            border: "1px solid rgba(255,255,255,0.25)",
                            backdropFilter: "blur(4px)",
                            fontWeight: 600,
                            fontSize: "0.76rem",
                            letterSpacing: "0.03em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            pointerEvents: "auto",
                          }}
                        >
                          View Details <i className="fa fa-arrow-right ms-1"></i>
                        </Link>
                      </div>
                    </div>

                    {/* Card Content / Info */}
                    <div className="p-2 p-sm-3 d-flex flex-column flex-grow-1 justify-content-between">
                      <div>
                        {item.brand?.name && (
                          <div
                            style={{
                              fontSize: "0.64rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              color: "#c9a84c",
                              marginBottom: 2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.brand.name}
                          </div>
                        )}
                        <h6
                          style={{
                            fontSize: "clamp(0.78rem, 2.2vw, 0.92rem)",
                            fontWeight: 600,
                            color: "#1a1a24",
                            lineHeight: 1.3,
                            marginBottom: 6,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "2.4em",
                          }}
                        >
                          <Link
                            to={`/product/${item._id}`}
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            {item.name}
                          </Link>
                        </h6>
                      </div>

                      {/* Pricing Row & Add to Cart Button */}
                      <div>
                        <div className="d-flex align-items-baseline flex-wrap gap-1 gap-sm-2 pt-1 border-top" style={{ borderColor: "#f0ebe1" }}>
                          <span
                            style={{
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontSize: "clamp(0.88rem, 2.4vw, 1.05rem)",
                              fontWeight: 800,
                              color: "#0d1b2a",
                            }}
                          >
                            ₹{finalPrice.toLocaleString('en-IN')}
                          </span>
                          {basePrice > finalPrice && (
                            <del style={{ fontSize: "0.72rem", color: "#8a8a9a" }}>
                              ₹{basePrice.toLocaleString('en-IN')}
                            </del>
                          )}
                          {discount > 0 && (
                            <span
                              className="ms-auto"
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                color: "#27a85a",
                              }}
                            >
                              {discount}% off
                            </span>
                          )}
                        </div>

                        {/* Quick Add Button */}
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, item)}
                          className="btn btn-sm w-100 rounded-pill mt-2 d-flex align-items-center justify-content-center gap-1"
                          style={{
                            background: inCart || addedId === item._id ? "#27a85a" : "rgba(201,168,76,0.12)",
                            color: inCart || addedId === item._id ? "#ffffff" : "#0d1b2a",
                            border: inCart || addedId === item._id ? "1px solid #27a85a" : "1px solid rgba(201,168,76,0.35)",
                            fontWeight: 700,
                            fontSize: "clamp(0.7rem, 2vw, 0.78rem)",
                            padding: "5px 10px",
                            letterSpacing: "0.03em",
                            textTransform: "uppercase",
                            transition: "all 0.22s ease",
                          }}
                        >
                          <i className={`fa ${inCart || addedId === item._id ? "fa-check" : "fa-shopping-cart"}`} style={{ fontSize: "0.88em" }}></i>
                          <span>{inCart ? "In Cart" : addedId === item._id ? "Added ✓" : "Add to Cart"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="text-center mt-5 d-flex flex-column flex-sm-row justify-content-center gap-3">
            {visibleCount < products.length && (
              <button
                className="btn rounded-pill px-4 py-2"
                onClick={() => setVisibleCount(v => v + 21)}
                style={{
                  background: "linear-gradient(135deg, #c9a84c, #e8c873)",
                  color: "#070d14",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  border: "none",
                  boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
                }}
              >
                <i className="fa fa-plus-circle me-1"></i> Load More
              </button>
            )}
            {visibleCount > 21 && (
              <button
                className="btn btn-outline-dark rounded-pill px-4 py-2"
                onClick={() => setVisibleCount(21)}
                style={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                View Less
              </button>
            )}
            {title !== "Shop" && (
              <Link
                to={`/shop?mc=${title}`}
                className="btn rounded-pill px-4 py-2"
                style={{
                  background: "#0d1b2a",
                  color: "#c9a84c",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  border: "1px solid #c9a84c",
                }}
              >
                View All <i className="fa fa-arrow-right ms-1"></i>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}