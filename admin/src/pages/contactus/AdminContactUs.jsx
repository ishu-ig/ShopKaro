import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net';
import { deleteContactUs, getContactUs, updateContactUs } from "../../Redux/ActionCreators/ContactUsActionCreators"

export default function AdminContactUs() {
    const [flag, setFlag] = useState(false)
    const ContactUsStateData = useSelector(state => state.ContactUsStateData)
    const dispatch = useDispatch()

    function deleteRecord(_id) {
        if (window.confirm("Are you sure you want to delete this query?")) {
            dispatch(deleteContactUs({ _id }))
            getAPIData()
        }
    }

    function updateRecord(_id) {
        if (window.confirm("Are you sure you want to update the status?")) {
            const item = ContactUsStateData.find(x => x._id === _id)
            const index = ContactUsStateData.findIndex(x => x._id === _id)
            dispatch(updateContactUs({ ...item, active: !item.active }))
            ContactUsStateData[index].active = !item.active
            setFlag(!flag)
        }
    }

    function getAPIData() {
        dispatch(getContactUs())
        const time = setTimeout(() => {
            if (!$.fn.DataTable.isDataTable('#DataTable')) {
                $('#DataTable').DataTable({ responsive: true, order: [[5, 'desc']] })
            }
        }, 500)
        return time
    }

    useEffect(() => {
        const time = getAPIData()
        return () => clearTimeout(time)
    }, [ContactUsStateData.length])

    return (
        <div className="fade-in-up">
            <div className="page-header mb-4">
                <h5 className='text-light bg-primary'><i className="fas fa-headset me-2"></i>Customer Queries</h5>
                <span style={{ fontSize: "14px", background: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: "20px" }}>
                    {ContactUsStateData.length} queries
                </span>
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table id='DataTable' className="table" style={{ width: "100%" }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Subject</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>View</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ContactUsStateData.map((item) => (
                                <tr key={item._id}>
                                    <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-muted)", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {item._id}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                                    <td style={{ fontSize: "13px" }}>{item.email}</td>
                                    <td style={{ fontSize: "13px", whiteSpace: "nowrap" }}>{item.phone}</td>
                                    <td style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.subject}</td>
                                    <td style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span
                                            className={`badge-status ${item.active ? "success" : "danger"}`}
                                            onClick={() => updateRecord(item._id)}
                                            style={{ cursor: "pointer" }}
                                            title="Click to toggle status"
                                        >
                                            <i className={`fas fa-${item.active ? "check-circle" : "times-circle"}`}></i>
                                            {item.active ? "Pending" : "Resolved"}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/contactus/view/${item._id}`} className='btn btn-primary btn-sm text-light'>
                                            <i className='fas fa-eye'></i>
                                        </Link>
                                    </td>
                                    <td>
                                        {!item.active && localStorage.getItem("role") === "Super Admin" ? (
                                            <button className='btn btn-danger btn-sm' onClick={() => deleteRecord(item._id)}>
                                                <i className='fas fa-trash'></i>
                                            </button>
                                        ) : <span style={{ color: "var(--border)" }}>—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}