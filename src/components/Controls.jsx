import React from 'react';
import './Controls.css';

/**
 * Controls — Play / Pause / Step / Step Back / Reset buttons + speed slider.
 */
export default function Controls({
  onPlay, onPause, onStep, onStepBack, onReset,
  isRunning, isHalted, canStepBack, speed, onSpeedChange, hasConfig
}) {
  return (
    <div className="card controls" id="controls-panel">
      <div className="card-title">
        <span className="icon">🎮</span> Controls
      </div>

      <div className="controls-buttons">
        {!isRunning ? (
          <button
            className="btn btn-success"
            onClick={onPlay}
            disabled={isHalted || !hasConfig}
            id="btn-play"
            title="Play"
          >
            ▶ Play
          </button>
        ) : (
          <button
            className="btn btn-secondary"
            onClick={onPause}
            id="btn-pause"
            title="Pause"
          >
            ⏸ Pause
          </button>
        )}

        <button
          className="btn btn-secondary"
          onClick={onStep}
          disabled={isRunning || isHalted || !hasConfig}
          id="btn-step"
          title="Step forward"
        >
          ⏭ Step
        </button>

        <button
          className="btn btn-secondary"
          onClick={onStepBack}
          disabled={isRunning || !canStepBack}
          id="btn-step-back"
          title="Step back"
        >
          ⏮ Back
        </button>

        <div className="controls-divider" />

        <button
          className="btn btn-danger"
          onClick={onReset}
          id="btn-reset"
          title="Reset machine"
        >
          🔄 Reset
        </button>
      </div>

      <div className="speed-control">
        <span className="speed-label">Speed:</span>
        <input
          type="range"
          className="speed-slider"
          min="50"
          max="2000"
          step="50"
          value={speed}
          onChange={e => onSpeedChange(Number(e.target.value))}
          id="speed-slider"
          aria-label="Simulation speed"
        />
        <span className="speed-value">{speed}ms</span>
      </div>
    </div>
  );
}
