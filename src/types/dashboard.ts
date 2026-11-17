import type { DocumentStatus, FileType } from "./document.type";

export interface DashboardStats {
  totalDocuments: number;
  completedDocuments: number;
  processingDocuments: number;
  failedDocuments: number;
  totalUsers: number;
  totalConversations: number;
}

export interface DailyCount {
  /** yyyy-mm-dd */
  date: string;
  count: number;
}

export interface StatusCount {
  status: DocumentStatus;
  count: number;
}

export interface DailyActivity {
  date: string;
  queries: number;
  uploads: number;
}

export type ActivityType =
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_COMPLETED"
  | "DOCUMENT_FAILED"
  | "USER_REGISTERED";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  createdAt: string;
}

export interface RecentDocument {
  id: string;
  name: string;
  fileType: FileType;
  uploadedAt: string;
  status: DocumentStatus;
}

export interface DashboardData {
  stats: DashboardStats;
  conversationsByDay: DailyCount[];
  documentStatus: StatusCount[];
  systemActivity: DailyActivity[];
  recentActivities: ActivityItem[];
  recentDocuments: RecentDocument[];
}

export interface DashboardDataResponse {
  stats: {
    total_documents: number;
    completed_documents: number;
    processing_documents: number;
    failed_documents: number;
    total_users: number;
    total_conversations: number;
  };

  conversations_by_day: DailyCount[];

  document_status: {
    status: string;
    count: number;
  }[];

  system_activity: DailyActivity[];

  recent_activities: {
    id: string;
    type: string;
    message: string;
    created_at: string;
  }[];

  recent_documents: {
    id: string;
    name: string;
    file_type: string;
    status: string;
    created_at: string;
  }[];
}
