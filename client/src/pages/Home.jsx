import React, { useEffect } from 'react'
import Fact from '../Components/Fact'
import About from '../Components/About'
import Features from '../Components/Features'
import Product from '../Components/Product'
import ProductSlider from '../Components/ProductSlider'
import Testimonial from '../Components/Testimonial'
import CategorySlider from '../Components/CategorySlider'
import { Link } from 'react-router-dom'

import { getMaincategory } from "../Redux/ActionCreators/MaincategoryActionCreators"
import { getSubcategory } from "../Redux/ActionCreators/SubcategoryActionCreators"
import { getBrand } from "../Redux/ActionCreators/BrandActionCreators"
import { getProduct } from "../Redux/ActionCreators/ProductActionCreators"
import { getBanner } from "../Redux/ActionCreators/BannerActionCreators"
import { useDispatch, useSelector } from 'react-redux'

export default function Home() {
    let ProductStateData = useSelector((state) => state.ProductStateData)
    let MaincategoryStateData = useSelector((state) => state.MaincategoryStateData)
    let SubcategoryStateData = useSelector((state) => state.SubcategoryStateData)
    let BrandStateData = useSelector((state) => state.BrandStateData)
    let BannerStateData = useSelector((state) => state.BannerStateData)

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

    useEffect(() => {
        (() => {
            dispatch(getBanner())
        })()
    }, [BannerStateData.length])

    const activeBanners = BannerStateData?.filter((b) => b.active) ?? []

    return (
        <>
            {/* Carousel Start */}
            <div className="container-fluid px-0">
                {activeBanners.length > 0 ? (
                    <div id="carouselId" className="carousel slide" data-bs-ride="carousel">
                        <ol className="carousel-indicators">
                            {activeBanners.map((banner, index) => (
                                <li
                                    key={banner._id}
                                    data-bs-target="#carouselId"
                                    data-bs-slide-to={index}
                                    className={index === 0 ? "active" : ""}
                                    aria-current={index === 0 ? "true" : undefined}
                                    aria-label={`Slide ${index + 1}`}
                                ></li>
                            ))}
                        </ol>
                        <div className="carousel-inner" role="listbox">
                            {activeBanners.map((banner, index) => (
                                <div key={banner._id} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                                    <img src={banner.pic} style={{ height: 580, objectFit: "cover" }} className="w-100" alt={banner.title} />
                                    <div className="carousel-caption">
                                        <div className="container carousel-content">
                                            <h6 className="text-secondary h4 animated fadeInUp">Best Ecommerce Shopping Platform</h6>
                                            <h1 className="text-white display-5 mb-4 animated fadeInRight text-capitalize">{banner.title}</h1>
                                            {banner.link && (
                                                <Link to={banner.link} className="ms-2">
                                                    <button type="button" className="px-4 py-sm-3 px-sm-5 btn btn-primary rounded-pill carousel-content-btn2 animated fadeInRight">
                                                        Shop Now
                                                    </button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                ) : null}
            </div>
            {/* Carousel End */}

            <Fact />
            <CategorySlider title="Maincategory" data={MaincategoryStateData.filter(x => x.active)} />
            <About title="Home" />
            <CategorySlider title="Subcategory" data={SubcategoryStateData.filter(x => x.active)} />
            <Features />
            {MaincategoryStateData.filter(x => x.active).map((item) => {
                return <Product key={item._id} title={item.name} data={ProductStateData.filter(x => x.active && x.maincategory?.name === item.name).slice(0, 6)} />
            })}
            <ProductSlider data={ProductStateData.filter(x => x.active)} />
            <CategorySlider title="Brand" data={BrandStateData.filter(x => x.active)} />
            <Testimonial />
        </>
    )
}