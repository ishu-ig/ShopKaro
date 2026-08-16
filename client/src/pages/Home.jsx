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
            {/* Carousel Start */}
            <div className="container-fluid px-0 position-relative" style={{ overflow: 'hidden' }}>
                {activeBanners.length > 0 ? (
                    <div id="carouselId" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="5000">
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
                            {activeBanners.map((banner, index) => {
                                const bannerUrl = banner.link || "/shop";
                                const isExternal = /^https?:\/\//i.test(bannerUrl);

                                return (
                                <div key={banner._id} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                                    <div className="position-relative w-100" style={{ minHeight: "360px", height: "clamp(380px, 64vh, 640px)", overflow: "hidden" }}>
                                        {isExternal ? (
                                            <a href={bannerUrl} target="_blank" rel="noopener noreferrer" className="d-block w-100 h-100">
                                                <img
                                                    src={banner.pic}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        objectPosition: "center center",
                                                        transform: "scale(1.02)",
                                                        transition: "transform 7s ease"
                                                    }}
                                                    alt={banner.title}
                                                    onError={(e) => { e.currentTarget.src = "/img/banner1.jpg"; }}
                                                />
                                            </a>
                                        ) : (
                                            <Link to={bannerUrl} className="d-block w-100 h-100">
                                                <img
                                                    src={banner.pic}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        objectPosition: "center center",
                                                        transform: "scale(1.02)",
                                                        transition: "transform 7s ease"
                                                    }}
                                                    alt={banner.title}
                                                    onError={(e) => { e.currentTarget.src = "/img/banner1.jpg"; }}
                                                />
                                            </Link>
                                        )}
                                    </div>
                                    <div className="carousel-caption d-flex align-items-center" style={{ pointerEvents: "none" }}>
                                        <div className="container px-3 px-sm-4 px-md-5" style={{ pointerEvents: "auto" }}>
                                            <div className="col-12 col-sm-10 col-md-9 col-lg-7 text-start" style={{ animation: "skFadeSlideUp 0.8s ease-out" }}>
                                                <div
                                                    className="d-inline-flex align-items-center gap-2 px-2 px-sm-3 py-1 mb-2 mb-sm-3 rounded-pill"
                                                    style={{
                                                        background: "rgba(201,168,76,0.2)",
                                                        border: "1px solid rgba(201,168,76,0.45)",
                                                        color: "#e8c873",
                                                        fontSize: "clamp(0.68rem, 2.2vw, 0.82rem)",
                                                        fontWeight: 700,
                                                        letterSpacing: "0.12em",
                                                        textTransform: "uppercase",
                                                    }}
                                                >
                                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a84c", boxShadow: "0 0 6px #c9a84c", flexShrink: 0 }}></span>
                                                    Curated Luxury Collection
                                                </div>
                                                <h1
                                                    className="text-white mb-3 mb-sm-4 text-capitalize"
                                                    style={{
                                                        fontFamily: "'Playfair Display', serif",
                                                        fontWeight: 800,
                                                        fontSize: "clamp(1.6rem, 4.8vw, 3.5rem)",
                                                        lineHeight: 1.18,
                                                        textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {banner.title}
                                                </h1>
                                                <div className="d-flex flex-wrap gap-2 gap-sm-3 align-items-center">
                                                    {isExternal ? (
                                                        <a href={bannerUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                                            <button
                                                                type="button"
                                                                className="btn sk-btn-gold px-3 px-sm-4 py-2 py-sm-3 rounded-pill d-inline-flex align-items-center gap-2"
                                                                style={{
                                                                    background: "linear-gradient(135deg, #c9a84c, #e8c873)",
                                                                    color: "#070d14",
                                                                    fontWeight: 700,
                                                                    fontSize: "clamp(0.78rem, 2.2vw, 0.9rem)",
                                                                    letterSpacing: "0.06em",
                                                                    textTransform: "uppercase",
                                                                    boxShadow: "0 6px 20px rgba(201,168,76,0.35)",
                                                                    border: "none",
                                                                    transition: "all 0.3s ease",
                                                                }}
                                                            >
                                                                <span>Explore Collection</span>
                                                                <i className="fa fa-arrow-right" style={{ fontSize: "0.85em" }}></i>
                                                            </button>
                                                        </a>
                                                    ) : (
                                                        <Link to={bannerUrl} className="text-decoration-none">
                                                            <button
                                                                type="button"
                                                                className="btn sk-btn-gold px-3 px-sm-4 py-2 py-sm-3 rounded-pill d-inline-flex align-items-center gap-2"
                                                                style={{
                                                                    background: "linear-gradient(135deg, #c9a84c, #e8c873)",
                                                                    color: "#070d14",
                                                                    fontWeight: 700,
                                                                    fontSize: "clamp(0.78rem, 2.2vw, 0.9rem)",
                                                                    letterSpacing: "0.06em",
                                                                    textTransform: "uppercase",
                                                                    boxShadow: "0 6px 20px rgba(201,168,76,0.35)",
                                                                    border: "none",
                                                                    transition: "all 0.3s ease",
                                                                }}
                                                            >
                                                                <span>Explore Collection</span>
                                                                <i className="fa fa-arrow-right" style={{ fontSize: "0.85em" }}></i>
                                                            </button>
                                                        </Link>
                                                    )}
                                                    <Link to="/about" className="text-decoration-none">
                                                        <button
                                                            type="button"
                                                            className="btn px-3 px-sm-4 py-2 py-sm-3 rounded-pill text-white"
                                                            style={{
                                                                background: "rgba(255,255,255,0.1)",
                                                                border: "1px solid rgba(255,255,255,0.25)",
                                                                backdropFilter: "blur(8px)",
                                                                fontWeight: 600,
                                                                fontSize: "clamp(0.78rem, 2.2vw, 0.9rem)",
                                                                transition: "all 0.25s ease",
                                                            }}
                                                        >
                                                            Discover More
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
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
                ) : (
                    <div
                        className="py-4 py-sm-5 position-relative"
                        style={{
                            background: "linear-gradient(135deg, #070d14 0%, #0d1b2a 60%, #162236 100%)",
                            minHeight: "clamp(360px, 55vh, 480px)",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <div className="container px-3 px-sm-4 py-3 py-sm-4">
                            <div className="row align-items-center g-4">
                                <div className="col-12 col-md-10 col-lg-7 text-start">
                                    <div
                                        className="d-inline-flex align-items-center gap-2 px-2 px-sm-3 py-1 mb-2 mb-sm-3 rounded-pill"
                                        style={{
                                            background: "rgba(201,168,76,0.18)",
                                            border: "1px solid rgba(201,168,76,0.4)",
                                            color: "#e8c873",
                                            fontSize: "clamp(0.68rem, 2.2vw, 0.8rem)",
                                            fontWeight: 700,
                                            letterSpacing: "0.12em",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a84c", flexShrink: 0 }}></span>
                                        ShopKaro Exclusive Collection
                                    </div>
                                    <h1
                                        className="text-white mb-2 mb-sm-3"
                                        style={{
                                            fontFamily: "'Playfair Display', serif",
                                            fontWeight: 800,
                                            fontSize: "clamp(1.6rem, 4.8vw, 3.5rem)",
                                            lineHeight: 1.18,
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        Elevate Your Lifestyle With <span style={{ color: "#c9a84c", fontStyle: "italic" }}>Premium Quality</span>
                                    </h1>
                                    <p className="text-white-50 mb-3 mb-sm-4" style={{ fontSize: "clamp(0.88rem, 2.5vw, 1.05rem)", maxWidth: 540 }}>
                                        Discover verified luxury brands, handpicked fashion, and bespoke essentials delivered with care.
                                    </p>
                                    <div className="d-flex flex-wrap gap-2 gap-sm-3">
                                        <Link to="/shop" className="text-decoration-none">
                                            <button
                                                className="btn px-3 px-sm-4 py-2 py-sm-3 rounded-pill d-inline-flex align-items-center gap-2"
                                                style={{
                                                    background: "linear-gradient(135deg, #c9a84c, #e8c873)",
                                                    color: "#070d14",
                                                    fontWeight: 700,
                                                    fontSize: "clamp(0.78rem, 2.2vw, 0.9rem)",
                                                    border: "none",
                                                    boxShadow: "0 8px 25px rgba(201,168,76,0.35)",
                                                }}
                                            >
                                                <span>Shop All Products</span>
                                                <i className="fa fa-arrow-right" style={{ fontSize: "0.85em" }}></i>
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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