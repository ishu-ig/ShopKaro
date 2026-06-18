import React, { useEffect, useCallback } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Sidebar from "./Components/Sidebar";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

// Main Pages
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import ForgetPasswordPage from "./pages/ForgetPassword";

import AdminMaincategory from './pages/maincategory/AdminMaincategory';
import AdminCreateMaincategory from './pages/maincategory/AdminCreateMaincategory';
import AdminUpdateMaincategory from './pages/maincategory/AdminUpdateMaincategory';

import AdminSubcategory from './pages/subcategory/AdminSubcategory';
import AdminCreateSubcategory from './pages/subcategory/AdminCreateSubcategory';
import AdminUpdateSubcategory from './pages/subcategory/AdminUpdateSubcategory';

// FIX: Brand pages were referenced in routes below but never imported — added.
import AdminBrand from './pages/brand/AdminBrand';
import AdminCreateBrand from './pages/brand/AdminCreateBrand';
import AdminUpdateBrand from './pages/brand/AdminUpdateBrand';

import AdminCreateProduct from './pages/product/AdminCreateProduct';
import AdminUpdateProduct from './pages/product/AdminUpdateProduct';
import AdminProduct from './pages/product/AdminProduct';

import AdminTestimonial from './pages/testimonial/AdminTestiminial';
import AdminCreateTestimonial from './pages/testimonial/AdminCreateTestimonial';
import AdminUpdateTestimonial from './pages/testimonial/AdminUpdateTestimonial';

import AdminNewsletter from './pages/newsletter/AdminNewsletter';

import AdminCheckout from './pages/checkout/AdminCheckout';
import AdminCheckoutShow from './pages/checkout/AdminShowCheckout';
// FIX: ViewProductPage (order items page) was used in a route but never imported — added.
import ViewProductPage from './pages/checkout/ViewProductPage';

import AdminUser from './pages/user/AdminUser';
import AdminCreateUser from './pages/user/AdminCreateUser';
import AdminUpdateUser from './pages/user/AdminUpdateUser';

// contactus 
import AdminContactUs from "./pages/contactus/AdminContactUs";
import AdminShowQuery from "./pages/contactus/AdminShowQuery";


// FIX: All public routes listed here must match route paths exactly
const publicRoutes = ["/login", "/register", "/forgot-password"];

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

function Shell() {
  const location = useLocation();
  const isPublic = publicRoutes.includes(location.pathname);
  const isLoggedIn = localStorage.getItem("login") === "true";

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 992px)").matches;
    const savedMini = localStorage.getItem("adminHMD.sidebarMini") === "true";
    if (isDesktop && savedMini && !isPublic) {
      document.body.classList.add("sidebar-mini");
    }
    return () => {
      if (isPublic)
        document.body.classList.remove("sidebar-mini", "sidebar-open");
    };
  }, [isPublic]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 992px)");
    function handleBreakpoint(e) {
      if (e.matches) {
        document.body.classList.remove("sidebar-open");
        const savedMini =
          localStorage.getItem("adminHMD.sidebarMini") === "true";
        document.body.classList.toggle("sidebar-mini", savedMini);
      } else {
        document.body.classList.remove("sidebar-mini");
      }
    }
    if (mq.addEventListener) {
      mq.addEventListener("change", handleBreakpoint);
    } else {
      mq.addListener(handleBreakpoint);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", handleBreakpoint);
      } else {
        mq.removeListener(handleBreakpoint);
      }
    };
  }, []);

  // FIX: Moved toggleSidebar & closeMobileSidebar outside render using useCallback
  const toggleSidebar = useCallback(() => {
    const isDesktop = window.matchMedia("(min-width: 992px)").matches;
    if (isDesktop) {
      document.body.classList.toggle("sidebar-mini");
      localStorage.setItem(
        "adminHMD.sidebarMini",
        String(document.body.classList.contains("sidebar-mini")),
      );
    } else {
      document.body.classList.toggle("sidebar-open");
    }
  }, []);

  const closeMobileSidebar = useCallback(() => {
    document.body.classList.remove("sidebar-open");
  }, []);

  // Redirect unauthenticated users away from protected pages
  if (!isLoggedIn && !isPublic) {
    return <Navigate to="/login" replace />;
  }

  // ── Public pages ──────────────────────────────────────────────────────────
  if (isPublic) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* FIX: Added missing SignupPage import and route */}
        <Route path="/register" element={<SignupPage />} />
        {/* FIX: Multi-step forgot password routes instead of undefined <ForgetPasswordPage /> */}
        <Route path="/forgot-password" element={<ForgetPasswordPage />} />
      </Routes>
    );
  }

  // ── Protected pages ───────────────────────────────────────────────────────
  return (
    <div className="admin-shell">
      <div className="sidebar-backdrop" onClick={closeMobileSidebar} />
      <Sidebar onLinkClick={closeMobileSidebar} />

      <div className="admin-main">
        <Navbar toggleSidebar={toggleSidebar} />

        <Routes>
          {/* Dashboard */}
          {/* FIX: Removed duplicate "/" route — kept only one */}
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/update-profile" element={<UpdateProfilePage />} />

          <Route path="/maincategory" element={<AdminMaincategory />} />
          <Route
            path="/maincategory/create"
            element={<AdminCreateMaincategory />}
          />
          {/* FIX: Typo "AdminUpdateMaincategorr" -> "AdminUpdateMaincategory" (matches the actual import) */}
          <Route
            path="/maincategory/update/:_id"
            element={<AdminUpdateMaincategory />}
          />

          {/* Subcategory Routes */}
          <Route path="/subcategory" element={<AdminSubcategory />} />
          <Route
            path="/subcategory/create"
            element={<AdminCreateSubcategory />}
          />
          <Route
            path="/subcategory/update/:_id"
            element={<AdminUpdateSubcategory />}
          />

          {/* Brand Routes */}
          <Route path="/brand" element={<AdminBrand />} />
          <Route path="/brand/create" element={<AdminCreateBrand />} />
          <Route path="/brand/update/:_id" element={<AdminUpdateBrand />} />

          {/* Product Routes */}
          <Route path="/product" element={<AdminProduct />} />
          <Route path="/product/create" element={<AdminCreateProduct />} />
          <Route path="/product/update/:_id" element={<AdminUpdateProduct />} />

          {/* Testimonial Routes */}
          <Route path="/testimonial" element={<AdminTestimonial />} />
          <Route path="/testimonial/create" element={<AdminCreateTestimonial />}
          />
          <Route
            path="/testimonial/update/:_id"
            element={<AdminUpdateTestimonial />}
          />

          {/* Newsletter Route */}
          <Route path="/newsletter" element={<AdminNewsletter />} />

          {/* Checkout Routes */}
          <Route path="/checkout" element={<AdminCheckout />} />
          <Route path="/checkout/view/:_id" element={<AdminCheckoutShow />} />
          <Route path="/checkout/product/:_id" element={<ViewProductPage />} />

          {/* User Routes */}
          <Route path="/user" element={<AdminUser />} />
          <Route path="/user/create" element={<AdminCreateUser />} />
          <Route path="/user/update/:_id" element={<AdminUpdateUser />} />

          {/* ContactUS Routes */}
          <Route path="/contactus" element={<AdminContactUs />} />
          {/* FIX: "AdminContactUsShow" was never imported; the file actually imports AdminShowQuery from this folder */}
          <Route path="/contactus/view/:_id" element={<AdminShowQuery />} />

          {/* FIX: Removed forgot-password from protected routes — it belongs in public only */}
        </Routes>

        <Footer />
      </div>
    </div>
  );
}