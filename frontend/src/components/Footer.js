// src/components/Footer.js
import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <span className="footer-brand">🥬 FreshKeeper</span>
      <span className="footer-divider">·</span>
      <span className="footer-text">Reduce waste, cook smarter</span>
      <span className="footer-divider">·</span>
      <span className="footer-year">© {new Date().getFullYear()}</span>
    </footer>
  );
}
