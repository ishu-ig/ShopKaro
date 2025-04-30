import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'


import formValidator from '../../FormValidators/formValidator'
import imageValidator from '../../FormValidators/imageValidator'

import { getMaincategory, updateMaincategory } from "../../Redux/ActionCreartors/MaincategoryActionCreators"
export default function AdminUpdateMaincategory() {
    let { _id } = useParams()  //in case of real backend
    // let { id } = useParams()
    let [data, setData] = useState({
        name: "",
        pic: "",
        active: true
    })
    let [error, setError] = useState({
        name: "",
        pic: ""
    })
    let [show, setShow] = useState(false)
    let navigate = useNavigate()

    let MaincategoryStateData = useSelector(state => state.MaincategoryStateData)
    let dispatch = useDispatch()

    function getInputData(e) {
        let name = e.target.name
        let value = e.target.files ? e.target.files[0] : e.target.value  //in case of real backend
        // let value = e.target.files ? "maincategory/" + e.target.files[0].name : e.target.value

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
                [name]: name === "active" ? (value === "1" ? true : false) : value
            }
        })
    }
    function postSubmit(e) {
        e.preventDefault()
        let errorItem = Object.values(error).find(x => x !== "")
        if (errorItem)
            setShow(true)
        else {
            let item = MaincategoryStateData.find(x => x._id !== _id && x.name.toLocaleLowerCase() === data.name.toLocaleLowerCase())  // in case of real backend
            // let item = MaincategoryStateData.find(x => x.id !== id && x.name.toLocaleLowerCase() === data.name.toLocaleLowerCase())
            if (item) {
                setShow(true)
                setError((old) => {
                    return {
                        ...old,
                        "name": "Maincategory Already Exist"
                    }
                })
            }
            else {
                // dispatch(updateMaincategory({ ...data }))

                // //in case of real backend and form has a file field
                let formData = new FormData()
                formData.append("_id", data._id)  //use id in case of RDBMS and use _id in case of mongodb
                formData.append("name", data.name)
                formData.append("pic", data.pic)
                formData.append("active", data.active)
                dispatch(updateMaincategory(formData))
                navigate("/maincategory")
            }
        }
    }

    useEffect(() => {
        (() => {
            dispatch(getMaincategory())
            if (MaincategoryStateData.length) {
                // let item = MaincategoryStateData.find(x => x.id === id)
                let item = MaincategoryStateData.find(x => x._id === _id) //in case of real backend
                if (item)
                    setData({ ...item })
            }
        })()
    }, [MaincategoryStateData.length])

    return (
        <>
            <div className="container">
                <h5 className="text-center text-light bg-primary p-2">Update Maincategory <Link to="/maincategory"><i className="fa fa-arrow-left text-light float-end pt-1"></i></Link></h5>
                {/* Form */}
                <div className="card mt-3 shadow-sm p-4">
                    <form onSubmit={postSubmit}>
                        <div className="mb-3">
                            <label>Name</label>
                            <input type="text" name="name" value={data.name} onChange={getInputData} placeholder='Maincategory Name' className={`form-control border-3 ${show && error.name ? 'border-danger' : 'border-primary'}`} />
                            {show && error.name ? <p className='text-danger text-capitalize'>{error.name}</p> : null}
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label>Pic</label>
                                <input type="file" name="pic" onChange={getInputData} className={`form-control border-3 ${show && error.pic ? 'border-danger' : 'border-primary'}`} />
                                {show && error.pic ? <p className='text-danger text-capitalize'>{error.pic}</p> : null}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Active</label>
                                <select name="active" value={data.active ? "1" : "0"} onChange={getInputData} className='form-select border-3 border-primary'>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-3">
                            <button type="submit" className='btn btn-primary w-100 text-light'>Update</button>
                        </div>
                    </form>

                </div>
            </div>
        </>
    )
}
