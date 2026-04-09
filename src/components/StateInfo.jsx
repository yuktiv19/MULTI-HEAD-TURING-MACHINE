import React from 'react';
import './StateInfo.css';

/**
 * StateInfo — Displays the current state as a prominent badge,
 * step counter, and result (accepted/rejected/timeout) when halted.
 */
export default function StateInfo({ snapshot }) {
  if (!snapshot) return null;

  const { state, step, status, halted } = snapshot;

  const badgeClass = halted
    ? status === 'accepted' ? 'accepted'
    : status === 'rejected' ? 'rejected'
    : status === 'timeout' ? 'timeout'
    : ''
    : 'running';

  const resultLabel = halted
    ? status === 'accepted' ? '✓ ACCEPTED'
    : status === 'rejected' ? '✕ REJECTED'
    : status === 'timeout' ? '⏱ TIMEOUT'
    : ''
    : '';

  const resultBadgeClass = halted
    ? status === 'accepted' ? 'badge-success'
    : status === 'rejected' ? 'badge-danger'
    : 'badge-warning'
    : '';

  return (
    <div className="card" id="state-info">
      <div className="card-title">
        <span className="icon">📊</span> Machine Status
      </div>
      <div className="state-info">
        <div className="state-badge-wrap">
          <div className={`state-badge ${badgeClass}`} id="current-state-badge">
            {state}
          </div>
          <span className="state-badge-label">Current State</span>
        </div>

        <div className="state-info-stats">
          <div className="state-stat">
            <span className="state-stat-value" id="step-counter">{step}</span>
            <span className="state-stat-label">Steps</span>
          </div>
        </div>

        {halted && resultLabel && (
          <div className="state-result animate-fade-in">
            <span className={`badge ${resultBadgeClass}`} id="result-badge">
              {resultLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
