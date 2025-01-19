import React from "react";
import { motion } from "framer-motion";
import brianpicture from "../../brianpicture.jpg";

const AboutMe: React.FC = () => {
  return (
    <motion.div
      className="about-me min-h-screen flex flex-col items-center justify-center bg-rich_black-500 text-slate-300 px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      {/* Header */}
      <motion.h1
        className="font-azonix text-4xl md:text-5xl text-slate-100 mb-12 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        About Me
      </motion.h1>

      {/* Boxed Content */}
      <motion.div
        className="bg-slate-700/50 border border-slate-600 shadow-xl rounded-lg flex flex-col lg:flex-row p-8 gap-8 max-w-4xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        {/* Profile Image */}
        <motion.div
          className="profile-image flex-shrink-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        >
          <img
            src={brianpicture}
            alt="Portrait of Brian Daniels"
            className="w-80 h-96 object-cover border-4 border-slate-600 rounded-lg"
          />
        </motion.div>

        {/* Profile Text */}
        <motion.div
          className="profile-text text-center lg:text-left flex flex-col justify-center"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
        >
          <p className="text-base md:text-lg leading-relaxed mb-4">
            My name is Brian Daniels. I am a photographer and videographer with
            a love for capturing moments from all aspects of life. I might be
            the most spontaneous guy you know, and it continues to foster
            experiences I never thought possible. I currently attend
            Northeastern University, working toward my degree in Computer
            Science.
          </p>
          <p className="text-base md:text-lg leading-relaxed mb-4">
            My journey started when I was studying abroad. I began taking
            photos with a drone and my phone, and with the support of my
            friends, I honed my skills. Since returning, I’ve taken every
            opportunity to grow. Sleepless nights, travel, and determination
            have shaped me into who I am today.
          </p>
          <p className="text-base md:text-lg leading-relaxed">
            I thrive on the thrill of meeting new people, exploring new places,
            and saying yes to every opportunity. This mindset drives my
            success, and I love every moment of it.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AboutMe;