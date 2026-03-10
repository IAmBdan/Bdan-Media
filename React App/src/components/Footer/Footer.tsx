import React from "react";

const socials = [
  { href: "https://www.instagram.com/bdanmedia", src: "https://s3.us-east-2.amazonaws.com/bdan.photos/instagram.png", alt: "Instagram" },
  { href: "https://www.tiktok.com/@bdanmedia",   src: "https://s3.us-east-2.amazonaws.com/bdan.photos/tiktok.png",    alt: "TikTok" },
  { href: "https://twitter.com/IAmBdan",          src: "https://s3.us-east-2.amazonaws.com/bdan.photos/twitter.png",   alt: "Twitter" },
  { href: "mailto:contact@bdanmedia.com",         src: "https://s3.us-east-2.amazonaws.com/bdan.photos/email.png",     alt: "Email" },
];

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#080808",
        borderTop: "1px solid #181818",
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.16em", color: "#3a3a3a", textTransform: "uppercase" }}>
        © 2026 Brian Daniels
      </span>

      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        {socials.map((s) => (
          <a key={s.alt} href={s.href} target="_blank" rel="noopener noreferrer">
            <img
              src={s.src}
              alt={s.alt}
              style={{ width: "22px", height: "22px", borderRadius: "50%", transition: "transform 0.2s ease, opacity 0.2s ease", opacity: 0.4 }}
              onMouseOver={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.transform = "scale(1.15)";
                el.style.opacity = "1";
              }}
              onMouseOut={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.transform = "scale(1)";
                el.style.opacity = "0.4";
              }}
            />
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;