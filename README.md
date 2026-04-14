# Multi-Tape & Multi-Head Turing Machine Visualizer

An interactive, browser-based Turing Machine visualizer built with **React**, **Vite**, and **D3.js**. Designed for academic demonstration, this tool allows you to simulate, build, and step through computations for both Multi-Tape and Multi-Head Turing Machines.

## Features

- **Two Core Modes**:
  - **Multi-Tape**: Simulate machines with $N$ independent tapes, each with its own head.
  - **Multi-Head**: Simulate machines with 1 shared tape and $N$ independent heads moving across it.
- **Interactive UI**: A premium, responsive interface featuring dynamic tape rendering, head indicators, and real-time machine status.
- **Visual State Diagram**: Automatically generates a dynamic, force-directed graph (using D3.js) of your machine's states and transitions.
- **Transition Editor**: Easy-to-use form to define complex transitions (Read, Write, Move) across multiple tapes or heads.
- **Step-by-Step Execution**: Run the simulation automatically with adjustable speed, or advance frame-by-frame and even step backwards using the execution history.
- **Dynamic Tape Expansion**: The tape dynamically grows and visualizes blank (`_`) cells seamlessly as heads move.

## Demo

- **Live demo:** https://multihead-or-multitape-turing-machi.vercel.app/

## Quick Start

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone or download the repository.
2. Open the project folder in your terminal.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

## How to Use

1. **Configure the Machine**: Use the Configuration panel to select the mode (Multi-Tape or Multi-Head), set the initial input string, number of tapes/heads, and starting states ($q_0$, $q_{accept}$, $q_{reject}$).
2. **Add Transitions**: Use the Transitions panel to define the rules of your machine. For example, specify what multiple heads should read, write, and in which direction they should move (`L`, `R`, or `S` for Stay).
3. **Execute**: Use the Controls panel to run the machine. You can `Play` it continuously, or use `Step` to walk through the logic visually one calculation at a time. The State Diagram and Step Log will highlight the current operation in real-time.

## Technology Stack

- **React 18** - UI Component framework
- **Vite** - Fast frontend bundler and development server
- **D3.js** - Force-directed parsing and SVG state diagrams
- **Vanilla CSS** - Completely custom, modern, variable-driven dark/light styling without reliance on heavy UI libraries.

## Licensing

Open source. Built for educational and academic use.
