import React, { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux';

import $ from 'jquery';                                         // Import jQuery
import 'datatables.net-dt/css/dataTables.dataTables.min.css';   // Import DataTables styles
import 'datatables.net';

import { deleteTestimonial, getTestimonial } from "../../Redux/ActionCreartors/TestimonialActionCreators"
export default function AdminTestimonial() {
    let TestimonialStateData = useSelector(state => state.TestimonialStateData)
    let dispatch = useDispatch()

    // function deleteRecord(id) {
    //     if (window.confirm("Are You Sure to Delete that Item : ")) {
    //         dispatch(deleteTestimonial({ id: id }))
    //         getAPIData()
    //     }
    // }
    function deleteRecord(_id) {
        if (window.confirm("Are You Sure to Delete that Item : ")) {
            dispatch(deleteTestimonial({ _id: _id }))
            getAPIData()
        }
    }
    function getAPIData() {
        dispatch(getTestimonial())
        let time = setTimeout(() => {
            $('#DataTable').DataTable()
        }, 500)
        return time
    }
    useEffect(() => {
        let time = getAPIData()
        return () => clearTimeout(time)
    }, [TestimonialStateData.length])
    return (
        <>

            <div>
                <h5 className='bg-primary text-light text-center p-3'>Testimonial <Link to="/testimonial/create"><i className='fa fa-plus text-light float-end'></i></Link></h5>
                <div className="table-responsive">
                    <table id='DataTable' className="table table-striped table-hover table-bordered text-center">
                        <thead className="text-light" style={{ backgroundColor: "#1F2A40" }}>
                            <tr>
                                <th>Id</th>

                                <th>Name</th>
                                <th>Pic</th>
                                <th>Active</th>
                                <th>Message</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                TestimonialStateData.map((item) => {
                                    return <tr key={item._id}>
                                        <td>{item._id}</td>
                                        <td>{item.name}</td>
                                        <td>
                                            <Link to={`${process.env.REACT_APP_BACKEND_SERVER}/${item.pic}`} target='_blank' rel='noreferrer'>
                                                <img src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.pic}`} height={50} width={80} alt="" />
                                            </Link>
                                        </td>
                                        <td className={`${item.active ? 'text-success' : 'text-danger'}`}>{item.active ? "Yes" : "No"}</td>
                                        <td>
                                            <div className='testimonial-message'>{item.message}</div>
                                        </td>
                                        {/* <td><Link to={`/admin/testimonial/update/${item.id}`} className='btn btn-primary'><i className='fa fa-edit fs-4'></i></Link></td>
                                                <td>{localStorage.getItem("role")==="Super Admin"?<button className='btn btn-danger' onClick={() => deleteRecord(item.id)}><i className='fa fa-trash fs-4'></i></button>:null}</td> */}
                                        <td><Link to={`/testimonial/update/${item._id}`} className='btn btn-primary text-light'><i className='fa fa-edit fs-4'></i></Link></td>
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
