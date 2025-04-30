import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux';

import $ from 'jquery';                                         // Import jQuery
import 'datatables.net-dt/css/dataTables.dataTables.min.css';   // Import DataTables styles
import 'datatables.net';

import { deleteContactUs, getContactUs, updateContactUs } from "../../Redux/ActionCreartors/ContactUsActionCreators"
import { Link } from 'react-router-dom';
export default function AdminContactUs() {
    let [flag, setFlag] = useState(false)
    let ContactUsStateData = useSelector(state => state.ContactUsStateData)
    let dispatch = useDispatch()

    function deleteRecord(_id) {
        if (window.confirm("Are You Sure to Delete that Item : ")) {
            dispatch(deleteContactUs({ _id: _id }))
            getAPIData()
        }
    }

    function updateRecord(_id) {
        if (window.confirm("Are You Sure to Update the Status : ")) {
            let item = ContactUsStateData.find(x => x._id === _id)
            let index = ContactUsStateData.findIndex(x => x._id === _id)
            dispatch(updateContactUs({ ...item, active: !item.active }))
            ContactUsStateData[index].active = !item.active
            setFlag(!flag)
        }
    }

    function getAPIData() {
        dispatch(getContactUs())
        let time = setTimeout(() => {
            $('#DataTable').DataTable()
        }, 500)
        return time
    }
    useEffect(() => {
        let time = getAPIData()
        return () => clearTimeout(time)
    }, [ContactUsStateData.length])
    return (
        <>
            <div>
                <h5 className='bg-primary text-light text-center p-3'>Queries</h5>
                <div className="table-responsive">
                    <table id='DataTable' className="table table-striped table-hover table-bordered text-center">
                        <thead className="text-light" style={{ backgroundColor: "#1F2A40" }}>
                            <tr>
                                <th>Id</th>

                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Subject</th>
                                <th>Date</th>
                                <th>Active</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                ContactUsStateData.map((item) => {
                                    return <tr key={item._id}>
                                        {/* return <tr key={item._id}> */}
                                        {/* <td>{item.id}</td> */}
                                        <td>{item._id}</td>
                                        <td>{item.name}</td>
                                        <td>{item.email}</td>
                                        <td>{item.phone}</td>
                                        <td>{item.subject}</td>
                                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                                        {/* <td className={`${item.active ? 'text-success' : 'text-danger'}`} onClick={() => updateRecord(item.id)} style={{ cursor: "pointer" }}>{item.active ? "Yes" : "No"}</td> */}
                                        <td className={`${item.active ? 'text-success' : 'text-danger'}`} onClick={() => updateRecord(item._id)} style={{ cursor: "pointer" }}>{item.active ? "Yes" : "No"}</td>
                                        {/* <td><Link to={`/admin/contactus/show/${item.id}`} className='btn btn-primary'><i className='fa fa-eye fs-4'></i></Link></td> */}
                                        <td><Link to={`/contactus/view/${item._id}`} className='btn btn-primary text-light'><i className='fa fa-eye fs-4'></i></Link></td>
                                        {/* <td>
                                                    {!item.active && localStorage.getItem("role") === "Super Admin" ? <button className='btn btn-danger' onClick={() => deleteRecord(item.id)}><i className='fa fa-trash fs-4'></i></button> : null}
                                                </td> */}
                                        <td>
                                            {!item.active && localStorage.getItem("role") === "Super Admin" ? <button className='btn btn-danger' onClick={() => deleteRecord(item._id)}><i className='fa fa-trash fs-4'></i></button> : null}
                                        </td>

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
