import { Vec2 } from "./Math";

export interface Ellipse {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color?: string;
  strokeWidth?: number;
  dash?: [number, number];
}

export interface Line {
  p1: Vec2;
  p2: Vec2;
  color?: string;
  strokeWidth?: number;
  dash?: [number, number];
}

export interface Arc {
  p1: Vec2;
  p2: Vec2;
  p3: Vec2;
  color?: string;
  strokeWidth?: number;
  dash?: [number, number];
}

export interface WorldView {
  panX: number;
  panY: number;
  rotateRad: number;
  zoom: number;
  width: number;
  height: number;
}
