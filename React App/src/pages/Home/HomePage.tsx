import React, { useEffect, useState, useRef } from "react";
import "./HomePage.css";
import { useLocation } from "react-router-dom";

const HomePage: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const forcedIntro = urlParams.get("showIntro") === "true";
    const hasPlayedIntro = localStorage.getItem("introPlayed");
    setShowIntro(true);
    document.body.setAttribute("data-intro", "true");
  //   if (!forcedIntro && hasPlayedIntro) {
  //     // Skip intro
  //     setShowIntro(true);
  //     document.body.setAttribute("data-intro", "true");
  //     //document.body.removeAttribute("data-intro");
  //   } else {
  //     // Play intro
  //     //   http://localhost:3000/home/?showIntro=true
  //     setShowIntro(true);
  //     document.body.setAttribute("data-intro", "true");
  //   }
   }, [location.key]);

  // Called when intro is fully done
  const handleIntroEnd = () => {
    setShowIntro(false);
    document.body.removeAttribute("data-intro");
    //localStorage.setItem("introPlayed", "true");
  };

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const currentTime = e.currentTarget.currentTime;
    const duration = e.currentTarget.duration;

    // At 3s, add a class that reduces video opacity so we see the text
    if (currentTime >= 3 && !videoRef.current?.classList.contains("video-dim")) {
      videoRef.current?.classList.add("video-dim");
    }

    

    // If 0.5s left, fade out entirely
    if (duration - currentTime <= 0.5 && !videoRef.current?.classList.contains("video-fade-out")) {
      videoRef.current?.classList.add("video-fade-out");
    }
  };

  // Once the fade-out transition ends, remove the intro
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const onTransitionEnd = () => {
      if (videoEl.classList.contains("video-fade-out")) {
        handleIntroEnd();
      }
    };
    videoEl.addEventListener("transitionend", onTransitionEnd);
    return () => {
      videoEl.removeEventListener("transitionend", onTransitionEnd);
    };
  }, []);

  // If user clicks anywhere on the video, skip immediately
  const skipIntro = () => {
    handleIntroEnd();
  };

  // When intro finishes, fade in buttons after 0.5s
  useEffect(() => {
    if (!showIntro) {
      setTimeout(() => {
        document.querySelector(".nav-buttons")?.classList.add("show-buttons");
      }, 500);
    }
  }, [showIntro]);

  return (
    <div className="homepage">
      {showIntro && (
        <div className="intro-wrapper" onClick={skipIntro}>
          <video
            ref={videoRef}
            src="https://s3.us-east-2.amazonaws.com/bdan.photos/Comic+logo+intro_1.mp4"
            className="intro-video"
            autoPlay
            muted
            playsInline
            onTimeUpdate={handleVideoTimeUpdate}
          />
        </div>
      )}

      {/* ONE TEXT ELEMENT: Absolutely centered, always in the DOM */}
      <h1 className="main-text">BDAN Media</h1>

      {/* The normal content below */}
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