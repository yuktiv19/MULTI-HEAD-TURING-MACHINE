/**
 * examples.js — Pre-built Turing Machine configurations for academic demos.
 * Each example includes full config + a human-readable description.
 */

const examples = [
  {
    name: 'Binary Increment',
    description: 'Single-tape machine that increments a binary number by 1. Scans right to find the end, then carries back left.',
    config: {
      mode: 'multi-tape',
      states: ['q0', 'q_right', 'q_carry', 'q_done', 'q_accept'],
      startState: 'q0',
      acceptState: 'q_accept',
      rejectState: 'q_reject',
      inputString: '1011',
      numTapesOrHeads: 1,
      transitions: [
        // Move right to find end of input
        { currentState: 'q0', readSymbols: ['0'], writeSymbols: ['0'], moves: ['R'], nextState: 'q0' },
        { currentState: 'q0', readSymbols: ['1'], writeSymbols: ['1'], moves: ['R'], nextState: 'q0' },
        // Hit blank → go back left and start carrying
        { currentState: 'q0', readSymbols: ['_'], writeSymbols: ['_'], moves: ['L'], nextState: 'q_carry' },
        // Carry: 1 → 0, keep carrying
        { currentState: 'q_carry', readSymbols: ['1'], writeSymbols: ['0'], moves: ['L'], nextState: 'q_carry' },
        // Carry: 0 → 1, done
        { currentState: 'q_carry', readSymbols: ['0'], writeSymbols: ['1'], moves: ['S'], nextState: 'q_accept' },
        // Carry at blank → write 1 (overflow)
        { currentState: 'q_carry', readSymbols: ['_'], writeSymbols: ['1'], moves: ['S'], nextState: 'q_accept' },
      ]
    }
  },
  {
    name: 'Palindrome Checker (2-Tape)',
    description: 'Two-tape machine that checks if the input is a palindrome. Copies input to tape 2 in reverse, then compares both tapes.',
    config: {
      mode: 'multi-tape',
      states: ['q_copy', 'q_rewind1', 'q_rewind2', 'q_compare', 'q_accept', 'q_reject'],
      startState: 'q_copy',
      acceptState: 'q_accept',
      rejectState: 'q_reject',
      inputString: 'abba',
      numTapesOrHeads: 2,
      transitions: [
        // Copy phase: read tape1, write to tape2, move tape1 right
        { currentState: 'q_copy', readSymbols: ['a', '_'], writeSymbols: ['a', 'a'], moves: ['R', 'R'], nextState: 'q_copy' },
        { currentState: 'q_copy', readSymbols: ['b', '_'], writeSymbols: ['b', 'b'], moves: ['R', 'R'], nextState: 'q_copy' },
        // End of input on tape1 → rewind both tapes
        { currentState: 'q_copy', readSymbols: ['_', '_'], writeSymbols: ['_', '_'], moves: ['L', 'L'], nextState: 'q_rewind1' },
        // Rewind tape1 to start
        { currentState: 'q_rewind1', readSymbols: ['a', 'a'], writeSymbols: ['a', 'a'], moves: ['L', 'S'], nextState: 'q_rewind1' },
        { currentState: 'q_rewind1', readSymbols: ['a', 'b'], writeSymbols: ['a', 'b'], moves: ['L', 'S'], nextState: 'q_rewind1' },
        { currentState: 'q_rewind1', readSymbols: ['b', 'a'], writeSymbols: ['b', 'a'], moves: ['L', 'S'], nextState: 'q_rewind1' },
        { currentState: 'q_rewind1', readSymbols: ['b', 'b'], writeSymbols: ['b', 'b'], moves: ['L', 'S'], nextState: 'q_rewind1' },
        // Tape1 at blank (before start) → move right once to position, start compare
        { currentState: 'q_rewind1', readSymbols: ['_', 'a'], writeSymbols: ['_', 'a'], moves: ['R', 'S'], nextState: 'q_compare' },
        { currentState: 'q_rewind1', readSymbols: ['_', 'b'], writeSymbols: ['_', 'b'], moves: ['R', 'S'], nextState: 'q_compare' },
        { currentState: 'q_rewind1', readSymbols: ['_', '_'], writeSymbols: ['_', '_'], moves: ['R', 'S'], nextState: 'q_compare' },
        // Compare: tape1 forward, tape2 backward
        { currentState: 'q_compare', readSymbols: ['a', 'a'], writeSymbols: ['a', 'a'], moves: ['R', 'L'], nextState: 'q_compare' },
        { currentState: 'q_compare', readSymbols: ['b', 'b'], writeSymbols: ['b', 'b'], moves: ['R', 'L'], nextState: 'q_compare' },
        // Mismatch → reject
        { currentState: 'q_compare', readSymbols: ['a', 'b'], writeSymbols: ['a', 'b'], moves: ['S', 'S'], nextState: 'q_reject' },
        { currentState: 'q_compare', readSymbols: ['b', 'a'], writeSymbols: ['b', 'a'], moves: ['S', 'S'], nextState: 'q_reject' },
        // Both blanks → accept (palindrome!)
        { currentState: 'q_compare', readSymbols: ['_', '_'], writeSymbols: ['_', '_'], moves: ['S', 'S'], nextState: 'q_accept' },
      ]
    }
  },
  {
    name: 'Tape Copy (2-Tape)',
    description: 'Two-tape machine that copies the contents of tape 1 to tape 2 symbol by symbol.',
    config: {
      mode: 'multi-tape',
      states: ['q_copy', 'q_accept', 'q_reject'],
      startState: 'q_copy',
      acceptState: 'q_accept',
      rejectState: 'q_reject',
      inputString: '110100',
      numTapesOrHeads: 2,
      transitions: [
        { currentState: 'q_copy', readSymbols: ['0', '_'], writeSymbols: ['0', '0'], moves: ['R', 'R'], nextState: 'q_copy' },
        { currentState: 'q_copy', readSymbols: ['1', '_'], writeSymbols: ['1', '1'], moves: ['R', 'R'], nextState: 'q_copy' },
        { currentState: 'q_copy', readSymbols: ['_', '_'], writeSymbols: ['_', '_'], moves: ['S', 'S'], nextState: 'q_accept' },
      ]
    }
  },
  {
    name: 'Multi-Head Mark (2 Heads)',
    description: 'Single-tape machine with 2 heads. Head 1 reads while Head 2 marks every cell it visits with an X, demonstrating independent head movement on a shared tape.',
    config: {
      mode: 'multi-head',
      states: ['q0', 'q1', 'q2', 'q_accept', 'q_reject'],
      startState: 'q0',
      acceptState: 'q_accept',
      rejectState: 'q_reject',
      inputString: 'aabb',
      numTapesOrHeads: 2,
      transitions: [
        // Head 1 reads 'a', Head 2 reads 'a' → Head 2 writes X, both move right
        { currentState: 'q0', readSymbols: ['a', 'a'], writeSymbols: ['a', 'X'], moves: ['R', 'R'], nextState: 'q0' },
        // Head 1 reads 'a', Head 2 reads 'b' → Head 2 writes X, head1 right, head2 right
        { currentState: 'q0', readSymbols: ['a', 'b'], writeSymbols: ['a', 'X'], moves: ['R', 'R'], nextState: 'q0' },
        // Head 1 reads 'b', Head 2 reads already-marked X → keep going
        { currentState: 'q0', readSymbols: ['b', 'X'], writeSymbols: ['b', 'X'], moves: ['R', 'R'], nextState: 'q1' },
        // Head 1 reads 'b', Head 2 reads 'b' → mark
        { currentState: 'q0', readSymbols: ['b', 'b'], writeSymbols: ['b', 'X'], moves: ['R', 'R'], nextState: 'q1' },
        // Continue in q1
        { currentState: 'q1', readSymbols: ['b', 'b'], writeSymbols: ['b', 'X'], moves: ['R', 'R'], nextState: 'q1' },
        { currentState: 'q1', readSymbols: ['b', 'X'], writeSymbols: ['b', 'X'], moves: ['R', 'R'], nextState: 'q1' },
        { currentState: 'q1', readSymbols: ['b', '_'], writeSymbols: ['b', 'X'], moves: ['R', 'R'], nextState: 'q1' },
        // Head 1 hits blank → accept
        { currentState: 'q1', readSymbols: ['_', '_'], writeSymbols: ['_', '_'], moves: ['S', 'S'], nextState: 'q_accept' },
        { currentState: 'q0', readSymbols: ['_', '_'], writeSymbols: ['_', '_'], moves: ['S', 'S'], nextState: 'q_accept' },
      ]
    }
  }
];

export default examples;
