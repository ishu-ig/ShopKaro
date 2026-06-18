import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import formValidator from "../../FormValidators/formValidator";
import imageValidator from "../../FormValidators/imageValidator";
import { createTestimonial, getTestimonial } from "../../Redux/ActionCreators/TestimonialActionCreators";

const checklist = [
  { dot: "bg-primary", title: "Client Name",    body: "Enter the full name of the client or reviewer."   },
  { dot: "bg-success", title: "Upload Photo",   body: "A profile picture adds credibility to the review." },
  { dot: "bg-warning", title: "Write Message",  body: "Keep the testimonial authentic and concise."       },
];

export default function AdminCreateTestimonial() {
  let [data, setData] = useState({ name: "", pic: "", message: "", active: true });
  let [error, setError] = useState({
    name:    "Name Field is Mandatory",
    pic:     "Pic Field is Mandatory",
    message: "Message Field is Mandatory",
  });
  let [show, setShow]       = useState(false);
  let [preview, setPreview] = useState(null);
  let navigate              = useNavigate();
  let TestimonialStateData  = useSelector((state) => state.TestimonialStateData);
  let dispatch              = useDispatch();

  function getInputData(e) {
    let name  = e.target.name;
    let value = e.target.files ? e.target.files[0] : e.target.value;

    if (name !== "active") {
      setError((old) => ({
        ...old,
        [name]: e.target.files ? imageValidator(e) : formValidator(e),
      }));
    }
    if (name === "pic" && e.target.files?.[0]) {
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
    setData((old) => ({
      ...old,
      [name]: name === "active" ? (value === "1" ? true : false) : value,
    }));
  }

  function postSubmit(e) {
    e.preventDefault();
    let errorItem = Object.values(error).find((x) => x !== "");
    if (errorItem) {
      setShow(true);
    } else {
      let item = TestimonialStateData.find(
        (x) => x.name.toLocaleLowerCase() === data.name.toLocaleLowerCase()
      );
      if (item) {
        setShow(true);
        setError((old) => ({ ...old, name: "Testimonial Already Exists" }));
      } else {
        let formData = new FormData();
        formData.append("name",    data.name);
        formData.append("pic",     data.pic);
        formData.append("message", data.message);
        formData.append("active",  data.active);
        dispatch(createTestimonial(formData));
        navigate("/testimonial");
      }
    }
  }

  useEffect(() => {
    dispatch(getTestimonial());
  }, [TestimonialStateData.length]);

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">

        {/* Page Heading */}
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-plus-circle" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Add Testimonial</h1>
              <p className="text-muted mb-0">Create a new client testimonial.</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-outline-secondary btn-sm" to="/testimonial">
              <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to Testimonials
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {show && (
          <div className="alert alert-danger alert-dismissible" role="alert">
            {Object.values(error).find((x) => x !== "")}
            <button type="button" className="btn-close" onClick={() => setShow(false)} aria-label="Close" />
          </div>
        )}

        <section className="row g-3">

          {/* Form Panel */}
          <div className="col-12 col-xl-8">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-chat-quote" aria-hidden="true"></i>
                    <span>Testimonial Information</span>
                  </h2>
                  <p className="text-muted mb-0">Fill in the details to add a new testimonial.</p>
                </div>
              </div>

              <div className="row g-3">

                {/* Name */}
                <div className="col-12">
                  <label className="form-label" htmlFor="name">Client Name</label>
                  <input
                    id="name" type="text" name="name"
                    className="form-control" placeholder="Enter client name"
                    value={data.name} onChange={getInputData}
                  />
                  {show && error.name && <div className="text-danger small mt-1">{error.name}</div>}
                </div>

                {/* Message */}
                <div className="col-12">
                  <label className="form-label" htmlFor="message">Message</label>
                  <textarea
                    id="message" name="message" rows={5}
                    className="form-control" placeholder="Enter client testimonial..."
                    value={data.message} onChange={getInputData}
                  />
                  {show && error.message && <div className="text-danger small mt-1">{error.message}</div>}
                </div>

                {/* Upload Picture */}
                <div className="col-md-6">
                  <label className="form-label" htmlFor="pic">Upload Photo</label>
                  <input
                    id="pic" type="file" name="pic"
                    className="form-control" onChange={getInputData}
                    accept="image/jpeg,image/png,image/webp"
                  />
                  {show && error.pic && <div className="text-danger small mt-1">{error.pic}</div>}
                  {preview && (
                    <img
                      src={preview} alt="Preview"
                      className="mt-2 rounded-circle border"
                      style={{ width: 60, height: 60, objectFit: "cover" }}
                    />
                  )}
                </div>

                {/* Status */}
                <div className="col-md-6">
                  <label className="form-label" htmlFor="active">Status</label>
                  <select
                    id="active" name="active"
                    className="form-select"
                    value={data.active ? "1" : "0"} onChange={getInputData}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>

              </div>

              {/* Actions */}
              <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                <Link className="btn btn-outline-secondary" to="/testimonial">Cancel</Link>
                <button className="btn btn-primary" type="button" onClick={postSubmit}>
                  <i className="bi bi-check-circle" aria-hidden="true"></i> Create Testimonial
                </button>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="col-12 col-xl-4">
            <div className="panel h-100">
              <h2 className="h5 mb-3 section-title">
                <i className="bi bi-list-check" aria-hidden="true"></i>
                <span>Setup Checklist</span>
              </h2>
              <div className="activity-list">
                {checklist.map(({ dot, title, body }) => (
                  <div key={title} className="activity-item">
                    <span className={`activity-dot ${dot}`}></span>
                    <div>
                      <p className="mb-1 fw-semibold">{title}</p>
                      <p className="text-muted small mb-0">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}