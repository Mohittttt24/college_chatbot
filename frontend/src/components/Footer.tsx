// Why this component exists:
// This is the global Footer component shown at the bottom of standard dashboard and public layout pages.
// It provides branding, copyright notices, and quick external links for the college website.

import React from "react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 py-6 px-8 mt-auto text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Branding & Copyright */}
        <div className="flex flex-col items-center md:items-start">
          <span className="font-semibold text-slate-200">College Portal FAQ</span>
          <p className="mt-1 text-xs">
            &copy; {currentYear} Capstone Chatbot. All rights reserved.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs font-medium">
          <a
            href="https://example-college.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-200 transition-colors duration-200"
          >
            College Official Website
          </a>
          <a
            href="#"
            className="hover:text-slate-200 transition-colors duration-200"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="hover:text-slate-200 transition-colors duration-200"
          >
            Terms of Service
          </a>
          <a
            href="mailto:support@college.edu"
            className="hover:text-slate-200 transition-colors duration-200"
          >
            Contact Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
