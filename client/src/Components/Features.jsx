import React from 'react'
import { Link } from 'react-router-dom'

export default function Features() {
  return (
    <>
        {/* Services Start */}
        <div className="container-fluid services py-5 mb-5">
            <div className="container">
                <div className="text-center mx-auto pb-5 wow fadeIn" data-wow-delay=".3s" style={{maxWidth: "600px"}}>
                    <h5 className="text-primary">Our Features</h5>
                    <h1>Best In Industry Features</h1>
                </div>
                <div className="row g-5 services-inner">
                    <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay=".3s">
                        <div className="services-item bg-light">
                            <div className="p-4 text-center services-content">
                                <div className="services-content-icon">
                                    <i className="fa fa-check fs-1 mb-4 text-primary"></i>
                                    <h4 className="mb-3">Top Brands</h4>
                                    <p className="mb-4">Lorem ipsum dolor sit amet elit. Sed efficitur quis purus ut interdum. Aliquam dolor eget urna ultricies tincidunt.</p>
                                    <Link to="/shop" className="btn btn-secondary text-white px-5 py-3 rounded-pill">Shop</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay=".5s">
                        <div className="services-item bg-light">
                            <div className="p-4 text-center services-content">
                                <div className="services-content-icon">
                                    <i className="fa fa-copyright fs-1 mb-4 text-primary"></i>
                                    <h4 className="mb-3">100% Original Product</h4>
                                    <p className="mb-4">Lorem ipsum dolor sit amet elit. Sed efficitur quis purus ut interdum. Aliquam dolor eget urna ultricies tincidunt.</p>
                                    <Link to="/shop" className="btn btn-secondary text-white px-5 py-3 rounded-pill">Shop</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay=".7s">
                        <div className="services-item bg-light">
                            <div className="p-4 text-center services-content">
                                <div className="services-content-icon">
                                    <i className="fa fa-rotate-left fs-1 mb-4 text-primary"></i>
                                    <h4 className="mb-3">7 Day Refund Policy</h4>
                                    <p className="mb-4">Lorem ipsum dolor sit amet elit. Sed efficitur quis purus ut interdum. Aliquam dolor eget urna ultricies tincidunt.</p>
                                    <Link to="/shop" className="btn btn-secondary text-white px-5 py-3 rounded-pill">Shop</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay=".3s">
                        <div className="services-item bg-light">
                            <div className="p-4 text-center services-content">
                                <div className="services-content-icon">
                                    <i className="fas fa-phone fs-1 mb-4 text-primary"></i>
                                    <h4 className="mb-3">24/7 Costomer Support</h4>
                                    <p className="mb-4">Lorem ipsum dolor sit amet elit. Sed efficitur quis purus ut interdum. Aliquam dolor eget urna ultricies tincidunt.</p>
                                    <Link to="/shop" className="btn btn-secondary text-white px-5 py-3 rounded-pill">Shop</Link>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay=".5s">
                        <div className="services-item bg-light">
                            <div className="p-4 text-center services-content">
                                <div className="services-content-icon">
                                    <i className="fa fa-users fs-1 mb-4 text-primary"></i>
                                    <h4 className="mb-3">100000+ Happy Coustomer</h4>
                                    <p className="mb-4">Lorem ipsum dolor sit amet elit. Sed efficitur quis purus ut interdum. Aliquam dolor eget urna ultricies tincidunt.</p>
                                    <Link to="/shop" className="btn btn-secondary text-white px-5 py-3 rounded-pill">Shop</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay=".7s">
                        <div className="services-item bg-light">
                            <div className="p-4 text-center services-content">
                                <div className="services-content-icon">
                                    <i className="fas fa-truck fs-1 mb-4 text-primary"></i>
                                    <h4 className="mb-3">Fastest Delivery</h4>
                                    <p className="mb-4">Lorem ipsum dolor sit amet elit. Sed efficitur quis purus ut interdum. Aliquam dolor eget urna ultricies tincidunt.</p>
                                    <Link to="/shop" className="btn btn-secondary text-white px-5 py-3 rounded-pill">Shop</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* Services End */}
    </>
  )
}
