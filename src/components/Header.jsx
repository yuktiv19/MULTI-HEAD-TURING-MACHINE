import React from 'react';
import './Header.css';

/**
 * Header — App title, subtitle, and dark/light theme toggle.
 */
export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="header" id="header">
      <div className="header-brand">
        <span className="header-logo" role="img" aria-label="brain">🧠</span>
        <div>
          <h1 className="header-title">Turing Machine Visualizer</h1>
          <p className="header-subtitle">Multi-Head &amp; Multi-Tape Simulation</p>
        </div>
      </div>
      <div className="header-actions">
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label="Toggle dark/light theme"
          id="theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <div className={`theme-toggle-knob ${theme}`}>
            {theme === 'dark' ? '🌙' : '☀️'}
          </div>
        </button>
      </div>
    </header>
  );
}
