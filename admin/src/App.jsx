import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from './Components/Sidebar';
import AdminNavbar from './Components/Navbar';
import Footer from './Components/Footer';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';

// Import other pages...
import AdminMaincategory from './pages/maincategory/AdminMaincategory';
import AdminCreateMaincategory from './pages/maincategory/AdminCreateMaincategory';
import AdminUpdateMaincategory from './pages/maincategory/AdminUpdateMaincategory';

import AdminSubcategory from './pages/subcategory/AdminSubcategory';
import AdminCreateSubcategory from './pages/subcategory/AdminCreateSubcategory';
import AdminUpdateSubcategory from './pages/subcategory/AdminUpdateSubcategory';



import AdminCreateProduct from './pages/product/AdminCreateProduct';
import AdminUpdateProduct from './pages/product/AdminUpdateProduct';
import AdminProduct from './pages/product/AdminProduct';

import AdminTestimonial from './pages/testimonial/AdminTestimonial';
import AdminCreateTestimonial from './pages/testimonial/AdminCreateTestimonial';
import AdminUpdateTestimonial from './pages/testimonial/AdminUpdateTestimonial';

import AdminNewsletter from './pages/newsletter/AdminNewsletter';

import AdminCheckout from './pages/checkout/AdminCheckout';
import AdminCheckoutShow from './pages/checkout/AdminShowCheckout';


import AdminUser from './pages/user/AdminUser';
import AdminCreateUser from './pages/user/AdminCreateUser';
import AdminUpdateUser from './pages/user/AdminUpdateUser';



import ProfilePage from './pages/ProfilePage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import ForgetPasswordPage1 from './pages/ForgetPasswordPage1';
import ForgetPasswordPage2 from './pages/ForgetPasswordPage2';
import ForgetPasswordPage3 from './pages/ForgetPasswordPage3';
import AdminContactUs from './pages/contactus/AdminContactUs';
import AdminBrand from './pages/brand/AdminBrand';
import AdminCreateBrand from './pages/brand/AdminCreateBrand';
import AdminUpdateBrand from './pages/brand/AdminUpdateBrand';
import AdminContactUsShow from './pages/contactus/AdminContactUsShow';


export default function App() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(window.innerWidth > 992);

    // Function to check login status
    const checkLoginStatus = () => {
        return localStorage.getItem("login") === "true";
    };

    useEffect(() => {
        const handleResize = () => {
            setIsSidebarExpanded(window.innerWidth > 992);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <BrowserRouter>
            <MainContent isSidebarExpanded={isSidebarExpanded} toggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)} checkLoginStatus={checkLoginStatus} />
        </BrowserRouter>
    );
}

function MainContent({ isSidebarExpanded, toggleSidebar, checkLoginStatus }) {
    const location = useLocation();
    const navigate = useNavigate();

    const publicRoutes = ["/login", "/forgetPassword-1", "/forgetPassword-2", "/forgetPassword-3"];

    // Redirect to login if not logged in (except for public routes)
    useEffect(() => {
        if (!checkLoginStatus() && !publicRoutes.includes(location.pathname)) {
            navigate("/login");
        }
    }, [location, checkLoginStatus, navigate]);

    // Apply background color for login and forget password pages
    useEffect(() => {
        if (publicRoutes.includes(location.pathname)) {
            document.body.style.backgroundColor = "#f4f6f9"; // Light background for login & forget password pages
        } else {
            document.body.style.backgroundColor = ""; // Reset background for other pages
        }
    }, [location.pathname]);

    return (
        <div className={`app-container ${isSidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"}`}>
            {/* Show Navbar and Sidebar except on login & forget password pages */}
            {!publicRoutes.includes(location.pathname) && <AdminNavbar toggleSidebar={toggleSidebar} />}
            {!publicRoutes.includes(location.pathname) && <AdminSidebar isExpanded={isSidebarExpanded} />}

            <div className="content">
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgetPassword-1" element={<ForgetPasswordPage1 />} />
                    <Route path="/forgetPassword-2" element={<ForgetPasswordPage2 />} />
                    <Route path="/forgetPassword-3" element={<ForgetPasswordPage3 />} />
                    <Route path="/" element={<Home />} />

                    {/* Maincategory Routes */}
                    <Route path="/maincategory" element={<AdminMaincategory />} />
                    <Route path="/maincategory/create" element={<AdminCreateMaincategory />} />
                    <Route path="/maincategory/update/:_id" element={<AdminUpdateMaincategory />} />

                    {/* Subcategory Routes */}
                    <Route path="/subcategory" element={<AdminSubcategory />} />
                    <Route path="/subcategory/create" element={<AdminCreateSubcategory />} />
                    <Route path="/subcategory/update/:_id" element={<AdminUpdateSubcategory />} />


                    {/* Brand Routes */}
                    <Route path="/brand" element={<AdminBrand/>} />
                    <Route path="/brand/create" element={<AdminCreateBrand/>} />
                    <Route path="/brand/update/:_id" element={<AdminUpdateBrand />} />


                    {/* Product Routes */}
                    <Route path="/product" element={<AdminProduct />} />
                    <Route path="/product/create" element={<AdminCreateProduct />} />
                    <Route path="/product/update/:_id" element={<AdminUpdateProduct />} />

                    {/* Testimonial Routes */}
                    <Route path="/testimonial" element={<AdminTestimonial />} />
                    <Route path="/testimonial/create" element={<AdminCreateTestimonial />} />
                    <Route path="/testimonial/update/:_id" element={<AdminUpdateTestimonial />} />

                    {/* Newsletter Route */}
                    <Route path="/newsletter" element={<AdminNewsletter />} />

                    {/* Checkout Routes */}
                    <Route path="/checkout" element={<AdminCheckout />} />
                    <Route path="/checkout/view/:_id" element={<AdminCheckoutShow />} />

                    {/* User Routes */}
                    <Route path="/user" element={<AdminUser />} />
                    <Route path="/user/create" element={<AdminCreateUser />} />
                    <Route path="/user/update/:_id" element={<AdminUpdateUser />} />

                    {/* ContactUS Routes */}
                    <Route path="/contactus" element={<AdminContactUs />} />
                    <Route path="/contactus/view/:_id" element={<AdminContactUsShow />} />

                    <Route path='/profile' element={<ProfilePage />} />
                    <Route path='/update-profile' element={<UpdateProfilePage />} />

                </Routes>

                {/* Show Footer except on login & forget password pages */}
                {!publicRoutes.includes(location.pathname) && <Footer />}
            </div>
        </div>
    );
}

