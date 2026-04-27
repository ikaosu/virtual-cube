"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { newScramble3x3 } from "./cube";

export type SolverState = "idle" | "ready" | "solving" | "done";

export interface SolveResult {
  scramble: string;
  solution: string[];
  timeMs: number;
}

export interface SolverSession {
  state: SolverState;
  scramble: string | null;
  solution: string[];
  /** Live elapsed time in ms while solving; final time when done. */
  elapsedMs: number;
  /** Result of the most recently completed solve, or null. */
  lastResult: SolveResult | null;
  /** Generate a new scramble and arm the cube; transitions idle/done → ready. */
  newScramble(): Promise<void>;
  /** Feed a move from the cube. Starts the timer on first move. */
  recordMove(move: string): void;
  /** Called by the cube when it reaches a solved state. Stops the timer. */
  markSolved(): void;
  /** Discard current state and return to idle. */
  reset(): void;
}

export function useSolverSession(): SolverSession {
  const [state, setState] = useState<SolverState>("idle");
  const [scramble, setScramble] = useState<string | null>(null);
  const [solution, setSolution] = useState<string[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastResult, setLastResult] = useState<SolveResult | null>(null);

  const stateRef = useRef<SolverState>("idle");
  const startedAtRef = useRef<number>(0);
  const scrambleRef = useRef<string | null>(null);
  const solutionRef = useRef<string[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Live timer tick while solving.
  useEffect(() => {
    if (state !== "solving") return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setElapsedMs(performance.now() - startedAtRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [state]);

  const newScramble = useCallback(async () => {
    const scrambleStr = await newScramble3x3();
    scrambleRef.current = scrambleStr;
    solutionRef.current = [];
    startedAtRef.current = 0;
    setScramble(scrambleStr);
    setSolution([]);
    setElapsedMs(0);
    setState("ready");
  }, []);

  const recordMove = useCallback((move: string) => {
    const current = stateRef.current;
    if (current !== "ready" && current !== "solving") return;
    solutionRef.current = [...solutionRef.current, move];
    setSolution(solutionRef.current);
    if (current === "ready") {
      startedAtRef.current = performance.now();
      setState("solving");
    }
  }, []);

  const markSolved = useCallback(() => {
    if (stateRef.current !== "solving") return;
    const finalMs = performance.now() - startedAtRef.current;
    setElapsedMs(finalMs);
    setLastResult({
      scramble: scrambleRef.current ?? "",
      solution: solutionRef.current,
      timeMs: Math.round(finalMs),
    });
    setState("done");
  }, []);

  const reset = useCallback(() => {
    scrambleRef.current = null;
    solutionRef.current = [];
    startedAtRef.current = 0;
    setScramble(null);
    setSolution([]);
    setElapsedMs(0);
    setLastResult(null);
    setState("idle");
  }, []);

  return {
    state,
    scramble,
    solution,
    elapsedMs,
    lastResult,
    newScramble,
    recordMove,
    markSolved,
    reset,
  };
}
