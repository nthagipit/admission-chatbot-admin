import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  MessagesSquare,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import DocumentStatusChart from "../components/DocumentStatusChart";
import RecentActivities from "../components/RecentActivities";
import RecentDocuments from "../components/RecentDocuments";
import StatCard from "../components/StartCard";
import ConversationsChart from "../components/ConversationChart";
import SystemActivityChart from "../components/SystemActivityChart";

import Card from "@/components/ui/Card/Card";
import ErrorState from "@/components/ui/ErrorState/ErrorState";
import { dashboardApi, mapDashboardData } from "@/apis/dashboard.api";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function Dashboard() {
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => dashboardApi.getDashboardByDays(),
    staleTime: 1000 * 60 * 1, // Cache fresh trong 1 phút
    retry: 1,
  });

  if (isError) {
    return (
      <Card>
        <ErrorState
          message={
            (error as Error)?.message ?? "Không thể tải dữ liệu dashboard."
          }
          onRetry={() => refetch()}
        />
      </Card>
    );
  }

  const data = dashboardData
    ? mapDashboardData(dashboardData.data.data)
    : undefined;
  const s = data?.stats;

  return (
    <div className="space-y-6">
      {/* ── 6 thẻ thống kê ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Total Documents"
          value={isLoading ? undefined : s?.totalDocuments}
          icon={FileText}
          tone="primary"
        />
        <StatCard
          label="Completed Documents"
          value={isLoading ? undefined : s?.completedDocuments}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Processing Documents"
          value={isLoading ? undefined : s?.processingDocuments}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Failed Documents"
          value={isLoading ? undefined : s?.failedDocuments}
          icon={AlertTriangle}
          tone="danger"
        />
        <StatCard
          label="Total Users"
          value={isLoading ? undefined : s?.totalUsers}
          icon={Users}
          tone="neutral"
        />
        <StatCard
          label="Total Conversations"
          value={isLoading ? undefined : s?.totalConversations}
          icon={MessagesSquare}
          tone="primary"
        />
      </div>

      {/* ── Biểu đồ ── */}
      {isLoading ? (
        <div className="grid gap-6 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <TableSkeleton rows={4} cols={1} />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <ConversationsChart data={data?.conversationsByDay} />
          <DocumentStatusChart data={data?.documentStatus} />
          <SystemActivityChart data={data?.systemActivity} />
          <RecentActivities items={data?.recentActivities} />
        </div>
      )}

      {/* ── Tài liệu gần đây ── */}
      <RecentDocuments items={isLoading ? undefined : data?.recentDocuments} />
    </div>
  );
}
