import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";


export default function Footer() {
  let [email, setEmail] = useState("")
  let [message, setMessage] = useState("")

  async function postData(e) {
    e.preventDefault()
    if (email.length === 0) {
      setMessage("Please EnterValid Email Address")
    }
    else {
      let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/newsletter`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email: email })
      })
      response = await response.json()
      console.log(response)
      if (response.result === "Done") {
        setMessage("Thanks to Subscribe Our Newsletter Service")
        setEmail("")
      }
      else
        setMessage(response.reason?.email)
    }
  }

  return (
    <>
      {/* Footer Start  */}
      <div
        className="container-fluid footer bg-dark wow fadeIn px-4"
        data-wow-delay=".3s"
      >
        <div className="row g-5">
          <div className="col-lg-2 col-md-6">
            <Link to="/">
              <h1 className="text-white fw-bold d-block">
                Shop<span className="text-secondary">Karo</span>{" "}
              </h1>
            </Link>
            <p className="mt-4 text-light text-justify">
              We provide Upto 90% Discount on Top Brands Product and We deals in
              Kids Female Males Products
            </p>
            <div className="d-flex hightech-link">
              <Link
                to="#"
                className="btn-light nav-fill btn btn-square rounded-circle me-2"
              >
                <i className="fab fa-facebook-f text-primary"></i>
              </Link>
              <Link
                to="#"
                className="btn-light nav-fill btn btn-square rounded-circle me-2"
              >
                <i className="fab fa-twitter text-primary"></i>
              </Link>
              <Link
                to="#"
                className="btn-light nav-fill btn btn-square rounded-circle me-2"
              >
                <i className="fab fa-instagram text-primary"></i>
              </Link>
              <Link
                to="#"
                className="btn-light nav-fill btn btn-square rounded-circle me-0"
              >
                <i className="fab fa-linkedin-in text-primary"></i>
              </Link>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <Link to="/contactUs" className="h3 text-secondary">
              Contact Us
            </Link>
            <div className="text-white mt-4 d-flex flex-column contact-link">
              <Link
                to="/"
                className="pb-3 text-light border-bottom border-primary"
              >
                <i className="fas fa-map-marker-alt text-secondary me-2"></i>{" "}
                123 Street, New York, USA
              </Link>
              <Link
                to="tel:+123
                456 7890"
                className="py-3 text-light border-bottom border-primary"
              >
                <i
                  className="fas fa-phone-alt text-secondary me-2"
                  target="_blank"
                  rel="noreferrer"
                ></i>{" "}
                +123 456 7890
              </Link>
              <Link
                to="https://wa.me/8218635344"
                className="py-3 text-light border-bottom border-primary"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fa fa-whatsapp text-secondary me-2 fs-4"></i> +123
                456 7890
              </Link>
              <Link
                to="mailto:ishaangupta124@gmail.com"
                className="py-3 text-light border-bottom border-primary"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fas fa-envelope text-secondary me-2"></i>{" "}
                info@exmple.con
              </Link>
            </div>
          </div>
          <div className="col-lg-2 col-md-6">
            <Link to="##" className="h3 text-secondary">
              Quick Link
            </Link>
            <div className="mt-4 d-flex flex-column short-link">
              <Link
                to="/"
                className="mb-2 text-white"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fas fa-angle-right text-secondary me-2"></i>Home
              </Link>
              <Link
                to="/about"
                className="mb-2 text-white"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fas fa-angle-right text-secondary me-2"></i>About
                us
              </Link>
              <Link
                to="feature"
                className="mb-2 text-white"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fas fa-angle-right text-secondary me-2"></i>
                Feature
              </Link>
              <Link
                to="shop"
                className="mb-2 text-white"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fas fa-angle-right text-secondary me-2"></i>Shop
              </Link>
              <Link
                to="testimonial"
                className="mb-2 text-white"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fas fa-angle-right text-secondary me-2"></i>
                Testimonial
              </Link>
            </div>
          </div>
          <div className="col-lg-2 col-md-6">
            <Link to="##" className="h3 text-secondary">
              Quick Link
            </Link>
            <div className="mt-4 d-flex flex-column short-link">
              <Link to="/contactUs" className="mb-2 text-white">
                <i
                  className="fas fa-angle-right text-secondary me-2"
                  target="_blank"
                  rel="noreferrer"
                ></i>
                ContactUs
              </Link>
              <Link to="#" className="mb-2 text-white">
                <i
                  className="fas fa-angle-right text-secondary me-2"
                  target="_blank"
                  rel="noreferrer"
                ></i>
                Privacy Policy
              </Link>
              <Link to="#" className="mb-2 text-white">
                <i
                  className="fas fa-angle-right text-secondary me-2"
                  target="_blank"
                  rel="noreferrer"
                ></i>
                Terms And Conditions
              </Link>
              <Link to="#" className="mb-2 text-white">
                <i
                  className="fas fa-angle-right text-secondary me-2"
                  target="_blank"
                  rel="noreferrer"
                ></i>
                Refund Policy
              </Link>
              <Link to="#" className="mb-2 text-white">
                <i
                  className="fas fa-angle-right text-secondary me-2"
                  target="_blank"
                  rel="noreferrer"
                ></i>
                Delivery Policy
              </Link>
            </div>
          </div>

          <div className="col-lg-3 col-md-12 ">
            <Link to="#" className="h3 text-secondary mb-4">
              Newsletter
            </Link>
            <h6 className="text-light ">
              {message ? message : "Suncribe to our NewsLetter Service to Get Latest Update About Our New Product And Great Deals"}
            </h6>
            <form onSubmit={postData}>
              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="form-control"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>
              <button type="submit" className="btn w-100 btn-secondary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <hr className="text-light mt-5 mb-4" />
        <div className="row">
          <div className="col-md-6 text-center text-md-start">
            <span className="text-light">
              <Link to="##" className="text-secondary">
                <i className="fas fa-copyright text-secondary me-2"></i>ShopKaro
              </Link>
              , All right reserved.
            </span>
          </div>
        </div>
      </div>
      {/* Footer End  */}
    </>
  );
}
