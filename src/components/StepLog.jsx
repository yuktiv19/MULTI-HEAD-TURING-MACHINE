import React, { useRef, useEffect } from 'react';
import './StepLog.css';

/**
 * StepLog — Scrollable table showing the execution history.
 * Each row: step #, state, tape content summary, head positions.
 */
export default function StepLog({ history, currentStep, acceptState, rejectState }) {
  const scrollRef = useRef(null);

  // Auto-scroll to latest entry
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  if (!history || history.length === 0) {
    return (
      <div className="card step-log" id="step-log">
        <div className="card-title">
          <span className="icon">📜</span> Step Log
        </div>
        <div className="step-log-empty">
          Run the machine to see the execution log.
        </div>
      </div>
    );
  }

  /** Trim blanks from tape edges for compact display */
  const trimTape = (tape) => {
    const str = tape.join('');
    return str.replace(/^_+/, '').replace(/_+$/, '') || '_';
  };

  return (
    <div className="card step-log" id="step-log">
      <div className="card-title">
        <span className="icon">📜</span> Step Log
        <span className="badge badge-accent" style={{ marginLeft: 'auto' }}>{history.length} steps</span>
      </div>
      <div className="step-log-scroll" ref={scrollRef}>
        <table className="step-log-table">
          <thead>
            <tr>
              <th>#</th>
              <th>State</th>
              <th>Tape(s)</th>
              <th>Heads</th>
            </tr>
          </thead>
          <tbody>
            {history.map((snap, i) => {
              const isCurrent = i === currentStep;
              const stateClass = snap.state === acceptState ? 'accepted'
                : snap.state === rejectState ? 'rejected'
                : '';
              return (
                <tr key={i} className={isCurrent ? 'current' : ''}>
                  <td>{snap.step}</td>
                  <td className={`state-cell ${stateClass}`}>{snap.state}</td>
                  <td className="step-log-tape-content">
                    {snap.tapes.map((t, j) => trimTape(t)).join(' | ')}
                  </td>
                  <td>{snap.heads.join(', ')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
