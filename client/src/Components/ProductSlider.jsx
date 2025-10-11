import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { Link } from "react-router-dom";

export default function ProductSlider({ title, data }) {
  const [slidesPerView, setSlidesPerView] = useState(
    window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 4
  );

  useEffect(() => {
    function handleResize() {
      setSlidesPerView(
        window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 4
      );
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <h5 className="text-primary">{title || "Our Products"}</h5>
        <h2 className="fw-bold">{title || "Check Out Latest Products"}</h2>
      </div>

      <Swiper
        slidesPerView={slidesPerView}
        spaceBetween={20}
        loop={true}
        modules={[Autoplay]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        grabCursor={true} // allows side handle drag
        className="mySwiper"
      >
        {data?.map((item) => (
          <SwiperSlide key={item._id}>
            <div
              className="card h-100 shadow-sm position-relative"
              style={{
                borderRadius: "10px",
                overflow: "hidden",
                transition: "transform 0.3s",
              }}
            >
              <div
                className="position-relative overflow-hidden"
                style={{ cursor: "pointer" }}
              >
                <img
                  src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.pic[0]}`}
                  alt={item.name}
                  className="card-img-top w-100"
                  style={{ height: 250, objectFit: "cover", transition: "transform 0.3s" }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
                <div
                  className="position-absolute top-0 end-0 m-2 px-2 py-1 rounded"
                  style={{ background: "#ffc107", color: "#000", fontWeight: "bold" }}
                >
                  {item.rating || 4.5} ★
                </div>
              </div>

              <div className="card-body text-center d-flex flex-column">
                <h5 className="card-title fw-bold">{item.name}</h5>
                <p className="card-text mb-2">
                  <del className="text-danger">&#8377;{item.basePrice}</del>{" "}
                  <span className="text-success fw-bold">&#8377;{item.finalPrice}</span>{" "}
                  <sup className="text-warning">{item.discount}% Off</sup>
                </p>

                <div className="mt-auto d-grid gap-2">
                  <Link
                    to={`/cart/${item._id}`}
                    className="btn btn-primary w-100"
                    style={{ borderRadius: "25px", fontWeight: "bold" }}
                  >
                    <i className="fa fa-shopping-cart"></i> Add to Cart
                  </Link>
                  <Link
                    to={`/product/${item._id}`}
                    className="btn btn-outline-secondary w-100"
                    style={{ borderRadius: "25px", fontWeight: "bold" }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
