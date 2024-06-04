import React, { useEffect, useState } from "react";
import Login from "./authentication/Login";
import Home from "./main/Home";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './authentication/Signup';
import PersonalArea from "./main/PersonalArea";
import Header from "./main/Header";
import Footer from "./main/Footer";
import Main from "./main/Main";
import ChangePassword from "./main/ChangePassword";

const { localStorage } = window;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn'));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn'));
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    console.log("isLoggedIn:", isLoggedIn);
  }, [isLoggedIn]);

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/change-password" element={<ChangePasswordWithHeader />} />
          <Route
            path="/"
            element={isLoggedIn === 'true' ? <HomeWithHeader /> : <MainWithHeader />}
          />
          <Route path="/user" element={<PersonalAreaWithHeader />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  );
}

function ChangePasswordWithHeader() {
  return (
    <>
      <Header />
      <ChangePassword />
    </>
  );
}

function HomeWithHeader() {
  return (
    <>
      <Header />
      <Home />
    </>
  );
}

function MainWithHeader() {
  return (
    <>
      <Header />
      <Main />
    </>
  );
}

function PersonalAreaWithHeader() {
  return (
    <>
      <Header />
      <PersonalArea />
    </>
  );
}

export default App;
