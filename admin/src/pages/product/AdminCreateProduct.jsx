import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import formValidator from '../../FormValidators/formValidator'
import imageValidator from '../../FormValidators/imageValidator'

import { createProduct } from "../../Redux/ActionCreartors/ProductActionCreators"
import { getMaincategory } from "../../Redux/ActionCreartors/MaincategoryActionCreators"
import { getSubcategory } from "../../Redux/ActionCreartors/SubcategoryActionCreators"
import { getBrand } from "../../Redux/ActionCreartors/BrandActionCreators"

var rte

export default function AdminCreateProduct() {
    var refdiv = useRef(null);

    let [data, setData] = useState({
        name: "",
        maincategory: "",
        subcategory: "",
        brand: "",
        color: "",
        size: "",
        basePrice: 0,
        discount: 0,
        finalPrice: 0,
        stock: true,
        stockQuantity: 0,
        description: "",
        pic: [],
        active: true
    })
    let [error, setError] = useState({
        name: "Name Field is Mendatory",
        color: "Color Field is Mendatory",
        size: "Size Field is Mendatory",
        basePrice: "Base Price Field is Mendatory",
        discount: "Discount Field is Mendatory",
        stockQuantity: "Stock Quantity Field is Mendatory",
        pic: "Pic Field is Mendatory"
    })
    let [show, setShow] = useState(false)
    let navigate = useNavigate()

    let MaincategoryStateData = useSelector((state) => state.MaincategoryStateData)
    let SubcategoryStateData = useSelector((state) => state.SubcategoryStateData)
    let BrandStateData = useSelector((state) => state.BrandStateData)
    let dispatch = useDispatch()

    function getInputData(e) {
        let name = e.target.name
        let value = e.target.files ? e.target.files : e.target.value  //in case of real backend
        // let value = e.target.files ? Array.from(e.target.files).map(x => "product/" + x.name) : e.target.value

        if (name !== "active") {
            setError((old) => {
                return {
                    ...old,
                    [name]: e.target.files ? imageValidator(e) : formValidator(e)
                }
            })
        }
        setData((old) => {
            return {
                ...old,
                [name]: name === "active" || name === "stock" ? (value === "1" ? true : false) : value
            }
        })
    }
    function postSubmit(e) {
        e.preventDefault()
        let errorItem = Object.values(error).find(x => x !== "")
        if (errorItem)
            setShow(true)
        else {
            let bp = parseInt(data.basePrice)
            let d = parseInt(data.discount)
            let fp = parseInt(bp - bp * d / 100)
            let stockQuantity = parseInt(data.stockQuantity)

            // dispatch(createProduct({
            //     ...data,
            //     'maincategory': data.maincategory ? data.maincategory : MaincategoryStateData[0].name,
            //     'subcategory': data.subcategory ? data.subcategory : SubcategoryStateData[0].name,
            //     'brand': data.brand ? data.brand : BrandStateData[0].name,
            //     'basePrice': bp,
            //     'discount': d,
            //     'finalPrice': fp,
            //     'stockQuantity': stockQuantity,
            //     'description': rte.getHTMLCode()
            // }))

            // //in case of real backend and form has a file field
            let formData = new FormData()
            formData.append("name", data.name)
            formData.append("maincategory", data.maincategory ? data.maincategory : MaincategoryStateData[0]._id)
            formData.append("subcategory", data.subcategory ? data.subcategory : SubcategoryStateData[0]._id)
            formData.append("brand", data.brand ? data.brand : BrandStateData[0]._id)
            formData.append("color", data.color)
            formData.append("size", data.size)
            formData.append("basePrice", bp)
            formData.append("discount", d)
            formData.append("finalPrice", fp)
            formData.append("stock", data.stock)
            formData.append("stockQuantity", stockQuantity)
            formData.append("description", rte.getHTMLCode())
            formData.append("active", data.active)
            Array.from(data.pic).forEach((x) => {
                formData.append("pic", x)
            })
            dispatch(createProduct(formData))

            navigate("/product")
        }
    }

    useEffect(() => {
        rte = new window.RichTextEditor(refdiv.current);
        rte.setHTMLCode("");
    }, [])
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
    return (
        <>
            <div>
                <h5 className='bg-primary text-light text-center p-2'>Product <Link to="/admin/product"><i className='fa fa-arrow-left text-light float-end'></i></Link></h5>
                <div className="card mt-3 shadow-sm p-4">
                <form onSubmit={postSubmit}>
                    <div className="mb-3">
                        <label>Name*</label>
                        <input type="text" name="name" onChange={getInputData} placeholder='Product Name' className={`form-control border-3 ${show && error.name ? 'border-danger' : 'border-primary'}`} />
                        {show && error.name ? <p className='text-danger text-capitalize'>{error.name}</p> : null}
                    </div>

                    <div className="row">
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label>Maincategory*</label>
                            <select name="maincategory" onChange={getInputData} className='form-select border-3 border-primary'>
                                {MaincategoryStateData && MaincategoryStateData.filter((x) => x.active).map((item) => {
                                    // return <option key={item._id}>{item.name}</option>
                                    return <option key={item._id} value={item._id}>{item.name}</option>
                                })}
                            </select>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label>Subcategory*</label>
                            <select name="subcategory" onChange={getInputData} className='form-select border-3 border-primary'>
                                {SubcategoryStateData && SubcategoryStateData.filter((x) => x.active).map((item) => {
                                    // return <option key={item._id}>{item.name}</option>
                                    return <option key={item._id} value={item._id}>{item.name}</option>
                                })}
                            </select>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label>Brand*</label>
                            <select name="brand" onChange={getInputData} className='form-select border-3 border-primary'>
                                {BrandStateData && BrandStateData.filter((x) => x.active).map((item) => {
                                    // return <option key={item._id}>{item.name}</option>
                                    return <option key={item._id} value={item._id}>{item.name}</option>
                                })}
                            </select>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label>Active*</label>
                            <select name="active" onChange={getInputData} className='form-select border-3 border-primary'>
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label>Color*</label>
                            <input type="text" name="color" onChange={getInputData} placeholder='Product Color' className={`form-control border-3 ${show && error.color ? 'border-danger' : 'border-primary'}`} />
                            {show && error.color ? <p className='text-danger text-capitalize'>{error.color}</p> : null}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>Size*</label>
                            <input type="text" name="size" onChange={getInputData} placeholder='Product Size' className={`form-control border-3 ${show && error.size ? 'border-danger' : 'border-primary'}`} />
                            {show && error.size ? <p className='text-danger text-capitalize'>{error.size}</p> : null}
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label>Base Price*</label>
                            <input type="number" name="basePrice" onChange={getInputData} placeholder='Product Base Price' className={`form-control border-3 ${show && error.basePrice ? 'border-danger' : 'border-primary'}`} />
                            {show && error.basePrice ? <p className='text-danger text-capitalize'>{error.basePrice}</p> : null}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>Discount*</label>
                            <input type="number" name="discount" onChange={getInputData} placeholder='Product Discount' className={`form-control border-3 ${show && error.discount ? 'border-danger' : 'border-primary'}`} />
                            {show && error.discount ? <p className='text-danger text-capitalize'>{error.discount}</p> : null}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label>Description*</label>
                        <div ref={refdiv} className='border-3 border-primary'></div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label>Stock Quantity*</label>
                            <input type="number" name="stockQuantity" onChange={getInputData} placeholder='Product Stock Quantity' className={`form-control border-3 ${show && error.stockQuantity ? 'border-danger' : 'border-primary'}`} />
                            {show && error.stockQuantity ? <p className='text-danger text-capitalize'>{error.stockQuantity}</p> : null}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>Pic*</label>
                            <input type="file" name="pic" multiple onChange={getInputData} className={`form-control border-3 ${show && error.pic ? 'border-danger' : 'border-primary'}`} />
                            {show && error.pic ? typeof error.pic === "string" ? <p className='text-danger text-capitalize'>{error.pic}</p> :
                                error.pic.map((err, index) => {
                                    return <p key={index} className='text-danger text-capitalize'>{err}</p>
                                }) : null}
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label>Active*</label>
                            <select name="active" onChange={getInputData} className='form-select border-3 border-primary'>
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-3">
                        <button type="submit" className='btn btn-primary w-100'>Create</button>
                    </div>
                </form>
                </div>
            </div>
        </>
    )
}
