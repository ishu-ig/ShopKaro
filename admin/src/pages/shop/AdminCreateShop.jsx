import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import formValidator from "../../FormValidators/formValidator";
import imageValidator from "../../FormValidators/imageValidator";
import {
  createShop,
  getShop,
} from "../../Redux/ActionCreators/ShopActionCreators";
import { getMaincategory } from "../../Redux/ActionCreators/MaincategoryActionCreators";
import { getSubcategory } from "../../Redux/ActionCreators/SubcategoryActionCreators";

const GEOAPIFY_API_KEY = "e04b543b846f4fb187b19c00fe5a29af";

// Trimmed to match ShopSchema — reservationPrice/discount/finalPrice/
// seatAvailable/openTime/closeTime/isreservation/rating are NOT on the
// schema (they belonged to an older version of this model) and are no
// longer collected here.
const checklist = [
  {
    dot: "bg-primary",
    title: "Owner & contact",
    body: "Name, owner, email, and phone are required to create a login.",
  },
  {
    dot: "bg-info",
    title: "Cuisine tags",
    body: "Pick the main/sub categories this shop serves — products are filtered by these.",
  },
  {
    dot: "bg-success",
    title: "Upload a photo",
    body: "Add a cover image for the shop profile.",
  },
  {
    dot: "bg-warning",
    title: "Status",
    body: "Set whether the shop is open and whether it's active on the platform.",
  },
];

export default function AdminCreateShop() {
  const [data, setData] = useState({
    name: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    pic: null,
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
    name: "Name Field is Mandatory",
    ownerName: "Owner Name Field is Mandatory",
    email: "Email Field is Mandatory",
    password: "Password Field is Mandatory",
    phone: "Contact Number Field is Mandatory",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

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
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getShop());
  }, [ShopStateData.length]);
  useEffect(() => {
    dispatch(getMaincategory());
  }, [MaincategoryStateData.length]);
  useEffect(() => {
    dispatch(getSubcategory());
  }, [SubcategoryStateData.length]);

  function getInputData(e) {
    const name = e.target.name;
    const value = e.target.files ? e.target.files[0] : e.target.value;

    if (name !== "active" && name !== "status") {
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

  // Subcategory docs reference their parent maincategory (field is sometimes
  // populated, sometimes just an id, and the backend uses a slightly
  // misspelled key in a couple of places — this reads whichever is present.
  function getSubMaincategoryId(subItem) {
    const ref = subItem.maincategory ?? subItem.maincateory;
    if (!ref) return null;
    return typeof ref === "object" ? ref._id : ref;
  }

  function toggleMaincategory(id) {
    setData((old) => {
      const current = old.maincategory;
      const nextMain = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];

      // Drop any already-selected subcategories that no longer belong to a
      // currently-selected main category.
      const nextSub = old.subcategory.filter((subId) => {
        const subItem = SubcategoryStateData?.find((s) => s._id === subId);
        if (!subItem) return true;
        const parentId = getSubMaincategoryId(subItem);
        return !parentId || nextMain.includes(parentId);
      });

      return { ...old, maincategory: nextMain, subcategory: nextSub };
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
      (x) => x.name.toLowerCase() === data.name.toLowerCase(),
    );
    if (duplicate) {
      setShow(true);
      setError((old) => ({ ...old, name: "Shop Already Exists" }));
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("ownerName", data.ownerName);
    formData.append("email", data.email);
    formData.append("password", data.password);
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
    if (data.pic) formData.append("pic", data.pic);

    dispatch(createShop(formData));
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
              <h1 className="h3 mb-1">Add Shop</h1>
              <p className="text-muted mb-0">Onboard a new shop partner.</p>
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
                    <i className="bi bi-person-badge" aria-hidden="true"></i>
                    <span>Owner & Login</span>
                  </h2>
                  <p className="text-muted mb-0">
                    Used to create the shop's login account.
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
                  {show && error.ownerName && (
                    <div className="text-danger small mt-1">
                      {error.ownerName}
                    </div>
                  )}
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
                  <label className="form-label" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Login password"
                    value={data.password}
                    onChange={getInputData}
                  />
                  {show && error.password && (
                    <div className="text-danger small mt-1">
                      {error.password}
                    </div>
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
                  {imagePreview && (
                    <img
                      src={imagePreview}
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
                      Coordinates: {data.lat.toFixed(5)}, {data.lng.toFixed(5)}
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
                    {!data.maincategory.length && (
                      <div className="text-muted small">
                        Select a main category first to see its sub categories.
                      </div>
                    )}
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
                  Create Shop
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
