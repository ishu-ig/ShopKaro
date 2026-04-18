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
import { getCart, createCart } from "../Redux/ActionCreartors/CartActionCreators";
import { getWishlist, createWishlist } from "../Redux/ActionCreartors/WishlistActionCreators";

export default function ProductPage() {
  const { _id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const ProductStateData = useSelector((state) => state.ProductStateData) || [];
  const CartStateData = useSelector((state) => state.CartStateData) || [];
  const WishlistStateData = useSelector((state) => state.WishlistStateData) || [];

  const [data, setData] = useState({ pic: [], reviews: [] });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [qty, setQty] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [tab, setTab] = useState("description");

  useEffect(() => { dispatch(getProduct()); }, [dispatch]);

  useEffect(() => {
    if (ProductStateData.length > 0) {
      const item = ProductStateData.find((x) => x._id === _id);
      if (item) {
        setData({ ...item, reviews: item.reviews || [] });
        setRelatedProducts(
          ProductStateData.filter(x => x.active && x.maincategory?.name === item.maincategory?.name && x._id !== item._id)
        );
      }
    }
  }, [ProductStateData, _id]);

  useEffect(() => {
    dispatch(getCart());
    dispatch(getWishlist());
  }, [dispatch]);

  const addToCart = () => {
    const item = CartStateData.find(x => x.product?._id === _id && x.user?._id === localStorage.getItem("userid"));
    if (!item) dispatch(createCart({ user: localStorage.getItem("userid"), product: data._id, qty, total: data.finalPrice * qty }));
    navigate("/cart");
  };

  const addToWishlist = () => {
    const item = WishlistStateData.find(x => x.product?._id === _id && x.user?._id === localStorage.getItem("userid"));
    if (!item) dispatch(createWishlist({ user: localStorage.getItem("userid"), product: data._id }));
    navigate("/wishlist");
  };

  const savings = data.basePrice - data.finalPrice;

  return (
    <>      <div className="sk-pp">
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
                <a href={`/shop?mc=${data.maincategory.name}`}>{data.maincategory.name}</a>
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
                  slidesPerView={1} loop
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 4000 }}
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  modules={[Pagination, Autoplay, Thumbs]}
                >
                  {data.pic.map((item, index) => (
                    <SwiperSlide key={index}>
                      <img src={`${process.env.REACT_APP_BACKEND_SERVER}/${item}`} alt={data.name} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              {data.pic.length > 1 && (
                <div className="sk-gallery-thumbs mt-2">
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    slidesPerView={4} spaceBetween={8}
                    watchSlidesProgress modules={[Thumbs]}
                  >
                    {data.pic.map((item, index) => (
                      <SwiperSlide key={index}>
                        <img src={`${process.env.REACT_APP_BACKEND_SERVER}/${item}`} alt="" />
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
                  {data.maincategory?.name && <span className="sk-tag">{data.maincategory.name}</span>}
                  {data.subcategory?.name  && <span className="sk-tag">{data.subcategory.name}</span>}
                  {data.brand?.name        && <span className="sk-tag gold">{data.brand.name}</span>}
                </div>

                <h1 className="sk-pp-name">{data.name}</h1>

                <div className="sk-pp-pricing">
                  <span className="sk-pp-final">₹{data.finalPrice?.toLocaleString()}</span>
                  {data.basePrice > data.finalPrice && (
                    <span className="sk-pp-original">₹{data.basePrice?.toLocaleString()}</span>
                  )}
                  {data.discount > 0 && (
                    <span className="sk-pp-savings">Save {data.discount}% · ₹{savings?.toLocaleString()} off</span>
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
                    <span className={`sk-stock-badge ${data.stock ? 'in' : 'out'}`}>
                      <i className="fa fa-circle" style={{ fontSize: 7 }} />
                      {data.stock ? `In Stock (${data.stockQuantity} left)` : "Out of Stock"}
                    </span>
                  </div>
                </div>

                {data.stock && (
                  <>
                    <div className="sk-qty-wrap">
                      <div>
                        <div className="sk-qty-label">Quantity</div>
                        <div className="sk-qty-control">
                          <button className="sk-qty-btn" onClick={() => qty > 1 && setQty(qty - 1)}>−</button>
                          <span className="sk-qty-val">{qty}</span>
                          <button className="sk-qty-btn" onClick={() => qty < data.stockQuantity && setQty(qty + 1)}>+</button>
                        </div>
                      </div>
                      <div className="sk-qty-total">
                        Total &nbsp;<strong>₹{(data.finalPrice * qty).toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="sk-pp-actions">
                      <button className="sk-pp-btn sk-pp-btn-primary" onClick={addToCart}>
                        <i className="fa fa-shopping-cart" />
                        Add to Cart
                      </button>
                      <button className="sk-pp-btn sk-pp-btn-wish" onClick={addToWishlist}>
                        <i className="fa fa-heart" />
                      </button>
                    </div>
                  </>
                )}

                <div className="sk-trust-badges">
                  <div className="sk-trust-badge"><i className="fa fa-shield-alt" /> Secure Payment</div>
                  <div className="sk-trust-badge"><i className="fa fa-truck" /> Fast Delivery</div>
                  <div className="sk-trust-badge"><i className="fa fa-undo" /> Easy Returns</div>
                  <div className="sk-trust-badge"><i className="fa fa-headphones" /> 24/7 Support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="sk-tabs">
            <div className="sk-tab-nav">
              <button className={`sk-tab-btn ${tab === 'description' ? 'active' : ''}`} onClick={() => setTab('description')}>
                Description
              </button>
              <button className={`sk-tab-btn ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>
                Reviews ({data.reviews?.length || 0})
              </button>
            </div>

            {tab === 'description' && (
              <div style={{ fontSize: 14, color: '#555', lineHeight: 1.85 }}
                dangerouslySetInnerHTML={{ __html: data.description || "<p>No description available.</p>" }}
              />
            )}

            {tab === 'reviews' && (
              <div>
                <div className="sk-coming-soon"><i className="fa fa-clock" /> Coming Soon</div>
                {!data.reviews?.length && (
                  <p style={{ fontSize: 13, color: '#bbb' }}>No reviews yet. Be the first to review this product.</p>
                )}
                {data.reviews.map((rev, i) => (
                  <div key={i} className="sk-review-item">
                    <span className="sk-review-author">{rev.user?.name}</span>
                    <span className="sk-review-date">{new Date(rev.date).toLocaleDateString()}</span>
                    <p className="sk-review-text">{rev.comment}</p>
                  </div>
                ))}
                <div className="mt-3">
                  <textarea className="sk-review-input" rows={3} placeholder="Write a review..." disabled />
                  <button className="sk-review-submit" disabled>Submit Review</button>
                </div>
              </div>
            )}
          </div>

          {/* Related */}
          <div className="mt-2">
            <ProductSlider title="Related Products" data={relatedProducts || []} />
          </div>
        </div>
      </div>
    </>
  );
}