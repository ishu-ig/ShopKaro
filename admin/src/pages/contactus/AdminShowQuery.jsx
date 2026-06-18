import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteContactUs,
  getContactUs,
  updateContactUs,
} from "../../Redux/ActionCreators/ContactUsActionCreators";

export default function AdminShowQuery() {
  let { _id } = useParams();
  let [data, setData] = useState({});
  let [flag, setFlag] = useState(true);

  let ContactUsStateData = useSelector((state) => state.ContactUsStateData);
  let dispatch = useDispatch();
  let navigate = useNavigate();

  function deleteRecord() {
    if (window.confirm("Are You Sure to Delete that Item : ")) {
      dispatch(deleteContactUs({ _id: _id }));
      navigate("/contactus");
    }
  }

  function updateRecord() {
    if (window.confirm("Are You Sure to Update the Status : ")) {
      dispatch(updateContactUs({ ...data, active: !data.active }));
      setData((old) => ({ ...old, active: !old.active }));
      setFlag(!flag);
    }
  }

  useEffect(() => {
    dispatch(getContactUs());
    if (ContactUsStateData.length) {
      let item = ContactUsStateData.find((x) => x._id === _id);
      if (item) setData({ ...item });
      else alert("Invalid Contact Us Id");
    }
  }, [ContactUsStateData.length]);

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">

        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-envelope-open" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Query Details</h1>
              <p className="text-muted mb-0">
                Review the full details of this customer query.
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-outline-secondary btn-sm" to="/contactus">
              <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to Contact Us
            </Link>
          </div>
        </div>

        <section className="row g-3">
          <div className="col-12 col-xl-8">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-person-lines-fill" aria-hidden="true"></i>
                    <span>Query Information</span>
                  </h2>
                  <p className="text-muted mb-0">
                    Submitted by {data.name || "—"}.
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <tbody>
                    <tr>
                      <th style={{ width: 160 }}>Name</th>
                      <td>{data.name}</td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{data.email}</td>
                    </tr>
                    <tr>
                      <th>Phone</th>
                      <td>{data.phone}</td>
                    </tr>
                    <tr>
                      <th>Subject</th>
                      <td>{data.subject}</td>
                    </tr>
                    <tr>
                      <th>Message</th>
                      <td>{data.message}</td>
                    </tr>
                    <tr>
                      <th>Date</th>
                      <td>{data.createdAt ? new Date(data.createdAt).toLocaleString() : "—"}</td>
                    </tr>
                    <tr>
                      <th>Status</th>
                      <td>
                        <span
                          className={`badge ${data.active ? "text-bg-success" : "text-bg-secondary"}`}
                        >
                          {data.active ? "Active" : "Resolved"}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                {data.active ? (
                  <button className="btn btn-primary" onClick={updateRecord}>
                    <i className="bi bi-check-circle" aria-hidden="true"></i> Mark Resolved
                  </button>
                ) : (
                  <button className="btn btn-danger" onClick={deleteRecord}>
                    <i className="bi bi-trash3" aria-hidden="true"></i> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}