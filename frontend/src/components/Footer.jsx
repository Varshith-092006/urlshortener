import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-brand">
            <div className="footer-brand-mark">🔗</div>
            <div className="footer-brand-text">
              <div className="footer-brand-name">ScaleURL</div>
              <div className="footer-brand-tagline">Fast, Simple URL Shortening</div>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <nav className="footer-nav">
            <Link to="/">Home</Link>
            <Link to="/features">Features</Link>
            <Link to="/analytics">Analytics</Link>
          </nav>
        </div>

        <div className="footer-section">
          <h3>Resources</h3>
          <nav className="footer-nav">
            <a href="https://github.com/sandeeprepala/url-shortener-microservices" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
          </nav>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} ScaleURL. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;