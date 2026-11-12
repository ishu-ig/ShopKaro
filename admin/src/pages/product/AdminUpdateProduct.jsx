import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import formValidator from "../../FormValidators/formValidator";
import { updateProduct, getProduct } from "../../Redux/ActionCreators/ProductActionCreators";
import { getShop } from "../../Redux/ActionCreators/ShopActionCreators";
import { getMaincategory } from "../../Redux/ActionCreators/MaincategoryActionCreators";
import { getSubcategory } from "../../Redux/ActionCreators/SubcategoryActionCreators";
// ASSUMPTION: a Brand action creator/state slice exists, mirroring the Shop one.
import { getBrand } from "../../Redux/ActionCreators/BrandActionCreators";

const SIZE_OPTIONS = ["Free Size", "XS", "S", "M", "L", "XL", "XXL"];

// Fields that are optional / not validated by formValidator
const SKIP_VALIDATION = ["active", "isreturnAble", "returnDuration", "warranty"];

const checklist = [
  {
    dot: "bg-success",
    title: "Review details",
    body: "Confirm name, main category, subcategory, brand, and shop are correct.",
  },
  {
    dot: "bg-primary",
    title: "Check variant stock",
    body: "Update stock quantity and status so counts stay accurate.",
  },
  {
    dot: "bg-warning",
    title: "Review variant images",
    body: "Confirm each variant still lists the right image paths.",
  },
  {
    dot: "bg-info",
    title: "Check return & warranty",
    body: "Confirm whether the product is returnable, its return window, and the warranty text.",
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

// Normalizes an entry into a { _productId, name } option.
//
// IMPORTANT: the API / Mongo documents only ever carry `_id` (Mongoose's
// built-in primary key) — there is no `_productId` field anywhere in the
// database or the router (`PUT /:_id`). `_productId` is this component's
// own internal naming convention for "the id of the thing", and it is
// always SOURCED FROM `_id`, aliased right here at the boundary where data
// enters the component.
function toOption(entry) {
  if (entry && typeof entry === "object" && "name" in entry) {
    const id = entry._id?.$oid || entry._id;
    return { _productId: id, name: entry.name };
  }
  const id = toIdString(entry);
  return { _productId: id, name: id };
}

function makeEmptyVariant() {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    _productId: undefined,
    color: "",
    size: "",
    stockQuantity: 0,
    stock: true,
    price: "",
    sku: "",
    pic: [],
    files: [],
  };
}

// Normalize a product's saved variants into editable rows.
// NOTE: the current updateRecord controller does not process req.files for
// images on update — it only re-saves whatever `pic` array is sent in the
// variants JSON. So existing images are kept/edited as plain URL strings
// here rather than as a file upload.
function mapVariantsForEdit(savedVariants, rootItem) {
  const saved = Array.isArray(savedVariants) ? savedVariants : [];
  if (saved.length === 0) {
    if (rootItem && (rootItem.color || rootItem.basePrice || rootItem.price || (rootItem.pic && rootItem.pic.length))) {
      return [{
        key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        _productId: undefined,
        color: rootItem.color ?? "",
        size: rootItem.size ?? "",
        stockQuantity: rootItem.stockQuantity ?? 0,
        stock: rootItem.stock ?? true,
        price: rootItem.basePrice ?? rootItem.price ?? "",
        sku: rootItem.sku ?? "",
        pic: Array.isArray(rootItem.pic) ? rootItem.pic : [],
        files: [],
      }];
    }
    return [makeEmptyVariant()];
  }
  return saved.map((v) => ({
    // Same aliasing rule: subdocuments only ever carry `_id`, read that here.
    key: v._id?.$oid || v._id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    _productId: v._id?.$oid || v._id, // preserved so the same sub-document id is reused on save
    color: v.color ?? "",
    size: v.size ?? "",
    stockQuantity: v.stockQuantity ?? 0,
    stock: v.stock ?? true,
    price: v.price ?? "",
    sku: v.sku ?? "",
    pic: Array.isArray(v.pic) ? v.pic : [], // existing image URLs, editable as text
    files: [], // new File[] chosen for this variant on this edit, if any
  }));
}

export default function AdminUpdateProduct() {
  // The route itself is defined as `PUT /:_id` on the server side (matches
  // ProductRouter.put("/:_id", ...)), so react-router's param is named
  // `_id` regardless of what we call it in this file. We destructure it as
  // `_id` and immediately alias to `_productId` for use everywhere below —
  // this is the ONLY place the real param name and our naming convention meet.
  const { _id, _productId: paramId } = useParams();
  const _productId = _id || paramId;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [data, setData] = useState({
    name: "",
    maincategory: "",
    subcategory: "",
    brand: "",
    shop: "",
    discount: 0, // common discount, applied to every variant's own price
    isreturnAble: true, // whether the product can be returned at all
    returnDuration: 7, // days a customer may return the product
    warranty: "1 Year",
    description: "",
    active: true,
    variants: [makeEmptyVariant()],
  });

  const [error, setError] = useState({
    name: "",
    maincategory: "",
    subcategory: "",
    brand: "",
    shop: "",
    variants: "",
  });

  const [show, setShow] = useState(false);

  const ProductStateData = useSelector((state) => state.ProductStateData);
  const ShopStateData = useSelector((state) => state.ShopStateData);
  const BrandStateData = useSelector((state) => state.BrandStateData);
  const MaincategoryStateData = useSelector((state) => state.MaincategoryStateData);
  const SubcategoryStateData = useSelector((state) => state.SubcategoryStateData);

  useEffect(() => { dispatch(getShop()); }, [ShopStateData.length]);
  useEffect(() => { dispatch(getBrand()); }, [BrandStateData.length]);
  useEffect(() => { dispatch(getMaincategory()); }, [MaincategoryStateData.length]);
  useEffect(() => { dispatch(getSubcategory()); }, [SubcategoryStateData.length]);

  useEffect(() => {
    dispatch(getProduct());
    if (ProductStateData.length) {
      // ProductStateData items come straight from the API. `_id` values can
      // arrive either as a plain string OR wrapped as { $oid: "..." }
      // depending on the serializer — toIdString() normalizes either shape.
      const item = ProductStateData.find((x) => toIdString(x._id) === _productId);
      if (item) {
        setData({
          name: item.name ?? "",
          maincategory: refId(item.maincategory) ?? "",
          subcategory: refId(item.subcategory) ?? "",
          brand: refId(item.brand) ?? "",
          shop: refId(item.shop) ?? "",
          discount: item.discount ?? 0,
          isreturnAble: item.isreturnAble ?? true,
          returnDuration: item.returnDuration ?? 7,
          warranty: item.warranty ?? "1 Year",
          description: item.description ?? "",
          active: item.active ?? true,
          variants: mapVariantsForEdit(item.variants, item),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ProductStateData.length, _productId]);

  // Step 1: all active main categories.
  const maincategoryOptions = (MaincategoryStateData || [])
    .filter((x) => x?.active || toIdString(x._id) === data.maincategory)
    .map(toOption);

  // Step 2: subcategories belonging ONLY to the selected main category.
  // Nothing is listed until a main category is selected.
  const subcategoryOptions = data.maincategory
    ? (SubcategoryStateData || [])
      .filter((x) => x?.active || toIdString(x._id) === data.subcategory)
      .filter((x) => refId(x.maincategory) === data.maincategory)
      .map(toOption)
    : [];

  const brandOptions = (BrandStateData || []).map(toOption);
  const shopOptions = (ShopStateData || []).filter((x) => x?.active).map(toOption);

  function getInputData(e) {
    const name = e.target.name;
    const value = e.target.value;

    if (!SKIP_VALIDATION.includes(name)) {
      setError((old) => ({ ...old, [name]: formValidator(e) }));
    }

    // Changing the main category invalidates the chosen subcategory,
    // so clear it and make the user pick again from the new list.
    // (Done here, not in an effect, so the saved subcategory loaded from
    // the product isn't wiped when the form first populates.)
    if (name === "maincategory") {
      setError((old) => ({ ...old, subcategory: "Sub Category is Mandatory" }));
      setData((old) => ({ ...old, maincategory: value, subcategory: "" }));
      return;
    }

    if (name === "shop") {
      setError((old) => ({ ...old, shop: value ? "" : "Shop is Mandatory" }));
    }

    setData((old) => ({
      ...old,
      [name]: name === "active" || name === "isreturnAble" ? value === "1" : value,
    }));
  }

  function getVariantData(index, field, value) {
    setData((old) => {
      const variants = old.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      );

      // Price is required per variant since there's no product-level
      // basePrice to fall back on.
      const hasValidVariant = variants.some(
        (v) => String(v.color).trim() !== "" && String(v.size).trim() !== "" && parseFloat(v.price) > 0
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

  // Edits an existing image URL in-place, or removes it when set to "".
  function getVariantPic(index, picIndex, value) {
    setData((old) => {
      const variants = old.variants.map((v, i) => {
        if (i !== index) return v;
        const pic = [...v.pic];
        if (value === "") {
          pic.splice(picIndex, 1);
        } else {
          pic[picIndex] = value;
        }
        return { ...v, pic };
      });
      return { ...old, variants };
    });
  }

  function addVariantPic(index) {
    setData((old) => {
      const variants = old.variants.map((v, i) =>
        i === index ? { ...v, pic: [...v.pic, ""] } : v
      );
      return { ...old, variants };
    });
  }

  // New image files picked for this variant on this edit — appended to any
  // files already selected earlier in this session (instead of replacing them).
  function getVariantFiles(index, fileList) {
    setData((old) => {
      const variants = old.variants.map((v, i) =>
        i === index ? { ...v, files: [...v.files, ...Array.from(fileList || [])] } : v
      );
      return { ...old, variants };
    });
  }

  // Removes a single newly-selected (not-yet-uploaded) file by its index.
  function removeVariantFile(index, fileIndex) {
    setData((old) => {
      const variants = old.variants.map((v, i) =>
        i === index ? { ...v, files: v.files.filter((_, fi) => fi !== fileIndex) } : v
      );
      return { ...old, variants };
    });
  }

  function addVariant() {
    setData((old) => ({ ...old, variants: [...old.variants, makeEmptyVariant()] }));
  }

  function removeVariant(index) {
    setData((old) => {
      if (old.variants.length <= 1) return old;
      return { ...old, variants: old.variants.filter((_, i) => i !== index) };
    });
  }

  function postSubmit(e) {
    e.preventDefault();
    if (!data.shop) {
      setError((old) => ({ ...old, shop: "Shop is Mandatory" }));
      setShow(true);
      return;
    }
    const errorItem = Object.values(error).find((x) => x !== "");
    if (errorItem) {
      setShow(true);
      return;
    }

    // Only send variants that have color, size, AND a valid price.
    const validVariants = data.variants.filter(
      (v) => String(v.color).trim() !== "" && String(v.size).trim() !== "" && parseFloat(v.price) > 0
    );

    const discount = Number(data.discount) || 0; // common discount, applied to every variant's own price
    const isreturnAble = !!data.isreturnAble;
    const returnDuration = isreturnAble ? Math.max(0, Number(data.returnDuration) || 0) : 0;
    const warranty = String(data.warranty ?? "").trim() || "No Warranty";

    // Keep the same variant sub-document id where one already existed. The
    // VariantSchema subdocument field is `_id` (Mongoose default) — we
    // translate our internal `_productId` back to `_id` here, right before
    // it leaves the component.
    const cleanedVariants = validVariants.map((v) => {
      const variantPrice = parseFloat(v.price) || 0;
      const variantFinalPrice =
        Math.round((variantPrice - (variantPrice * discount) / 100) * 100) / 100;

      return {
        ...(v._productId ? { _id: v._productId } : {}),
        color: v.color,
        size: v.size,
        stockQuantity: Number(v.stockQuantity) || 0,
        stock: !!v.stock,
        price: variantPrice,
        finalPrice: variantFinalPrice, // required by VariantSchema
        sku: v.sku || "",
        pic: v.pic.filter((p) => p && p.trim() !== ""), // existing images kept/edited as URLs
        imageCount: v.files.length, // tells the backend how many NEW uploaded files to append for this variant
      };
    });

    const formData = new FormData();
    // The server reads the record id from the URL (req.params._id via the
    // PUT /:_id route), not from the body — sent for completeness only.
    formData.append("_id", _productId);
    formData.append("name", data.name);
    formData.append("maincategory", data.maincategory);
    formData.append("subcategory", data.subcategory);
    formData.append("brand", data.brand);
    formData.append("shop", data.shop);
    formData.append("discount", discount); // real ProductSchema field
    formData.append("isreturnAble", isreturnAble); // real ProductSchema field
    formData.append("returnDuration", returnDuration); // real ProductSchema field
    formData.append("warranty", warranty); // real ProductSchema field
    formData.append("description", data.description);
    formData.append("active", data.active);
    formData.append("variants", JSON.stringify(cleanedVariants));

    // Flatten NEW variant image files IN VARIANT ORDER — same convention as
    // the create form.
    validVariants.forEach((v) => {
      v.files.forEach((file) => formData.append("pic", file));
    });

    // FIX: the original version built the FormData but never dispatched it,
    // so edits were silently discarded.
    dispatch(updateProduct(formData));

    if (localStorage.getItem("role") === "Admin") {
      navigate("/product");
    } else {
      navigate(`/shopProduct/${localStorage.getItem("role")}/${localStorage.getItem("userid")}`);
    }
  }

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-pencil-square" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Update Product</h1>
              <p className="text-muted mb-0">
                Edit category, brand, shop, pricing, variants, return window, warranty, and status.
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-outline-secondary btn-sm" to="/product">
              <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to Products
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
                    <i className="bi bi-pencil-square" aria-hidden="true"></i>
                    <span>Product Information</span>
                  </h2>
                  <p className="text-muted mb-0">Update the details for this product.</p>
                </div>
              </div>

              <div className="row g-3">
                {/* Name */}
                <div className="col-12">
                  <label className="form-label" htmlFor="name">Name</label>
                  <input
                    className={`form-control ${show && error.name ? "is-invalid" : ""}`}
                    id="name" type="text" name="name"
                    value={data.name} onChange={getInputData}
                    placeholder="Enter Product Name"
                  />
                  {show && error.name && <div className="text-danger small mt-1">{error.name}</div>}
                </div>

                {/* Step 1: Main Category */}
                <div className="col-md-6">
                  <label className="form-label" htmlFor="maincategory">Main Category</label>
                  <select
                    className={`form-select ${show && error.maincategory ? "is-invalid" : ""}`}
                    id="maincategory" name="maincategory"
                    value={data.maincategory} onChange={getInputData}
                  >
                    <option value="" disabled>Select Main Category</option>
                    {maincategoryOptions.map((item) => (
                      <option key={item._productId} value={item._productId}>{item.name}</option>
                    ))}
                  </select>
                  {show && error.maincategory && <div className="text-danger small mt-1">{error.maincategory}</div>}
                </div>

                {/* Step 2: Sub Category — only those belonging to the selected main category */}
                <div className="col-md-6">
                  <label className="form-label" htmlFor="subcategory">Sub Category</label>
                  <select
                    className={`form-select ${show && error.subcategory ? "is-invalid" : ""}`}
                    id="subcategory" name="subcategory"
                    value={data.subcategory} onChange={getInputData}
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
                      <option key={item._productId} value={item._productId}>{item.name}</option>
                    ))}
                  </select>
                  {show && error.subcategory && <div className="text-danger small mt-1">{error.subcategory}</div>}
                </div>

                {/* Brand */}
                <div className="col-md-4">
                  <label className="form-label" htmlFor="brand">Brand</label>
                  <select
                    className={`form-select ${show && error.brand ? "is-invalid" : ""}`}
                    id="brand" name="brand"
                    value={data.brand} onChange={getInputData}
                  >
                    <option value="" disabled>Select Brand</option>
                    {brandOptions.map((item) => (
                      <option key={item._productId} value={item._productId}>{item.name}</option>
                    ))}
                  </select>
                  {show && error.brand && <div className="text-danger small mt-1">{error.brand}</div>}
                </div>

                {/* Shop — Mandatory */}
                <div className="col-md-4">
                  <label className="form-label" htmlFor="shop">Shop <span className="text-danger">*</span></label>
                  <select
                    className="form-select" id="shop" name="shop"
                    value={data.shop} onChange={getInputData}
                  >
                    <option value="" disabled>Select Shop</option>
                    {shopOptions.map((item) => (
                      <option key={item._productId} value={item._productId}>{item.name}</option>
                    ))}
                  </select>
                  {show && error.shop && <div className="text-danger small mt-1">{error.shop}</div>}
                </div>

                {/* Discount — common to every variant, used to derive each variant's finalPrice */}
                <div className="col-md-4">
                  <label className="form-label" htmlFor="discount">Discount (%)</label>
                  <input
                    className="form-control"
                    id="discount" type="number" name="discount"
                    min="0" max="100"
                    value={data.discount} onChange={getInputData}
                    placeholder="Enter Discount"
                  />
                  <div className="text-muted small mt-1">
                    Applied to every variant when computing its final price.
                  </div>
                </div>

                {/* Returnable */}
                <div className="col-md-4">
                  <label className="form-label" htmlFor="isreturnAble">Returnable</label>
                  <select
                    className="form-select"
                    id="isreturnAble"
                    name="isreturnAble"
                    value={data.isreturnAble ? "1" : "0"}
                    onChange={getInputData}
                  >
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>

                {/* Return window — shown only when the product is returnable */}
                {data.isreturnAble && (
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="returnDuration">Return Window (days)</label>
                    <input
                      className="form-control"
                      id="returnDuration" type="number" name="returnDuration"
                      min="0"
                      value={data.returnDuration} onChange={getInputData}
                      placeholder="e.g. 7"
                    />
                    <div className="text-muted small mt-1">
                      Days after delivery within which a return is accepted.
                    </div>
                  </div>
                )}

                {/* Warranty */}
                <div className="col-md-4">
                  <label className="form-label" htmlFor="warranty">Warranty</label>
                  <input
                    className="form-control"
                    id="warranty" type="text" name="warranty"
                    value={data.warranty} onChange={getInputData}
                    placeholder="e.g. 1 Year, 6 Months"
                  />
                  <div className="text-muted small mt-1">
                    Leave empty for "No Warranty".
                  </div>
                </div>

                {/* Variants */}
                <div className="col-12">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="form-label d-block mb-0">
                      Variants <span className="text-muted small">({data.variants.length})</span>
                    </label>
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={addVariant}>
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
                                type="number" min="0"
                                value={variant.stockQuantity}
                                onChange={(e) => getVariantData(index, "stockQuantity", e.target.value)}
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small">Price (₹)</label>
                              <input
                                className={`form-control ${show && error.variants && !(parseFloat(variant.price) > 0) ? "is-invalid" : ""
                                  }`}
                                type="number" min="0"
                                placeholder="Required"
                                value={variant.price}
                                onChange={(e) => getVariantData(index, "price", e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="row g-2 align-items-start mt-1">
                            <div className="col-md-4">
                              <label className="form-label small">SKU</label>
                              <input
                                className="form-control"
                                type="text"
                                value={variant.sku}
                                onChange={(e) => getVariantData(index, "sku", e.target.value)}
                              />
                            </div>
                            <div className="col-md-12">
                              <label className="form-label small d-flex justify-content-between">
                                <span>Existing Images</span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link p-0"
                                  onClick={() => addVariantPic(index)}
                                >
                                  + add by URL
                                </button>
                              </label>
                              {variant.pic.length === 0 && (
                                <div className="text-muted small">No images yet.</div>
                              )}
                              <div className="d-flex flex-wrap gap-2 mb-2">
                                {variant.pic.map((url, picIndex) =>
                                  url ? (
                                    <div className="position-relative" key={picIndex}>
                                      <img
                                        src={url}
                                        alt={`Variant ${index + 1} image ${picIndex + 1}`}
                                        className="rounded border"
                                        style={{ width: 72, height: 72, objectFit: "cover" }}
                                      />
                                      <button
                                        type="button"
                                        className="btn btn-danger position-absolute p-0 d-flex align-items-center justify-content-center"
                                        style={{
                                          width: 20, height: 20, borderRadius: "50%",
                                          top: -6, right: -6, lineHeight: 1,
                                        }}
                                        onClick={() => getVariantPic(index, picIndex, "")}
                                        aria-label="Remove image"
                                        title="Remove image"
                                      >
                                        <i className="bi bi-x" style={{ fontSize: "0.85rem" }}></i>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="input-group input-group-sm" style={{ width: 200 }} key={picIndex}>
                                      <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Paste image URL"
                                        value={url}
                                        onChange={(e) => getVariantPic(index, picIndex, e.target.value)}
                                      />
                                      <button
                                        className="btn btn-outline-danger"
                                        type="button"
                                        onClick={() => getVariantPic(index, picIndex, "")}
                                      >
                                        <i className="bi bi-x"></i>
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>

                              <label className="form-label small mt-2">Upload New Images</label>
                              <input
                                className="form-control"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  getVariantFiles(index, e.target.files);
                                  e.target.value = ""; // reset so choosing files again always fires onChange
                                }}
                              />
                              {variant.files.length > 0 && (
                                <>
                                  <div className="text-muted small mt-1">
                                    {variant.files.length} new file(s) selected — will be
                                    added alongside any existing images you keep above.
                                  </div>
                                  <div className="d-flex flex-wrap gap-2 mt-2">
                                    {variant.files.map((file, fileIndex) => (
                                      <div className="position-relative" key={fileIndex}>
                                        <img
                                          src={URL.createObjectURL(file)}
                                          alt={`New upload ${fileIndex + 1}`}
                                          className="rounded border"
                                          style={{ width: 72, height: 72, objectFit: "cover" }}
                                        />
                                        <button
                                          type="button"
                                          className="btn btn-danger position-absolute p-0 d-flex align-items-center justify-content-center"
                                          style={{
                                            width: 20, height: 20, borderRadius: "50%",
                                            top: -6, right: -6, lineHeight: 1,
                                          }}
                                          onClick={() => removeVariantFile(index, fileIndex)}
                                          aria-label="Remove new image"
                                          title="Remove image"
                                        >
                                          <i className="bi bi-x" style={{ fontSize: "0.85rem" }}></i>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </>
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
                    style={{ minHeight: 250 }}
                    className="quill-editor"
                  />
                </div>

                {/* Status */}
                <div className="col-md-3">
                  <label className="form-label" htmlFor="active">Status</label>
                  <select
                    className="form-select" id="active" name="active"
                    value={data.active ? "1" : "0"} onChange={getInputData}
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
                  Update Product
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
      </div>
    </main>
  );
}