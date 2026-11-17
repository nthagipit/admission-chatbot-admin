import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard from "@/components/shared/ChartCard";
import { chartColors, tooltipStyle } from "@/components/shared/chart-theme";
import type { StatusCount } from "@/types/dashboard";
import type { DocumentStatus } from "@/types/document.type";

const META: Record<DocumentStatus, { label: string; color: string }> = {
  COMPLETED: { label: "Completed", color: chartColors.success },
  PROCESSING: { label: "Processing", color: chartColors.warning },
  FAILED: { label: "Failed", color: chartColors.danger },
};

export function DocumentStatusChart({ data }: { data?: StatusCount[] }) {
  const rows = data?.map((d) => {
    const meta = META[d.status] ?? {
      label: d.status || "Unknown",
      color: chartColors.warning,
    };
    return {
      ...d,
      label: meta.label,
      color: meta.color,
    };
  });
  return (
    <ChartCard
      title="Document processing status"
      description="All documents"
      loading={!rows}
    >
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={rows}
            dataKey="count"
            nameKey="label"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={2}
            stroke="none"
          >
            {rows?.map((row) => (
              <Cell key={row.status} fill={row.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-3 space-y-2">
        {rows?.map((row) => (
          <li
            key={row.status}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2 text-ink-muted">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: row.color }}
                aria-hidden
              />
              {row.label}
            </span>
            <span className="font-medium text-ink tabular-nums">
              {row.count}
            </span>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
