import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  let navigate = useNavigate();
  let [data, setData] = useState([]);

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  useEffect(() => {
    (async () => {
      try {
        let response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/api/user/${localStorage.getItem("userid")}`,
          {
            method: "GET",
            headers: {
              "content-Type": "application/json",
              "authorization": localStorage.getItem("token")
            },
          }
        );
        response = await response.json();
        console.log(response)
        if (response.result === "Done")
          setData(response.data)
        else
          navigate("/login")
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    })();
  }, []);

  return (
    <>
      {/* 🔹 Top Bar with Contact & Social Links */}
      <div className="container-fluid bg-dark py-2 d-none d-md-block">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            {/* 🔹 Contact Info */}
            <div className="d-flex flex-wrap">
              <small className="me-3 text-white-50">
                <Link to="mailto:vishankchauhan@gmail.com" target="_blank" rel="noreferrer" className="text-light">
                  <i className="fas fa-envelope me-2 text-secondary"></i>
                  <span className="d-none d-lg-inline">vishankchauhan@gmail.com</span>
                </Link>
              </small>
              <small className="me-3 text-white-50">
                <Link to="tel:+919873848046" target="_blank" rel="noreferrer" className="text-light">
                  <i className="fas fa-phone me-2 text-secondary"></i>
                  <span className="d-none d-lg-inline">+91-9873848046</span>
                </Link>
              </small>
              <small className="me-3 text-white-50">
                <Link to="https://wa.me/+919873848046" target="_blank" rel="noreferrer" className="text-light">
                  <i className="fa fa-whatsapp fs-5 me-2 text-secondary"></i>
                  <span className="d-none d-lg-inline">+91-9873848046</span>
                </Link>
              </small>
            </div>

            {/* 🔹 Social Icons */}
            <div className="d-flex">
              <a href="#" className="bg-light nav-fill btn btn-sm-square rounded-circle me-2">
                <i className="fab fa-facebook-f text-primary"></i>
              </a>
              <a href="#" className="bg-light nav-fill btn btn-sm-square rounded-circle me-2">
                <i className="fab fa-twitter text-primary"></i>
              </a>
              <a href="#" className="bg-light nav-fill btn btn-sm-square rounded-circle me-2">
                <i className="fab fa-instagram text-primary"></i>
              </a>
              <a href="#" className="bg-light nav-fill btn btn-sm-square rounded-circle">
                <i className="fab fa-linkedin-in text-primary"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Main Navbar */}
      <div className="container-fluid bg-primary sticky-top">
        <div className="container">
          <nav className="navbar navbar-dark navbar-expand-lg py-2">
            {/* 🔹 Logo */}
            <Link to="/" className="navbar-brand">
              <h1 className="text-white fw-bold d-block">
                Shop<span className="text-secondary me-5">Karo</span>
              </h1>
            </Link>

            {/* 🔹 Mobile Toggle Button */}
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarCollapse"
              aria-controls="navbarCollapse"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* 🔹 Navbar Links */}
            <div className="collapse navbar-collapse" id="navbarCollapse">
              <ul className="navbar-nav mx-auto text-center">
                <li className="nav-item">
                  <NavLink to="/" className="nav-link">Home</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/about" className="nav-link">About</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/shop" className="nav-link">Shop</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/feature" className="nav-link">Features</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/testimonial" className="nav-link">Testimonials</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/contactus" className="nav-link">Contact</NavLink>
                </li>
              </ul>

              {/* 🔹 Icons & Profile Dropdown */}
              <div className="d-flex align-items-center justify-content-center justify-content-lg-end w-100">
                {/* Wishlist Icon */}
                <Link to="/wishlist" className="nav-icon me-3 d-none d-lg-block">
                  <i className="fa fa-heart text-white fs-5"></i>
                </Link>

                {/* Cart Icon */}
                <Link to="/cart" className="nav-icon me-3 d-none d-lg-block">
                  <i className="fa fa-shopping-cart text-white fs-5"></i>
                </Link>

                {/* 🔹 Profile Dropdown */}
                <div className="nav-item dropdown">
                  <a
                    href="#"
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    <i className="fa fa-user text-white fs-5 me-2"></i>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end rounded">
                    {data.pic && localStorage.getItem("login") ? (
                      <li className="dropdown-header text-center">
                        <img
                          src={
                            `${process.env.REACT_APP_BACKEND_SERVER}/${data.pic}`
                          }
                          alt="User"
                          className="rounded-circle mb-2 border shadow align-content-center"
                          height={50}
                          width={50}
                        />
                      </li>
                    ) : (
                      <li className="dropdown-header text-center">
                        <img
                          src="/img/noimage.jpg"
                          alt="User"
                          className="rounded-circle mb-2 border shadow align-content-center"
                          height={50}
                          width={50}
                        />
                      </li>
                    )}

                    <Link to="/profile"><li className="dropdown-header text-center fw-boldpt-0 bg-primary mx-3 text-light">{localStorage.getItem("name") ? localStorage.getItem("name") : "User Name"}</li></Link>
                    <li><i></i><Link to="/cart" className="dropdown-item mt-3">Cart</Link></li>
                    <li><Link to="/order" className="dropdown-item">Orders</Link></li>
                    <li><Link to="/checkout" className="dropdown-item">Checkout</Link></li>
                    {localStorage.getItem("login") ?
                      <li><button className="dropdown-item text-danger" onClick={logout}>Logout</button></li> :
                      <Link to="/login"><li><button className="dropdown-item text-success">Login</button></li></Link>
                    }
                  </ul>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}