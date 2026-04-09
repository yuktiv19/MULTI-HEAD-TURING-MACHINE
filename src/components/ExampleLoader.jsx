import React from 'react';
import examples from '../utils/examples';
import './ExampleLoader.css';

const ICONS = ['🔢', '🔍', '📋', '🔀'];

/**
 * ExampleLoader — Displays pre-built example machines as clickable cards.
 * Clicking a card loads the example into the app state.
 */
export default function ExampleLoader({ onLoad, disabled }) {
  return (
    <div className="card example-loader" id="example-loader">
      <div className="card-title">
        <span className="icon">📚</span> Example Machines
      </div>
      <div className="example-grid">
        {examples.map((ex, i) => (
          <div
            key={i}
            className="example-card"
            onClick={() => !disabled && onLoad(ex)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && !disabled && onLoad(ex)}
            id={`example-card-${i}`}
          >
            <div className="example-card-name">
              <span className="example-icon">{ICONS[i % ICONS.length]}</span>
              {ex.name}
            </div>
            <div className="example-card-desc">{ex.description}</div>
            <div className="example-card-meta">
              <span className="badge badge-accent">
                {ex.config.mode === 'multi-tape' ? '📼 Multi-Tape' : '🔀 Multi-Head'}
              </span>
              <span className="badge badge-accent">
                {ex.config.mode === 'multi-tape'
                  ? `${ex.config.numTapesOrHeads} tape${ex.config.numTapesOrHeads > 1 ? 's' : ''}`
                  : `${ex.config.numTapesOrHeads} head${ex.config.numTapesOrHeads > 1 ? 's' : ''}`
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
