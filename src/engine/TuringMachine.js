/**
 * TuringMachine.js — Pure JavaScript Turing Machine simulation engine.
 *
 * Supports two modes:
 *   1. Multi-Tape: N independent tapes, each with 1 head.
 *   2. Multi-Head: 1 tape shared by N heads.
 *
 * The engine is fully decoupled from the DOM — it receives configuration
 * and returns snapshots, making it easy to drive from any UI framework.
 */

/** Blank symbol constant */
const BLANK = '_';

/**
 * @typedef {Object} Snapshot
 * @property {number}     step      - Step number (0 = initial)
 * @property {string}     state     - Current state label
 * @property {string[][]} tapes     - Array of tape arrays (one per tape)
 * @property {number[]}   heads     - Head positions (one per tape in multi-tape, N in multi-head)
 * @property {boolean}    halted    - Whether the machine has halted
 * @property {'running'|'accepted'|'rejected'|'timeout'} status
 * @property {Object|null} transition - The transition that was just applied (null for step 0)
 */

export default class TuringMachine {
  /**
   * @param {Object} config
   * @param {'multi-tape'|'multi-head'} config.mode
   * @param {string[]}  config.states       - List of state labels
   * @param {string}    config.startState
   * @param {string}    config.acceptState
   * @param {string}    config.rejectState
   * @param {string}    config.inputString  - Characters to place on tape 0
   * @param {number}    config.numTapesOrHeads - Number of tapes (multi-tape) or heads (multi-head)
   * @param {Object[]}  config.transitions  - Array of transition objects
   *   Each transition: { currentState, readSymbols:[], writeSymbols:[], moves:[], nextState }
   *   moves entries are 'L', 'R', or 'S' (stay)
   * @param {number}    [config.maxSteps=500]
   */
  constructor(config) {
    this.mode = config.mode || 'multi-tape';
    this.states = config.states;
    this.startState = config.startState;
    this.acceptState = config.acceptState;
    this.rejectState = config.rejectState;
    this.maxSteps = config.maxSteps || 500;

    // Number of tapes (multi-tape) or heads (multi-head)
    this.n = config.numTapesOrHeads || 1;

    // Build transition lookup map: key = "state|sym1,sym2,..." → transition
    this.transitionMap = new Map();
    for (const t of config.transitions) {
      const key = this._transKey(t.currentState, t.readSymbols);
      this.transitionMap.set(key, t);
    }

    // Initialise tapes and heads.
    // IMPORTANT: Input always starts at index 0 — no prepended blanks.
    if (this.mode === 'multi-tape') {
      // N tapes, 1 head per tape. Input goes on tape 0 starting at index 0.
      this.tapes = [];
      for (let i = 0; i < this.n; i++) {
        if (i === 0 && config.inputString && config.inputString.length > 0) {
          // Tape 0: input symbols at index 0, 1, 2, ... followed by trailing blanks
          this.tapes.push(this._buildInputTape(config.inputString));
        } else {
          // Other tapes: all blanks
          this.tapes.push(this._buildBlankTape());
        }
      }
      // All heads start at position 0 → reads the first input symbol immediately
      this.heads = new Array(this.n).fill(0);
    } else {
      // Multi-head: 1 tape, N heads — all on the same tape
      if (config.inputString && config.inputString.length > 0) {
        this.tapes = [this._buildInputTape(config.inputString)];
      } else {
        this.tapes = [this._buildBlankTape()];
      }
      // All heads start at position 0
      this.heads = new Array(this.n).fill(0);
    }

    this.currentState = this.startState;
    this.stepCount = 0;
    this.halted = false;
    this.status = 'running';
    this.lastTransition = null;

    // History stores every snapshot for step-back
    this.history = [this._snapshot()];
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                         */
  /* ------------------------------------------------------------------ */

  /** Take a single step. Returns the new snapshot. */
  step() {
    if (this.halted) return this._snapshot();

    // Read symbols under each head
    const readSyms = this._readHeads();

    // Look up transition
    const key = this._transKey(this.currentState, readSyms);
    const trans = this.transitionMap.get(key);

    if (!trans) {
      // No transition → reject
      this.currentState = this.rejectState;
      this.halted = true;
      this.status = 'rejected';
      this.lastTransition = null;
      this.stepCount++;
      const snap = this._snapshot();
      this.history.push(snap);
      return snap;
    }

    // Write symbols
    this._writeHeads(trans.writeSymbols);

    // Move heads
    this._moveHeads(trans.moves);

    // Update state
    this.currentState = trans.nextState;
    this.lastTransition = trans;
    this.stepCount++;

    // Check halting conditions
    if (this.currentState === this.acceptState) {
      this.halted = true;
      this.status = 'accepted';
    } else if (this.currentState === this.rejectState) {
      this.halted = true;
      this.status = 'rejected';
    } else if (this.stepCount >= this.maxSteps) {
      this.halted = true;
      this.status = 'timeout';
    }

    const snap = this._snapshot();
    this.history.push(snap);
    return snap;
  }

  /** Reset the machine to the initial state. */
  reset(config) {
    // Re-construct from config
    Object.assign(this, new TuringMachine(config));
  }

  /** Return snapshot at a given step index (for step-back). */
  getSnapshot(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.history.length) {
      return this.history[stepIndex];
    }
    return null;
  }

  /** Get all transitions as an array (for diagram rendering). */
  getTransitions() {
    return Array.from(this.transitionMap.values());
  }

  /* ------------------------------------------------------------------ */
  /*  Internal helpers                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Build a tape from an input string.
   * Input symbols start at index 0 (no prepended blanks),
   * followed by trailing blanks for display room.
   * @param {string} inputString
   * @returns {string[]}
   */
  _buildInputTape(inputString) {
    // Split into individual characters, filter out empty strings
    const symbols = inputString.split('').filter(s => s.length > 0);
    const TRAILING_PAD = 20;
    return [...symbols, ...new Array(TRAILING_PAD).fill(BLANK)];
  }

  /**
   * Build a blank tape (used for non-input tapes).
   * @returns {string[]}
   */
  _buildBlankTape() {
    const TRAILING_PAD = 20;
    return new Array(TRAILING_PAD).fill(BLANK);
  }

  /** Build a lookup key from state + read symbols. */
  _transKey(state, readSymbols) {
    return `${state}|${readSymbols.join(',')}`;
  }

  /** Read the symbol under each head. */
  _readHeads() {
    if (this.mode === 'multi-tape') {
      return this.heads.map((h, i) => this.tapes[i][h] || BLANK);
    } else {
      // Multi-head: all heads on tape 0
      return this.heads.map(h => this.tapes[0][h] || BLANK);
    }
  }

  /** Write symbols at each head position. */
  _writeHeads(writeSymbols) {
    if (this.mode === 'multi-tape') {
      for (let i = 0; i < this.n; i++) {
        this._ensureBounds(i, this.heads[i]);
        this.tapes[i][this.heads[i]] = writeSymbols[i];
      }
    } else {
      for (let i = 0; i < this.n; i++) {
        this._ensureBounds(0, this.heads[i]);
        this.tapes[0][this.heads[i]] = writeSymbols[i];
      }
    }
  }

  /** Move heads according to directions. */
  _moveHeads(moves) {
    for (let i = 0; i < this.n; i++) {
      const tapeIdx = this.mode === 'multi-tape' ? i : 0;
      if (moves[i] === 'R') {
        this.heads[i]++;
        this._ensureBounds(tapeIdx, this.heads[i]);
      } else if (moves[i] === 'L') {
        if (this.heads[i] > 0) {
          this.heads[i]--;
        } else {
          // Head is at position 0 and wants to move left.
          // Dynamically prepend a blank cell and keep head at 0.
          this.tapes[tapeIdx].unshift(BLANK);
          // Adjust ALL OTHER heads that reference the SAME tape
          // so their positions remain correct after the unshift.
          if (this.mode === 'multi-head') {
            // Multi-head: all heads share tape 0
            for (let j = 0; j < this.n; j++) {
              if (j !== i) this.heads[j]++;
            }
          }
          // Multi-tape: each tape has exactly one head, so no
          // other heads reference this tape — nothing to adjust.
        }
      }
      // 'S' = stay, do nothing
    }
  }

  /** Ensure tape is large enough for the given position. */
  _ensureBounds(tapeIdx, pos) {
    while (pos >= this.tapes[tapeIdx].length) {
      this.tapes[tapeIdx].push(BLANK);
    }
  }

  /** Capture a deep-copy snapshot of the current machine state. */
  _snapshot() {
    return {
      step: this.stepCount,
      state: this.currentState,
      tapes: this.tapes.map(t => [...t]),
      heads: [...this.heads],
      halted: this.halted,
      status: this.status,
      transition: this.lastTransition ? { ...this.lastTransition } : null
    };
  }
}
