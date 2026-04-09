import React, { useState, useRef, useCallback, useEffect } from 'react';
import './App.css';

// Components
import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';
import TransitionEditor from './components/TransitionEditor';
import Controls from './components/Controls';
import TapeDisplay from './components/TapeDisplay';
import StateInfo from './components/StateInfo';
import StateDiagram from './components/StateDiagram';
import StepLog from './components/StepLog';

// Engine & utilities
import TuringMachine from './engine/TuringMachine';
import { getInitialTheme, applyTheme, toggleTheme as toggleThemeFn } from './utils/theme';

/**
 * App — Main application component.
 * Manages all state: machine config, transitions, simulation, theme.
 */
export default function App() {
  /* ---- Theme ---- */
  const [theme, setTheme] = useState(() => {
    const t = getInitialTheme();
    applyTheme(t);
    return t;
  });

  const handleToggleTheme = () => {
    const next = toggleThemeFn(theme);
    setTheme(next);
  };

  /* ---- Machine Configuration ---- */
  const [config, setConfig] = useState({
    mode: 'multi-tape',
    states: '',
    inputString: '',
    numTapesOrHeads: 1,
    startState: '',
    acceptState: '',
    rejectState: ''
  });

  const [transitions, setTransitions] = useState([]);

  const handleAddTransition = (t) => {
    setTransitions(prev => [...prev, t]);
  };

  const handleDeleteTransition = (index) => {
    setTransitions(prev => prev.filter((_, i) => i !== index));
  };

  /* ---- Simulation State ---- */
  const [machine, setMachine] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [prevSnapshot, setPrevSnapshot] = useState(null);
  const [history, setHistory] = useState([]);
  const [viewStep, setViewStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const intervalRef = useRef(null);

  /** Parse config into a TuringMachine-compatible object */
  const buildMachineConfig = useCallback(() => {
    const statesList = config.states
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    return {
      mode: config.mode,
      states: statesList,
      startState: config.startState.trim(),
      acceptState: config.acceptState.trim(),
      rejectState: config.rejectState.trim(),
      inputString: config.inputString.trim(),
      numTapesOrHeads: config.numTapesOrHeads,
      transitions: transitions
    };
  }, [config, transitions]);

  const hasConfig = config.startState && config.acceptState && transitions.length > 0;

  /** Initialize or re-initialize the machine */
  const initMachine = useCallback(() => {
    const cfg = buildMachineConfig();
    const tm = new TuringMachine(cfg);
    const initialSnap = tm.history[0];
    setMachine(tm);
    setSnapshot(initialSnap);
    setPrevSnapshot(null);
    setHistory([initialSnap]);
    setViewStep(0);
    return tm;
  }, [buildMachineConfig]);

  /** Step forward */
  const handleStep = useCallback(() => {
    let tm = machine;
    if (!tm) {
      tm = initMachine();
    }
    if (tm.halted) return;

    const prevSnap = tm.history[tm.history.length - 1];
    const newSnap = tm.step();
    setPrevSnapshot(prevSnap);
    setSnapshot(newSnap);
    setHistory([...tm.history]);
    setViewStep(tm.history.length - 1);

    if (newSnap.halted) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Force re-render of machine ref
    setMachine(Object.assign(Object.create(Object.getPrototypeOf(tm)), tm));
  }, [machine, initMachine]);

  /** Step back (view only — uses history) */
  const handleStepBack = useCallback(() => {
    if (viewStep > 0) {
      const newStep = viewStep - 1;
      setViewStep(newStep);
      setSnapshot(history[newStep]);
      setPrevSnapshot(newStep > 0 ? history[newStep - 1] : null);
    }
  }, [viewStep, history]);

  /** Play */
  const handlePlay = useCallback(() => {
    let tm = machine;
    if (!tm) {
      tm = initMachine();
    }
    if (tm.halted) return;
    setIsRunning(true);
  }, [machine, initMachine]);

  /** Pause */
  const handlePause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /** Reset */
  const handleReset = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setMachine(null);
    setSnapshot(null);
    setPrevSnapshot(null);
    setHistory([]);
    setViewStep(0);
  }, []);

  // Auto-step interval when playing
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        handleStep();
      }, speed);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, speed, handleStep]);

  /* ---- Derived values for diagram ---- */
  const parsedStates = config.states
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const currentDiagramState = snapshot ? snapshot.state : config.startState;

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={handleToggleTheme} />

      <main className="app-content">
        {/* Simulation area (tape + status) — rendered at the top when active */}
        {snapshot && (
          <div className="app-simulation-row animate-fade-in">
            <div className="app-simulation-left">
              <TapeDisplay
                snapshot={snapshot}
                mode={config.mode}
                numTapesOrHeads={config.numTapesOrHeads}
                prevSnapshot={prevSnapshot}
              />
            </div>
            <div className="app-simulation-right">
              <StateInfo snapshot={snapshot} />
            </div>
          </div>
        )}

        {/* Main two-column layout */}
        <div className="app-main-row">
          {/* LEFT COLUMN: Config + Transitions */}
          <div className="app-left-col">
            <ConfigPanel
              config={config}
              onChange={setConfig}
              disabled={isRunning}
            />
            <TransitionEditor
              transitions={transitions}
              onAdd={handleAddTransition}
              onDelete={handleDeleteTransition}
              numTapesOrHeads={config.numTapesOrHeads}
              mode={config.mode}
              disabled={isRunning}
            />
          </div>

          {/* RIGHT COLUMN: Controls + State Diagram + Step Log */}
          <div className="app-right-col">
            <Controls
              onPlay={handlePlay}
              onPause={handlePause}
              onStep={handleStep}
              onStepBack={handleStepBack}
              onReset={handleReset}
              isRunning={isRunning}
              isHalted={snapshot?.halted || false}
              canStepBack={viewStep > 0 && !isRunning}
              speed={speed}
              onSpeedChange={setSpeed}
              hasConfig={hasConfig}
            />
            <StateDiagram
              transitions={transitions}
              states={parsedStates}
              startState={config.startState.trim()}
              acceptState={config.acceptState.trim()}
              rejectState={config.rejectState.trim()}
              currentState={currentDiagramState}
            />
            <StepLog
              history={history}
              currentStep={viewStep}
              acceptState={config.acceptState.trim()}
              rejectState={config.rejectState.trim()}
            />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        Multi-Head &amp; Multi-Tape Turing Machine Visualizer — Built for academic demonstration
      </footer>
    </div>
  );
}
