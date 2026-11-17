import type {
  ActivityType,
  DashboardData,
  DashboardDataResponse,
} from "@/types/dashboard";
import type { SuccessResponse } from "@/types/utils.type";
import http from "@/utils/http";
import type { DocumentStatus, FileType } from "@/types/document.type";

export function mapDashboardData(raw: DashboardDataResponse): DashboardData {
  return {
    stats: {
      totalDocuments: raw.stats.total_documents,
      completedDocuments: raw.stats.completed_documents,
      processingDocuments: raw.stats.processing_documents,
      failedDocuments: raw.stats.failed_documents,
      totalUsers: raw.stats.total_users,
      totalConversations: raw.stats.total_conversations,
    },

    conversationsByDay: raw.conversations_by_day.map((item) => ({
      date: item.date,
      count: item.count,
    })),

    documentStatus: raw.document_status.map((item) => ({
      status: item.status as DocumentStatus,
      count: item.count,
    })),

    systemActivity: raw.system_activity,

    recentActivities: raw.recent_activities.map((item) => ({
      id: item.id,
      type: item.type as ActivityType,
      message: item.message,
      createdAt: item.created_at,
    })),

    recentDocuments: raw.recent_documents.map((item) => ({
      id: item.id,
      name: item.name,
      fileType: item.file_type as FileType,
      uploadedAt: item.created_at,
      status: item.status as DocumentStatus,
    })),
  };
}
export const dashboardApi = {
  getDashboardByDays(days?: number) {
    return http.get<SuccessResponse<DashboardDataResponse>>(
      "/admin/dashboard",
      {
        params: days ? { days } : undefined,
      },
    );
  },
};
