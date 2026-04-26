"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { cstimerMoveToWca, type CstimerMove } from "@/lib/cstimer-move";

export interface VirtualCubeHandle {
  /** Reset cube to solved, then apply the given scramble instantly. */
  applyScramble(scramble: string): void;
  /** Reset cube to solved state. */
  reset(): void;
}

interface VirtualCubeProps {
  /** Fired for each user-initiated move during the solve, in WCA notation ("R", "U'", "R2", etc.). */
  onMove?: (move: string) => void;
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

interface CstimerScene {
  initializeTwisty(opts: {
    type: string;
    dimension: number;
    allowDragging?: boolean;
  }): void;
  getDomElement(): HTMLElement;
  getTwisty(): {
    parseScramble(s: string): unknown[];
  };
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

const VirtualCube = forwardRef<VirtualCubeHandle, VirtualCubeProps>(
  function VirtualCube({ onMove, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<CstimerScene | null>(null);
    const onMoveRef = useRef(onMove);

    useEffect(() => {
      onMoveRef.current = onMove;
    }, [onMove]);

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
          if (step !== 0) return;
          try {
            const moveStr = cstimerMoveToWca(move as CstimerMove);
            onMoveRef.current?.(moveStr);
          } catch (err) {
            console.error("[VirtualCube] move conversion failed", err, move);
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
      })();

      return () => {
        cancelled = true;
        if (onKey) window.removeEventListener("keydown", onKey);
        resizeObserver?.disconnect();
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        applyScramble(scramble: string) {
          const scene = sceneRef.current;
          if (!scene) {
            console.warn("[VirtualCube] applyScramble called before scene ready");
            return;
          }
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
          } catch (err) {
            console.error("[VirtualCube] applyScramble failed", err);
          }
        },
        reset() {
          const scene = sceneRef.current;
          if (!scene) return;
          try {
            scene.initializeTwisty({
              type: "cube",
              dimension: 3,
              allowDragging: false,
            });
            scene.resize();
          } catch (err) {
            console.error("[VirtualCube] reset failed", err);
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
