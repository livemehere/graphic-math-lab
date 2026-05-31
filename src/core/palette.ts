// Pastel dark palette
export const PALETTE = {
  bg: "#121212", // canvas background
  surface: "#4e4e4e", // borders, panels
  text: "#d6d6d6", // labels / titles
  textMuted: "#8f8f8f",

  // pastel accents
  pink: "#fca5a5",
  rose: "#f9a8d4",
  orange: "#fdba74",
  yellow: "#fde68a",
  green: "#86efac",
  teal: "#99f6e4",
  cyan: "#a5f3fc",
  blue: "#93c5fd",
  indigo: "#a5b4fc",
  purple: "#c4b5fd",
  slate: "#cbd5e1",
  slateDim: "#64748b",
} as const;

// Grid colors derived from palette
export const GRID = {
  minor: "rgba(203, 213, 225, 0.08)", // slate, very faint
  majorY: "rgba(134, 239, 172, 0.12)", // pastel green, faint
  majorX: "rgba(252, 165, 165, 0.12)", // pastel pink, faint
  axisY: "rgba(134, 239, 172, 0.45)", // base Y axis (green)
  axisX: "rgba(252, 165, 165, 0.45)", // base X axis (pink)
} as const;
