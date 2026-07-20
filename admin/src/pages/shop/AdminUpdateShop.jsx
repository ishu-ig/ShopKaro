import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import formValidator from "../../FormValidators/formValidator";
import imageValidator from "../../FormValidators/imageValidator";
import {
  updateShop,
  getShop,
} from "../../Redux/ActionCreators/ShopActionCreators";
import { getMaincategory } from "../../Redux/ActionCreators/MaincategoryActionCreators";
import { getSubcategory } from "../../Redux/ActionCreators/SubcategoryActionCreators";

const GEOAPIFY_API_KEY = "e04b543b846f4fb187b19c00fe5a29af";

export default function AdminUpdateShop() {
  const { _id } = useParams();
  console.log(_id)
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Trimmed to match ShopSchema — reservationPrice/discount/finalPrice/
  // seatAvailable/rating/openTime/closeTime/isreservation are NOT on the
  // schema (they belonged to an older version of this model) and are no
  // longer read, edited, or submitted here.
  const [data, setData] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    pic: "",
    address: "",
    city: "",
    state: "",
    pin: "",
    lat: null,
    lng: null,
    maincategory: [],
    subcategory: [],
    status: true,
    active: true,
  });

  const [error, setError] = useState({
    name: "",
    email: "",
    phone: "",
    pic: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [show, setShow] = useState(false);

  // ── Geolocation / reverse-geocode state ─────────────────────────────────────
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [locSuccess, setLocSuccess] = useState("");

  const ShopStateData = useSelector((state) => state.ShopStateData);
  const MaincategoryStateData = useSelector(
    (state) => state.MaincategoryStateData,
  );
  const SubcategoryStateData = useSelector(
    (state) => state.SubcategoryStateData,
  );

  useEffect(() => {
    dispatch(getShop());
  }, []);
  useEffect(() => {
    dispatch(getMaincategory());
  }, [MaincategoryStateData.length]);
  useEffect(() => {
    dispatch(getSubcategory());
  }, [SubcategoryStateData.length]);

  useEffect(() => {
    if (ShopStateData.length) {
      const item = ShopStateData.find((x) => x._id === _id);
      if (item) {
        setData((old) => ({
          ...old,
          ...item,
          address: item.permanentLocation?.address ?? "",
          city: item.permanentLocation?.city ?? "",
          state: item.permanentLocation?.state ?? "",
          pin: item.permanentLocation?.pin ?? "",
          lat: item.permanentLocation?.lat ?? null,
          lng: item.permanentLocation?.lng ?? null,
          // maincategory/subcategory come back populated (objects) from the
          // backend — normalize to plain id arrays for the checkboxes below.
          maincategory: (item.maincategory || []).map((m) =>
            typeof m === "object" ? m._id : m,
          ),
          subcategory: (item.subcategory || []).map((s) =>
            typeof s === "object" ? s._id : s,
          ),
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ShopStateData.length]);

  function getInputData(e) {
    const name = e.target.name;
    const value = e.target.files ? e.target.files[0] : e.target.value;

    if (
      name === "name" ||
      name === "email" ||
      name === "phone" ||
      name === "pic"
    ) {
      setError((old) => ({
        ...old,
        [name]: e.target.files ? imageValidator(e) : formValidator(e),
      }));
    }

    if (name === "pic" && e.target.files?.[0])
      setImagePreview(URL.createObjectURL(e.target.files[0]));

    setData((old) => ({
      ...old,
      [name]: name === "active" || name === "status" ? value === "1" : value,
    }));
  }

  function toggleMultiSelect(field, id) {
    setData((old) => {
      const current = old[field];
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      return { ...old, [field]: next };
    });
  }

  function toggleMaincategory(id) {
    setData((old) => {
      const current = old.maincategory;
      const nextMain = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      return { ...old, maincategory: nextMain };
    });
  }

  // ── Use my location: geolocate then reverse-geocode via Geoapify ───────────
  async function getLocation() {
    setLocError("");
    setLocSuccess("");

    if (!("geolocation" in navigator)) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}`,
          );
          const result = await response.json();

          if (result.features?.length > 0) {
            const place = result.features[0].properties;
            setData((prev) => ({
              ...prev,
              lat: latitude,
              lng: longitude,
              address: place.address_line1 || "",
              city: place.city || place.town || place.village || "",
              state: place.state || "",
              pin: place.postcode || "",
            }));
            setLocSuccess("Location detected and address filled in.");
          } else {
            setLocError("Could not determine an address from your location.");
          }
        } catch {
          setLocError("Failed to fetch address from location.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocError("Location permission denied.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function postSubmit(e) {
    e.preventDefault();
    const errorItem = Object.values(error).find((x) => x !== "");
    if (errorItem) {
      setShow(true);
      return;
    }

    const duplicate = ShopStateData.find(
      (x) => x._id !== _id && x.name.toLowerCase() === data.name.toLowerCase(),
    );
    if (duplicate) {
      setShow(true);
      setError((old) => ({ ...old, name: "Shop Already Exists" }));
      return;
    }

    const formData = new FormData();
    formData.append("_id", data._id);
    formData.append("name", data.name);
    formData.append("ownerName", data.ownerName);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("status", data.status);
    formData.append("active", data.active);
    formData.append("maincategory", JSON.stringify(data.maincategory));
    formData.append("subcategory", JSON.stringify(data.subcategory));
    formData.append(
      "permanentLocation",
      JSON.stringify({
        address: data.address,
        city: data.city,
        state: data.state,
        pin: data.pin,
        lat: data.lat,
        lng: data.lng,
      }),
    );
    if (data.pic instanceof File) formData.append("pic", data.pic);

    dispatch(updateShop(formData));
    navigate("/shop");
  }

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-shop" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Update Shop</h1>
              <p className="text-muted mb-0">
                Edit this shop partner's details.
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-outline-secondary btn-sm" to="/shop">
              <i className="bi bi-arrow-left" aria-hidden="true"></i> Back
            </Link>
          </div>
        </div>

        {show && (
          <div className="alert alert-danger alert-dismissible" role="alert">
            {Object.values(error).find((x) => x !== "")}
            <button
              type="button"
              className="btn-close"
              onClick={() => setShow(false)}
              aria-label="Close"
            />
          </div>
        )}

        <section className="row g-3">
          <div className="col-12 col-xl-8">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-shop" aria-hidden="true"></i>
                    <span>Basic Details</span>
                  </h2>
                  <p className="text-muted mb-0">
                    Name, contact, and cover photo.
                  </p>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="name">
                    Shop Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Spice Route"
                    value={data.name}
                    onChange={getInputData}
                  />
                  {show && error.name && (
                    <div className="text-danger small mt-1">{error.name}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="ownerName">
                    Owner Name
                  </label>
                  <input
                    id="ownerName"
                    type="text"
                    name="ownerName"
                    className="form-control"
                    placeholder="Owner's full name"
                    value={data.ownerName}
                    onChange={getInputData}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="owner@example.com"
                    value={data.email}
                    onChange={getInputData}
                  />
                  {show && error.email && (
                    <div className="text-danger small mt-1">{error.email}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="phone">
                    Contact Number
                  </label>
                  <input
                    id="phone"
                    type="number"
                    name="phone"
                    className="form-control"
                    placeholder="10-digit phone number"
                    value={data.phone}
                    onChange={getInputData}
                  />
                  {show && error.phone && (
                    <div className="text-danger small mt-1">{error.phone}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="pic">
                    Cover Photo
                  </label>
                  <input
                    id="pic"
                    type="file"
                    name="pic"
                    className="form-control"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={getInputData}
                  />
                  {show && error.pic && (
                    <div className="text-danger small mt-1">{error.pic}</div>
                  )}
                  {(imagePreview ||
                    (typeof data.pic === "string" && data.pic)) && (
                    <img
                      src={imagePreview || data.pic}
                      alt="Preview"
                      className="mt-2 rounded border"
                      style={{
                        height: 64,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="panel mt-3">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-geo-alt" aria-hidden="true"></i>
                    <span>Location</span>
                  </h2>
                  <p className="text-muted mb-0">
                    Where the shop is physically located.
                  </p>
                </div>
                <div className="ms-auto">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={getLocation}
                    disabled={locating}
                  >
                    {locating ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Detecting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-crosshair" aria-hidden="true"></i>{" "}
                        Use my location
                      </>
                    )}
                  </button>
                </div>
              </div>

              {locError && (
                <div
                  className="alert alert-danger py-2 px-3 small mb-3"
                  role="alert"
                >
                  {locError}
                </div>
              )}
              {locSuccess && (
                <div
                  className="alert alert-success py-2 px-3 small mb-3"
                  role="alert"
                >
                  {locSuccess}
                </div>
              )}

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="address">
                    Street Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    className="form-control"
                    rows={2}
                    value={data.address}
                    onChange={getInputData}
                    placeholder="Street, area, landmark"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    className="form-control"
                    value={data.city}
                    onChange={getInputData}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="state">
                    State
                  </label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    className="form-control"
                    value={data.state}
                    onChange={getInputData}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="pin">
                    PIN Code
                  </label>
                  <input
                    id="pin"
                    type="text"
                    name="pin"
                    className="form-control"
                    value={data.pin}
                    onChange={getInputData}
                  />
                </div>
                {data.lat != null && data.lng != null && (
                  <div className="col-12">
                    <div className="text-muted small">
                      <i className="bi bi-pin-map" aria-hidden="true"></i>{" "}
                      Coordinates: {Number(data.lat).toFixed(5)},{" "}
                      {Number(data.lng).toFixed(5)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="panel mt-3">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-tags" aria-hidden="true"></i>
                    <span>Cuisine Categories</span>
                  </h2>
                  <p className="text-muted mb-0">
                    Tag the main and sub categories this shop serves.
                  </p>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label d-block">Main Categories</label>
                  <div
                    className="border rounded p-2"
                    style={{ maxHeight: 160, overflowY: "auto" }}
                  >
                    {MaincategoryStateData?.filter((x) => x.active).map(
                      (item) => (
                        <div className="form-check" key={item._id}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`mc-${item._id}`}
                            checked={data.maincategory.includes(item._id)}
                            onChange={() => toggleMaincategory(item._id)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`mc-${item._id}`}
                          >
                            {item.name}
                          </label>
                        </div>
                      ),
                    )}
                    {!MaincategoryStateData?.length && (
                      <div className="text-muted small">
                        No main categories available.
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label d-block">Sub Categories</label>
                  <div
                    className="border rounded p-2"
                    style={{ maxHeight: 160, overflowY: "auto" }}
                  >
                    {SubcategoryStateData?.filter((x) => x.active).map(
                      (item) => (
                        <div className="form-check" key={item._id}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`sc-${item._id}`}
                            checked={data.subcategory.includes(item._id)}
                            onChange={() =>
                              toggleMultiSelect("subcategory", item._id)
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`sc-${item._id}`}
                          >
                            {item.name}
                          </label>
                        </div>
                      ),
                    )}
                    {!SubcategoryStateData?.filter((x) => x.active).length && (
                      <div className="text-muted small">
                        No sub categories available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="panel mt-3">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-toggle-on" aria-hidden="true"></i>
                    <span>Status</span>
                  </h2>
                  <p className="text-muted mb-0">
                    Whether the shop is open, and whether it's visible on the
                    platform.
                  </p>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="status">
                    Open / Closed
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="form-select"
                    value={data.status ? "1" : "0"}
                    onChange={getInputData}
                  >
                    <option value="1">Open</option>
                    <option value="0">Closed</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="active">
                    Active
                  </label>
                  <select
                    id="active"
                    name="active"
                    className="form-select"
                    value={data.active ? "1" : "0"}
                    onChange={getInputData}
                  >
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
              </div>
              <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                <Link className="btn btn-outline-secondary" to="/shop">
                  Cancel
                </Link>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={postSubmit}
                >
                  <i className="bi bi-check-circle" aria-hidden="true"></i>{" "}
                  Update Shop
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="panel h-100">
              <h2 className="h5 mb-3 section-title">
                <i className="bi bi-info-circle" aria-hidden="true"></i>
                <span>Notes</span>
              </h2>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-dot bg-info"></span>
                  <div>
                    <p className="mb-1 fw-semibold">Cover photo optional</p>
                    <p className="text-muted small mb-0">
                      Leave it blank to keep the current photo.
                    </p>
                  </div>
                </div>
                <div className="activity-item">
                  <span className="activity-dot bg-primary"></span>
                  <div>
                    <p className="mb-1 fw-semibold">
                      Password isn't editable here
                    </p>
                    <p className="text-muted small mb-0">
                      Use the "Forgot Password" flow on the shop login page to
                      reset it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}