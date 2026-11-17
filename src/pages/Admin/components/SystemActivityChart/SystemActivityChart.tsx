import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "@/components/shared/ChartCard";
import {
  axisProps,
  chartColors,
  tooltipStyle,
} from "@/components/shared/chart-theme";
import type { DailyActivity } from "@/types/dashboard";
import { formatShortDate } from "@/utils/format";

export function SystemActivityChart({ data }: { data?: DailyActivity[] }) {
  const rows = useMemo(
    () => data?.map((d) => ({ ...d, label: formatShortDate(d.date) })),
    [data],
  );
  return (
    <ChartCard
      title="System activity"
      description="Questions asked and documents uploaded, last 14 days"
      loading={!rows}
      className="xl:col-span-2"
    >
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={rows}
          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis allowDecimals={false} {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="queries"
            name="Questions"
            stroke={chartColors.primary}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="uploads"
            name="Uploads"
            stroke={chartColors.warning}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
