import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import $ from 'jquery';                                         // Import jQuery
import 'datatables.net-dt/css/dataTables.dataTables.min.css';   // Import DataTables styles
import 'datatables.net';

export default function AdminUser() {
    let [UserStateData, setUserStateData] = useState([])

    // async function deleteRecord(_id) {
    async function deleteRecord(_id) {
        if (window.confirm("Are You Sure to Delete that Item : ")) {
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/${_id}`, {
                // let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/user/${id}`, {
                method: "DELETE",
                headers: {
                    "content-type": "application/json",
                    "authorization": localStorage.getItem("token")
                }
            })
            response = await response.json()
            getAPIData()
        }
    }

    async function updateRecord(_id) {
        if (window.confirm("Are You Sure to Update the Status : ")) {
            let item = UserStateData.find(x => x._id === _id)
            let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user/${_id}`, {
                // let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/user/${id}`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json",
                    "authorization": localStorage.getItem("token")
                },
                body: JSON.stringify({ ...item, active: !item?.active })
            })
            response = await response.json()
            getAPIData()
        }
    }
    async function getAPIData() {
        let response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/api/user`, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                "authorization": localStorage.getItem("token")
            }
        })
        response = await response.json()
        setUserStateData(response.data)
        let time = setTimeout(() => {
            $('#DataTable').DataTable()
        }, 500)
        return time
    }
    useEffect(() => {
        let time = getAPIData()
        return () => clearTimeout(time)
    }, [])
    return (
        <>
            <div>
                <h5 className='bg-primary text-light text-center p-2'>User {localStorage.getItem("role") === "Super Admin" ? <Link to="/admin/user/create"><i className='fa fa-plus text-light float-end'></i></Link> : null}</h5>
                <div className="table-responsive">
                    <table id='DataTable' className="table table-striped table-hover table-bordered text-center">
                        <thead className="text-light" style={{ backgroundColor: "#1F2A40" }}>
                            <tr>
                                <th>Id</th>

                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Active</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                UserStateData.map((item) => {
                                    return <tr key={item?._id}>
                                        {/* return <tr key={item?._id}> */}
                                        {/* <td>{item?.id}</td> */}
                                        <td>{item?._id}</td>
                                        <td>{item?.name}</td>
                                        <td>{item?.username}</td>
                                        <td>{item?.email}</td>
                                        <td>{item?.phone}</td>
                                        <td>{item?.role}</td>
                                        <td className={`${item?.active ? 'text-success' : 'text-danger'}`} onClick={() => updateRecord(item?.id)} style={{ cursor: "pointer" }}>{item?.active ? "Yes" : "No"}</td>
                                        {/* <td>{localStorage.getItem("role") === "Super Admin" && item?.role !== "Buyer" ? <Link to={`/admin/user/update/${item?.id}`} className='btn btn-primary'><i className='fa fa-edit fs-4'></i></Link> : null}</td>
                                                <td>{localStorage.getItem("role") === "Super Admin" ? <button className='btn btn-danger' onClick={() => deleteRecord(item?.id)}><i className='fa fa-trash fs-4'></i></button> : null}</td> */}
                                        <td><Link to={`/admin/user/update/${item?._id}`} className='btn btn-primary'><i className='fa fa-edit fs-4'></i></Link></td>
                                        <td><button className='btn btn-danger' onClick={() => deleteRecord(item?._id)}><i className='fa fa-trash fs-4'></i></button></td>
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
