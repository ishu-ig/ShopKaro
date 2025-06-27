import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-cards";
import "swiper/css/pagination";

import { EffectCards, EffectCoverflow } from "swiper/modules";
import { Link } from "react-router-dom";

export default function ProductSlider({ title, data }) {
  const [slidesPerView, setSlidesPerView] = useState(
    window.innerWidth < 1000 ? 1 : 3
  );
  const [slideType, setSlideType] = useState(
    window.innerWidth < 1000 ? "cards" : "coverflow"
  );

  useEffect(() => {
    function handleResize() {
      setSlidesPerView(window.innerWidth < 1000 ? 1 : 3);
      setSlideType(window.innerWidth < 1000 ? "cards" : "coverflow");
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let options = {
    effect: slideType,
    grabCursor: true,
    centeredSlides: false,
    slidesPerView: slidesPerView,
    coverflowEffect: {
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
    loop: true,
    modules: [EffectCoverflow, EffectCards],
    className: "mySwiper",
  };

  return (
    <>
      <div className="container-fluid py-5 mb-5 team">
        <div className="container">
          <div
            className="text-center mx-auto pb-5 wow fadeIn"
            data-wow-delay=".3s"
            style={{ maxWidth: "600px" }}
          >
            <h5 className="text-primary">{title || "Our Latest Products"}</h5>
            <h1>Checkout Our {title || "Latest Products"} Of Top Brands</h1>
          </div>

          <Swiper {...options}>
            {data?.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="rounded team-item p-3" style={{backgroundColor:"#72A0C1"}}>
                  <div className="team-content text-center position-relative">
                    <div className="team-img-icon">
                      <div className="team-img  mx-auto position-relative">
                        <img
                          src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.pic[0]}`}
                          style={{
                            height: 350,
                            objectFit: "cover",
                            borderRadius: "5%",
                            transition: "transform 0.3s ease-in-out",
                          }}
                          className="img-fluid w-100"
                          alt={item.name}
                          onMouseOver={(e) => (e.target.style.transform = "scale(1.1)")}
                          onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                        />
                        <div className="team-overlay"></div>
                      </div>

                      <div className="team-name text-center py-3">
                        <h4 className="fw-bold">{item.name}</h4>
                        <p className="m-0">
                          <del className="text-danger">&#8377;{item.basePrice}</del>{" "}
                          <strong className="text-success">
                            &#8377;{item.finalPrice}
                          </strong>{" "}
                          <sup className="text-warning">{item.discount}%</sup>
                        </p>
                      </div>

                      <div className="team-icon d-flex justify-content-center pb-4">
                        <Link
                          className="btn btn-primary px-4 py-2 mx-1 shadow-sm"
                          to={`/cart/${item.id}`}
                          style={{ fontWeight: "bold", borderRadius: "20px" }}
                        >
                          <i className="fa fa-shopping-cart"></i> Add to Cart
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
}
