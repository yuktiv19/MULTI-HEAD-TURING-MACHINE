import React from 'react';
import './ConfigPanel.css';

/**
 * ConfigPanel — Machine configuration form.
 * Inputs: mode, states, input string, number of tapes/heads,
 *         start state, accept state, reject state.
 */
export default function ConfigPanel({ config, onChange, disabled }) {
  const handleChange = (field, value) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="card config-panel" id="config-panel">
      <div className="card-title">
        <span className="icon">⚙️</span> Machine Configuration
      </div>

      {/* Mode selector */}
      <div className="form-group">
        <label>Machine Mode</label>
        <div className="mode-selector" id="mode-selector">
          <button
            className={`mode-btn ${config.mode === 'multi-tape' ? 'active' : ''}`}
            onClick={() => handleChange('mode', 'multi-tape')}
            disabled={disabled}
            id="mode-multi-tape"
          >
            📼 Multi-Tape
          </button>
          <button
            className={`mode-btn ${config.mode === 'multi-head' ? 'active' : ''}`}
            onClick={() => handleChange('mode', 'multi-head')}
            disabled={disabled}
            id="mode-multi-head"
          >
            🔀 Multi-Head
          </button>
        </div>
      </div>

      {/* States & Input */}
      <div className="config-grid">
        <div className="form-group">
          <label htmlFor="input-states">States (comma-separated)</label>
          <input
            id="input-states"
            type="text"
            placeholder="q0, q1, q_accept, q_reject"
            value={config.states}
            onChange={e => handleChange('states', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="form-group">
          <label htmlFor="input-string">Input String</label>
          <input
            id="input-string"
            type="text"
            placeholder="e.g. 01101"
            value={config.inputString}
            onChange={e => handleChange('inputString', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="form-group">
          <label htmlFor="input-num">
            {config.mode === 'multi-tape' ? 'Number of Tapes' : 'Number of Heads'}
          </label>
          <input
            id="input-num"
            type="number"
            min="1"
            max="5"
            value={config.numTapesOrHeads}
            onChange={e => handleChange('numTapesOrHeads', parseInt(e.target.value) || 1)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Start / Accept / Reject states */}
      <div className="config-states-row">
        <div className="form-group">
          <label htmlFor="input-start">Start State</label>
          <input
            id="input-start"
            type="text"
            placeholder="q0"
            value={config.startState}
            onChange={e => handleChange('startState', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="form-group">
          <label htmlFor="input-accept">Accept State</label>
          <input
            id="input-accept"
            type="text"
            placeholder="q_accept"
            value={config.acceptState}
            onChange={e => handleChange('acceptState', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="form-group">
          <label htmlFor="input-reject">Reject State</label>
          <input
            id="input-reject"
            type="text"
            placeholder="q_reject"
            value={config.rejectState}
            onChange={e => handleChange('rejectState', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
