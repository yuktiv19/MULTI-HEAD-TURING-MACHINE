import React, { useRef, useEffect } from 'react';
import './TapeDisplay.css';

const BLANK = '_';
const HEAD_COLORS = ['head-color-0', 'head-color-1', 'head-color-2', 'head-color-3', 'head-color-4'];

/**
 * TapeDisplay — Renders tape(s) as horizontal rows of cells with head markers.
 *
 * Multi-tape: shows N rows (one per tape), each with a single head.
 * Multi-head: shows 1 row with N head markers (different colors).
 */
export default function TapeDisplay({ snapshot, mode, numTapesOrHeads, prevSnapshot }) {
  if (!snapshot) return null;

  const { tapes, heads } = snapshot;
  const n = numTapesOrHeads || 1;

  if (mode === 'multi-tape') {
    return (
      <div className="card tape-display" id="tape-display">
        <div className="card-title">
          <span className="icon">📼</span> Tapes
        </div>
        {tapes.map((tape, tapeIdx) => (
          <SingleTapeRow
            key={tapeIdx}
            tape={tape}
            headPositions={[heads[tapeIdx]]}
            label={`Tape ${tapeIdx + 1}`}
            colorIndex={tapeIdx}
            mode="multi-tape"
            prevTape={prevSnapshot ? prevSnapshot.tapes[tapeIdx] : null}
          />
        ))}
      </div>
    );
  } else {
    // Multi-head: single tape, multiple heads
    return (
      <div className="card tape-display" id="tape-display">
        <div className="card-title">
          <span className="icon">📼</span> Tape (Multi-Head)
        </div>
        <SingleTapeRow
          tape={tapes[0]}
          headPositions={heads}
          label="Shared Tape"
          colorIndex={0}
          mode="multi-head"
          prevTape={prevSnapshot ? prevSnapshot.tapes[0] : null}
        />
      </div>
    );
  }
}

/**
 * Renders a single tape row with cells and head markers.
 */
function SingleTapeRow({ tape, headPositions, label, colorIndex, mode, prevTape }) {
  const scrollRef = useRef(null);

  // Auto-scroll to keep the primary head visible and centered.
  // On the initial render (head at 0), scrolls to the start so the
  // first input symbol is visible. During simulation, smoothly follows the head.
  useEffect(() => {
    if (scrollRef.current && headPositions.length > 0) {
      const primaryHead = headPositions[0];
      const cellWidth = 44; // 42px cell + 2px gap
      const containerWidth = scrollRef.current.clientWidth;
      const headCenter = primaryHead * cellWidth + cellWidth / 2;
      const scrollLeft = headCenter - containerWidth / 2;
      scrollRef.current.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: primaryHead === 0 ? 'auto' : 'smooth'
      });
    }
  }, [headPositions]);

  // Determine which cells have just been written (changed from previous snapshot)
  const writtenCells = new Set();
  if (prevTape) {
    for (let i = 0; i < tape.length; i++) {
      if (tape[i] !== (prevTape[i] || BLANK)) {
        writtenCells.add(i);
      }
    }
  }

  // Build head position lookup: cellIndex → [headIdx, ...]
  const headAtCell = {};
  headPositions.forEach((pos, idx) => {
    if (!headAtCell[pos]) headAtCell[pos] = [];
    headAtCell[pos].push(idx);
  });

  // Compute visible range.
  // Always start at index 0 so the first input symbol is the first cell shown.
  // Extend the right edge beyond the rightmost head for context.
  const minHead = Math.min(...headPositions);
  const maxHead = Math.max(...headPositions);
  const visibleStart = 0;
  const visibleEnd = Math.min(tape.length - 1, Math.max(maxHead + 15, minHead + 25, 20));
  const visibleTape = tape.slice(visibleStart, visibleEnd + 1);

  return (
    <div className="tape-row">
      <div className="tape-label">
        <span className="tape-label-dot" style={{ background: `var(--accent)` }} />
        {label}
      </div>
      <div className="tape-scroll-wrapper" ref={scrollRef}>
        {/* Cells */}
        <div className="tape-cells">
          {visibleTape.map((symbol, i) => {
            const globalIdx = i + visibleStart;
            const isBlank = symbol === BLANK;
            const headsHere = headAtCell[globalIdx] || [];
            const isActive = headsHere.length > 0;
            const justWritten = writtenCells.has(globalIdx);

            let activeClasses = '';
            if (isActive) {
              if (mode === 'multi-head') {
                activeClasses = headsHere.map(h => `active-head-${h % 5}`).join(' ');
              } else {
                activeClasses = 'active';
              }
            }

            return (
              <div
                key={globalIdx}
                className={`tape-cell ${isBlank ? 'blank' : ''} ${isActive ? 'active' : ''} ${activeClasses} ${justWritten ? 'just-written' : ''}`}
              >
                {symbol}
              </div>
            );
          })}
        </div>
        {/* Head markers */}
        <div className="tape-head-markers">
          {visibleTape.map((_, i) => {
            const globalIdx = i + visibleStart;
            const headsHere = headAtCell[globalIdx] || [];
            return (
              <div key={globalIdx} className="tape-head-marker">
                {headsHere.map(hIdx => (
                  <div key={hIdx} className={`tape-head-arrow ${HEAD_COLORS[hIdx % 5]}`}>
                    <span className="arrow-icon">▲</span>
                    <span className="head-label">
                      {mode === 'multi-head' ? `H${hIdx + 1}` : 'H'}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
