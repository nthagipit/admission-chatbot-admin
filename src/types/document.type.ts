import type { PageParams } from "./common";

export type DocumentStatus = "PROCESSING" | "COMPLETED" | "FAILED";
export type SortOrder = "newest" | "oldest";
export type FileType = "PDF";

export interface KnowledgeDocument {
  id: string;
  name: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  uploadedAt: string;
  status: DocumentStatus;
  enabled: boolean;
  totalPages: number | null;
  totalChunks: number | null;
  errorMessage: string | null;
  /** Chỉ có khi backend hỗ trợ xem trước tài liệu */
  previewUrl?: string | null;
}

export interface DocumentChunk {
  id: string;
  index: number;
  pageNumber: number;
  sectionTitle: string;
  content: string;
}

export interface DocumentListParams extends PageParams {
  search?: string;
  status?: DocumentStatus | "";
  fileType?: FileType | "";
  sort?: SortOrder;
}

export interface DocumentQueryConfig {
  page?: number | string;
  page_size?: number | string;
  search?: string;
  status?: string;
  file_type?: string;
  sort?: string;
}

export interface DocumentStats {
  total: number;
  completed: number;
  processing: number;
  failed: number;
}

export interface UploadOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

// ─── Backend Response Types (snake_case) ─────────────────────────────────────

export interface DocumentResponse {
  id: string;
  title?: string;
  name?: string;
  file_name: string;
  file_type?: string;
  file_size: number;
  status: DocumentStatus;
  enabled?: boolean;
  is_active?: boolean;
  total_pages?: number | null;
  total_chunks?: number | null;
  error_message?: string | null;
  preview_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface DocumentChunkResponse {
  id: string;
  index?: number;
  page_number?: number;
  page?: number;
  section?: string;
  section_title?: string;
  content: string;
  created_at?: string;
}

export interface DocumentStatsResponse {
  total: number;
  completed: number;
  processing: number;
  failed: number;
}
