import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import formValidator from "../../../FormValidators/formValidator";
import { createProduct } from "../../../Redux/ActionCreators/ProductActionCreators";
import { getShop } from "../../../Redux/ActionCreators/ShopActionCreators";
import { getBrand } from "../../../Redux/ActionCreators/BrandActionCreators";

const checklist = [
  {
    dot: "bg-success",
    title: "Name & categorize",
    body: "Use a clear product name and pick the right category, subcategory, brand, and shop.",
  },
  {
    dot: "bg-primary",
    title: "Add variants",
    body: "Add at least one variant with a color and size — stock quantity keeps the count accurate.",
  },
  {
    dot: "bg-warning",
    title: "Upload variant images",
    body: "Add one or more photos per variant so customers can see exactly what they're buying.",
  },
];

// Some APIs (or raw Mongo exports) return ObjectId refs wrapped as { $oid: "..." }
// instead of plain strings. This normalizes either shape to a plain string id.
function toIdString(id) {
  if (id && typeof id === "object" && "$oid" in id) return id.$oid;
  return id;
}

// Normalizes an entry from Shop.maincategory / Shop.subcategory
// into a { _id, name, maincategory? } option. Handles two possible shapes
// coming back from the API for a populated ref:
//   - a populated object: { _id: "...", name: "Starters", maincategory: "..." }
//   - a raw id (string, or Mongo-export { $oid: "..." } wrapper)
// For the raw-id case there's no name/maincategory to show (no separate
// category fetch), so we fall back to the id itself as the label and
// leave maincategory undefined.
function toOption(entry) {
  if (entry && typeof entry === "object" && "name" in entry) {
    const id = entry._id?.$oid || entry._id;
    const maincategoryId = entry.maincategory
      ? toIdString(entry.maincategory?._id ?? entry.maincategory)
      : undefined;
    return { _id: id, name: entry.name, maincategory: maincategoryId };
  }
  const id = toIdString(entry);
  return { _id: id, name: id };
}

// Options for the variant Size dropdown.
const SIZE_OPTIONS = ["Free Size", "XS", "S", "M", "L", "XL", "XXL"];

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

export default function ShopCreateProduct() {
  const { _id } = useParams();

  const [data, setData] = useState({
    name: "",
    maincategory: "",
    subcategory: "",
    brand: "",
    shop: _id || "", // default shop to the :_id route param
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

  const ShopStateData = useSelector((state) => state.ShopStateData);
  const BrandStateData = useSelector((state) => state.BrandStateData);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getShop());
  }, [ShopStateData.length]);

  useEffect(() => {
    dispatch(getBrand());
  }, [BrandStateData.length]);

  // Keep shop pinned to the route param whenever it's present.
  // If there's no :_id (generic /product/create route), fall back to the first active shop once loaded.
  useEffect(() => {
    if (_id) {
      setData((old) => ({ ...old, shop: _id }));
      return;
    }
    if (ShopStateData.length > 0) {
      const fallback = ShopStateData.find((item) => item?.active);
      setData((old) => ({ ...old, shop: old.shop || fallback?._id || "" }));
    }
  }, [ShopStateData, _id]);

  // Whenever the selected shop changes, clear any previously picked
  // main/sub category since they may not belong to the new shop.
  useEffect(() => {
    setData((old) => ({ ...old, maincategory: "", subcategory: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.shop]);

  // Whenever the selected main category changes, clear any previously
  // picked subcategory since it may not belong to the new main category.
  useEffect(() => {
    setData((old) => ({ ...old, subcategory: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.maincategory]);

  const selectedShop = ShopStateData.find((r) => r._id === data.shop);

  // The shop's OWN maincategory/subcategory arrays are the only
  // source for these dropdowns — no separate Maincategory/Subcategory state.
  // Sorted alphabetically for predictable ordering in the dropdown.
  const availableMaincategories = (selectedShop?.maincategory || [])
    .map(toOption)
    .sort((a, b) => a.name.localeCompare(b.name));

  const availableSubcategories = (selectedShop?.subcategory || []).map(toOption);

  // Subcategories scoped to the currently selected main category, sorted
  // alphabetically. If a subcategory option has no maincategory info (raw-id
  // fallback case), it's shown regardless — we can't filter what we don't know.
  const filteredSubcategories = availableSubcategories
    .filter((opt) => !opt.maincategory || opt.maincategory === data.maincategory)
    .sort((a, b) => a.name.localeCompare(b.name));

  const brandOptions = (BrandStateData || []).map(toOption);

  function getInputData(e) {
    const name = e.target.name;
    const value = e.target.value;

    if (name !== "active") {
      setError((old) => ({ ...old, [name]: formValidator(e) }));
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
    formData.append(
      "maincategory",
      data.maincategory || availableMaincategories[0]?._id || ""
    );
    formData.append(
      "subcategory",
      data.subcategory || availableSubcategories[0]?._id || ""
    );
    formData.append("brand", data.brand || brandOptions[0]?._id || "");
    formData.append("shop", data.shop || _id || ShopStateData[0]?._id);
    formData.append("discount", discount); // real ProductSchema field
    formData.append("description", data.description);
    formData.append("active", data.active);
    formData.append("variants", JSON.stringify(cleanedVariants));

    // Flatten variant image files IN VARIANT ORDER — the backend slices
    // req.files sequentially per variant using each variant's imageCount.
    // ASSUMPTION: multer field name is "images"; change to match your route.
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
                Create a new product with category, brand, shop, pricing, and variants.
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

                {/* Shop — defaults to the :_id route param, editable if you land here without one */}
                <div className="col-md-6">
                  <label className="form-label" htmlFor="shop">Shop</label>
                  <select
                    className="form-select"
                    id="shop"
                    name="shop"
                    value={data.shop}
                    onChange={getInputData}
                    disabled={!!_id}
                  >
                    <option value="" disabled>Select Shop</option>
                    {ShopStateData?.filter((x) => x?.active).map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                  {_id && (
                    <div className="text-muted small mt-1">
                      Locked to the shop this product is being added under.
                    </div>
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

                {/* Main Category — scoped to the selected shop's own maincategory list */}
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
                    {availableMaincategories.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                  {show && error.maincategory && (
                    <div className="text-danger small mt-1">{error.maincategory}</div>
                  )}
                </div>

                {/* Sub Category — scoped to the selected main category */}
                <div className="col-md-6">
                  <label className="form-label" htmlFor="subcategory">Sub Category</label>
                  <select
                    className={`form-select ${show && error.subcategory ? "is-invalid" : ""}`}
                    id="subcategory"
                    name="subcategory"
                    value={data.subcategory}
                    onChange={getInputData}
                  >
                    <option value="" disabled>
                      {data.maincategory ? "Select Sub Category" : "Select a main category first"}
                    </option>
                    {filteredSubcategories.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                  {show && error.subcategory && (
                    <div className="text-danger small mt-1">{error.subcategory}</div>
                  )}
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
                                className={`form-control ${
                                  show && error.variants && !variant.color ? "is-invalid" : ""
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
                                className={`form-select ${
                                  show && error.variants && !variant.size ? "is-invalid" : ""
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
                                className={`form-control ${
                                  show && error.variants && !(parseFloat(variant.price) > 0) ? "is-invalid" : ""
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
                            <div className="col-md-4">
                              <label className="form-label small">SKU</label>
                              <input
                                className="form-control"
                                type="text"
                                placeholder="optional"
                                value={variant.sku}
                                onChange={(e) => getVariantData(index, "sku", e.target.value)}
                              />
                            </div>
                            <div className="col-md-8">
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