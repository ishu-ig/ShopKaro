import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { FreeMode, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { getMaincategory } from "../Redux/ActionCreartors/MaincategoryActionCreators";
import { useDispatch, useSelector } from "react-redux";

export default function CategorySlider({ title, data }) {
  const MaincategoryStateData = useSelector((state) => state.MaincategoryStateData);
  const dispatch = useDispatch();
  const [slidesPerView, setSlidesPerView] = useState(
    window.innerWidth < 640 ? 1.2 : window.innerWidth < 1000 ? 2.2 : 3.2
  );

  useEffect(() => {
    dispatch(getMaincategory());
  }, [dispatch, MaincategoryStateData.length]);

  useEffect(() => {
    const handleResize = () => {
      setSlidesPerView(
        window.innerWidth < 640 ? 1.2 : window.innerWidth < 1000 ? 2.2 : 3.2
      );
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <section className="sk-cat-section">
        <div className="container">
          <div className="row align-items-end mb-5">
            <div className="col-md-8">
              <span className="sk-cat-eyebrow">Explore</span>
              <h2 className="sk-cat-heading">
                We Deal In <em>Following!</em>
              </h2>
              <p className="sk-cat-subtext">Browse our curated selection across all categories</p>
            </div>
          </div>

          <Swiper
            slidesPerView={slidesPerView}
            spaceBetween={20}
            freeMode={true}
            loop={true}
            modules={[FreeMode, Autoplay]}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            className="sk-cat-swiper"
          >
            {data?.map((item) => (
              <SwiperSlide key={item.id || item._id}>
                <div className="sk-cat-card">
                  <img
                    src={item.pic}
                    alt={item.name}
                    loading="lazy"
                  />
                  <div className="sk-cat-card-gradient"></div>
                  <div className="sk-cat-card-body">
                    <span className="sk-cat-card-tag">{title}</span>
                    <h4>{item.name}</h4>
                    <Link
                      to={
                        title === "Maincategory" ? `/shop?mc=${item.name}` :
                        title === "Subcategory" ? `/shop?sc=${item.name}` :
                        `/shop?br=${item.name}`
                      }
                      className="sk-cat-cta"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Shop Now <i className="fa fa-arrow-right fa-xs"></i>
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </>
  );
}