import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { FreeMode, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { getMaincategory } from "../Redux/ActionCreators/MaincategoryActionCreators";
import { useDispatch, useSelector } from "react-redux";

export default function CategorySlider({ title, data }) {
  const MaincategoryStateData = useSelector((state) => state.MaincategoryStateData);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMaincategory());
  }, [dispatch, MaincategoryStateData.length]);

  return (
    <>
      <section className="sk-cat-section py-4 py-md-5">
        <div className="container">
          <div className="row align-items-end mb-4 mb-md-5">
            <div className="col-md-8">
              <span className="sk-cat-eyebrow">Explore</span>
              <h2 className="sk-cat-heading">
                We Deal In <em>{title || "Following"}!</em>
              </h2>
              <p className="sk-cat-subtext">Browse our curated selection across all categories</p>
            </div>
          </div>

          <Swiper
            spaceBetween={12}
            freeMode={true}
            loop={true}
            modules={[FreeMode, Autoplay]}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            className="sk-cat-swiper"
            breakpoints={{
              0: {
                slidesPerView: 2,
                spaceBetween: 10,
              },
              480: {
                slidesPerView: 2.2,
                spaceBetween: 12,
              },
              768: {
                slidesPerView: 3.2,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
          >
            {data?.map((item) => {
              const targetUrl =
                title === "Maincategory" ? `/shop?mc=${item.name}` :
                title === "Subcategory" ? `/shop?sc=${item.name}` :
                `/shop?br=${item.name}`;

              return (
                <SwiperSlide key={item.id || item._id}>
                  <Link to={targetUrl} className="sk-cat-card text-decoration-none">
                    <img
                      src={item.pic || "/img/noimage.jpg"}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/img/noimage.jpg";
                      }}
                    />
                    <div className="sk-cat-card-gradient"></div>
                    <div className="sk-cat-card-body">
                      <span className="sk-cat-card-tag">{title}</span>
                      <h4>{item.name}</h4>
                      <span className="sk-cat-cta">
                        Shop Now <i className="fa fa-arrow-right fa-xs"></i>
                      </span>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </section>
    </>
  );
}