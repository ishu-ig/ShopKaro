import React, { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux';

import $ from 'jquery';                                         // Import jQuery
import 'datatables.net-dt/css/dataTables.dataTables.min.css';   // Import DataTables styles
import 'datatables.net';

import { deleteProduct, getProduct } from "../../Redux/ActionCreartors/ProductActionCreators"
export default function AdminProduct() {
    let ProductStateData = useSelector(state => state.ProductStateData)
    let dispatch = useDispatch()

    // function deleteRecord(id) {
    //     if (window.confirm("Are You Sure to Delete that Item : ")) {
    //         dispatch(deleteProduct({ id: id }))
    //         getAPIData()
    //     }
    // }
    function deleteRecord(_id) {
        if (window.confirm("Are You Sure to Delete that Item : ")) {
            dispatch(deleteProduct({ _id: _id }))
            getAPIData()
        }
    }
    function getAPIData() {
        dispatch(getProduct())
        let time = setTimeout(() => {
            $('#DataTable').DataTable()
        }, 500)
        return time
    }
    useEffect(() => {
        let time = getAPIData()
        return () => clearTimeout(time)
    }, [ProductStateData.length])
    return (
        <>
            <div>
                <h5 className='bg-primary text-light text-center p-3'>Product <Link to="/product/create"><i className='fa fa-plus text-light float-end'></i></Link></h5>
                <div className="table-responsive">
                    <table id='DataTable' className="table table-striped table-hover table-bordered text-center">
                        <thead className="text-light" style={{ backgroundColor: "#1F2A40" }}>
                            <tr>
                                <th>Id</th>
                                <th>Name</th>
                                <th>Maincategory</th>
                                <th>Subcategory</th>
                                <th>Brand</th>
                                <th>Color</th>
                                <th>Size</th>
                                <th>Base Price</th>
                                <th>Discount</th>
                                <th>Final Price</th>
                                <th>Stock</th>
                                <th>Stock Quantity</th>
                                <th>Pic</th>
                                <th>Active</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                ProductStateData.map((item) => {
                                    return <tr key={item._id}>
                                        {/* return <tr key={item._id}> */}
                                        {/* <td>{item.id}</td> */}
                                        <td>{item._id}</td>
                                        <td>{item.name}</td>
                                        {/* <td>{item.maincategory}</td>
                                                <td>{item.subcategory}</td>
                                                <td>{item.brand}</td> */}
                                        <td>{item.maincategory?.name}</td>
                                        <td>{item.subcategory?.name}</td>
                                        <td>{item.brand?.name}</td>
                                        <td>{item.color}</td>
                                        <td>{item.size}</td>
                                        <td>&#8377;{item.basePrice}</td>
                                        <td>{item.discount}</td>
                                        <td>&#8377;{item.finalPrice}</td>
                                        <td className={`${item.active ? 'text-success' : 'text-danger'}`}>{item.stock ? "Yes" : "No"}</td>
                                        <td>{item.stockQuantity}</td>
                                        <td>
                                            <div className='product-images'>
                                                {item.pic?.map((p, index) => {
                                                    return <Link key={index} to={`${process.env.REACT_APP_BACKEND_SERVER}/${p}`} target='_blank' rel='noreferrer'>
                                                        <img src={`${process.env.REACT_APP_BACKEND_SERVER}/${p}`} height={50} width={80} alt="Product Pic" className='me-2 mb-2' />
                                                    </Link>
                                                })}
                                            </div>
                                        </td>
                                        <td className={`${item.active ? 'text-success' : 'text-danger'}`}>{item.active ? "Yes" : "No"}</td>
                                        {/* <td><Link to={`/admin/product/update/${item.id}`} className='btn btn-primary'><i className='fa fa-edit fs-4'></i></Link></td>
                                                <td>{localStorage.getItem("role")==="Super Admin"?<button className='btn btn-danger' onClick={() => deleteRecord(item.id)}><i className='fa fa-trash fs-4'></i></button>:null}</td> */}
                                        <td><Link to={`/product/update/${item._id}`} className='btn btn-primary'><i className='fa fa-edit fs-4'></i></Link></td>
                                        <td><button className='btn btn-danger' onClick={() => deleteRecord(item._id)}><i className='fa fa-trash fs-4'></i></button></td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
