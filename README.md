# Multi-Tape / Multi-Head Turing Machine Visualizer

This is an interactive, browser-run visualizer that demonstrates multi-tape and multi-head Turing machines. It is designed for students to step through computations, compare multi-tape vs multi-head behaviors, and learn transition design.

Quick start

- Serve the folder and open in a browser:

  ```powershell
  python -m http.server 8000
  # then open http://localhost:8000
  ```

What you'll find

- `index.html` — polished UI with editor, examples, step log, and explanation panel
- `src/simulator.js` — robust `TuringMachine` implementation supporting:
  - multi-tape machines (multiple tapes, one head per tape)
  - multi-head machines (multiple heads on a single tape)
  - pattern-based transition matching (use `*` as wildcard and `_` for blank)
  - dynamic tape expansion (both directions)
  - detailed step responses for UI-driven explanations
- `src/main.js` — UI wiring: import/export, run/step/reset, logs, samples
- `src/style.css` — modern, accessible styles and subtle animations

Transition table format

Provide a JSON object with keys `start`, `accept`, `reject`, and `transitions` (an object). Transition keys use the form `state|sym1,sym2,...` where `sym1` corresponds to tape 0 or head 0, etc. Example:

```
{
  "start":"q0",
  "accept":"qa",
  "reject":"qr",
  "transitions":{
    "q0|1,_": {"next":"q0","write":["1","1"],"move":["R","R"]},
    "q0|_,_": {"next":"qa","write":["_","_"],"move":["S","S"]}
  }
}
```

Special patterns

- `*` in a transition symbol matches any symbol.
- `_` matches the blank symbol (default `_`).

Examples included

- `two-tape-copy` — simple two-tape copy demonstration
- `multi-head-mark-first-two` — multi-head example marking symbols

Extending the project

- Add more curated example machines (palindrome checker, addition, incrementers).
- Add CSV or visual editor for transitions (table-driven input).
- Improve animations and add step-back capability by recording history.

If you want, I can now:
- Add a rich example set (palindrome, addition, pattern matching).
- Add transition editor GUI with validation and autocomplete.
- Add step-back / history and visual head movement animation.
