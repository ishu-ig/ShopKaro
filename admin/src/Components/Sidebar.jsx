import React from "react";
import { Link } from "react-router-dom";

export default function AdminSidebar({ isExpanded }) {
    return (
        <div id="sidebar" className={isExpanded ? "expanded" : ""}>
            <div className="sidebar-header">
                <img src="https://i.pravatar.cc/100" alt="Admin" className="admin-avatar" />
                <span className="admin-name">John Doe</span>
            </div>

            <ul className="nav flex-column mt-3  sidebar-nav">
                <li><Link to="/dashboard" className="nav-link"><i className="fa fa-home"></i> <span>Dashboard</span></Link></li>
                <li><Link to="/maincategory" className="nav-link"><i className="fa fa-list"></i> <span>Maincategory</span></Link></li>
                <li><Link to="/subcategory" className="nav-link"><i className="fa fa-list"></i> <span>Subcategory</span></Link></li>
                <li><Link to="/brand" className="nav-link"><i className="fa fa-list"></i> <span>Brands</span></Link></li>
                <li><Link to="/product" className="nav-link"><i className="fa fa-list"></i> <span>Products</span></Link></li>
                <li><Link to="/testimonial" className="nav-link"><i className="fa fa-star"></i> <span>Testmonial</span></Link></li>
                <li><Link to="/newsletter" className="nav-link"><i className="fa fa-envelope"></i> <span>Newsletter</span></Link></li>
                <li><Link to="/checkout" className="nav-link"><i className="fa fa-shopping-cart"></i> <span>Checkout</span></Link></li>
                <li><Link to="/user" className="nav-link"><i className="fa fa-users"></i> <span>User</span></Link></li>
                <li><Link to="/contactus" className="nav-link"><i className="fa fa-phone"></i> <span>ContactUs</span></Link></li>
                <li><Link to="/settings" className="nav-link"><i className="fa fa-cog"></i> <span>Settings</span></Link></li>
            </ul>
        </div>
    );
}
