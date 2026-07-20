import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Product({ title, data }) {
  const [visibleCount, setVisibleCount] = useState(21);

  // Guard against data being undefined/null/not-an-array (e.g. while
  // still loading, or if the API returns an unexpected shape).
  const products = Array.isArray(data) ? data : [];

  return (
    <>
      <div className="sk-product-section">
        <div className="container">
          {title !== "Shop" && (
            <div className="text-center mb-5">
              <span className="sk-section-label">Our Products</span>
              <h2 className="sk-section-title">For {title}</h2>
              <div className="sk-divider mx-auto"></div>
            </div>
          )}

          <div className="row g-3 g-md-4">
            {products.slice(0, visibleCount).map((item, index) => {
              // Skip any null/undefined entries in the array instead of
              // crashing on item.name / item.discount below.
              if (!item) return null;

              // Products no longer carry flat pic/price fields directly —
              // those now live per-variant. Use the first variant as the
              // representative one for the listing card.
              const variant = item.variants?.[0] || {};
              const thumb = variant.pic?.[0] || "/placeholder.png";
              const basePrice = variant.price ?? variant.finalPrice ?? 0;
              const finalPrice = variant.finalPrice ?? basePrice;
              const key = item._id ?? index;

              return (
                <div key={key} className="col-6 col-md-4 col-lg-3">
                  <div className="sk-pcard">
                    <div className="sk-pcard-img-wrap">
                      <Link to={`/product/${item._id}`}>
                        <img
                          src={thumb}
                          alt={item.name || "Product"}
                          loading="lazy"
                        />
                      </Link>
                      {item.discount > 0 && (
                        <span className="sk-pcard-badge">{item.discount}% Off</span>
                      )}
                      {/* Desktop hover overlay */}
                      <div className="sk-pcard-overlay d-none d-md-flex">
                        <div className="sk-pcard-overlay-content">
                          <h6>{item.name}</h6>
                          <div className="sk-pcard-overlay-price">
                            {basePrice > finalPrice && <del>₹{basePrice}</del>}
                            <strong>₹{finalPrice}</strong>
                            {item.discount > 0 && (
                              <span className="off">↓{item.discount}%</span>
                            )}
                          </div>
                          <Link to={`/product/${item._id}`} className="sk-pcard-overlay-btn">
                            View Product
                          </Link>
                        </div>
                      </div>
                    </div>
                    {/* Mobile info */}
                    <div className="sk-pcard-info d-md-none">
                      <div className="name">{item.name}</div>
                      <div className="price">
                        {basePrice > finalPrice && <del>₹{basePrice}</del>}
                        <strong className="ms-1">₹{finalPrice}</strong>
                        {item.discount > 0 && (
                          <span className="off">{item.discount}% off</span>
                        )}
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
              <button className="sk-btn sk-btn-gold" onClick={() => setVisibleCount(v => v + 21)}>
                <i className="fa fa-plus-circle"></i> Load More
              </button>
            )}
            {visibleCount > 21 && (
              <button className="sk-btn sk-btn-outline" onClick={() => setVisibleCount(21)}>
                View Less
              </button>
            )}
            {title !== "Shop" && (
              <Link to={`/shop?mc=${title}`} className="sk-btn sk-btn-dark">
                View All <i className="fa fa-arrow-right"></i>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}