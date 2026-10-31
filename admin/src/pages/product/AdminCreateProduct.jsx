import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import formValidator from "../../FormValidators/formValidator";
import { createProduct } from "../../Redux/ActionCreators/ProductActionCreators";
import { getMaincategory } from "../../Redux/ActionCreators/MaincategoryActionCreators";
import { getSubcategory } from "../../Redux/ActionCreators/SubcategoryActionCreators";
import { getBrand } from "../../Redux/ActionCreators/BrandActionCreators";
import { getShop } from "../../Redux/ActionCreators/ShopActionCreators";

const checklist = [
  {
    dot: "bg-success",
    title: "Name & categorize",
    body: "Pick the main category first, then its subcategory, and the brand.",
  },
  {
    dot: "bg-primary",
    title: "Add variants",
    body: "Add at least one variant with a color and size — stock quantity keeps the count accurate.",
  },
  {
    dot: "bg-warning",
    title: "Upload variant images",
    body: "Add one or more photos per variant — the first acts as that variant's cover image.",
  },
];

// Some APIs (or raw Mongo exports) return ObjectId refs wrapped as { $oid: "..." }
// instead of plain strings. This normalizes either shape to a plain string id.
function toIdString(id) {
  if (id && typeof id === "object" && "$oid" in id) return id.$oid;
  return id;
}

// A reference field can be a plain id, a { $oid } wrapper, or a populated
// document ({ _id, name, ... }). This always returns a plain string id.
function refId(ref) {
  if (ref && typeof ref === "object") return toIdString(ref._id ?? ref);
  return ref;
}

function makeEmptyVariant() {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2)}`, // client-only React key
    color: "",
    size: "",
    stockQuantity: 0,
    stock: true,
    price: "", // REQUIRED per variant — there's no product-level basePrice in the schema
    sku: "",
    files: [], // File[] chosen for this variant's images
  };
}

export default function AdminCreateProduct() {
  const SIZE_OPTIONS = ["Free Size", "XS", "S", "M", "L", "XL", "XXL"];
  const [data, setData] = useState({
    name: "",
    maincategory: "",
    subcategory: "",
    brand: "",
    shop: "", // optional — Product.shop is not a required field on the schema
    discount: 0, // common discount, applied to every variant's own price
    description: "",
    active: true,
    variants: [makeEmptyVariant()],
  });

  const [error, setError] = useState({
    name: "Name Field is Mandatory",
    maincategory: "Main Category is Mandatory",
    subcategory: "Sub Category is Mandatory",
    brand: "Brand is Mandatory",
    variants: "At Least One Variant (Color, Size & Price) Is Mandatory",
  });

  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const MaincategoryStateData = useSelector((state) => state.MaincategoryStateData);
  const SubcategoryStateData = useSelector((state) => state.SubcategoryStateData);
  const BrandStateData = useSelector((state) => state.BrandStateData);
  const ShopStateData = useSelector((state) => state.ShopStateData);
  const dispatch = useDispatch();

  useEffect(() => { dispatch(getMaincategory()); }, [MaincategoryStateData.length]);
  useEffect(() => { dispatch(getSubcategory()); }, [SubcategoryStateData.length]);
  useEffect(() => { dispatch(getBrand()); }, [BrandStateData.length]);
  useEffect(() => { dispatch(getShop()); }, [ShopStateData.length]);

  const maincategoryOptions = (MaincategoryStateData || []).filter((x) => x?.active);

  // Step 2: subcategories are listed ONLY for the selected main category.
  // Nothing is shown until a main category is picked.
  const subcategoryOptions = data.maincategory
    ? (SubcategoryStateData || [])
      .filter((x) => x?.active)
      .filter((x) => refId(x.maincategory) === data.maincategory)
    : [];

  const brandOptions = (BrandStateData || []).filter((x) => x?.active);
  const shopOptions = (ShopStateData || []).filter((x) => x?.active);

  function getInputData(e) {
    const name = e.target.name;
    const value = e.target.value;

    if (name !== "active" && name !== "shop") {
      setError((old) => ({ ...old, [name]: formValidator(e) }));
    }

    // Changing the main category invalidates the chosen subcategory,
    // so clear it and make the user pick again from the new list.
    if (name === "maincategory") {
      setError((old) => ({ ...old, subcategory: "Sub Category is Mandatory" }));
      setData((old) => ({ ...old, maincategory: value, subcategory: "" }));
      return;
    }

    setData((old) => ({
      ...old,
      [name]: name === "active" ? value === "1" : value,
    }));
  }

  function getVariantData(index, field, value) {
    setData((old) => {
      const variants = old.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      );

      // Re-validate off this same freshly computed array (avoids a stale
      // one-keystroke-behind snapshot of data.variants). Price is required
      // per variant since there's no product-level basePrice to fall back on.
      const hasValidVariant = variants.some(
        (v) => v.color.trim() !== "" && v.size.trim() !== "" && parseFloat(v.price) > 0
      );
      setError((oldError) => ({
        ...oldError,
        variants: hasValidVariant
          ? ""
          : "At Least One Variant (Color, Size & Price) Is Mandatory",
      }));

      return { ...old, variants };
    });
  }

  function getVariantFiles(index, fileList) {
    setData((old) => {
      const variants = old.variants.map((v, i) =>
        i === index ? { ...v, files: Array.from(fileList || []) } : v
      );
      return { ...old, variants };
    });
  }

  function addVariant() {
    setData((old) => ({ ...old, variants: [...old.variants, makeEmptyVariant()] }));
  }

  function removeVariant(index) {
    setData((old) => {
      if (old.variants.length <= 1) return old; // keep at least one row
      return { ...old, variants: old.variants.filter((_, i) => i !== index) };
    });
  }

  function postSubmit(e) {
    e.preventDefault();
    const errorItem = Object.values(error).find((x) => x !== "");
    if (errorItem) {
      setShow(true);
      return;
    }

    // Only send variants that have color, size, AND a valid price — the
    // schema has no product-level basePrice, so each variant's own price
    // is the base that the common discount gets applied to.
    const validVariants = data.variants.filter(
      (v) => v.color.trim() !== "" && v.size.trim() !== "" && parseFloat(v.price) > 0
    );

    const discount = Number(data.discount) || 0; // common discount, applied to every variant's own price

    const cleanedVariants = validVariants.map((v) => {
      const variantPrice = parseFloat(v.price) || 0;
      const variantFinalPrice =
        Math.round((variantPrice - (variantPrice * discount) / 100) * 100) / 100;

      return {
        color: v.color,
        size: v.size,
        stockQuantity: Number(v.stockQuantity) || 0,
        stock: !!v.stock,
        price: variantPrice,
        finalPrice: variantFinalPrice, // required by VariantSchema
        sku: v.sku || "",
        imageCount: v.files.length, // tells the backend how many uploaded files belong to this variant
      };
    });

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("maincategory", data.maincategory);
    formData.append("subcategory", data.subcategory);
    formData.append("brand", data.brand || brandOptions[0]?._id || "");
    if (data.shop) formData.append("shop", data.shop); // optional on the schema — omit entirely if not picked
    formData.append("discount", discount); // real ProductSchema field
    formData.append("description", data.description);
    formData.append("active", data.active);
    formData.append("variants", JSON.stringify(cleanedVariants));

    // Flatten variant image files IN VARIANT ORDER — the backend slices
    // req.files sequentially per variant using each variant's imageCount.
    validVariants.forEach((v) => {
      v.files.forEach((file) => formData.append("pic", file));
    });

    dispatch(createProduct(formData));
    navigate("/product");
  }

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
              <h1 className="h3 mb-1">Add Product</h1>
              <p className="text-muted mb-0">
                Create a new product with category, brand, pricing, and variants.
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-outline-secondary btn-sm" to="/product">
              <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to
              Products
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
                    <i className="bi bi-box-seam" aria-hidden="true"></i>
                    <span>Product Information</span>
                  </h2>
                  <p className="text-muted mb-0">
                    Fill in the details to create a new product.
                  </p>
                </div>
              </div>

              <div className="row g-3">
                {/* Name */}
                <div className="col-12">
                  <label className="form-label" htmlFor="name">Name</label>
                  <input
                    className={`form-control ${show && error.name ? "is-invalid" : ""}`}
                    id="name"
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={getInputData}
                    placeholder="Enter Product Name"
                  />
                  {show && error.name && (
                    <div className="text-danger small mt-1">{error.name}</div>
                  )}
                </div>

                {/* Step 1: Main Category */}
                <div className="col-md-6">
                  <label className="form-label" htmlFor="maincategory">Main Category</label>
                  <select
                    className={`form-select ${show && error.maincategory ? "is-invalid" : ""}`}
                    id="maincategory"
                    name="maincategory"
                    value={data.maincategory}
                    onChange={getInputData}
                  >
                    <option value="" disabled>Select Main Category</option>
                    {maincategoryOptions.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                  {show && error.maincategory && (
                    <div className="text-danger small mt-1">{error.maincategory}</div>
                  )}
                </div>

                {/* Step 2: Sub Category — only those belonging to the selected main category */}
                <div className="col-md-6">
                  <label className="form-label" htmlFor="subcategory">Sub Category</label>
                  <select
                    className={`form-select ${show && error.subcategory ? "is-invalid" : ""}`}
                    id="subcategory"
                    name="subcategory"
                    value={data.subcategory}
                    onChange={getInputData}
                    disabled={!data.maincategory}
                  >
                    <option value="" disabled>
                      {!data.maincategory
                        ? "Select a main category first"
                        : subcategoryOptions.length
                          ? "Select Sub Category"
                          : "No subcategories for this main category"}
                    </option>
                    {subcategoryOptions.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                  {show && error.subcategory && (
                    <div className="text-danger small mt-1">{error.subcategory}</div>
                  )}
                </div>

                {/* Brand */}
                <div className="col-md-6">
                  <label className="form-label" htmlFor="brand">Brand</label>
                  <select
                    className={`form-select ${show && error.brand ? "is-invalid" : ""}`}
                    id="brand"
                    name="brand"
                    value={data.brand}
                    onChange={getInputData}
                  >
                    <option value="" disabled>Select Brand</option>
                    {brandOptions.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                  {show && error.brand && (
                    <div className="text-danger small mt-1">{error.brand}</div>
                  )}
                </div>

                {/* Shop — optional; Admin can attach a product to any active shop */}
                <div className="col-md-6">
                  <label className="form-label" htmlFor="shop">Shop (optional)</label>
                  <select
                    className="form-select"
                    id="shop"
                    name="shop"
                    value={data.shop}
                    onChange={getInputData}
                  >
                    <option value="">No shop</option>
                    {shopOptions.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                {/* Discount — common to every variant, used to derive each variant's finalPrice */}
                <div className="col-md-4">
                  <label className="form-label" htmlFor="discount">Discount (%)</label>
                  <input
                    className="form-control"
                    id="discount"
                    type="number"
                    name="discount"
                    min="0"
                    max="100"
                    value={data.discount}
                    onChange={getInputData}
                    placeholder="Enter Discount"
                  />
                  <div className="text-muted small mt-1">
                    This discount is applied to every variant when computing its final price.
                  </div>
                </div>

                {/* Variants */}
                <div className="col-12">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="form-label d-block mb-0">
                      Variants <span className="text-muted small">({data.variants.length})</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={addVariant}
                    >
                      <i className="bi bi-plus-lg" aria-hidden="true"></i> Add Variant
                    </button>
                  </div>
                  <div className="row g-3">
                    {data.variants.map((variant, index) => (
                      <div className="col-12" key={variant.key}>
                        <div className="border rounded p-3">
                          {/* Header row: variant label on the left, Stock toggle + Remove pinned top-right */}
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="fw-semibold small text-muted">
                              Variant {index + 1}
                            </span>
                            <div className="d-flex align-items-center gap-3">
                              <div className="form-check form-switch mb-0">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id={`variant-stock-${index}`}
                                  checked={variant.stock}
                                  onChange={(e) => getVariantData(index, "stock", e.target.checked)}
                                />
                                <label
                                  className="form-check-label small text-muted"
                                  htmlFor={`variant-stock-${index}`}
                                >
                                  {variant.stock ? "In Stock" : "Out of Stock"}
                                </label>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeVariant(index)}
                                disabled={data.variants.length <= 1}
                              >
                                <i className="bi bi-trash3" aria-hidden="true"></i> Remove
                              </button>
                            </div>
                          </div>

                          <div className="row g-2 align-items-end">
                            <div className="col-md-3">
                              <label className="form-label small">Color</label>
                              <input
                                className={`form-control ${show && error.variants && !variant.color ? "is-invalid" : ""
                                  }`}
                                type="text"
                                placeholder="e.g. Red"
                                value={variant.color}
                                onChange={(e) => getVariantData(index, "color", e.target.value)}
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small">Size</label>
                              <select
                                className={`form-select ${show && error.variants && !variant.size ? "is-invalid" : ""
                                  }`}
                                value={variant.size}
                                onChange={(e) => getVariantData(index, "size", e.target.value)}
                              >
                                <option value="" disabled>Select Size</option>
                                {SIZE_OPTIONS.map((sizeOption) => (
                                  <option key={sizeOption} value={sizeOption}>{sizeOption}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small">Stock Qty</label>
                              <input
                                className="form-control"
                                type="number"
                                min="0"
                                value={variant.stockQuantity}
                                onChange={(e) =>
                                  getVariantData(index, "stockQuantity", e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small">Price (₹)</label>
                              <input
                                className={`form-control ${show && error.variants && !(parseFloat(variant.price) > 0) ? "is-invalid" : ""
                                  }`}
                                type="number"
                                min="0"
                                placeholder="Required"
                                value={variant.price}
                                onChange={(e) => getVariantData(index, "price", e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="row g-2 align-items-end mt-1">
                            <div className="col-md-5">
                              <label className="form-label small">SKU</label>
                              <input
                                className="form-control"
                                type="text"
                                placeholder="optional"
                                value={variant.sku}
                                onChange={(e) => getVariantData(index, "sku", e.target.value)}
                              />
                            </div>
                            <div className="col-md-7">
                              <label className="form-label small">Images</label>
                              <input
                                className="form-control"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => getVariantFiles(index, e.target.files)}
                              />
                              {variant.files.length > 0 && (
                                <div className="text-muted small mt-1">
                                  {variant.files.length} file(s) selected
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {show && error.variants && (
                    <div className="text-danger small mt-1">{error.variants}</div>
                  )}
                </div>

                {/* Description */}
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <ReactQuill
                    theme="snow"
                    value={data.description}
                    onChange={(value) => setData((old) => ({ ...old, description: value }))}
                    className="quill-editor"
                    style={{ color: "var(--admin-text)" }}
                  />
                </div>

                {/* Status */}
                <div className="col-md-3">
                  <label className="form-label" htmlFor="active">Status</label>
                  <select
                    className="form-select"
                    id="active"
                    name="active"
                    value={data.active ? "1" : "0"}
                    onChange={getInputData}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                <Link className="btn btn-outline-secondary" to="/product">Cancel</Link>
                <button className="btn btn-primary" type="button" onClick={postSubmit}>
                  <i className="bi bi-check-circle" aria-hidden="true"></i>{" "}
                  Create Product
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