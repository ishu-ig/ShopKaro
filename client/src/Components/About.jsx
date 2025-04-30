import React from 'react'
import { Link } from 'react-router-dom'

export default function About({title}) {
  return (
    <>
         {/* About Start  */}
        <div className="container-fluid py-5 my-5">
            <div className="container pt-5">
                <div className="row g-5">
                    <div className="col-lg-5 col-md-6 col-sm-12 wow fadeIn" data-wow-delay=".3s">
                        <div className="h-100 position-relative">
                            <img src="img/about-1.jpg" className="img-fluid w-75 rounded" alt="" style={{marginBottom :"25%" }} />
                            <div className="position-absolute w-75" style={{top: "25%", left: "25%"}}>
                                <img src="img/banner8.jpg"  className="img-fluid w-100 rounded" alt="" />
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-7 col-md-6 col-sm-12 wow fadeIn" data-wow-delay=".5s">
                        <h5 className="text-primary">About Us</h5>
                        <h1 className="mb-4">About ShopKaro</h1>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed efficitur quis purus ut interdum. Pellentesque aliquam dolor eget urna ultricies tincidunt. Nam volutpat libero sit amet leo cursus, ac viverra eros tristique. Morbi quis quam mi. Cras vel gravida eros. Proin scelerisque quam nec elementum viverra. Suspendisse viverra hendrerit diam in tempus. Etiam gravida justo nec erat vestibulum, et malesuada augue laoreet.</p>
                        <p className="mb-4">Pellentesque aliquam dolor eget urna ultricies tincidunt. Nam volutpat libero sit amet leo cursus, ac viverra eros tristique. Morbi quis quam mi. Cras vel gravida eros. Proin scelerisque quam nec elementum viverra. Suspendisse viverra hendrerit diam in tempus.</p>
                        {title && <Link to="/about" className="btn btn-secondary rounded-pill py-2 text-white w-100">More Details</Link>}
                    </div>
                </div>
            </div>
        </div>
        {/* About End */}
    </>
  )
}
