import React, { useState } from "react";
import { useDispatch } from "react-redux";
import formValidator from "../FormValidator/formValidator";
import { createContactUs } from "../Redux/ActionCreartors/ContactUsActionCreators";

export default function ContactUs() {
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [errorMessage, setErrorMessage] = useState({
    name: "Name Field is Mandatory",
    email: "Email Field is Mandatory",
    phone: "Phone Field is Mandatory",
    subject: "Subject Field is Mandatory",
    message: "Message Field is Mandatory",
  });

  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  const getInputData = (e) => {
    const { name, value } = e.target;
    setErrorMessage((old) => ({
      ...old,
      [name]: formValidator(e),
    }));
    setData((old) => ({
      ...old,
      [name]: value,
    }));
  };

  const postData = (e) => {
    e.preventDefault();
    const error = Object.values(errorMessage).find((x) => x !== "");
    if (error) {
      setShow(true);
    } else {
      dispatch(createContactUs({ ...data, active: true, date: new Date() }));
      setMessage("Thanks for sharing your query with us. Our team will contact you soon.");
      setData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }
  };

  return (
    <>
      <div className="container-fluid py-5 mb-5">
        <div className="container">
          {/* Header */}
          <div className="text-center mx-auto pb-5 wow fadeIn" data-wow-delay=".3s" style={{ maxWidth: "600px" }}>
            <h5 className="text-primary">Get In Touch</h5>
            <h1 className="mb-3">Contact for Any Query</h1>
          </div>

          {/* Contact Details */}
          <div className="row g-4 mb-5">
            {[
              {
                icon: "fas fa-map-marker-alt",
                title: "Address",
                value: "A-43 Sector-16, Noida",
                link: "https://www.google.com/maps?q=A-43+Sector-16+Noida",
              },
              {
                icon: "fa fa-phone",
                title: "Call Us",
                value: "+012 3456 7890",
                link: "tel:+0123456789",
              },
              {
                icon: "fa fa-envelope",
                title: "Email Us",
                value: "info@example.com",
                link: "mailto:info@example.com",
              },
              {
                icon: "fa fa-whatsapp",
                title: "WhatsApp",
                value: "+91-8218635347",
                link: "https://wa.me/918218635347",
              },
            ].map((item, index) => (
              <div className="col-md-6 col-sm-12 wow fadeIn" data-wow-delay={`.${index + 3}s`} key={index}>
                <div className="d-flex bg-light p-3 rounded align-items-center h-100">
                  <div className="flex-shrink-0 btn-square bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: "64px", height: "64px" }}>
                    <i className={`${item.icon} text-white fs-3`}></i>
                  </div>
                  <div className="ms-3">
                    <h5 className="text-primary mb-1">{item.title}</h5>
                    <a href={item.link} target="_blank" rel="noreferrer">{item.value}</a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form & Map */}
          <div className="row g-5">
            {/* Map */}
            <div className="col-lg-6 col-12 wow fadeIn" data-wow-delay=".3s">
              <div className="h-100 rounded overflow-hidden shadow-sm">
                <iframe
                  width="100%"
                  height="100%"
                  title="map"
                  src="https://maps.google.com/maps?q=A-43%20Sector-16%20Noida&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  style={{ minHeight: "400px", border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
            </div>

            {/* Form */}
            <div className="col-lg-6 col-12 wow fadeIn" data-wow-delay=".5s">
              <div className="p-4 p-md-5 bg-light rounded shadow-sm">
                {message && <p className='text-dark text-center fw-bold'>{message}</p>}
                <form onSubmit={postData}>
                  {[
                    { type: "text", name: "name", placeholder: "Your Name" },
                    { type: "email", name: "email", placeholder: "Your Email" },
                    { type: "number", name: "phone", placeholder: "Your Phone Number" },
                    { type: "text", name: "subject", placeholder: "Subject" }
                  ].map((field, i) => (
                    <div className="mb-3" key={i}>
                      <input
                        type={field.type}
                        name={field.name}
                        value={data[field.name]}
                        onChange={getInputData}
                        className={`form-control border-3 py-3 ${show && errorMessage[field.name] ? 'border-danger' : 'border-success'}`}
                        placeholder={show && errorMessage[field.name] ? errorMessage[field.name] : field.placeholder}
                      />
                    </div>
                  ))}

                  <div className="mb-3">
                    <textarea
                      name="message"
                      className={`form-control border-3 py-2 ${show && errorMessage.message ? 'border-danger' : 'border-success'}`}
                      rows="5"
                      value={data.message}
                      onChange={getInputData}
                      placeholder={show && errorMessage.message ? errorMessage.message : "Your Message"}
                    ></textarea>
                  </div>

                  <div>
                    <button type="submit" className="btn bg-primary text-white py-3 w-100">Send Message</button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
