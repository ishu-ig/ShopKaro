import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";

import HeroSection from "../Components/HeroSection";
import ProductSlider from "../Components/ProductSlider";

import { getProduct } from "../Redux/ActionCreartors/ProductActionCreators"
import { getCart, createCart } from "../Redux/ActionCreartors/CartActionCreators"
import { getWishlist, createWishlist } from "../Redux/ActionCreartors/WishlistActionCreators"

export default function ProductPage() {
  let { _id } = useParams();
  let [qty, setQty] = useState(1);
  let [data, setData] = useState({ pic: [] });
  let [relatedProducts, setRelatedProducts] = useState([]);

  let ProductStateData = useSelector((state) => state.ProductStateData);
  let CartStateData = useSelector((state) => state.CartStateData);
  let WishlistStateData = useSelector((state) => state.WishlistStateData);

  let dispatch = useDispatch();
  let navigate = useNavigate();

  let swiperOptions = {
    slidePerView: 1,
    pagination: { dynamicBullets: true },
    modules: [Pagination],
    loop: true,
    className: "mySwiper",
  };

  function addToCart() {
    let item = CartStateData.find(
      (x) =>
        x.product?._id === _id && x.user?._id === localStorage.getItem("userid")
    );
    if (!item) {
      dispatch(
        createCart({
          user: localStorage.getItem("userid"),
          product: data._id,
          qty: qty,
          total: data.finalPrice * qty,
        })
      );
    }
    navigate("/cart");
  }

  function addToWishlist() {
    let item = WishlistStateData.find(
      (x) =>
        x.product?._id === _id && x.user?._id === localStorage.getItem("userid")
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
  }

  useEffect(() => {
    dispatch(getProduct());
    if (ProductStateData.length) {
      let item = ProductStateData.find((x) => x._id === _id);
      setData(item);
      setRelatedProducts(
        ProductStateData.filter(
          (x) =>
            x.active &&
            x.maincategory?.name === item.maincategory?.name &&
            x._id !== item._id
        )
      );
    }
  }, [ProductStateData.length]);

  useEffect(() => {
    dispatch(getCart());
  }, [CartStateData.length]);

  useEffect(() => {
    dispatch(getWishlist());
  }, [WishlistStateData.length]);

  return (
    <>
      <HeroSection title={`Product - ${data.name || ""}`} />

      <div className="container my-5">
        <div className="row justify-content-center">
          {/* Product Image Section */}
          <div className="col-md-5 align-content-center">
            <div className="card shadow-lg p-3 mb-5 bg-white rounded">
              <Swiper {...swiperOptions} className="w-100 text-center">
                {data.pic.map((item, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={`${process.env.REACT_APP_BACKEND_SERVER}/${item}`}
                      className="img-fluid"
                      style={{ maxHeight: "400px", objectFit: "contain" }}
                      alt=""
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="col-md-6">
            <div className="card shadow-lg p-4 rounded">
              <table className="table table-striped">
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td>{data.name}</td>
                  </tr>
                  <tr>
                    <th>Category / Brand</th>
                    <td>
                      {data.maincategory?.name} / {data.subcategory?.name} /{" "}
                      {data.brand?.name}
                    </td>
                  </tr>
                  <tr>
                    <th>Color / Size</th>
                    <td>{data.color} / {data.size}</td>
                  </tr>
                  <tr>
                    <th>Price</th>
                    <td>
                      <del className="text-danger">&#8377;{data.basePrice}</del>{" "}
                      <strong className="text-success">
                        &#8377;{data.finalPrice}
                      </strong>{" "}
                      <sup className="text-success">{data.discount}% Off</sup>
                    </td>
                  </tr>
                  <tr>
                    <th>Stock</th>
                    <td>
                      {data.stock
                        ? `Yes, ${data.stockQuantity} Left in Stock`
                        : "Out Of Stock"}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="text-center">
                      {data.stock ? (
                        <div className="row">
                          <div className="col-md-4 mb-2 mt-3">
                            <div className="btn-group w-100">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() =>
                                  qty > 1 ? setQty(qty - 1) : null
                                }
                              >
                                <i className="fa fa-minus"></i>
                              </button>
                              <h4 className="px-3">{qty}</h4>
                              <button
                                className="btn btn-outline-primary"
                                onClick={() =>
                                  qty < data.stockQuantity
                                    ? setQty(qty + 1)
                                    : null
                                }
                              >
                                <i className="fa fa-plus"></i>
                              </button>
                            </div>
                          </div>
                          <div className="col-md-8 mb-3 btn-group mt-3">
                            <button
                              className="btn btn-success w-100"
                              onClick={addToCart}
                            >
                              <i className="fa fa-shopping-cart"></i> Add To
                              Cart
                            </button>
                            <button
                              className="btn btn-outline-danger w-100"
                              onClick={addToWishlist}
                            >
                              <i className="fa fa-heart"></i> Add To Wishlist
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="btn btn-outline-danger w-100"
                          onClick={addToWishlist}
                        >
                          <i className="fa fa-heart"></i> Add To Wishlist
                        </button>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>Description</th>
                    <td>
                      <div dangerouslySetInnerHTML={{ __html: data.description }} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <ProductSlider title="Other Related Products" data={relatedProducts} />
    </>
  );
}
