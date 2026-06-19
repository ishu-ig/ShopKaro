import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import formValidator from "../../FormValidators/formValidator";
import imageValidator from "../../FormValidators/imageValidator";
import { createBanner, getBanner } from "../../Redux/ActionCreators/BannerActionCreators";

const checklist = [
  { dot: "bg-primary", title: "Banner Title", body: "Use a clear, attention-grabbing title."        },
  { dot: "bg-success", title: "Upload Image", body: "Add a banner image (JPEG, PNG, or WebP)."      },
  { dot: "bg-warning", title: "Set Status",   body: "Active banners appear on the site immediately." },
];

export default function AdminCreateBanner() {
  const [data, setData] = useState({ title: "", link: "", pic: "", active: true });
  const [error, setError] = useState({
    title: "Title Field is Mandatory",
    link:  "Link Field is Mandatory",
    pic:   "Banner image is required",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const BannerStateData = useSelector((state) => state.BannerStateData);
  const dispatch = useDispatch();

  function getInputData(e) {
    const name  = e.target.name;
    const value = e.target.files ? e.target.files[0] : e.target.value;

    if (name !== "active") {
      setError((old) => ({ ...old, [name]: e.target.files ? imageValidator(e) : formValidator(e) }));
    }
    if (name === "pic" && e.target.files?.[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
    setData((old) => ({
      ...old,
      [name]: name === "active" ? (value === "1") : value,
    }));
  }

  function postSubmit(e) {
    e.preventDefault();
    const errorItem = Object.values(error).find((x) => x !== "");
    if (errorItem) { setShow(true); return; }

    const duplicate = BannerStateData.find(
      (x) => x.title.toLowerCase() === data.title.toLowerCase()
    );
    if (duplicate) {
      setShow(true);
      setError((old) => ({ ...old, title: "Banner Title Already Exists" }));
      return;
    }

    const formData = new FormData();
    formData.append("title",  data.title);
    formData.append("link",   data.link);
    formData.append("pic",    data.pic);
    formData.append("active", data.active);
    dispatch(createBanner(formData));
    console.log("Data Is Filled")
    navigate("/banner");
  }

  useEffect(() => { dispatch(getBanner()); }, [BannerStateData.length]);

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">

        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-plus-circle" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Add Banner</h1>
              <p className="text-muted mb-0">Create a new banner entry.</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-outline-secondary btn-sm" to="/banner">
              <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to Banners
            </Link>
          </div>
        </div>

        {show && (
          <div className="alert alert-danger alert-dismissible" role="alert">
            {Object.values(error).find((x) => x !== "")}
            <button type="button" className="btn-close" onClick={() => setShow(false)} aria-label="Close" />
          </div>
        )}

        <section className="row g-3">
          <div className="col-12 col-xl-8">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-bookmark-star" aria-hidden="true"></i>
                    <span>Banner Information</span>
                  </h2>
                  <p className="text-muted mb-0">Fill in the details to create a new banner.</p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="title">Banner Title</label>
                  <input id="title" type="text" name="title" className="form-control"
                    placeholder="e.g. We Deal With ..." value={data.title} onChange={getInputData} />
                  {show && error.title && <div className="text-danger small mt-1">{error.title}</div>}
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="link">Link</label>
                  <input id="link" type="text" name="link" className="form-control"
                    placeholder="e.g. https://yoursite.com" value={data.link} onChange={getInputData} />
                  {show && error.link && <div className="text-danger small mt-1">{error.link}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="pic">Banner Image</label>
                  <input id="pic" type="file" name="pic" className="form-control"
                    accept="image/jpeg,image/png,image/webp" onChange={getInputData} />
                  {show && error.pic && <div className="text-danger small mt-1">{error.pic}</div>}
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview"
                      className="mt-2 rounded border"
                      style={{ height: 60, objectFit: "contain", background: "#f8f9fa", padding: 4 }} />
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="active">Status</label>
                  <select id="active" name="active" className="form-select"
                    value={data.active ? "1" : "0"} onChange={getInputData}>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                <Link className="btn btn-outline-secondary" to="/banner">Cancel</Link>
                <button className="btn btn-primary" type="button" onClick={postSubmit}>
                  <i className="bi bi-check-circle" aria-hidden="true"></i> Create Banner
                </button>
              </div>
            </div>
          </div>

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