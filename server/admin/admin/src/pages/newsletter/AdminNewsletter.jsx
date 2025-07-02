import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux';

import $ from 'jquery';                                         // Import jQuery
import 'datatables.net-dt/css/dataTables.dataTables.min.css';   // Import DataTables styles
import 'datatables.net';

import { deleteNewsletter, getNewsletter, updateNewsletter } from "../../Redux/ActionCreartors/NewsletterActionCreators"
export default function AdminNewsletter() {
    let NewsletterStateData = useSelector(state => state.NewsletterStateData)
    let [flag, setFlag] = useState(false)
    let dispatch = useDispatch()

    function deleteRecord(_id) {
        if (window.confirm("Are You Sure to Delete that Item : ")) {
            dispatch(deleteNewsletter({ _id: _id }))
            getAPIData()
        }
    }

    function updateRecord(_id) {
        if (window.confirm("Are You Sure to Update the Status : ")) {
            let item = NewsletterStateData.find(x => x._id === _id)
            let index = NewsletterStateData.findIndex(x => x._id === _id)
            dispatch(updateNewsletter({ ...item, active: !item.active }))
            NewsletterStateData[index].active = !item.active
            setFlag(!flag)
        }
    }

    function getAPIData() {
        dispatch(getNewsletter())
        let time = setTimeout(() => {
            $('#DataTable').DataTable()
        }, 500)
        return time
    }
    useEffect(() => {
        let time = getAPIData()
        return () => clearTimeout(time)
    }, [NewsletterStateData.length])
    return (
        <>
            <div>
                <h5 className='bg-primary text-light text-center p-3'>Newsletter </h5>
                <div className="table-responsive">
                    <table id='DataTable' className="table table-striped table-hover table-bordered text-center">
                        <thead className="text-light" style={{ backgroundColor: "#1F2A40" }}>
                            <tr>
                                <th>Id</th>

                                <th>Email</th>
                                <th>Active</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                NewsletterStateData.map((item) => {
                                    return <tr key={item._id}>
                                        {/* return <tr key={item._id}> */}
                                        {/* <td>{item.id}</td> */}
                                        <td>{item._id}</td>
                                        <td>{item.email}</td>
                                        {/* <td className={`${item.active ? 'text-success' : 'text-danger'}`} onClick={() => updateRecord(item.id)} style={{ cursor: "pointer" }}>{item.active ? "Yes" : "No"}</td> */}
                                        <td className={`${item.active ? 'text-success' : 'text-danger'}`} onClick={() => updateRecord(item._id)} style={{ cursor: "pointer" }}>{item.active ? "Yes" : "No"}</td>
                                        {/* <td>{localStorage.getItem("role") === "Super Admin" ? <button className='btn btn-danger' onClick={() => deleteRecord(item.id)}><i className='fa fa-trash fs-4'></i></button> : null}</td> */}
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
