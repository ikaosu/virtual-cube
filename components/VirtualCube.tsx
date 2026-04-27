"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { cstimerMoveToWca, wcaToCstimerMove, type CstimerMove } from "@/lib/cstimer-move";

export interface VirtualCubeHandle {
  /** Reset cube to solved, then apply the given scramble instantly. */
  applyScramble(scramble: string): void;
  /** Reset cube to solved state. */
  reset(): void;
  /** Apply a single move (WCA notation). Triggers onMove + onSolved as if from a keypress. */
  executeMove(wca: string): void;
}

interface VirtualCubeProps {
  /** Fired for each user-initiated move during the solve, in WCA notation ("R", "U'", "R2", etc.). */
  onMove?: (move: string) => void;
  /** Fired when the cube reaches a solved state (orientation-invariant) after a user move. */
  onSolved?: () => void;
  className?: string;
}

const SCRIPTS = [
  "/cstimer/jquery-1.8.0.js",
  "/cstimer/threemin.js",
  "/cstimer/pnltri.js",
  "/cstimer/utillib.js",
  "/cstimer/isaac.js",
  "/cstimer/mathlib.js",
  "/cstimer/cubeutil.js",
  "/cstimer/kernel-stub.js",
  "/cstimer/twisty.js",
  "/cstimer/twistynnn.js",
];

let scriptsLoadedPromise: Promise<void> | null = null;

function loadCstimerScripts(): Promise<void> {
  if (scriptsLoadedPromise) return scriptsLoadedPromise;
  scriptsLoadedPromise = (async () => {
    for (const src of SCRIPTS) {
      if (document.querySelector(`script[data-cstimer="${src}"]`)) continue;
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.dataset.cstimer = src;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error(`Failed to load cstimer script: ${src}`));
        document.head.appendChild(script);
      });
    }
  })();
  return scriptsLoadedPromise;
}

interface CstimerTwisty {
  parseScramble(s: string): unknown[];
  getFacelet(): string;
}

interface CstimerScene {
  initializeTwisty(opts: {
    type: string;
    dimension: number;
    allowDragging?: boolean;
  }): void;
  getDomElement(): HTMLElement;
  getTwisty(): CstimerTwisty;
  applyMoves(moves: unknown[]): void;
  addMoves(moves: unknown[]): void;
  addMoveListener(
    fn: (move: unknown, step: number, ts: number) => void
  ): void;
  keydown(e: {
    keyCode: number;
    altKey: boolean;
    ctrlKey: boolean;
    preventDefault: () => void;
  }): void;
  resize(): void;
}

/** Returns true iff every face of the 54-char facelet string is monochrome. */
function isFaceletSolved(facelet: string): boolean {
  if (facelet.length !== 54) return false;
  for (let f = 0; f < 6; f++) {
    const start = f * 9;
    const c = facelet[start];
    for (let i = 1; i < 9; i++) {
      if (facelet[start + i] !== c) return false;
    }
  }
  return true;
}

const VirtualCube = forwardRef<VirtualCubeHandle, VirtualCubeProps>(
  function VirtualCube({ onMove, onSolved, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<CstimerScene | null>(null);
    const onMoveRef = useRef(onMove);
    const onSolvedRef = useRef(onSolved);
    // Suppress onMove/onSolved while we're applying a scramble programmatically.
    const suppressRef = useRef(false);
    // Avoid firing onSolved repeatedly: require an unsolved state in between.
    const wasSolvedRef = useRef(true);
    // If applyScramble is called before the cstimer scene finishes loading,
    // queue the scramble here and apply it once the scene is ready.
    const pendingScrambleRef = useRef<string | null>(null);

    useEffect(() => {
      onMoveRef.current = onMove;
    }, [onMove]);
    useEffect(() => {
      onSolvedRef.current = onSolved;
    }, [onSolved]);

    useEffect(() => {
      let cancelled = false;
      let onKey: ((e: KeyboardEvent) => void) | null = null;
      let resizeObserver: ResizeObserver | null = null;

      (async () => {
        try {
          await loadCstimerScripts();
        } catch (err) {
          console.error("[VirtualCube] script load failed", err);
          return;
        }
        if (cancelled || !containerRef.current) return;

        const w = window as unknown as {
          twistyjs?: { TwistyScene: new () => CstimerScene };
        };
        if (!w.twistyjs) {
          console.error("[VirtualCube] window.twistyjs is undefined after script load");
          return;
        }

        const scene = new w.twistyjs.TwistyScene();
        scene.initializeTwisty({
          type: "cube",
          dimension: 3,
          allowDragging: false,
        });
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(scene.getDomElement());
        scene.resize();

        scene.addMoveListener((move, step) => {
          // Step 0 = move queued, step 1 = animation start, step 2 = move
          // applied. We need step 2 for both onMove and solve detection
          // because the cube's internal state isn't updated until then —
          // reading getFacelet() at step 0 returns the previous state.
          if (step !== 2) return;
          if (suppressRef.current) return;
          try {
            const moveStr = cstimerMoveToWca(move as CstimerMove);
            onMoveRef.current?.(moveStr);
          } catch (err) {
            console.error("[VirtualCube] move conversion failed", err, move);
          }
          try {
            const twisty = scene.getTwisty();
            const facelet = twisty.getFacelet();
            const solvedNow = isFaceletSolved(facelet);
            if (solvedNow && !wasSolvedRef.current) {
              wasSolvedRef.current = true;
              onSolvedRef.current?.();
            } else if (!solvedNow) {
              wasSolvedRef.current = false;
            }
          } catch (err) {
            console.error("[VirtualCube] solve detection failed", err);
          }
        });

        onKey = (e: KeyboardEvent) => {
          const target = e.target as HTMLElement | null;
          if (
            target &&
            (target.tagName === "INPUT" ||
              target.tagName === "TEXTAREA" ||
              target.isContentEditable)
          ) {
            return;
          }
          try {
            scene.keydown({
              keyCode: e.keyCode,
              altKey: e.altKey,
              ctrlKey: e.ctrlKey,
              preventDefault: () => e.preventDefault(),
            });
          } catch (err) {
            console.error("[VirtualCube] keydown handler failed", err);
          }
        };
        window.addEventListener("keydown", onKey);

        resizeObserver = new ResizeObserver(() => {
          try {
            scene.resize();
          } catch {
            /* ignore transient resize errors */
          }
        });
        resizeObserver.observe(containerRef.current);

        sceneRef.current = scene;

        // If a scramble was requested before the scene was ready, apply it now.
        if (pendingScrambleRef.current !== null) {
          const queued = pendingScrambleRef.current;
          pendingScrambleRef.current = null;
          applyScrambleToScene(scene, queued);
        }
      })();

      return () => {
        cancelled = true;
        if (onKey) window.removeEventListener("keydown", onKey);
        resizeObserver?.disconnect();
      };
    }, []);

    function applyScrambleToScene(scene: CstimerScene, scramble: string) {
      suppressRef.current = true;
      try {
        scene.initializeTwisty({
          type: "cube",
          dimension: 3,
          allowDragging: false,
        });
        scene.resize();
        const trimmed = scramble.trim();
        if (trimmed.length > 0) {
          const moves = scene.getTwisty().parseScramble(trimmed);
          scene.applyMoves(moves);
        }
        try {
          wasSolvedRef.current = isFaceletSolved(scene.getTwisty().getFacelet());
        } catch {
          wasSolvedRef.current = false;
        }
      } catch (err) {
        console.error("[VirtualCube] applyScramble failed", err);
      } finally {
        suppressRef.current = false;
      }
    }

    useImperativeHandle(
      ref,
      () => ({
        applyScramble(scramble: string) {
          const scene = sceneRef.current;
          if (!scene) {
            // Scene not initialised yet; remember the request and apply it
            // once the scripts finish loading.
            pendingScrambleRef.current = scramble;
            return;
          }
          applyScrambleToScene(scene, scramble);
        },
        reset() {
          const scene = sceneRef.current;
          if (!scene) {
            pendingScrambleRef.current = "";
            return;
          }
          suppressRef.current = true;
          try {
            scene.initializeTwisty({
              type: "cube",
              dimension: 3,
              allowDragging: false,
            });
            scene.resize();
            wasSolvedRef.current = true;
          } catch (err) {
            console.error("[VirtualCube] reset failed", err);
          } finally {
            suppressRef.current = false;
          }
        },
        executeMove(wca: string) {
          const scene = sceneRef.current;
          if (!scene) return;
          const internal = wcaToCstimerMove(wca);
          if (!internal) {
            console.warn("[VirtualCube] unknown move", wca);
            return;
          }
          try {
            scene.addMoves([internal]);
          } catch (err) {
            console.error("[VirtualCube] executeMove failed", err);
          }
        },
      }),
      []
    );

    return (
      <div
        ref={containerRef}
        className={className ?? "w-full aspect-square max-w-[400px]"}
      />
    );
  }
);

export default VirtualCube;
