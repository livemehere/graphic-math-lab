import Canvas2D from "./core/component/Canvas2D";
import { SAMPLES } from "./SAMPLES";

export default function App() {
  return (
    <div className="grid min-h-screen grid-cols-2 auto-rows-[500px] gap-2 bg-neutral-950 p-2">
      {SAMPLES.map((s, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded border border-neutral-800"
        >
          <div className="pointer-events-none absolute top-1.5 left-2 z-10 text-xs text-slate-300">
            {s.title}
          </div>
          <Canvas2D
            points={s.points}
            lines={s.lines}
            ellipses={s.ellipses}
            arcs={s.arcs}
          />
        </div>
      ))}
    </div>
  );
}
