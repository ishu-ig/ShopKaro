import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'

import Home from './pages/Home'
import AboutPage from './pages/AboutPage'
import FeaturePage from './pages/FeaturePage'
import ShopPage from './pages/ShopPage'
import TestimonialPage from './pages/TestimonialPage'
import ErrorPage from './pages/ErrorPage'
import ContactUsPage from './pages/ContactUsPage'
import ProductPage from './pages/ProductPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import UpdateProfilePage from './pages/UpdateProfilePage'
import CartPage from './pages/CartPage'
import WishlistPage from './pages/WishlistPage'
import CheckoutPage from './pages/CheckoutPage'
import ConfirmationPage from './pages/ConfirmationPage'
import OrderPage from './pages/OrderPage'


import WOW from 'wow.js';
import OrderDetailPage from './pages/OrderDetailPage'
import ForgetPasswordPage1 from './pages/ForgetPasswordPage1'
import ForgetPasswordPage2 from './pages/ForgetPasswordPage2'
import ForgetPasswordPage3 from './pages/ForgetPasswordPage3'
import Payment from './pages/Payment'
new WOW().init();


export default function App() {
  return (
    <BrowserRouter>
        <Navbar />
            <Routes>
                <Route path='' element={<Home />}/>
                <Route path='/about' element={<AboutPage />}/>
                <Route path='/feature' element={<FeaturePage />}/>
                <Route path='/shop' element={<ShopPage />}/>
                <Route path='/testimonial' element={<TestimonialPage />}/>
                <Route path='/contactUs' element={<ContactUsPage />}/>
                <Route path='/product/:_id' element={<ProductPage />}/>
                <Route path='/cart' element={<CartPage />}/>
                <Route path='/checkout' element={<CheckoutPage />}/>
                <Route path='/confirmation' element={<ConfirmationPage />}/>
                <Route path='/wishlist' element={<WishlistPage />}/>
                <Route path='/order' element={<OrderPage />}/>
                <Route path='/order-detail/:_id' element={<OrderDetailPage />}/>
                <Route path='/signup' element={<SignupPage />}/>

                <Route path='/profile' element={<ProfilePage />}/>
                <Route path='/login' element={<LoginPage />}/>
                <Route path='/UpdateProfile' element={<UpdateProfilePage />}/>

                <Route path='/forgetPassword-1' element={<ForgetPasswordPage1 />}/>
                <Route path='/forgetPassword-2' element={<ForgetPasswordPage2 />}/>
                <Route path='/forgetPassword-3' element={<ForgetPasswordPage3 />}/>

                <Route path='/payment/:_id' element={<Payment/>}/>

                <Route path='/*' element={<ErrorPage />}/>
            </Routes>
        <Footer />
    </BrowserRouter>
  )
}
