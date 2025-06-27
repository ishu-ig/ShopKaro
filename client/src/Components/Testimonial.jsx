import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-cards";
import "swiper/css/pagination";
import { EffectCards, EffectCoverflow, Pagination } from "swiper/modules";
import { useDispatch, useSelector } from "react-redux";
import { getTestimonial } from "../Redux/ActionCreartors/TestimonialActionCreators";

export default function Testimonial() {
  const dispatch = useDispatch();
  const TestimonialStateData = useSelector(state => state.TestimonialStateData);

  useEffect(() => {
    dispatch(getTestimonial());
  }, [dispatch]);

  return (
    <>
      <div className="container-fluid testimonial py-5 mb-5">
        <div className="container">

          {/* Section Heading */}
          <div className="text-center mx-auto pb-5 wow fadeIn" data-wow-delay=".3s" style={{ maxWidth: "600px" }}>
            <h5 className="text-primary">Our Testimonial</h5>
            <h1>Our Client Saying!</h1>
          </div>

          {/* 📌 Intro Paragraph */}
          <div className="mb-5">
            <p className="lead text-center text-muted">
              We value feedback and strive to improve our services every day. Here’s what some of our satisfied customers have to say about their experience with us.
            </p>
          </div>

          {/* Swiper Testimonial */}
          <Swiper
            grabCursor={true}
            loop={true}
            pagination={{ clickable: true }}
            effect="coverflow"
            centeredSlides={true}
            coverflowEffect={{
              rotate: 30,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            breakpoints={{
              0: {
                slidesPerView: 1,
                effect: "cards",
                modules: [EffectCards, Pagination],
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
                effect: "coverflow",
                modules: [EffectCoverflow, Pagination],
              },
              1000: {
                slidesPerView: 3,
                spaceBetween: 40,
                effect: "coverflow",
                modules: [EffectCoverflow, Pagination],
              },
            }}
            className="mySwiper"
          >
            {TestimonialStateData?.filter(x => x.active).map((item) => (
              <SwiperSlide key={item._id}>
                <div className="testimonial-item border p-4 h-100">
                  <div className="d-flex align-items-center">
                    <img
                      src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.pic}`}
                      height={100}
                      width={100}
                      className="rounded-circle object-fit-cover"
                      alt={item.name}
                    />
                    <div className="ms-4">
                      <h4 className="text-secondary">{item.name}</h4>
                      <div className="d-flex pe-5">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className="fas fa-star me-1 text-primary"></i>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="border-top mt-4 pt-3">
                    <p className="mb-0 testimonial-message" style={{ height: 150, overflowY: "auto" }}>
                      {item.message}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* 📌 Additional Content Below Swiper */}
          <div className="row mt-5">
            <div className="col-md-6 mb-4">
              <h4>Why Customers Trust Us</h4>
              <ul>
                <li>✅ 24/7 Support and service</li>
                <li>✅ 100% Quality Guarantee</li>
                <li>✅ Easy Refund Policies</li>
                <li>✅ Affordable Pricing</li>
              </ul>
            </div>
            <div className="col-md-6 mb-4">
              <h4>Our Mission</h4>
              <p>
                We aim to provide top-tier services that not only satisfy our clients but also create long-lasting relationships. Your success is our success.
              </p>
              <p>
                Whether it's customer service, delivery, or product satisfaction—we're always one step ahead.
              </p>
            </div>
          </div>

          {/* 📌 Call to Action */}
          <div className="text-center mt-5">
            <h3>Ready to Experience Excellence?</h3>
            <p className="lead">Join the thousands of happy customers who trust us.</p>
            <a href="/contactus" className="btn btn-primary px-4 py-2 mt-2">Get in Touch</a>
          </div>

        </div>
      </div>
    </>
  );
}
