"use client";

import { useState, useRef, useEffect } from "react";

export interface PanelResizeState {
  leftWidth: number;
  outputHeight: number;
  setOutputHeight: (h: number) => void;
  isDragging: false | "h" | "v";
  startDragH: (e: React.MouseEvent) => void;
  startDragV: (e: React.MouseEvent) => void;
  startDragHTouch: (e: React.TouchEvent) => void;
  startDragVTouch: (e: React.TouchEvent) => void;
}

export function usePanelResize(): PanelResizeState {
  const [leftWidth, setLeftWidth] = useState(320);
  const [outputHeight, setOutputHeight] = useState(240);
  const [isDragging, setIsDragging] = useState<false | "h" | "v">(false);

  const dragState = useRef<{ type: "h" | "v"; startX: number; startY: number; startValue: number } | null>(null);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- intentional hydration */
    const w = Number(localStorage.getItem("it-leftWidth"));
    const h = Number(localStorage.getItem("it-outputHeight"));
    if (w) setLeftWidth(w);
    if (h) setOutputHeight(h);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem("it-leftWidth", String(leftWidth)); }, [leftWidth]);
  useEffect(() => { localStorage.setItem("it-outputHeight", String(outputHeight)); }, [outputHeight]);

  useEffect(() => {
    function applyMove(clientX: number, clientY: number) {
      const ds = dragState.current;
      if (!ds) return;
      if (ds.type === "h") {
        // Leave at least 300px for the right panel (editor + output)
        setLeftWidth(Math.max(200, Math.min(window.innerWidth - 300, ds.startValue + (clientX - ds.startX))));
      } else {
        // Leave at least 150px for the code editor above; allow output to shrink to just the tab bar (~40px)
        setOutputHeight(Math.max(40, Math.min(window.innerHeight - 150, ds.startValue + (ds.startY - clientY))));
      }
    }
    function onMouseMove(e: MouseEvent) {
      applyMove(e.clientX, e.clientY);
    }
    function onMouseUp() {
      if (dragState.current) { dragState.current = null; setIsDragging(false); }
    }
    function onTouchMove(e: TouchEvent) {
      if (dragState.current && e.cancelable) e.preventDefault();
      if (e.touches.length) applyMove(e.touches[0].clientX, e.touches[0].clientY);
    }
    function onTouchEnd() {
      if (dragState.current) { dragState.current = null; setIsDragging(false); }
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  function startDragH(e: React.MouseEvent) {
    e.preventDefault();
    dragState.current = { type: "h", startX: e.clientX, startY: 0, startValue: leftWidth };
    setIsDragging("h");
  }

  function startDragV(e: React.MouseEvent) {
    e.preventDefault();
    dragState.current = { type: "v", startX: 0, startY: e.clientY, startValue: outputHeight };
    setIsDragging("v");
  }

  function startDragHTouch(e: React.TouchEvent) {
    e.preventDefault();
    const t = e.touches[0];
    if (t) dragState.current = { type: "h", startX: t.clientX, startY: 0, startValue: leftWidth };
    setIsDragging("h");
  }

  function startDragVTouch(e: React.TouchEvent) {
    e.preventDefault();
    const t = e.touches[0];
    if (t) dragState.current = { type: "v", startX: 0, startY: t.clientY, startValue: outputHeight };
    setIsDragging("v");
  }

  return { leftWidth, outputHeight, setOutputHeight, isDragging, startDragH, startDragV, startDragHTouch, startDragVTouch };
}
