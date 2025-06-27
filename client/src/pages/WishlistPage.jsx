import React, { useEffect, useState } from 'react'
import HeroSection from '../Components/HeroSection'
import { useDispatch, useSelector } from 'react-redux'
import { deleteWishlist, getWishlist } from '../Redux/ActionCreartors/WishlistActionCreators'
import { Link } from 'react-router-dom'

export default function WishlistPage() {
    let [wishlist, setWishlist] = useState([])
    let WishlistStateData = useSelector(state => state.WishlistStateData)
    let dispatch = useDispatch()

    function deleteRecord(_id) {
        if (window.confirm("Are You Sure To Delete This Item")) {
            dispatch(deleteWishlist({ _id: _id }))
            getAPIData()
        }
    }
    function getAPIData() {
        dispatch(getWishlist())
        if (WishlistStateData.length)
            setWishlist(WishlistStateData)
        else
            setWishlist([])
    }
    useEffect(() => {
        (() => {
            getAPIData()
        })()
    }, [WishlistStateData.length])
    return (
        <>
            <HeroSection title="My WishList" />
            <h5 className=' text-light text-center bg-primary p-2 mt-3 mx-5'>Wishlist</h5>
            <div className="container-fluid mt-3 mb-5 pb-3">

                <div className='mx-5'>
                    {
                        wishlist.length ?
                            <>
                                <table className='table table-bordered border-2 table-striped align-middle'>
                                    <thead className="table-primary text-center">
                                        <tr>
                                            <th></th>
                                            <th>Name</th>
                                            <th>Brand</th>
                                            <th>Color</th>
                                            <th>Size</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-dark'>
                                        {
                                            wishlist.map((item) => {
                                                return <tr key={item.id}>
                                                    <td className='align-content-center'>
                                                        <Link to={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`} target='_blank' rel='noreferrer'>
                                                            <img src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.product?.pic}`} height={50} width={50} alt="Product image" /></Link>
                                                    </td>
                                                    <th>{item.product?.name}</th>
                                                    <th>{item.product?.brand?.name}</th>
                                                    <th>{item.product?.color}</th>
                                                    <th>{item.product?.size}</th>
                                                    <td>&#8377;{item.product?.finalPrice}</td>
                                                    <td>{item.product?.stockQuantity === 0 ? "Out Of Stock" : `${item.product?.stockQuantity} Left in the Stock`}</td>
                                                    <td><Link to={`/product/${item.product?._id}`} className='btn btn-primary'><i className='fa fa-shopping-cart text-light fs-5'></i></Link></td>
                                                    <td><button className='btn btn-primary' onClick={() => deleteRecord(item._id)}><i className='fa fa-trash text-danger fs-5'></i></button></td>
                                                </tr>
                                            })
                                        }
                                    </tbody>
                                </table>
                            </> :
                            <div className="py-5 text-center ">
                                <h3>No Item In Wishlist</h3>
                                <Link to="/shop" className="btn btn-primary" >Shop Now</Link>
                            </div>
                    }
                </div>
            </div>
        </>
    )
}
