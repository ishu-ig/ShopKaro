import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import formValidator from "../../FormValidators/formValidator";
import imageValidator from "../../FormValidators/imageValidator";
import { updateTestimonial, getTestimonial } from "../../Redux/ActionCreators/TestimonialActionCreators";

const checklist = [
  { dot: "bg-success", title: "Review Details",  body: "Confirm the name and message are still accurate."  },
  { dot: "bg-primary", title: "Update Photo",    body: "Replace the photo if a better one is available."   },
  { dot: "bg-warning", title: "Save Changes",    body: "Changes take effect immediately on the site."       },
];

export default function AdminUpdateTestimonial() {
  let { _id }             = useParams();
  let navigate            = useNavigate();
  let TestimonialStateData = useSelector((state) => state.TestimonialStateData);
  let dispatch            = useDispatch();

  let [data, setData]   = useState({ name: "", pic: "", message: "", active: true });
  let [error, setError] = useState({ name: "", pic: "", message: "" });
  let [show, setShow]       = useState(false);
  let [preview, setPreview] = useState(null);

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
      let formData = new FormData();
      formData.append("_id",     data._id);
      formData.append("name",    data.name);
      formData.append("pic",     data.pic);
      formData.append("message", data.message);
      formData.append("active",  data.active);
      dispatch(updateTestimonial(formData));
      navigate("/testimonial");
    }
  }

  useEffect(() => {
    dispatch(getTestimonial());
    if (TestimonialStateData.length) {
      let item = TestimonialStateData.find((x) => x._id === _id);
      if (item) {
        setData({ ...item });
        if (item.pic) setPreview(item.pic);
      }
    }
  }, [TestimonialStateData.length]);

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">

        {/* Page Heading */}
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-pencil-square" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Update Testimonial</h1>
              <p className="text-muted mb-0">Edit the testimonial details below.</p>
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
                    <i className="bi bi-pencil-square" aria-hidden="true"></i>
                    <span>Testimonial Information</span>
                  </h2>
                  <p className="text-muted mb-0">Update the details for this testimonial.</p>
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
                  <label className="form-label" htmlFor="pic">
                    Upload Photo <span className="text-muted fw-normal">(leave blank to keep current)</span>
                  </label>
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
                  <i className="bi bi-check-circle" aria-hidden="true"></i> Update Testimonial
                </button>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="col-12 col-xl-4">
            <div className="panel h-100">
              <h2 className="h5 mb-3 section-title">
                <i className="bi bi-list-check" aria-hidden="true"></i>
                <span>Update Checklist</span>
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