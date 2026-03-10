import React from "react";
import { motion } from "framer-motion";
import brianpicture from "../../brianpicture.jpg";

const css = `
  .divider {
    width: 32px;
    height: 2px;
    background: #4db0f2;
    margin: 12px 0 0;
  }

  .about-body p {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.88rem;
    font-weight: 400;
    line-height: 1.85;
    color: #909090;
    margin: 0 0 20px;
  }

  .about-body p:last-child {
    margin-bottom: 0;
  }
`;

const AboutMe: React.FC = () => {
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
          style={{ textAlign: 'left', width: '100%', maxWidth: '900px', marginBottom: '48px' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p style={{ fontFamily: 'Montserrat', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.26em', color: '#4db0f2', textTransform: 'uppercase', margin: '0 0 12px' }}>
            The person behind the lens
          </p>
          <h1 style={{ fontFamily: 'Azonix, sans-serif', fontSize: '2.2rem', color: '#fff', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            About Me
          </h1>
          <div className="divider" />
        </motion.div>

        {/* Card */}
        <motion.div
          style={{ backgroundColor: '#0d0d0d', border: '1px solid #181818', borderRadius: '4px', padding: '48px', width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'row', gap: '48px', alignItems: 'flex-start' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          {/* Photo */}
          <motion.div
            style={{ flexShrink: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <img
              src={brianpicture}
              alt="Portrait of Brian Daniels"
              style={{ width: '280px', height: '360px', objectFit: 'cover', borderRadius: '3px', border: '1px solid #181818', display: 'block' }}
            />
          </motion.div>

          {/* Text */}
          <motion.div
            className="about-body"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <p>
              I'm Brian Daniels — a Boston and New York City-based music photographer,
              videographer, and multicam producer. I create high-impact
              photo and video content for artists, brands, festivals, and live events, capturing
              the energy at its peak.
            </p>
            <p>
              My work has taken me across the country and beyond, shooting and producing
              for some of the biggest names in the industry — Fred Again, Fisher, DJ Diesel,
              Cloonee, and many more. From intimate club sets to massive festival mainstages,
              I've built a reputation for delivering cinematic, high-quality content under
              pressure. My multicam production work brings a unqiue look to live
              performances, giving artists content that stands out and resonates with fans.
            </p>
            <p>
              Whether you're an artist looking for a music event photographer in Boston or NYC,
              need a videographer for your next festival run, or want a full multicam production
              for your live show — I'm the person for it. Every shoot is driven by the same thing:
              a relentless passion for the music and the moments that define it.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default AboutMe;