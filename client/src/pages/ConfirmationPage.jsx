import React from 'react'
import HeroSection from "../Components/HeroSection"
import { Link } from 'react-router-dom'

export default function ConfirmationPage() {
  return (
    <>
      <HeroSection title={"Order Placed Successfully"} />

      <div className="container d-flex flex-column align-items-center text-center py-5">
        <div className="card shadow-lg p-4 rounded-4 text-center" style={{ maxWidth: "600px", width: "100%" }}>
          <div className="mb-3">
            <i className="fas fa-check-circle text-success display-3"></i>
          </div>
          <h1 className="fw-bold text-primary">Thank You!</h1>
          <h3 className="text-secondary">
            Your order has been placed successfully!
          </h3>
          <p className="text-muted">
            You can track your shipment in the Order section.
          </p>

          <div className="d-flex gap-3 justify-content-center mt-4 btn-group">
            <Link to="/order" className="btn btn-primary px-4 fw-bold rounded-0">
              <i className="fas fa-box"></i> Check Orders
            </Link>
            <Link to="/shop" className="btn btn-primary px-4 fw-bold rounded-0">
              <i className="fas fa-shopping-cart"></i> Shop More
            </Link>
          </div>
        </div>
      </div>
      <div style={{marginBottom:"100px"}}></div>
    </>

  )
}
