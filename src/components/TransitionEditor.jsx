import React, { useState } from 'react';
import './TransitionEditor.css';

/**
 * TransitionEditor — Dynamic form for adding and managing transitions.
 *
 * Uses Option B (recommended UX): separate Read / Write / Move inputs
 * per tape or head, grouped inside clearly-labelled cards.
 * Validates that every field is filled before allowing submission.
 */
export default function TransitionEditor({ transitions, onAdd, onDelete, numTapesOrHeads, mode, disabled }) {
  const n = numTapesOrHeads || 1;

  const empty = () => ({
    currentState: '',
    readSymbols: new Array(n).fill(''),
    writeSymbols: new Array(n).fill(''),
    moves: new Array(n).fill('R'),
    nextState: ''
  });

  const [form, setForm] = useState(empty());
  const [error, setError] = useState('');

  // Keep form in sync when numTapesOrHeads or mode changes
  React.useEffect(() => {
    setForm(empty());
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numTapesOrHeads, mode]);

  const updateSymbol = (field, index, value) => {
    const arr = [...form[field]];
    arr[index] = value;
    setForm({ ...form, [field]: arr });
    setError(''); // clear error on edit
  };

  /** Validate and add a transition */
  const handleAdd = () => {
    setError('');

    // Validate states
    if (!form.currentState.trim()) {
      setError('Current state is required.');
      return;
    }
    if (!form.nextState.trim()) {
      setError('Next state is required.');
      return;
    }

    // Validate every read/write symbol is filled
    for (let i = 0; i < n; i++) {
      const label = mode === 'multi-tape' ? `Tape ${i + 1}` : `Head ${i + 1}`;
      if (!form.readSymbols[i].trim()) {
        setError(`${label}: Read symbol is required.`);
        return;
      }
      if (!form.writeSymbols[i].trim()) {
        setError(`${label}: Write symbol is required.`);
        return;
      }
    }

    // All good — add the transition
    onAdd({
      currentState: form.currentState.trim(),
      readSymbols: form.readSymbols.map(s => s.trim()),
      writeSymbols: form.writeSymbols.map(s => s.trim()),
      moves: [...form.moves],
      nextState: form.nextState.trim()
    });
    setForm(empty());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  /** Build a formatted label: (r1,r2) → (w1,w2), (M1,M2) */
  const formatLabel = (t) => {
    const read = t.readSymbols.join(',');
    const write = t.writeSymbols.join(',');
    const move = t.moves.join(',');
    return `(${read}) → (${write}), (${move})`;
  };

  const labelPrefix = mode === 'multi-tape' ? 'Tape' : 'Head';

  return (
    <div className="card transition-editor" id="transition-editor">
      <div className="card-title">
        <span className="icon">🔄</span> Transitions
      </div>

      {/* Add transition form */}
      <div className="transition-form">
        {/* Current State → Next State row */}
        <div className="transition-form-states">
          <div className="form-group">
            <label htmlFor="trans-current">Current State</label>
            <input
              id="trans-current"
              type="text"
              placeholder="e.g. q0"
              value={form.currentState}
              onChange={e => { setForm({ ...form, currentState: e.target.value }); setError(''); }}
              onKeyDown={handleKeyDown}
              disabled={disabled}
            />
          </div>
          <div className="form-group">
            <label htmlFor="trans-next">Next State</label>
            <input
              id="trans-next"
              type="text"
              placeholder="e.g. q1"
              value={form.nextState}
              onChange={e => { setForm({ ...form, nextState: e.target.value }); setError(''); }}
              onKeyDown={handleKeyDown}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Per-tape / per-head blocks */}
        <div className="transition-tapes-grid">
          {Array.from({ length: n }, (_, i) => (
            <div className="transition-tape-block" key={i}>
              <div className="transition-tape-label">
                <span className="tape-dot" />
                {labelPrefix} {i + 1}
              </div>
              <div className="transition-tape-fields">
                <div className="form-group">
                  <label>Read</label>
                  <input
                    type="text"
                    placeholder="e.g. 0"
                    value={form.readSymbols[i]}
                    onChange={e => updateSymbol('readSymbols', i, e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    aria-label={`${labelPrefix} ${i + 1} read symbol`}
                  />
                </div>
                <div className="form-group">
                  <label>Write</label>
                  <input
                    type="text"
                    placeholder="e.g. 1"
                    value={form.writeSymbols[i]}
                    onChange={e => updateSymbol('writeSymbols', i, e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    aria-label={`${labelPrefix} ${i + 1} write symbol`}
                  />
                </div>
                <div className="form-group">
                  <label>Move</label>
                  <select
                    value={form.moves[i]}
                    onChange={e => updateSymbol('moves', i, e.target.value)}
                    disabled={disabled}
                    aria-label={`${labelPrefix} ${i + 1} move direction`}
                  >
                    <option value="L">← L (Left)</option>
                    <option value="R">R → (Right)</option>
                    <option value="S">• S (Stay)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error + Add button */}
        <div className="transition-form-actions">
          {error && (
            <div className="transition-error" role="alert">
              ⚠ {error}
            </div>
          )}
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={disabled}
            id="add-transition-btn"
          >
            ＋ Add Transition
          </button>
        </div>
      </div>

      {/* Transition table */}
      {transitions.length > 0 ? (
        <div className="transition-table-wrap">
          <table className="transition-table" id="transition-table">
            <thead>
              <tr>
                <th>#</th>
                <th>From</th>
                <th>Transition</th>
                <th>To</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transitions.map((t, i) => (
                <tr key={i} className="animate-fade-in">
                  <td>{i + 1}</td>
                  <td>{t.currentState}</td>
                  <td className="transition-label">{formatLabel(t)}</td>
                  <td>{t.nextState}</td>
                  <td>
                    <button
                      className="transition-delete-btn"
                      onClick={() => onDelete(i)}
                      disabled={disabled}
                      aria-label={`Delete transition ${i + 1}`}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="transition-empty">
          No transitions defined yet. Use the form above to add transitions.
        </div>
      )}
    </div>
  );
}
