import React from "react";
import "./App.css";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import Header from "./components/header/Header";
import Homepage from "./components/homepage/Homepage";
import AboutUs from "./components/aboutUs/AboutUs";

import SignIn from "./components/auth/SignIn";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import Footer from "./components/footer/Footer";
import faq from "./components/faqs/Faqs";
import Dashboard from "./components/dashboard/Dashboard";
import { PrivateRoute } from "./components/Privateroute/index";
import UserProfile from "./components/user/UserProfile";


export default function App() {
  return (
      <div>

        <BrowserRouter>
          <Header />
          <Switch >
            <Route path="/" exact component={Homepage} />
            <Route exact path="/faqs" component={faq} />
            <Route exact path="/forgotPassword" component={ForgotPassword} />
            <Route exact path="/about-us" component={AboutUs} />
            <Route exact path="/signin" component={SignIn} />
            <Route exact path="/register" component={Register} />
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            <PrivateRoute exact path="/profile" component={UserProfile} />


          </Switch>
          <Footer />
        </BrowserRouter>
      </div>
    );

}
