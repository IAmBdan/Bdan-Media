import React, { useEffect, useState, useRef } from "react";
import "./HomePage.css";
import { useLocation } from "react-router-dom";

const HomePage: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [showNavbar, setShowNavbar] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const location = useLocation();

  useEffect(() => {
    setShowIntro(true);
    setShowNavbar(false);
    setButtonsVisible(false);
    document.body.setAttribute("data-intro", "true");
  }, [location.key]);

  const handleIntroEnd = () => {
    setShowIntro(false);
    setButtonsVisible(true);
    document.body.removeAttribute("data-intro");
    setTimeout(() => setShowNavbar(true), 900);
  };

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const currentTime = e.currentTarget.currentTime;
    const duration = e.currentTarget.duration;

    if (currentTime >= 3 && !videoRef.current?.classList.contains("video-dim")) {
      videoRef.current?.classList.add("video-dim");
    }

    if (duration - currentTime <= 0.5 && !videoRef.current?.classList.contains("video-fade-out")) {
      videoRef.current?.classList.add("video-fade-out");
    }
  };

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const onTransitionEnd = () => {
      if (videoEl.classList.contains("video-fade-out")) handleIntroEnd();
    };
    videoEl.addEventListener("transitionend", onTransitionEnd);
    return () => videoEl.removeEventListener("transitionend", onTransitionEnd);
  }, []);

  useEffect(() => {
    if (buttonsVisible) {
      // Small delay to ensure DOM is ready before triggering animation
      requestAnimationFrame(() => {
        document.querySelector(".nav-buttons")?.classList.add("show-buttons");
      });
    }
  }, [buttonsVisible]);

  const skipIntro = () => handleIntroEnd();

  return (
    <div className="homepage">
      {!showNavbar && (
        <style>{`.navbar, .menu-button { opacity: 0 !important; pointer-events: none !important; }`}</style>
      )}
      {showNavbar && (
        <style>{`.navbar, .menu-button { animation: navFadeIn 0.6s ease forwards; }`}</style>
      )}

      {showIntro && (
        <div className="intro-wrapper" onClick={skipIntro}>
          <video
            ref={videoRef}
            src="https://d1lkd205tzcot1.cloudfront.net/Comic+logo+intro_1.mp4"
            className="intro-video"
            autoPlay
            muted
            playsInline
            onTimeUpdate={handleVideoTimeUpdate}
          />
          <div className="skip-hint">Click anywhere to skip</div>
        </div>
      )}

      <h1 className="main-text">BDAN Media</h1>

      <div className="main-content">
        <div className="nav-buttons">
          <a href="/work">My Work</a>
          <a href="/connect">Connect With Me</a>
          <a href="/about">About Me</a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;