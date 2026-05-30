import { useEffect, useRef } from "react";
import { Mat3, Vec2 } from "./core/Math";

export default function App() {
  const canvsRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef({
    panX: 5,
    panY: 20,
    rotate: 0,
    zoom: 1,
  });

  useEffect(() => {
    const canvas = canvsRef.current!;
    const ctx = canvas.getContext("2d")!;

    const view = viewRef.current;

    const stageWidth = window.innerWidth;
    const stageHeight = window.innerHeight;
    canvas.width = stageWidth;
    canvas.height = stageHeight;

    const viewMat = new Mat3()
      .translate(view.panX, view.panY)
      .rotate(view.rotate)
      .scale(view.zoom, view.zoom);

    const points: Vec2[] = [
      new Vec2(10, 10),
      new Vec2(100, 10),
      new Vec2(100, 100),
      new Vec2(10, 100),
    ];

    const draw = () => {
      ctx.clearRect(0, 0, stageWidth, stageHeight);

      ctx.save();
      ctx.fillStyle = "tomato";
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const vp = viewMat.mulVec2(p);
        ctx.beginPath();
        if (i === 0) {
          ctx.moveTo(vp.x, vp.y);
        } else {
          ctx.lineTo(vp.x, vp.y);
        }

        ctx.arc(vp.x, vp.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      requestAnimationFrame(draw);
    };

    draw();
  }, []);

  return (
    <div>
      <canvas
        ref={canvsRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 99,
        }}
      ></canvas>
    </div>
  );
}
