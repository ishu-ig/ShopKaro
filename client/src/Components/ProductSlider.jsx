import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { Link } from "react-router-dom";

export default function ProductSlider({ title, data }) {
  const swiperOptions = {
    effect: "fade", // Use "fade" or "slide" or any other built-in effect
    grabCursor: true,
    centeredSlides: false,
    loop: true,
    modules: [EffectFade],
    className: "mySwiper",
    spaceBetween: 20,
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  };

  return (
    <div className="container-fluid py-5 bg-light">
      <div className="container">
        <div className="text-center mb-4">
          <h5 className="text-primary">{title || "Our Latest Products"}</h5>
          <h2 className="fw-bold">Shop Our {title || "Top Deals"}</h2>
        </div>

        <Swiper {...swiperOptions}>
          {data?.map((item) => (
            <SwiperSlide key={item._id || item.id}>
              <div className="card h-100 shadow-sm">
                <img
                  src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.pic[0]}`}
                  className="card-img-top"
                  alt={item.name}
                  style={{ height: "250px", objectFit: "cover" }}
                />
                <div className="card-body text-center">
                  <h5>{item.name}</h5>
                  <p className="mb-1">
                    <del className="text-danger">&#8377;{item.basePrice}</del>{" "}
                    <span className="text-success fw-bold">
                      &#8377;{item.finalPrice}
                    </span>{" "}
                    <sup className="text-warning">{item.discount}%</sup>
                  </p>
                  <Link
                    to={`/cart/${item._id || item.id}`}
                    className="btn btn-primary mt-2"
                  >
                    <i className="fa fa-shopping-cart me-1" />
                    Add to Cart
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
