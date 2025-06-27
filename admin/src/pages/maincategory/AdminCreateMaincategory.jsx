import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'


import formValidator from '../../FormValidators/formValidator'
import imageValidator from '../../FormValidators/imageValidator'

import { createMaincategory, getMaincategory } from "../../Redux/ActionCreartors/MaincategoryActionCreators"

export default function AdminCreateMaincategory() {
    let [data, setData] = useState({
        name: "",
        pic: "",
        active: true
    })
    let [error, setError] = useState({
        name: "Name Field is Mendatory",
        pic: "Pic Field is Mendatory"
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
            let item = MaincategoryStateData.find(x => x.name.toLocaleLowerCase() === data.name.toLocaleLowerCase())
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
                // dispatch(createMaincategory({ ...data }))

                // //in case of real backend and form has a file field
                let formData = new FormData()
                formData.append("name", data.name)
                formData.append("pic", data.pic)
                formData.append("active", data.active)
                dispatch(createMaincategory(formData))

                navigate("/maincategory")
            }
        }
    }

    useEffect(() => {
        (() => {
            dispatch(getMaincategory())
        })()
    }, [MaincategoryStateData.length])

    return (
        <>
            <div className="container">
                <h5 className="text-center text-light bg-primary p-2">Create Maincategory <Link to="/maincategory"><i className="fa fa-arrow-left text-light float-end pt-1"></i></Link></h5>
                {/* Form */}
                <div className="card mt-3 shadow-sm p-4">
                    <form onSubmit={postSubmit}>
                        <div className="mb-3">
                            <label>Name*</label>
                            <input type="text" name="name" onChange={getInputData} placeholder='Maincategory Name' className={`form-control border-3 ${show && error.name ? 'border-danger' : 'border-primary'}`} />
                            {show && error.name ? <p className='text-danger text-capitalize'>{error.name}</p> : null}
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label>Pic*</label>
                                <input type="file" name="pic" onChange={getInputData} className={`form-control border-3 ${show && error.pic ? 'border-danger' : 'border-primary'}`} />
                                {show && error.pic ? <p className='text-danger text-capitalize'>{error.pic}</p> : null}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Active*</label>
                                <select name="active" onChange={getInputData} className='form-select border-3 border-primary'>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-3">
                            <button type="submit" className='btn btn-primary w-100 -text-light'>Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
