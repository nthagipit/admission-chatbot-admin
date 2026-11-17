import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
import type { DailyCount } from "@/types/dashboard";
import { formatShortDate } from "@/utils/format";

export function ConversationsChart({ data }: { data?: DailyCount[] }) {
  const rows = useMemo(
    () =>
      data?.map((d) => ({ label: formatShortDate(d.date), count: d.count })),
    [data],
  );
  return (
    <ChartCard
      title="Conversations by day"
      description="Last 14 days"
      loading={!rows}
      className="xl:col-span-2"
    >
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={rows}
          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis allowDecimals={false} {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="count"
            name="Conversations"
            stroke={chartColors.primary}
            strokeWidth={2}
            fill={chartColors.primary}
            fillOpacity={0.1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
