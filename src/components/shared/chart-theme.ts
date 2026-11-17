import type { CSSProperties } from "react";

export const chartColors = {
  primary: "#4f46e5",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  muted: "#64748b",
  grid: "#e2e8f0",
};

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 12, fill: chartColors.muted },
} as const;

export const tooltipStyle: CSSProperties = {
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgb(15 23 42 / 0.12)",
  fontSize: 12,
};
