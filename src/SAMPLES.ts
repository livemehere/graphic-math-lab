import { toRad, Vec2 } from "./core/Math";
import { PALETTE } from "./core/palette";
import type { Arc, Ellipse, Line } from "./core/types";

export interface Sample {
  title: string;
  points?: Vec2[];
  lines?: Line[];
  ellipses?: Ellipse[];
  arcs?: Arc[];
}

const p45 = new Vec2(Math.cos(toRad(45)) * 100, Math.sin(toRad(45)) * 100);

// 외접 타원 위의 점 (rx=120, ry=80) — 각도로 파라미터화해야 정확히 타원 위에 위치
const ERX = 120;
const ERY = 80;
const onEllipse = (deg: number) =>
  new Vec2(Math.cos(toRad(deg)) * ERX, Math.sin(toRad(deg)) * ERY);
const triA = onEllipse(200);
const triB = onEllipse(340);
const triC = onEllipse(80);

export const SAMPLES: Sample[] = [
  {
    title: "원 + 반지름 + 각도",
    points: [new Vec2(0, 0), p45],
    lines: [
      { p1: new Vec2(0, 0), p2: p45, color: PALETTE.orange },
      {
        p1: new Vec2(0, 0),
        p2: new Vec2(100, 0),
        color: PALETTE.slateDim,
        dash: [4, 4],
      },
    ],
    ellipses: [{ cx: 0, cy: 0, rx: 100, ry: 100, color: PALETTE.slate }],
    arcs: [
      {
        p1: new Vec2(100, 0),
        p2: new Vec2(0, 0),
        p3: p45,
        color: PALETTE.yellow,
      },
    ],
  },
  {
    title: "삼각형 + 외접 타원",
    points: [triA, triB, triC],
    lines: [
      { p1: triA, p2: triB, color: PALETTE.cyan },
      { p1: triB, p2: triC, color: PALETTE.cyan },
      { p1: triC, p2: triA, color: PALETTE.cyan },
    ],
    ellipses: [
      {
        cx: 0,
        cy: 0,
        rx: ERX,
        ry: ERY,
        color: PALETTE.purple,
        dash: [6, 4],
      },
    ],
    arcs: [{ p1: triB, p2: triA, p3: triC, color: PALETTE.yellow }],
  },
];
