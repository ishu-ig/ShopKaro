import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import formValidator from "../../FormValidators/formValidator";
import imageValidator from "../../FormValidators/imageValidator";
import { getSubcategory, updateSubcategory } from "../../Redux/ActionCreators/SubcategoryActionCreators";
import { getMaincategory } from "../../Redux/ActionCreators/MaincategoryActionCreators";

const SERVER = process.env.REACT_APP_BACKEND_SERVER || "http://localhost:8000";

const checklist = [
  { dot: "bg-success", title: "Review Name", body: "Ensure the subcategory name is correct." },
  { dot: "bg-primary", title: "Main Category", body: "Change the parent main category if needed." },
  { dot: "bg-primary", title: "Update Image", body: "Replace the subcategory image if needed." },
  { dot: "bg-warning", title: "Save Changes", body: "Changes take effect immediately on the site." },
];

export default function AdminUpdateSubcategory() {
  const { _id } = useParams();
  const navigate = useNavigate();
  const SubcategoryStateData = useSelector((state) => state.SubcategoryStateData);
  const MaincategoryStateData = useSelector((state) => state.MaincategoryStateData);
  const dispatch = useDispatch();

  const [data, setData] = useState({ _id: "", name: "", maincategory: "", pic: "", active: true });
  const [error, setError] = useState({ name: "", maincategory: "", pic: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  function getInputData(e) {
    const name = e.target.name;
    const value = e.target.files ? e.target.files[0] : e.target.value;
    if (name === "maincategory") {
      setError((old) => ({ ...old, maincategory: value ? "" : "Maincategory is Mandatory" }));
    } else if (name !== "active") {
      setError((old) => ({ ...old, [name]: e.target.files ? imageValidator(e) : formValidator(e) }));
    }
    if (name === "pic" && e.target.files?.[0]) setImagePreview(URL.createObjectURL(e.target.files[0]));
    setData((old) => ({ ...old, [name]: name === "active" ? (value === "1") : value }));
  }

  function postSubmit(e) {
    e.preventDefault();
    const errorItem = Object.values(error).find((x) => x !== "");
    if (errorItem) { setShow(true); return; }
    const duplicate = SubcategoryStateData.find(
      (x) =>
        x._id !== _id &&
        x.name.toLowerCase() === data.name.toLowerCase() &&
        String(x.maincategory?._id ?? x.maincategory) === String(data.maincategory)
    );
    if (duplicate) {
      setShow(true);
      setError((old) => ({ ...old, name: "Subcategory Already Exists in this Main Category" }));
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("_id", data._id);
    formData.append("name", data.name);
    formData.append("maincategory", data.maincategory);
    formData.append("pic", data.pic);
    formData.append("active", data.active);
    dispatch(updateSubcategory(formData));
    navigate("/subcategory");
  }

  // On mount: load dropdown list via Redux, fetch THIS record fresh from the
  // API so maincategory is always a fully populated object and the form
  // initialises exactly once (never reset by background Redux updates).
  useEffect(() => {
    dispatch(getMaincategory());
    dispatch(getSubcategory());

    const token = localStorage.getItem("token");
    const authHeader = (token && token !== "null" && token !== "undefined") ? token : "";

    fetch(`${SERVER}/api/subcategory/${_id}`, {
      headers: { authorization: authHeader },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.result === "Done" && json.data) {
          const item = json.data;
          // maincategory comes back as populated object { _id, name, … }
          const mcId = String(item.maincategory?._id ?? item.maincategory ?? "");
          setData({
            _id:          item._id,
            name:         item.name   ?? "",
            maincategory: mcId,
            pic:          item.pic    ?? "",
            active:       item.active ?? true,
          });
          setError({
            name:         item.name ? "" : "Name Field is Mandatory",
            maincategory: mcId      ? "" : "Maincategory is Mandatory",
            pic:          "",   // pic is optional on update
          });
          if (item.pic) setImagePreview(item.pic);
        }
      })
      .catch((err) => console.error("Failed to load subcategory:", err))
      .finally(() => setFetching(false));
  }, [_id]);

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon"><i className="bi bi-pencil-square" aria-hidden="true"></i></span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Update Subcategory</h1>
              <p className="text-muted mb-0">Edit the subcategory details below.</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-outline-secondary btn-sm" to="/subcategory">
              <i className="bi bi-arrow-left" aria-hidden="true"></i> Back
            </Link>
          </div>
        </div>

        {show && (
          <div className="alert alert-danger alert-dismissible" role="alert">
            {Object.values(error).find((x) => x !== "")}
            <button type="button" className="btn-close" onClick={() => setShow(false)} aria-label="Close" />
          </div>
        )}

        {fetching ? (
          <div className="text-center py-5">
            <span className="spinner-border text-primary" role="status" aria-label="Loading" />
          </div>
        ) : (
        <section className="row g-3">
          <div className="col-12 col-xl-8">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-grid-3x3-gap" aria-hidden="true"></i>
                    <span>Subcategory Information</span>
                  </h2>
                  <p className="text-muted mb-0">Update the details for this subcategory.</p>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="maincategory">Main Category</label>
                  <select id="maincategory" name="maincategory" className="form-select"
                    value={String(data.maincategory)} onChange={getInputData}>
                    <option value="">Select Main Category</option>
                    {MaincategoryStateData?.filter((m) => m.active || String(m._id) === String(data.maincategory)).map((m) => (
                      <option key={m._id} value={String(m._id)}>{m.name}</option>
                    ))}
                  </select>
                  {show && error.maincategory && <div className="text-danger small mt-1">{error.maincategory}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="name">Subcategory Name</label>
                  <input id="name" type="text" name="name" className="form-control"
                    placeholder="e.g. Laptops, T-Shirts" value={data.name} onChange={getInputData} />
                  {show && error.name && <div className="text-danger small mt-1">{error.name}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="pic">
                    Subcategory Image <span className="text-muted fw-normal">(leave blank to keep current)</span>
                  </label>
                  <input id="pic" type="file" name="pic" className="form-control"
                    accept="image/jpeg,image/png,image/webp" onChange={getInputData} />
                  {show && error.pic && <div className="text-danger small mt-1">{error.pic}</div>}
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview"
                      className="mt-2 rounded border"
                      style={{ height: 64, objectFit: "cover", borderRadius: 6 }} />
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
                <Link className="btn btn-outline-secondary" to="/subcategory">Cancel</Link>
                <button className="btn btn-primary" type="button" onClick={postSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle" aria-hidden="true"></i> Update Subcategory
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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
        )}
      </div>
    </main>
  );
}