
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getShop } from "../../../Redux/ActionCreators/ShopActionCreators";

export default function ShopMaincategory() {
  const { _id } = useParams();
  const dispatch = useDispatch();

  const ShopStateData = useSelector((state) => state.ShopStateData);

  const [shop, setShop] = useState(null);
  const [error, setError] = useState("");

  // Make sure the restaurant list is loaded (harmless if it already is —
  // adjust/remove this if some parent route already dispatches it).
  useEffect(() => {
    dispatch(getShop());
  }, [dispatch]);

  // Find THIS restaurant once the list is available
  useEffect(() => {
    if (ShopStateData?.length > 0) {
      const match = ShopStateData.find((item) => item._id === _id);

      if (match) {
        setShop(match);
      } else {
        setError("Restaurant not found.");
      }
    }
  }, [ShopStateData, _id]);

  if (error && !shop) {
    return (
      <div className="container py-5 text-center text-danger">
        {error}
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container py-5 text-center text-muted">
        Loading restaurant…
      </div>
    );
  }

  // resturent.maincategory comes back populated (objects with _id, name,
  // active, pic) directly from the API — no need to cross-reference
  // against a separately-loaded category list.
  const maincategoryList = shop.maincategory || [];

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading mb-4">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-grid" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Main Categories — {shop.name}</h1>
              <p className="text-muted mb-0">
                Main categories currently attached to this restaurant.
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <Link
              className="btn btn-outline-secondary btn-sm"
              to={`/shopMaincategory/${localStorage.getItem("role")}/${localStorage.getItem("userid")}/add`}
            >
              <i className="bi bi-plus-lg" aria-hidden="true"></i>
              Add Maincategory
            </Link>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2 className="h5 mb-1 section-title">
                <i className="bi bi-collection" aria-hidden="true"></i>
                <span>Attached Categories</span>
              </h2>
              <p className="text-muted mb-0">
                Categories this restaurant is currently attached to.
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {maincategoryList.length > 0 ? (
                  maincategoryList.map((cat, index) => (
                    <tr key={cat._id}>
                      <td>{index + 1}</td>
                      <td>
                        {cat.pic ? (
                          <a href={cat.pic} target="_blank" rel="noreferrer">
                            <img
                              src={cat.pic}
                              alt={cat.name}
                              style={{ width: 64, height: 42, objectFit: "cover", borderRadius: 6 }}
                            />
                          </a>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td className="fw-semibold">{cat.name}</td>
                      <td>
                        <span className={`badge ${cat.active ? "text-bg-success" : "text-bg-secondary"}`}>
                          {cat.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">
                      No categories attached yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}