import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { FreeMode } from "swiper/modules";
import { Link } from "react-router-dom";
import { getMaincategory } from "../Redux/ActionCreartors/MaincategoryActionCreators";
import { useDispatch, useSelector } from "react-redux";
import "animate.css"; // Make sure animate.css is included

export default function CategorySlider({ title, data }) {
  const MaincategoryStateData = useSelector(state => state.MaincategoryStateData);
  const dispatch = useDispatch();
  let [slidesPerView, setSlidesPerView] = useState(
      window.innerWidth < 1000 ? 1 : 3
    );

  useEffect(() => {
    dispatch(getMaincategory());
  }, [dispatch, MaincategoryStateData.length]);

  const options = {
    slidesPerView: slidesPerView,
    spaceBetween: 20,
    freeMode: true,
    pagination: { clickable: true },
    modules: [FreeMode],
    loop: true,
    className: "mySwiper",
  };

  return (
    <>
      {/* Section Start */}
      <div className="container-fluid py-5 bg-light">
        <div className="container">
          {/* Section Title */}
          <div className="text-center mx-auto pb-5 wow fadeIn animate__animated animate__fadeIn" data-wow-delay=".3s" style={{ maxWidth: "600px" }}>
            <h5 className="text-primary fw-bold text-uppercase">{`Our ${title}`}</h5>
            <h1 className="fw-bold text-dark">We Deal In Following!</h1>
          </div>

          {/* Swiper Section */}
          <Swiper {...options} className="position-relative">
            {data?.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="card category-card border-0 shadow-lg position-relative wow zoomIn animate__animated animate__zoomIn"
                  data-wow-delay=".3s">
                  <img
                    src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.pic}`}
                    className="card-img-top"
                    alt={item.name}
                  />
                  <div className="overlay d-flex flex-column justify-content-end text-center">
                    <h4 className="fw-bold text-light">{item.name}</h4>
                    <Link
                      to={
                        title === "Maincategory" ? `/shop?mc=${item.name}` :
                        title === "Subcategory" ? `/shop?sc=${item.name}` :
                        `/shop?br=${item.name}`
                      }
                      className="btn custom-btn mt-2"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      {/* Section End */}
    </>
  );
}
