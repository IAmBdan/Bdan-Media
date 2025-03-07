import React from "react";

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#02111b", // Matching homepage background color
        color: "#f1f1f1", // White text for contrast
        fontSize: "0.8rem",
        textAlign: "center",
        padding: "0.5rem 0", // Minimal padding for tiny height
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <span>© 2025 Brian Daniels</span>
      <div style={{ display: "flex", gap: "10px" }}>
        <a
          href="https://www.instagram.com/bdanmedia"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://s3.us-east-2.amazonaws.com/bdan.photos/instagram.png"
            alt="Instagram"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              transition: "transform 0.3s",
            }}
            onMouseOver={(e) => {
              (e.target as HTMLImageElement).style.transform = "scale(1.2)";
            }}
            onMouseOut={(e) => {
              (e.target as HTMLImageElement).style.transform = "scale(1)";
            }}
          />
        </a>
        <a
          href="https://www.tiktok.com/@bdanmedia"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://s3.us-east-2.amazonaws.com/bdan.photos/tiktok.png"
            alt="TikTok"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              transition: "transform 0.3s",
            }}
            onMouseOver={(e) => {
              (e.target as HTMLImageElement).style.transform = "scale(1.2)";
            }}
            onMouseOut={(e) => {
              (e.target as HTMLImageElement).style.transform = "scale(1)";
            }}
          />
        </a>
        <a
          href="https://twitter.com/IAmBdan"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://s3.us-east-2.amazonaws.com/bdan.photos/twitter.png"
            alt="Twitter"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              transition: "transform 0.3s",
            }}
            onMouseOver={(e) => {
              (e.target as HTMLImageElement).style.transform = "scale(1.2)";
            }}
            onMouseOut={(e) => {
              (e.target as HTMLImageElement).style.transform = "scale(1)";
            }}
          />
        </a>
        <a
          href="mailto:contact@bdanmedia.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://s3.us-east-2.amazonaws.com/bdan.photos/email.png"
            alt="Email"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              transition: "transform 0.3s",
            }}
            onMouseOver={(e) => {
              (e.target as HTMLImageElement).style.transform = "scale(1.2)";
            }}
            onMouseOut={(e) => {
              (e.target as HTMLImageElement).style.transform = "scale(1)";
            }}
          />
        </a>
      </div>
    </footer>
  );
};

export default Footer;