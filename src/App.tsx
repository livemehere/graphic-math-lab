import { useEffect, useRef } from "react";
import { Mat3, Vec2 } from "./core/Math";

interface WorldView {
  panX: number;
  panY: number;
  rotate: number;
  zoom: number;
  width: number;
  height: number;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<WorldView>({
    panX: 0,
    panY: 0,
    rotate: 0,
    zoom: 1,
    width: 0,
    height: 0,
  });

  const inputStatusRef = useRef<{
    [key: string]: boolean; // keyboard
  }>({});

  const mouseStatusRef = useRef<{
    isDown: boolean;
    x: number;
    y: number;
  }>({
    isDown: false,
    x: 0,
    y: 0,
  });

  const pointsRef = useRef<Vec2[]>([
    new Vec2(0, 0),
    new Vec2(100, 0),
    new Vec2(100, 100),
    new Vec2(0, 100),
  ]);

  const getViewMat = () => {
    const view = viewRef.current;
    return new Mat3()
      .translate(view.panX, view.panY)
      .rotate(view.rotate)
      .scale(view.zoom, view.zoom);
  };

  const screenToWorldPoint = (screenX: number, screenY: number) => {
    return getViewMat().invert()!.mulVec2(new Vec2(screenX, screenY));
  };

  const worldToScreenPoint = (worldX: number, worldY: number) => {
    return getViewMat().mulVec2(new Vec2(worldX, worldY));
  };
  const applyZoom = (mount: number, mouseX: number, mouseY: number) => {
    const beforeWorldPos = screenToWorldPoint(mouseX, mouseY);
    viewRef.current.zoom = Math.max(0.1, viewRef.current.zoom + mount);
    const afterScreenPos = worldToScreenPoint(
      beforeWorldPos.x,
      beforeWorldPos.y,
    );

    viewRef.current.panX += mouseX - afterScreenPos.x;
    viewRef.current.panY += mouseY - afterScreenPos.y;
  };

  const applyRotate = (mount: number, mouseX: number, mouseY: number) => {
    const beforeWorldPos = screenToWorldPoint(mouseX, mouseY);
    viewRef.current.rotate += mount;
    const afterScreenPos = worldToScreenPoint(
      beforeWorldPos.x,
      beforeWorldPos.y,
    );

    viewRef.current.panX += mouseX - afterScreenPos.x;
    viewRef.current.panY += mouseY - afterScreenPos.y;
  };

  const setViewCenterAt = (worldX: number, worldY: number) => {
    const targetScreenPos = worldToScreenPoint(worldX, worldY);
    const centerScreenPos = new Vec2(
      viewRef.current.width / 2,
      viewRef.current.height / 2,
    );
    viewRef.current.panX += centerScreenPos.x - targetScreenPos.x;
    viewRef.current.panY += centerScreenPos.y - targetScreenPos.y;
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = viewRef.current;
    const viewMat = getViewMat();
    const invertMat = viewMat.invert()!;
    const GAP = 100;
    const MAJOR_STEP = 5;

    const worldCorners = [
      invertMat.mulVec2(new Vec2(0, 0)),
      invertMat.mulVec2(new Vec2(width, 0)),
      invertMat.mulVec2(new Vec2(width, height)),
      invertMat.mulVec2(new Vec2(0, height)),
    ];

    const worldMinX = Math.min(...worldCorners.map((p) => p.x));
    const worldMaxX = Math.max(...worldCorners.map((p) => p.x));
    const worldMinY = Math.min(...worldCorners.map((p) => p.y));
    const worldMaxY = Math.max(...worldCorners.map((p) => p.y));

    const startX = Math.floor(worldMinX / GAP) * GAP;
    const endX = Math.ceil(worldMaxX / GAP) * GAP;
    const startY = Math.floor(worldMinY / GAP) * GAP;
    const endY = Math.ceil(worldMaxY / GAP) * GAP;

    ctx.save();

    // MINOR
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255, 0.1)";
    ctx.setLineDash([5, 5]);
    for (let x = startX; x < endX; x += GAP) {
      if (x === 0 || x % (GAP * MAJOR_STEP) === 0) continue;
      const p1 = viewMat.mulVec2(new Vec2(x, startY));
      const p2 = viewMat.mulVec2(new Vec2(x, endY));
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }

    for (let y = startY; y < endY; y += GAP) {
      if (y === 0 || y % (GAP * MAJOR_STEP) === 0) continue;
      const p1 = viewMat.mulVec2(new Vec2(startX, y));
      const p2 = viewMat.mulVec2(new Vec2(endX, y));
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();

    // MAJOR
    // Y-axis
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(100, 255, 100,0.1)";
    for (let x = startX; x < endX; x += GAP) {
      if (x !== 0 && x % (GAP * MAJOR_STEP) !== 0) continue;
      const p1 = viewMat.mulVec2(new Vec2(x, startY));
      const p2 = viewMat.mulVec2(new Vec2(x, endY));
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 100, 100,0.1)";
    for (let y = startY; y < endY; y += GAP) {
      if (y !== 0 && y % (GAP * MAJOR_STEP) !== 0) continue;
      const p1 = viewMat.mulVec2(new Vec2(startX, y));
      const p2 = viewMat.mulVec2(new Vec2(endX, y));
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();

    // Base Y-Axis
    ctx.beginPath();
    ctx.strokeStyle = "rgba(100, 255, 100,0.5)";
    const p1 = viewMat.mulVec2(new Vec2(0, startY));
    const p2 = viewMat.mulVec2(new Vec2(0, endY));
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Base X-axis
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 100, 100,0.5)";
    const p3 = viewMat.mulVec2(new Vec2(startX, 0));
    const p4 = viewMat.mulVec2(new Vec2(endX, 0));
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.stroke();

    ctx.restore();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      inputStatusRef.current[e.key] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      inputStatusRef.current[e.key] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const dpr = window.devicePixelRatio;
    const width = window.innerWidth;
    const height = window.innerHeight;

    viewRef.current.width = width;
    viewRef.current.height = height;

    const stageWidth = width * dpr;
    const stageHeight = height * dpr;
    canvas.width = stageWidth;
    canvas.height = stageHeight;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    const points = pointsRef.current;

    ctx.scale(dpr, dpr);

    setViewCenterAt(0, 0);

    const draw = () => {
      const viewMat = getViewMat();
      const { q, e } = inputStatusRef.current;
      if (q || e) {
        const { x, y } = mouseStatusRef.current;
        applyRotate(0.01 * (e ? -1 : 1), x, y);
      }

      ctx.clearRect(0, 0, width, height);

      drawGrid(ctx);

      ctx.save();
      ctx.fillStyle = "tomato";
      ctx.lineWidth = 1;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const vp = viewMat.mulVec2(p);
        const worldScale = viewRef.current.zoom;

        ctx.beginPath();
        ctx.arc(vp.x, vp.y, 3 * worldScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        const padding = 8;
        ctx.fillText(
          `(${+p.x.toFixed(1)}, ${+p.y.toFixed(1)})`,
          vp.x + padding,
          vp.y - padding,
        );
      }
      ctx.restore();

      requestAnimationFrame(draw);
    };

    draw();
  }, []);

  const addPoint = (x: number, y: number) => {
    const p = new Vec2(x, y);
    pointsRef.current.push(p);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    canvasRef.current!.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseStatusRef.current.x = x;
    mouseStatusRef.current.y = y;

    // wheel button
    if (e.button === 1) {
      mouseStatusRef.current.isDown = true;
      return;
    }

    const worldVec2 = screenToWorldPoint(x, y);

    // create point
    addPoint(worldVec2.x, worldVec2.y);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseStatusRef.current.isDown = false;
    mouseStatusRef.current.x = e.clientX - rect.left;
    mouseStatusRef.current.y = e.clientY - rect.top;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { isDown, x: prevX, y: prevY } = mouseStatusRef.current;

    mouseStatusRef.current.x = x;
    mouseStatusRef.current.y = y;

    if (!isDown) return;

    const dx = x - prevX;
    const dy = y - prevY;

    viewRef.current.panX += dx;
    viewRef.current.panY += dy;
  };

  const handleOnWheel = (e: React.WheelEvent) => {
    const isUp = e.deltaY < 0;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseStatusRef.current.x = x;
    mouseStatusRef.current.y = y;

    if (isUp) {
      applyZoom(0.1, x, y);
    } else {
      applyZoom(-0.1, x, y);
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 99,
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onWheel={handleOnWheel}
      ></canvas>
    </div>
  );
}
