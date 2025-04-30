import React, { useEffect } from 'react'
import Fact from '../Components/Fact'
import About from '../Components/About'
import Features from '../Components/Features'
import Product from '../Components/Product'
import ProductSlider from '../Components/ProductSlider'
import Testimonial from '../Components/Testimonial'
import CategorySlider from '../Components/CategorySlider'
import { Link } from 'react-router-dom'

import { getMaincategory } from "../Redux/ActionCreartors/MaincategoryActionCreators"
import { getSubcategory } from "../Redux/ActionCreartors/SubcategoryActionCreators"
import { getBrand } from "../Redux/ActionCreartors/BrandActionCreators"
import { getProduct } from "../Redux/ActionCreartors/ProductActionCreators"
import { useDispatch, useSelector } from 'react-redux'

export default function Home() {
let ProductStateData = useSelector((state) => state.ProductStateData)
    let MaincategoryStateData = useSelector((state) => state.MaincategoryStateData)
    let SubcategoryStateData = useSelector((state) => state.SubcategoryStateData)
    let BrandStateData = useSelector((state) => state.BrandStateData)

    let dispatch = useDispatch()

    useEffect(() => {
        (() => {
            dispatch(getMaincategory())
        })()
    }, [MaincategoryStateData.length])

    useEffect(() => {
        (() => {
            dispatch(getSubcategory())
        })()
    }, [SubcategoryStateData.length])

    useEffect(() => {
        (() => {
            dispatch(getBrand())
        })()
    }, [BrandStateData.length])

    useEffect(() => {
        (() => {
            dispatch(getProduct())
        })()
    }, [ProductStateData.length])
    return (
        <>
            {/* Carousel Start */}
            <div className="container-fluid px-0">
                <div id="carouselId" className="carousel slide" data-bs-ride="carousel">
                    <ol className="carousel-indicators">
                        <li data-bs-target="#carouselId" data-bs-slide-to="0" className="active" aria-current="true" aria-label="First slide"></li>
                        <li data-bs-target="#carouselId" data-bs-slide-to="1" aria-label="Second slide"></li>
                        <li data-bs-target="#carouselId" data-bs-slide-to="2" aria-label="Third slide"></li>
                    </ol>
                    <div className="carousel-inner" role="listbox">
                        <div className="carousel-item active">
                            <img src="img/banner1.jpg" style={{ height: 580 }} className="w-100" alt="First slide" />
                            <div className="carousel-caption">
                                <div className="container carousel-content">
                                    <h6 className="text-secondary h4 animated fadeInUp">Best Ecommerse Shoping Plateform</h6>
                                    <h1 className="text-white display-5 mb-4 animated fadeInRight text-capitalize">We Deals in Top Brand For Male</h1>
                                    <Link to="/shop?mc=Male" className="ms-2"><button type="button" className="px-4 py-sm-3 px-sm-5 btn btn-primary rounded-pill carousel-content-btn2 animated fadeInRight">Shop Now</button></Link>
                                </div>
                            </div>
                        </div>
                        <div className="carousel-item">
                            <img src="img/banner6.jpg" style={{ height: 580 }} className="w-100" alt="First slide" />
                            <div className="carousel-caption">
                                <div className="container carousel-content">
                                    <h6 className="text-secondary h4 animated fadeInUp">Best Ecommerse Shoping Plateform</h6>
                                    <h1 className="text-white display-5 mb-4 animated fadeInRight text-capitalize">We Deals in Top Brand For Female</h1>
                                    <Link to="/shop?mc=Male" className="ms-2"><button type="button" className="px-4 py-sm-3 px-sm-5 btn btn-primary rounded-pill carousel-content-btn2 animated fadeInRight">Shop Now</button></Link>
                                </div>
                            </div>
                        </div>
                        <div className="carousel-item">
                            <img src="img/banner4.jpg" style={{ height: 580 }} className="w-100" alt="First slide" />
                            <div className="carousel-caption">
                                <div className="container carousel-content">
                                    <h6 className="text-secondary h4 animated fadeInUp">Best Ecommerse Shoping Plateform</h6>
                                    <h1 className="text-white display-5 mb-4 animated fadeInRight text-capitalize">We Deals in Top Brand For Kids</h1>
                                    <Link to="/shop?mc=Male" className="ms-2"><button type="button" className="px-4 py-sm-3 px-sm-5 btn btn-primary rounded-pill carousel-content-btn2 animated fadeInRight">Shop Now</button></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#carouselId" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#carouselId" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
            </div>
            {/* Carousel End */}
    
            <Fact />
            <CategorySlider title="Maincategory" data={MaincategoryStateData.filter(x => x.active)} />
            <About title="Home" />
            <CategorySlider title="Subcategory" data={SubcategoryStateData.filter(x => x.active)} />
            <Features />
            {MaincategoryStateData.filter(x => x.active).map((item) => {
                return <Product title={item.name} data={ProductStateData.filter(x => x.active && x.maincategory?.name === item.name).slice(0, 6)} />
            })}
            <ProductSlider data={ProductStateData.filter(x => x.active)} />
            <CategorySlider title="Brand" data={BrandStateData.filter(x => x.active)} />
            <Testimonial />
        </>
    )
}
