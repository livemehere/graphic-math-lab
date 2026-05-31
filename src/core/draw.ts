import { toDeg, Vec2 } from "./Math";
import type { Arc, Ellipse, Line, WorldView } from "./types";
import { getViewMat } from "./view";
import { GRID, PALETTE } from "./palette";

export function drawGrid(ctx: CanvasRenderingContext2D, view: WorldView) {
  const { width, height } = view;
  const viewMat = getViewMat(view);
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
  ctx.strokeStyle = GRID.minor;
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

  // MAJOR Y-axis lines
  ctx.beginPath();
  ctx.setLineDash([]);
  ctx.strokeStyle = GRID.majorY;
  for (let x = startX; x < endX; x += GAP) {
    if (x !== 0 && x % (GAP * MAJOR_STEP) !== 0) continue;
    const p1 = viewMat.mulVec2(new Vec2(x, startY));
    const p2 = viewMat.mulVec2(new Vec2(x, endY));
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
  }
  ctx.stroke();

  // MAJOR X-axis lines
  ctx.beginPath();
  ctx.strokeStyle = GRID.majorX;
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
  ctx.strokeStyle = GRID.axisY;
  const ya = viewMat.mulVec2(new Vec2(0, startY));
  const yb = viewMat.mulVec2(new Vec2(0, endY));
  ctx.moveTo(ya.x, ya.y);
  ctx.lineTo(yb.x, yb.y);
  ctx.stroke();

  // Base X-axis
  ctx.beginPath();
  ctx.strokeStyle = GRID.axisX;
  const xa = viewMat.mulVec2(new Vec2(startX, 0));
  const xb = viewMat.mulVec2(new Vec2(endX, 0));
  ctx.moveTo(xa.x, xa.y);
  ctx.lineTo(xb.x, xb.y);
  ctx.stroke();

  ctx.restore();
}

export function drawPoints(
  ctx: CanvasRenderingContext2D,
  view: WorldView,
  points: Vec2[],
) {
  const viewMat = getViewMat(view);

  ctx.save();
  ctx.lineWidth = 1;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const vp = viewMat.mulVec2(p);

    ctx.beginPath();
    ctx.fillStyle = PALETTE.pink;
    ctx.arc(vp.x, vp.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    const padding = 8;
    ctx.fillStyle = PALETTE.textMuted;
    ctx.fillText(
      `(${+p.x.toFixed(1)}, ${+p.y.toFixed(1)})`,
      vp.x + padding,
      vp.y - padding,
    );
  }
  ctx.restore();
}

export function drawEllipses(
  ctx: CanvasRenderingContext2D,
  view: WorldView,
  ellipses: Ellipse[],
) {
  const { rotateRad, zoom } = view;
  const viewMat = getViewMat(view);

  ctx.save();
  for (let i = 0; i < ellipses.length; i++) {
    const ellipse = ellipses[i];
    const vp = viewMat.mulVec2(new Vec2(ellipse.cx, ellipse.cy));

    ctx.strokeStyle = ellipse.color ?? PALETTE.pink;
    ctx.lineWidth = ellipse.strokeWidth ?? 1;
    ctx.setLineDash(ellipse.dash ?? []);
    ctx.beginPath();
    ctx.ellipse(
      vp.x,
      vp.y,
      ellipse.rx * zoom,
      ellipse.ry * zoom,
      -rotateRad,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.closePath();
  }
  ctx.restore();
}

export function drawLines(
  ctx: CanvasRenderingContext2D,
  view: WorldView,
  lines: Line[],
) {
  const viewMat = getViewMat(view);

  ctx.save();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const p1 = viewMat.mulVec2(line.p1);
    const p2 = viewMat.mulVec2(line.p2);

    ctx.strokeStyle = line.color ?? PALETTE.pink;
    ctx.lineWidth = line.strokeWidth ?? 1;
    ctx.setLineDash(line.dash ?? []);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.closePath();
  }
  ctx.restore();
}

export function drawArcs(
  ctx: CanvasRenderingContext2D,
  view: WorldView,
  arcs: Arc[],
) {
  const viewMat = getViewMat(view);

  ctx.save();
  for (let i = 0; i < arcs.length; i++) {
    const arc = arcs[i];
    const p1 = viewMat.mulVec2(arc.p1);
    const p2 = viewMat.mulVec2(arc.p2);
    const p3 = viewMat.mulVec2(arc.p3);

    const r = Math.hypot(p1.x - p2.x, p1.y - p2.y) * 0.3;
    const startAngle = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    const endAngle = Math.atan2(p3.y - p2.y, p3.x - p2.x);

    ctx.strokeStyle = arc.color ?? PALETTE.yellow;
    ctx.lineWidth = arc.strokeWidth ?? 1;
    ctx.setLineDash(arc.dash ?? []);
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, r, startAngle, endAngle);
    ctx.stroke();
    ctx.closePath();

    const angleDiff = endAngle - startAngle;
    const sweep = Math.atan2(
      Math.sin(endAngle - startAngle),
      Math.cos(endAngle - startAngle),
    );
    const midAngle = startAngle + sweep / 2;

    ctx.beginPath();
    ctx.fillStyle = arc.color ?? PALETTE.yellow;
    ctx.fillText(
      `${+toDeg(angleDiff).toFixed(1)}°`,
      p2.x + Math.cos(midAngle) * (r + 5),
      p2.y + Math.sin(midAngle) * (r + 5),
    );
  }
  ctx.restore();
}
