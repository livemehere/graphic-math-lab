import { useEffect, useRef } from "react";
import { Mat3, Vec2 } from "./core/Math";

interface WorldView {
  panX: number;
  panY: number;
  rotate: number;
  zoom: number;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<WorldView>({
    panX: 0,
    panY: 0,
    rotate: 0,
    zoom: 1,
  });

  const inputStatusRef = useRef<{
    [key:string]:boolean; // keyboard
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
    new Vec2(10, 10),
    new Vec2(100, 10),
    new Vec2(100, 100),
    new Vec2(10, 100),
  ]);

  const getViewMat = () => {
    const view = viewRef.current;
    return new Mat3()
      .translate(view.panX, view.panY)
      .rotate(view.rotate)
      .scale(view.zoom, view.zoom);
  };

  const screenToWorld = (x: number, y: number) => {
    return getViewMat().invert()!.mulVec2(new Vec2(x, y));
  };

  const worldToScreen = (x: number, y: number) => {
    return getViewMat().mulVec2(new Vec2(x, y));
  }
  const applyZoom = (mount:number, mouseX:number, mouseY:number)=>{
    const beforeWorldPos = screenToWorld(mouseX,mouseY);
    viewRef.current.zoom += mount;
    const afterScreenPos = worldToScreen(beforeWorldPos.x,beforeWorldPos.y);

    viewRef.current.panX += mouseX - afterScreenPos.x;
    viewRef.current.panY += mouseY - afterScreenPos.y;
  }

  const applyRotate = (mount:number, mouseX:number, mouseY:number)=>{
    const beforeWorldPos = screenToWorld(mouseX,mouseY);
    viewRef.current.rotate += mount;
    const afterScreenPos = worldToScreen(beforeWorldPos.x,beforeWorldPos.y);

    viewRef.current.panX += mouseX - afterScreenPos.x;
    viewRef.current.panY += mouseY - afterScreenPos.y;
  }

  useEffect(() => {
    const onKeyDown = (e:KeyboardEvent)=>{
      console.log(e.key)
      inputStatusRef.current[e.key] = true;
    }
    const onKeyUp = (e:KeyboardEvent)=>{
      inputStatusRef.current[e.key] = false;
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp) ;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const dpr = window.devicePixelRatio;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const stageWidth = width * dpr;
    const stageHeight = height * dpr;
    canvas.width = stageWidth;
    canvas.height = stageHeight;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    const points = pointsRef.current;

    ctx.scale(dpr, dpr);

    const draw = () => {
      const viewMat = getViewMat();
      const {q, e} = inputStatusRef.current;
      if(q||e){
        const {x,y} = mouseStatusRef.current;
        applyRotate(0.01 * (e ? -1 : 1), x, y);
      }

      ctx.clearRect(0, 0, stageWidth, stageHeight);

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
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseStatusRef.current.x = x;
    mouseStatusRef.current.y = y;

    // wheel button
    if (e.button === 1) {
      mouseStatusRef.current.isDown = true;
      canvasRef.current!.setPointerCapture(e.pointerId);
      return;
    }

    const worldVec2 = screenToWorld(x, y);

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

  const handleOnWheel = (e:React.WheelEvent)=> {
    const isUp = e.deltaY <0;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseStatusRef.current.x = x;
    mouseStatusRef.current.y = y;

    if(isUp){
      applyZoom(0.1,x,y);
    }else{
      applyZoom(-0.1,x,y);
    }
  }

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
