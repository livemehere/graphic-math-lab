import { useEffect, useRef } from "react";
import { Vec2 } from "../Math";
import type { Arc, Ellipse, Line } from "../types";
import {
  applyRotate,
  applyZoom,
  createWorldView,
  setViewCenterAt,
} from "../view";
import {
  drawArcs,
  drawEllipses,
  drawGrid,
  drawLines,
  drawPoints,
} from "../draw";
import { PALETTE } from "../palette";

export interface Canvas2DProps {
  points?: Vec2[];
  lines?: Line[];
  ellipses?: Ellipse[];
  arcs?: Arc[];
  showGrid?: boolean;
  background?: string;
}

export default function Canvas2D({
  points = [],
  lines = [],
  ellipses = [],
  arcs = [],
  showGrid = true,
  background = PALETTE.bg,
}: Canvas2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const viewRef = useRef(createWorldView());
  const inputStatusRef = useRef<{ [key: string]: boolean }>({});
  const mouseStatusRef = useRef({
    isDown: false,
    x: 0,
    y: 0,
  });

  // Single render-on-demand function (latest closure stored in ref).
  const renderRef = useRef<() => void>(() => {});
  // Coalesce multiple requests in one frame.
  const renderScheduledRef = useRef(false);
  const requestRender = () => {
    if (renderScheduledRef.current) return;
    renderScheduledRef.current = true;
    requestAnimationFrame(() => {
      renderScheduledRef.current = false;
      renderRef.current();
    });
  };

  // Rotate loop: only runs while q/e is held.
  const rotateRafRef = useRef<number | null>(null);
  const startRotateLoop = () => {
    if (rotateRafRef.current != null) return;
    const tick = () => {
      const { q, e } = inputStatusRef.current;
      if (!q && !e) {
        rotateRafRef.current = null;
        return;
      }
      const { x, y } = mouseStatusRef.current;
      applyRotate(viewRef.current, 0.01 * (e ? -1 : 1), x, y);
      renderRef.current();
      rotateRafRef.current = requestAnimationFrame(tick);
    };
    rotateRafRef.current = requestAnimationFrame(tick);
  };

  // Setup canvas size + DPR + ResizeObserver (mount only)
  useEffect(() => {
    const container = containerRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const view = viewRef.current;

    let isFirst = true;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const dpr = window.devicePixelRatio || 1;

      view.width = width;
      view.height = height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (isFirst) {
        setViewCenterAt(view, 0, 0);
        isFirst = false;
      }
      requestRender();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => {
      ro.disconnect();
      if (rotateRafRef.current != null) {
        cancelAnimationFrame(rotateRafRef.current);
        rotateRafRef.current = null;
      }
    };
  }, []);

  // Update render closure & re-render whenever data/style changes.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const view = viewRef.current;

    renderRef.current = () => {
      ctx.clearRect(0, 0, view.width, view.height);

      if (background) {
        ctx.save();
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, view.width, view.height);
        ctx.restore();
      }

      if (showGrid) drawGrid(ctx, view);
      drawLines(ctx, view, lines);
      drawPoints(ctx, view, points);
      drawEllipses(ctx, view, ellipses);
      drawArcs(ctx, view, arcs);
    };

    requestRender();
  }, [points, lines, ellipses, arcs, showGrid, background]);

  const handleKeyDown = (ev: React.KeyboardEvent) => {
    const k = ev.key.toLowerCase();
    inputStatusRef.current[k] = true;
    if (k === "q" || k === "e") startRotateLoop();
  };
  const handleKeyUp = (ev: React.KeyboardEvent) => {
    inputStatusRef.current[ev.key.toLowerCase()] = false;
  };

  const handlePointerDown = (ev: React.PointerEvent) => {
    canvasRef.current!.setPointerCapture(ev.pointerId);
    canvasRef.current!.focus();
    const rect = ev.currentTarget.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

    mouseStatusRef.current.x = x;
    mouseStatusRef.current.y = y;

    if (ev.button === 1 || ev.button === 0) {
      mouseStatusRef.current.isDown = true;
    }
  };

  const handlePointerUp = (ev: React.PointerEvent) => {
    const rect = ev.currentTarget.getBoundingClientRect();
    mouseStatusRef.current.isDown = false;
    mouseStatusRef.current.x = ev.clientX - rect.left;
    mouseStatusRef.current.y = ev.clientY - rect.top;
  };

  const handlePointerMove = (ev: React.PointerEvent) => {
    const rect = ev.currentTarget.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const { isDown, x: prevX, y: prevY } = mouseStatusRef.current;

    mouseStatusRef.current.x = x;
    mouseStatusRef.current.y = y;

    if (!isDown) return;

    const dx = x - prevX;
    const dy = y - prevY;
    viewRef.current.panX += dx;
    viewRef.current.panY += dy;
    requestRender();
  };

  const handleWheel = (ev: React.WheelEvent) => {
    const rect = ev.currentTarget.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    mouseStatusRef.current.x = x;
    mouseStatusRef.current.y = y;
    applyZoom(viewRef.current, ev.deltaY < 0 ? 0.1 : -0.1, x, y);
    requestRender();
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        className="block cursor-grab outline-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      />
    </div>
  );
}
