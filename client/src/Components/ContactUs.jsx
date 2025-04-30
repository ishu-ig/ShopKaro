import React, { useState } from "react";
import { useDispatch } from "react-redux";
import formValidator from "../FormValidator/formValidator";

import { createContactUs } from "../Redux/ActionCreartors/ContactUsActionCreators"

export default function ContactUs() {
  let [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  let [errorMessage, setErrorMessage] = useState({
    name: "Name Feild is Mentatory",
    email: "Email Feild is Mentatory",
    phone: "Phone Feild is Mentatory",
    subject: "Subject Feild is Mentatory",
    message: "Message Feild is Mentatory",
  })
  let [show, setShow] = useState(false)
  let [message, setMessage] = useState("")

  let dispatch = useDispatch()

  function getInputData(e) {
    let { name, value } = e.target
    setErrorMessage((old) => {
      return {
        ...old,
        [name]: formValidator(e)
      }
    })
    setData((old) => {
      return {
        ...old,
        [name]: value
      }
    })
  }
  function postData(e) {
    e.preventDefault()
    let error = Object.values(errorMessage).find((x) => x !== "")
    if (error) {
      setShow(true)
    }
    else {
      dispatch(createContactUs({ ...data, active: true, date: new Date }))
      setMessage("Thank to share Query With Us. Our Team contact You Soon")
      setData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      })
    }
  }

  return (
    <>
      <div className="container-fluid py-5 mb-5">
        <div className="container">
          <div className="text-center mx-auto pb-5 wow fadeIn" data-wow-delay=".3s" style={{ maxWidth: "600px" }} >
            <h5 className="text-primary">Get In Touch</h5>
            <h1 className="mb-3">Contact for any query</h1>
          </div>
          <div className="contact-detail position-relative p-5">
            <div className="row g-5 mb-5 justify-content-center">
              <div className="col-md-6 wow fadeIn" data-wow-delay=".3s">
                <div className="d-flex bg-light p-3 rounded">
                  <div
                    className="flex-shrink-0 btn-square bg-secondary rounded-circle" style={{ width: "64px", height: "64px" }}>
                    <i className="fas fa-map-marker-alt text-white fs-3"></i>
                  </div>
                  <div className="ms-3">
                    <h5 className="text-primary">Address</h5>
                    <a href="https://www.google.com/maps/place/DUCAT/@28.5798005,77.3120918,17z/data=!3m1!4b1!4m6!3m5!1s0x390ce5106f125cfb:0xc516eda25aa8482c!8m2!3d28.5797958!4d77.3146667!16s%2Fg%2F1tcvmnf2?entry=ttu&g_ep=EgoyMDI1MDIwNS4xIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" >A-43 Sector-16, Noida</a>
                  </div>
                </div>
              </div>
              <div
                className="col-md-6 wow fadeIn" data-wow-delay=".5s">
                <div className="d-flex bg-light p-3 rounded">
                  <div className="flex-shrink-0 btn-square bg-secondary rounded-circle" style={{ width: "64px", height: "64px" }}>
                    <i className="fa fa-phone text-white fs-3"></i>
                  </div>
                  <div className="ms-3">
                    <h5 className="text-primary">Call Us</h5>
                    <a href="tel:+0123456789" target="_blank" rel="noreferrer">+012 3456 7890</a>
                  </div>
                </div>
              </div>
              <div className="col-md-6 wow fadeIn" data-wow-delay=".7s">
                <div className="d-flex bg-light p-3 rounded">
                  <div className="flex-shrink-0 btn-square bg-secondary rounded-circle" style={{ width: "64px", height: "64px" }}>
                    <i className="fa fa-envelope text-white fs-3"></i>
                  </div>
                  <div className="ms-3">
                    <h5 className="text-primary">Email Us</h5>
                    <a href="mailto:info@example.com" target="_blank" rel="noreferrer" >info@example.com </a>
                  </div>
                </div>
              </div>
              <div className="col-md-6 wow fadeIn" data-wow-delay=".7s">
                <div className="d-flex bg-light p-3 rounded">
                  <div className="flex-shrink-0 btn-square bg-secondary rounded-circle" style={{ width: "64px", height: "64px" }}>
                    <i className="fa fa-whatsapp text-white fs-3"></i>
                  </div>
                  <div className="ms-3">
                    <h5 className="text-primary">Whatsapp</h5>
                    <a href="https://wa.me/918218635347" target="_blank" rel="noreferrer" >
                      +91-8218635347
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-5">
              <div className="col-lg-6 wow fadeIn" data-wow-delay=".3s">
                <div className="p-5 h-100 rounded contact-map">
                  <iframe width="100%" height="100%" id="gmap_canvas" src="https://maps.google.com/maps?q=A-43%20Sector-16%20Noida&t=&z=13&ie=UTF8&iwloc=&output=embed" ></iframe>
                </div>
              </div>
              <div className="col-lg-6 wow fadeIn" data-wow-delay=".5s">
                <div className="p-5 rounded contact-form">
                {message && <p className='text-dark text-center'>{message}</p>}
                  <form onSubmit={postData}>
                    <div className="mb-4">
                      <input type="text" name="name" value={data.name} onChange={getInputData} className={`form-control border-3 py-3 ${show && errorMessage.name ? 'border-danger' : 'border-success'}`} placeholder={`${show && errorMessage.name ? 'Name Feild Is Mendatory' : 'Your Name'}`} />
                    </div>
                    <div className="mb-4">
                      <input type="email" name="email" value={data.email} onChange={getInputData} className={`form-control border-3 py-3 ${show && errorMessage.email ? 'border-danger' : 'border-success'}`} placeholder={`${show && errorMessage.email ? 'Email Feild Is Mendatory' : 'Your Emaill'}`} />
                    </div>
                    <div className="mb-4">
                      <input type="number" name="phone" value={data.phone} onChange={getInputData} className={`form-control border-3 py-3 ${show && errorMessage.phone ? 'border-danger' : 'border-success'}`} placeholder={`${show && errorMessage.phone ? 'Phone Number  Is Mendatory' : 'Your Phone Number'}`} />
                    </div>
                    <div className="mb-4">
                      <input type="text" name="subject" value={data.subject} onChange={getInputData} className={`form-control border-3 py-3 ${show && errorMessage.subject ? 'border-danger' : 'border-success'}`} placeholder={`${show && errorMessage.subject ? 'Subject Feild Is Mendatory' : 'Subject'}`} />
                    </div>
                    <div className="mb-4">
                      <textarea name='message' className={`w-100 form-control border-3 ${show && errorMessage.message ? 'border-danger' : 'border-success'} py-2`} rows="4" onChange={getInputData} value={data.message} cols="10" placeholder={show && errorMessage.message ? "Message Field is Mendatory" : "Your Message"}></textarea>
                    </div>
                    <div className="text-start">
                      <button type="submit" className="btn bg-primary text-white py-3 px-5 w-100" >Send Message</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
