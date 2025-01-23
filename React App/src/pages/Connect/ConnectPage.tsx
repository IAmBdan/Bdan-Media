import React from "react";
import { motion } from "framer-motion";

const Connect: React.FC = () => {
  return (
    <motion.div
      className="bg-rich_black-500 text-white-500 min-h-screen flex flex-col items-center justify-start pt-20 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      {/* Header */}
      <motion.h1
        className="font-azonix text-4xl md:text-5xl lg:text-6xl text-center tracking-wide mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        Connect With Me
      </motion.h1>

      {/* Unified Social Media and Contact Form Section */}
      <motion.div
        className="bg-slate-800 p-8 md:p-12 rounded-lg shadow-lg w-full max-w-3xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        {/* Social Media Section */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-6">Find Me Online</h2>
          <div className="flex justify-center gap-6">
            <a
              href="https://www.instagram.com/bdan.photos"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            >
              <img
                src="https://s3.us-east-2.amazonaws.com/bdan.photos/instagram.png"
                alt="Instagram"
                className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-slate-500 hover:border-slate-300"
              />
            </a>
            <a
              href="https://www.tiktok.com/@bdan.photos"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            >
              <img
                src="https://s3.us-east-2.amazonaws.com/bdan.photos/tiktok.png"
                alt="TikTok"
                className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-slate-500 hover:border-slate-300"
              />
            </a>
            <a
              href="https://twitter.com/IAmBdan"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            >
              <img
                src="https://s3.us-east-2.amazonaws.com/bdan.photos/twitter.png"
                alt="Twitter"
                className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-slate-500 hover:border-slate-300"
              />
            </a>
            <a
              href="mailto:contact@bdan.photos"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform"
            >
              <img
                src="
https://s3.us-east-2.amazonaws.com/bdan.photos/email.png"
                alt="Email"
                className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-slate-500 hover:border-slate-300"
              />
            </a>
          </div>
        </div>

        {/* Contact Form Section */}
        <form
          className="flex flex-col gap-6"
          action="https://formspree.io/f/xpwakrgq"
          method="POST"
        >
          <label className="flex flex-col text-lg font-semibold">
            Your Name:
            <input
              type="text"
              name="name"
              required
              className="mt-2 p-3 bg-rich_black-400 text-white-500 border border-rich_black-600 rounded-lg focus:outline-none focus:border-slate-300"
            />
          </label>
          <label className="flex flex-col text-lg font-semibold">
            Your Email:
            <input
              type="email"
              name="email"
              required
              className="mt-2 p-3 bg-rich_black-400 text-white-500 border border-rich_black-600 rounded-lg focus:outline-none focus:border-slate-300"
            />
          </label>
          <label className="flex flex-col text-lg font-semibold">
            Your Message:
            <textarea
              name="message"
              rows={4}
              required
              className="mt-2 p-3 bg-rich_black-400 text-white-500 border border-rich_black-600 rounded-lg focus:outline-none focus:border-slate-300"
            ></textarea>
          </label>
          <button
            type="submit"
            className="self-center bg-slate-600 text-white-500 hover:bg-slate-500 px-8 py-3 rounded-lg font-semibold shadow-md transition-all"
          >
            Submit
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Connect;