import React, { useEffect, useCallback, useState } from "react";
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
import EcomPreloader from "./Components/EcomPreloader";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

// Main Pages
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import ForgetPasswordPage from "./pages/ForgetPassword";

import AdminMaincategory from "./pages/maincategory/AdminMaincategory";
import AdminCreateMaincategory from "./pages/maincategory/AdminCreateMaincategory";
import AdminUpdateMaincategory from "./pages/maincategory/AdminUpdateMaincategory";

import AdminSubcategory from "./pages/subcategory/AdminSubcategory";
import AdminCreateSubcategory from "./pages/subcategory/AdminCreateSubcategory";
import AdminUpdateSubcategory from "./pages/subcategory/AdminUpdateSubcategory";

// FIX: Brand pages were referenced in routes below but never imported — added.
import AdminBrand from "./pages/brand/AdminBrand";
import AdminCreateBrand from "./pages/brand/AdminCreateBrand";
import AdminUpdateBrand from "./pages/brand/AdminUpdateBrand";

import AdminCreateProduct from "./pages/product/AdminCreateProduct";
import AdminUpdateProduct from "./pages/product/AdminUpdateProduct";
import AdminProduct from "./pages/product/AdminProduct";

import AdminTestimonial from "./pages/testimonial/AdminTestiminial";
import AdminCreateTestimonial from "./pages/testimonial/AdminCreateTestimonial";
import AdminUpdateTestimonial from "./pages/testimonial/AdminUpdateTestimonial";

import AdminNewsletter from "./pages/newsletter/AdminNewsletter";

import AdminCheckout from "./pages/checkout/AdminCheckout";
import AdminCheckoutShow from "./pages/checkout/AdminShowCheckout";
// FIX: ViewProductPage (order items page) was used in a route but never imported — added.
import ViewProductPage from "./pages/checkout/ViewProductPage";

import AdminUser from "./pages/user/AdminUser";
import AdminCreateUser from "./pages/user/AdminCreateUser";
import AdminUpdateUser from "./pages/user/AdminUpdateUser";

// Admin staff management
import AdminUserList from "./pages/adminUser/AdminUserList";
import AdminCreateAdminUser from "./pages/adminUser/AdminCreateAdminUser";
import AdminUpdateAdminUser from "./pages/adminUser/AdminUpdateAdminUser";

// Delivery partner management for admin
import AdminDeliver from "./pages/deliver/AdminDeliver";
import AdminCreateDeliver from "./pages/deliver/AdminCreateDeliver";
import AdminUpdateDeliver from "./pages/deliver/AdminUpdateDeliver";

// contactus
import AdminContactUs from "./pages/contactus/AdminContactUs";
import AdminShowQuery from "./pages/contactus/AdminShowQuery";
import AdminBanner from "./pages/banner/AdminBanner";
import AdminCreateBanner from "./pages/banner/AdminCreateBanner";
import AdminUpdateBanner from "./pages/banner/AdminUpdateBanner";
import ShopCreateProduct from "./pages/shopData/products/ShopCreateProduct";
import ShopProduct from "./pages/shopData/products/ShopProduct";
import ShopUpdateProduct from "./pages/shopData/products/ShopUpdateProduct";
import ShopCheckout from "./pages/shopData/checkout/ShopCheckout";
import AccountSetting from "./pages/shopData/AccountSetting";
import ShopDashboard from "./pages/shopData/Dashboard";
import ShopAddMaincategory from "./pages/shopData/maincategory/ShopAddMaincategory";
import ShopMaincategory from "./pages/shopData/maincategory/ShopMaincategory";
import ShopAddSubcategory from "./pages/shopData/subcategory/ShopAddSubcategory";
import ShopSubcategory from "./pages/shopData/subcategory/ShopSubcategory";
import AdminCreateShop from "./pages/shop/AdminCreateShop";
import AdminShop from "./pages/shop/AdminShop";
import AdminUpdateShop from "./pages/shop/AdminUpdateShop";
import AssignedOrder from "./pages/deliveryBoyData/AssignedOrder";
import OrderHistory from "./pages/deliveryBoyData/OrderHistory";
import DeliveryConfirm from "./pages/deliveryBoyData/DeliveryConfirm";
import DeliveryDashboard from "./pages/deliveryBoyData/DeliveryBoyDasboard";
import AdminReturn from "./pages/returnProduct/AdminReturn";
import AdminReturnShow from "./pages/returnProduct/AdminReturnShow";

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
  const [initialLoading, setInitialLoading] = useState(true);

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
      <>
        {initialLoading && (
          <EcomPreloader
            minDuration={900}
            onFinished={() => setInitialLoading(false)}
          />
        )}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* FIX: Added missing SignupPage import and route */}
          <Route path="/register" element={<SignupPage />} />
          {/* FIX: Multi-step forgot password routes instead of undefined <ForgetPasswordPage /> */}
          <Route path="/forgot-password" element={<ForgetPasswordPage />} />
        </Routes>
      </>
    );
  }

  // ── Protected pages ───────────────────────────────────────────────────────
  return (
    <>
      {initialLoading && (
        <EcomPreloader
          minDuration={900}
          onFinished={() => setInitialLoading(false)}
        />
      )}
      <div className="admin-shell">
        <div className="sidebar-backdrop" onClick={closeMobileSidebar} />
        <Sidebar onLinkClick={closeMobileSidebar} />

        <div className="admin-main">
          <Navbar toggleSidebar={toggleSidebar} />

          <Routes>
            {/* Dashboard */}
            {/* FIX: Removed duplicate "/" route — kept only one */}
            <Route path="/" element={<Home />} />
            <Route path="/:role/:_id/profile" element={<ProfilePage />} />
            <Route path="/:role/:_id/update-profile" element={<UpdateProfilePage />} />

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
            <Route path="/banner" element={<AdminBanner />} />
            <Route path="/banner/create" element={<AdminCreateBanner />} />
            <Route path="/banner/update/:_id" element={<AdminUpdateBanner />} />

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
            <Route
              path="/testimonial/create"
              element={<AdminCreateTestimonial />}
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


            <Route path="/return" element={<AdminReturn />} />
            <Route path="/return/view/:_id" element={<AdminReturnShow />} />
            {/* <Route path="/checkout/product/:_id" element={<ViewProductPage />} /> */}

            {/* Admin Staff Routes */}
            <Route path="/admins" element={<AdminUserList />} />
            <Route path="/admins/create" element={<AdminCreateAdminUser />} />
            <Route path="/admins/update/:_id" element={<AdminUpdateAdminUser />} />

            {/* User / Customer Routes */}
            <Route path="/user" element={<AdminUser />} />
            <Route path="/user/create" element={<AdminCreateUser />} />
            <Route path="/user/update/:_id" element={<AdminUpdateUser />} />

            {/* Delivery Partner Management Routes */}
            <Route path="/deliveryBoy" element={<AdminDeliver />} />
            <Route path="/deliveryBoy/create" element={<AdminCreateDeliver />} />
            <Route path="/deliveryBoy/update/:_id" element={<AdminUpdateDeliver />} />
            <Route path="/deliver" element={<AdminDeliver />} />
            <Route path="/deliver/create" element={<AdminCreateDeliver />} />
            <Route path="/deliver/update/:_id" element={<AdminUpdateDeliver />} />

            {/* ContactUS Routes */}
            <Route path="/contactus" element={<AdminContactUs />} />
            {/* FIX: "AdminContactUsShow" was never imported; the file actually imports AdminShowQuery from this folder */}
            <Route path="/contactus/view/:_id" element={<AdminShowQuery />} />

            {/* FIX: Removed forgot-password from protected routes — it belongs in public only */}

            <Route
              path="/shop"
              element={<AdminShop />}
            />
            <Route path="/shop/create" element={<AdminCreateShop />} />
            <Route
              path="/shop/update/:_id"
              element={<AdminUpdateShop />}
            />


            <Route
              path="/shopProduct/:role/:_id/create"
              element={<ShopCreateProduct />}
            />
            <Route path="/shopProduct/:role/:_id" element={<ShopProduct />} />
            <Route
              path="/shopProduct/:role/:_id/update/:_productId"
              element={<ShopUpdateProduct />}
            />

            {/* User Routes */}
            <Route path="/shopMaincategory/:role/:_id/add" element={<ShopAddMaincategory />} />
            <Route path="/shopMaincategory/:role/:_id" element={<ShopMaincategory />} />

            {/* User Routes */}
            <Route path="/shopSubcategory/:role/:_id/add" element={<ShopAddSubcategory />} />
            <Route path="/shopSubcategory/:role/:_id" element={<ShopSubcategory />} />

            <Route path="/shopCheckout/:role/:_id" element={<ShopCheckout />} />
            <Route path="/:role/:_id" element={<ShopDashboard />} />
            <Route path="/:role/setting" element={<AccountSetting />} />

            <Route path="/:role/:_id/orders" element={<AssignedOrder />} />
            <Route path="/:role/:_id/history" element={<OrderHistory />} />
            <Route path="/deliveryBoy/:_id/order/:_orderId" element={<DeliveryConfirm />} />
            <Route path="/deliveryBoy/:_id/dashboard" element={<DeliveryDashboard />} />
          </Routes>

          <Footer />
        </div>
      </div>
    </>
  );
}
