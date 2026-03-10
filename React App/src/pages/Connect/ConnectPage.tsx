import React from "react";
import { motion } from "framer-motion";

const css = `
  .connect-input, .connect-textarea {
    width: 100%;
    margin-top: 8px;
    padding: 12px 16px;
    background: #0d0d0d;
    color: #fff;
    border: 1px solid #181818;
    border-radius: 3px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.8rem;
    letter-spacing: 0.05em;
    outline: none;
    transition: border-color 0.25s ease;
  }

  .connect-input:focus, .connect-textarea:focus {
    border-color: #4db0f2;
  }

  .connect-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #4a4a4a;
  }

  .connect-submit {
    background: #0d0d0d;
    color: #6a6a6a;
    border: 1px solid #181818;
    border-radius: 3px;
    padding: 14px 40px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
  }

  .connect-submit:hover {
    border-color: #4db0f2;
    color: #fff;
    box-shadow: 0 0 20px rgba(77,176,242,0.15), 0 10px 24px rgba(77,176,242,0.1);
  }

  .social-icon {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 1px solid transparent;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    object-fit: cover;
  }

  .social-icon:hover {
    border-color: #4db0f2;
    transform: scale(1.08);
    box-shadow: 0 0 16px rgba(77,176,242,0.25);
  }

  .divider {
    width: 32px;
    height: 2px;
    background: #4db0f2;
    margin: 12px 0 0;
  }
`;

const Connect: React.FC = () => {
  return (
    <>
      <style>{css}</style>
      <motion.div
        style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '64px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Header */}
        <motion.div
          style={{ textAlign: 'left', width: '100%', maxWidth: '680px', marginBottom: '48px' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p style={{ fontFamily: 'Montserrat', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.26em', color: '#4db0f2', textTransform: 'uppercase', margin: '0 0 12px' }}>
            Get in touch
          </p>
          <h1 style={{ fontFamily: 'Azonix, sans-serif', fontSize: '2.2rem', color: '#fff', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Connect
          </h1>
          <div className="divider" />
        </motion.div>

        {/* Card */}
        <motion.div
          style={{ backgroundColor: '#0d0d0d', border: '1px solid #181818', borderRadius: '4px', padding: '48px', width: '100%', maxWidth: '680px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >

          {/* Social icons */}
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontFamily: 'Montserrat', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.22em', color: '#4a4a4a', textTransform: 'uppercase', margin: '0 0 20px' }}>
              Find me online
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { href: 'https://www.instagram.com/BdanMedia', src: 'https://s3.us-east-2.amazonaws.com/bdan.photos/instagram.png', alt: 'Instagram' },
                { href: 'https://www.tiktok.com/@bdanmedia', src: 'https://s3.us-east-2.amazonaws.com/bdan.photos/tiktok.png', alt: 'TikTok' },
                { href: 'https://twitter.com/IAmBdan', src: 'https://s3.us-east-2.amazonaws.com/bdan.photos/twitter.png', alt: 'Twitter' },
                { href: 'mailto:contact@bdanmedia.com', src: 'https://s3.us-east-2.amazonaws.com/bdan.photos/email.png', alt: 'Email' },
              ].map((s) => (
                <a key={s.alt} href={s.href} target="_blank" rel="noopener noreferrer">
                  <img src={s.src} alt={s.alt} className="social-icon" />
                </a>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: '100%', height: '1px', background: '#181818', marginBottom: '40px' }} />

          {/* Form */}
          <form
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            action="https://formspree.io/f/xpwakrgq"
            method="POST"
          >
            <label className="connect-label">
              Your Name
              <input type="text" name="name" required className="connect-input" />
            </label>
            <label className="connect-label">
              Your Email
              <input type="email" name="email" required className="connect-input" />
            </label>
            <label className="connect-label">
              Your Message
              <textarea name="message" rows={5} required className="connect-textarea" />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="connect-submit">
                Send Message
              </button>
            </div>
          </form>

        </motion.div>
      </motion.div>
    </>
  );
};

export default Connect;