import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

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
  const [reviewText, setReviewText] = useState("");

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
              x._id !== item._id
          )
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
      (x) => x.product?._id === _id && x.user?._id === localStorage.getItem("userid")
    );
    if (!item) {
      dispatch(
        createCart({
          user: localStorage.getItem("userid"),
          product: data._id,
          qty,
          total: data.finalPrice * qty,
        })
      );
    }
    navigate("/cart");
  };

  const addToWishlist = () => {
    const item = WishlistStateData.find(
      (x) => x.product?._id === _id && x.user?._id === localStorage.getItem("userid")
    );
    if (!item) {
      dispatch(
        createWishlist({
          user: localStorage.getItem("userid"),
          product: data._id,
        })
      );
    }
    navigate("/wishlist");
  };

  const submitReview = () => {
    if (reviewText.trim() !== "") {
      const newReview = {
        user: { name: "You" },
        comment: reviewText,
        date: new Date().toISOString(),
      };
      setData({ ...data, reviews: [...(data.reviews || []), newReview] });
      setReviewText("");
      alert("Review submitted!");
    }
  };

  return (
    <div>
      {/* HeroSection visible only on large screens */}
      <div className="d-none d-lg-block">
        <HeroSection title={`Product - ${data.name || ""}`} />
      </div>

      <div className="container my-4">
        <div className="row g-4">
          {/* Product Images */}
          <div className="col-lg-5 col-md-12 col-12">
            <div className="card shadow-sm p-3 h-100">
              <Swiper
                slidesPerView={1}
                loop={true}
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000 }}
                modules={[Pagination, Autoplay]}
                className="w-100"
              >
                {data.pic.map((item, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={`${process.env.REACT_APP_BACKEND_SERVER}/${item}`}
                      className="img-fluid"
                      style={{ maxHeight: "400px", width: "100%", objectFit: "contain" }}
                      alt={data.name}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Product Details */}
          <div className="col-lg-7 col-md-12 col-12">
            <div className="card shadow-sm p-3 h-100">
              <h3>{data.name}</h3>
              <p className="text-muted small">
                {data.maincategory?.name} / {data.subcategory?.name} / {data.brand?.name}
              </p>
              <h4>
                <del className="text-danger">&#8377;{data.basePrice}</del>{" "}
                <strong className="text-success">&#8377;{data.finalPrice}</strong>{" "}
                <sup className="text-success">{data.discount}% Off</sup>
              </h4>
              <p className="small">Color: {data.color || "-"} | Size: {data.size || "-"}</p>
              <p className="small">
                Stock: {data.stock ? `Yes, ${data.stockQuantity} Left` : "Out of Stock"}
              </p>

              {/* Quantity & Buttons */}
              {data.stock && (
                <div className="d-flex flex-column flex-sm-row align-items-stretch gap-2 mt-3">
                  <div className="btn-group mb-2 mb-sm-0 w-100" role="group">
                    <button
                      className="btn btn-outline-primary w-25"
                      onClick={() => qty > 1 && setQty(qty - 1)}
                    >
                      <i className="fa fa-minus"></i>
                    </button>
                    <span className="px-3 py-2 border text-center w-50">{qty}</span>
                    <button
                      className="btn btn-outline-primary w-25"
                      onClick={() => qty < data.stockQuantity && setQty(qty + 1)}
                    >
                      <i className="fa fa-plus"></i>
                    </button>
                  </div>

                  <div className="d-flex flex-column flex-sm-row gap-2 w-100">
                    <button className="btn btn-success flex-fill" onClick={addToCart}>
                      <i className="fa fa-shopping-cart"></i> Add To Cart
                    </button>
                    <button className="btn btn-outline-danger flex-fill" onClick={addToWishlist}>
                      <i className="fa fa-heart"></i> Add To Wishlist
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-3">
                <h5>Description</h5>
                <div
                  className="small"
                  dangerouslySetInnerHTML={{ __html: data.description || "-" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="card shadow-sm p-3 mt-4">
          <p className="fw-fa-bold fs-4">This Service Will Availabe Soon</p>
          <h4>Customer Reviews</h4>
          {!data.reviews?.length && <p className="small">No reviews yet.</p>}
          {(data.reviews || []).map((rev, i) => (
            <div key={i} className="border-bottom py-2">
              <strong>{rev.user?.name}</strong>
              <p className="mb-1 small">{rev.comment}</p>
              <small className="text-muted">{new Date(rev.date).toLocaleString()}</small>
            </div>
          ))}

          <div className="mt-3">
            <textarea
              className="form-control mb-2"
              placeholder="Write a review..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
              disabled
            />
            <button className="btn btn-primary w-100" disabled onClick={submitReview}>
              Submit Review
            </button>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-4">
          <ProductSlider title="Related Products" data={relatedProducts || []} />
        </div>
      </div>
      <div style={{ marginBottom: "100px" }}></div>
    </div>
  );
}
