import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/Home/HomePage";
import AboutMe from "./pages/About/AboutMe";
import Connect from "./pages/Connect/ConnectPage";
import LandingPage from "./pages/Landing/LandingPage";
import SectionPage from "./components/SectionPage";
import SectionLandingPage from "./components/SectionLandingPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import EditProfilePage from "./pages/Profile/EditProfile";
import LoginPage from "./pages/Log In/LoginPage";
import SignUpPage from "./pages/Sign Up/SignUp";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/Home" element={<HomePage />} />
            <Route path="/About" element={<AboutMe />} />
            <Route path="/work" element={<LandingPage />} />
            <Route path="/Connect" element={<Connect />} />
            <Route path="/work/*" element={<SectionPage />} />
            <Route path="/work/:sectionPath" element={<SectionLandingPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/profile/:username/edit" element={<EditProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;