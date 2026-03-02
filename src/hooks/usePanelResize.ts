"use client";

import { useState, useRef, useEffect } from "react";

export interface PanelResizeState {
  leftWidth: number;
  outputHeight: number;
  isDragging: false | "h" | "v";
  startDragH: (e: React.MouseEvent) => void;
  startDragV: (e: React.MouseEvent) => void;
}

export function usePanelResize(): PanelResizeState {
  const [leftWidth, setLeftWidth] = useState(320);
  const [outputHeight, setOutputHeight] = useState(176);
  const [isDragging, setIsDragging] = useState<false | "h" | "v">(false);

  const dragState = useRef<{ type: "h" | "v"; startX: number; startY: number; startValue: number } | null>(null);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const w = Number(localStorage.getItem("it-leftWidth"));
    const h = Number(localStorage.getItem("it-outputHeight"));
    if (w) setLeftWidth(w);
    if (h) setOutputHeight(h);
  }, []);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem("it-leftWidth", String(leftWidth)); }, [leftWidth]);
  useEffect(() => { localStorage.setItem("it-outputHeight", String(outputHeight)); }, [outputHeight]);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const ds = dragState.current;
      if (!ds) return;
      if (ds.type === "h") {
        setLeftWidth(Math.max(200, Math.min(620, ds.startValue + (e.clientX - ds.startX))));
      } else {
        setOutputHeight(Math.max(60, Math.min(520, ds.startValue + (ds.startY - e.clientY))));
      }
    }
    function onMouseUp() {
      if (dragState.current) { dragState.current = null; setIsDragging(false); }
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
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

  return { leftWidth, outputHeight, isDragging, startDragH, startDragV };
}
