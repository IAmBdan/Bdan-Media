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
import AdminPage from "./pages/Admin/AdminPage";
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
            {/* ── Core pages ── */}
            <Route path="/"          element={<HomePage />} />
            <Route path="/home"      element={<HomePage />} />
            <Route path="/about"     element={<AboutMe />} />
            <Route path="/connect"   element={<Connect />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/signup"    element={<SignUpPage />} />
            <Route path="/admin"     element={<AdminPage />} />
            <Route path="/profile/:username"      element={<ProfilePage />} />
            <Route path="/profile/:username/edit" element={<EditProfilePage />} />

            {/* ── Work routes (original — keep for existing links) ── */}
            <Route path="/work"              element={<LandingPage />} />
            <Route path="/work/:sectionPath" element={<SectionLandingPage />} />
            <Route path="/work/*"            element={<SectionPage />} />

            {/* ── Short routes e.g. .com/music ── */}
            <Route path="/:sectionPath" element={<SectionLandingPage />} />
            <Route path="/:sectionPath/*" element={<SectionPage />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;