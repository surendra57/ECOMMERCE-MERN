import "./App.css";
import Header from "./component/layout/header/Header.js";
import Footer from "./component/layout/footer/Footer.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WebFont from "webfontloader";
import React, { useEffect, useState } from "react";
import Home from "./component/home/Home";
import ProductDetails from "./component/product/ProductDetails.js";
import Products from "./component/product/Products.js";
import Search from "./component/product/Search.js";
import LoginSignUp from "./component/user/LoginSignUp";
import store from "./store.js";
import { loadUser } from "./actions/userAction";
import UserOptions from "./component/layout/header/UserOptions.js";
import { useSelector } from "react-redux";
import Profile from "./component/user/Profile.js";
import ProtectedRoute from "./component/route/ProtectedRoute";
import UpdateProfile from "./component/user/UpdateProfile.js";
import UpdatePassword from "./component/user/UpdatePassword.js";
import ForgotPassword from "./component/user/ForgotPassword.js";
import ResetPassword from "./component/user/ResetPassword.js";
import Cart from "./component/cart/Cart.js";
import Shipping from "./component/cart/Shipping.js";
import ConfirmOrder from "./component/cart/ConfirmOrder.js";
import axios from "axios";
import Payment from "./component/cart/Payment.js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import OrderSuccess from "./component/cart/OrderSuccess.js";
import MyOrders from "./component/Order/MyOrders.js";
import OrderDetails from "./component/Order/OrderDetails.js";
import Dashboard from "./component/admin/Dashboard.js";
import ProductList from "./component/admin/ProductList.js";
import NewProduct from "./component/admin/NewProduct";
import UpdateProduct from "./component/admin/UpdateProduct";
import OrderList from "./component/admin/OrderList";
import ProcessOrder from "./component/admin/ProcessOrder";
import UserList from "./component/admin/UserList";
import UpdateUser from "./component/admin/UpdateUser";
import ProductReviews from "./component/admin/ProductReviews";
import Contact from "./component/layout/Contact/Contact";
import About from "./component/layout/About/About";
import NotFound from "./component/layout/Not Found/NotFound";

//app
function App() {
  const { isAuthenticated, user } = useSelector((state) => state.user);

  const [stripeApiKey, setStripeApiKey] = useState("");

  async function getStripeApiKey() {
    const { data } = await axios.get("/api/v1/stripeApiKey");

    setStripeApiKey(data.stripeApiKey);
  }

  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Roboto", "Driod Sans", "Chilanka"],
      },
    });

    store.dispatch(loadUser());
    getStripeApiKey();
  }, []);

  window.addEventListener("contextmenu", (e) => e.preventDefault());
  return (
    <Router>
      <Header />
      {isAuthenticated && <UserOptions user={user} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:keyword" element={<Products />} />
        <Route path="/search" element={<Search />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<Profile />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/me/update" element={<UpdateProfile />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/password/update" element={<UpdatePassword />} />
        </Route>

        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />

        <Route path="/login" element={<LoginSignUp />} />
        <Route path="/cart" element={<Cart />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/shipping" element={<Shipping />} />
        </Route>

        {stripeApiKey && (
          <Route element={<ProtectedRoute />}>
            <Route
              path="/process/payment"
              element={
                <Elements stripe={loadStripe(stripeApiKey)}>
                  <Payment />
                </Elements>
              }
            />
          </Route>
        )}
        <Route element={<ProtectedRoute />}>
          <Route path="/success" element={<OrderSuccess />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/orders" element={<MyOrders />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/order/confirm" element={<ConfirmOrder />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/order/:id" element={<OrderDetails />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/products" element={<ProductList />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/product" element={<NewProduct />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/admin/product/:id" element={<UpdateProduct />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/admin/orders" element={<OrderList />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/order/:id" element={<ProcessOrder />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/users" element={<UserList />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/user/:id" element={<UpdateUser />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/reviews" element={<ProductReviews />} />
        </Route>

        <Route
          path="*"
          element={
            window.location.pathname === "/process/payment" ? null : (
              <NotFound />
            )
          }
        />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
