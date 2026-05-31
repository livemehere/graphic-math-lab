import { Mat3, Vec2 } from "./Math";
import type { WorldView } from "./types";

export function createWorldView(): WorldView {
  return {
    panX: 0,
    panY: 0,
    rotateRad: 0,
    zoom: 1,
    width: 0,
    height: 0,
  };
}

export function getViewMat(view: WorldView): Mat3 {
  return new Mat3()
    .translate(view.panX, view.panY)
    .rotate(view.rotateRad)
    .scale(view.zoom, view.zoom);
}

export function screenToWorld(view: WorldView, sx: number, sy: number): Vec2 {
  return getViewMat(view).invert()!.mulVec2(new Vec2(sx, sy));
}

export function worldToScreen(view: WorldView, wx: number, wy: number): Vec2 {
  return getViewMat(view).mulVec2(new Vec2(wx, wy));
}

export function applyZoom(
  view: WorldView,
  amount: number,
  mouseX: number,
  mouseY: number,
) {
  const before = screenToWorld(view, mouseX, mouseY);
  view.zoom = Math.max(0.1, view.zoom + amount);
  const after = worldToScreen(view, before.x, before.y);
  view.panX += mouseX - after.x;
  view.panY += mouseY - after.y;
}

export function applyRotate(
  view: WorldView,
  amount: number,
  mouseX: number,
  mouseY: number,
) {
  const before = screenToWorld(view, mouseX, mouseY);
  view.rotateRad += amount;
  const after = worldToScreen(view, before.x, before.y);
  view.panX += mouseX - after.x;
  view.panY += mouseY - after.y;
}

export function setViewCenterAt(view: WorldView, wx: number, wy: number) {
  const target = worldToScreen(view, wx, wy);
  const cx = view.width / 2;
  const cy = view.height / 2;
  view.panX += cx - target.x;
  view.panY += cy - target.y;
}
