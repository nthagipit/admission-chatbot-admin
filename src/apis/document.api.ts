import http from "@/utils/http";
import type { PagebleData } from "@/types/common";
import type { SuccessResponse } from "@/types/utils.type";
import type {
  DocumentChunk,
  DocumentChunkResponse,
  DocumentQueryConfig,
  DocumentResponse,
  DocumentStatus,
  DocumentStats,
  FileType,
  KnowledgeDocument,
  UploadOptions,
} from "@/types/document.type";
import { dashboardApi } from "./dashboard.api";

export function mapDocumentDataItem(raw: DocumentResponse): KnowledgeDocument {
  const statusStr = String(raw.status || "PROCESSING").toUpperCase();
  const status: DocumentStatus =
    statusStr === "COMPLETED"
      ? "COMPLETED"
      : statusStr === "FAILED"
        ? "FAILED"
        : "PROCESSING";

  const isEnabled =
    raw.enabled !== undefined
      ? raw.enabled
      : raw.is_active !== undefined
        ? raw.is_active
        : true;

  return {
    id: raw.id,
    name: raw.title || raw.name || raw.file_name || "Document",
    fileName: raw.file_name || raw.name || "document.pdf",
    fileType: (raw.file_type?.toUpperCase() === "PDF"
      ? "PDF"
      : "PDF") as FileType,
    fileSize: Number(raw.file_size || 0),
    uploadedAt: raw.created_at || raw.updated_at || new Date().toISOString(),
    status,
    enabled: isEnabled,
    totalPages: raw.total_pages ?? null,
    totalChunks: raw.total_chunks ?? null,
    errorMessage: raw.error_message ?? null,
    previewUrl: raw.preview_url ?? null,
  };
}

export function mapDocumentData(
  raw: PagebleData<DocumentResponse>,
): PagebleData<KnowledgeDocument> {
  if (!raw || !Array.isArray(raw.items)) {
    return {
      items: [],
      page: 1,
      page_size: 10,
      total: 0,
      total_pages: 1,
    };
  }

  return {
    items: raw.items.map(mapDocumentDataItem),
    page: Number(raw.page || 1),
    page_size: Number(raw.page_size || 10),
    total: Number(raw.total || 0),
    total_pages: Number(raw.total_pages || 1),
  };
}

export function mapDocumentChunkItem(
  raw: DocumentChunkResponse,
): DocumentChunk {
  return {
    id: raw.id,
    index: Number(raw.index ?? 0),
    pageNumber: Number(raw.page_number ?? raw.page ?? 1),
    sectionTitle: raw.section_title || raw.section || "Content",
    content: raw.content || "",
  };
}

export function mapDocumentChunkData(
  raw: PagebleData<DocumentChunkResponse>,
): PagebleData<DocumentChunk> {
  if (!raw || !Array.isArray(raw.items)) {
    return {
      items: [],
      page: 1,
      page_size: 8,
      total: 0,
      total_pages: 1,
    };
  }

  return {
    items: raw.items.map(mapDocumentChunkItem),
    page: Number(raw.page || 1),
    page_size: Number(raw.page_size || 8),
    total: Number(raw.total || 0),
    total_pages: Number(raw.total_pages || 1),
  };
}

export const documentApi = {
  async getAllDocuments(
    params: DocumentQueryConfig,
  ): Promise<{ data: SuccessResponse<PagebleData<KnowledgeDocument>> }> {
    const res = await http.get<SuccessResponse<PagebleData<DocumentResponse>>>(
      "/documents",
      {
        params,
      },
    );

    return {
      ...res,
      data: {
        ...res.data,
        data: mapDocumentData(res.data.data),
      },
    };
  },

  async list(
    params: DocumentQueryConfig,
  ): Promise<{ data: SuccessResponse<PagebleData<KnowledgeDocument>> }> {
    return this.getAllDocuments(params);
  },

  async stats(): Promise<DocumentStats> {
    try {
      const dashRes = await dashboardApi.getDashboardByDays();
      const rawStats = dashRes.data?.data?.stats;
      if (rawStats) {
        return {
          total: Number(rawStats.total_documents || 0),
          completed: Number(rawStats.completed_documents || 0),
          processing: Number(rawStats.processing_documents || 0),
          failed: Number(rawStats.failed_documents || 0),
        };
      }
    } catch {
      // Ignore error
    }

    return { total: 0, completed: 0, processing: 0, failed: 0 };
  },

  async get(id: string): Promise<KnowledgeDocument> {
    const res = await http.get<SuccessResponse<DocumentResponse>>(
      `/documents/${id}`,
    );
    const payload = res.data?.data ?? res.data;
    return mapDocumentDataItem(payload as DocumentResponse);
  },

  async getChunks(
    id: string,
    params: { page?: number | string; page_size?: number | string },
  ): Promise<{ data: SuccessResponse<PagebleData<DocumentChunk>> }> {
    try {
      const res = await http.get<
        SuccessResponse<PagebleData<DocumentChunkResponse>>
      >(`/documents/${id}/chunks`, {
        params,
      });
      return {
        ...res,
        data: {
          ...res.data,
          data: mapDocumentChunkData(res.data.data),
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return {
          data: {
            message: "No chunks found",
            data: {
              items: [],
              page: Number(params.page || 1),
              page_size: Number(params.page_size || 8),
              total: 0,
              total_pages: 1,
            },
          },
        };
      }
      throw err;
    }
  },

  async chunks(
    id: string,
    params: { page?: number | string; page_size?: number | string },
  ): Promise<{ data: SuccessResponse<PagebleData<DocumentChunk>> }> {
    return this.getChunks(id, params);
  },

  async upload(
    file: File,
    { onProgress, signal }: UploadOptions = {},
    title?: string,
  ): Promise<KnowledgeDocument> {
    const form = new FormData();
    form.append("file", file);
    if (title || file.name) {
      form.append("title", title || file.name.replace(/\.[^/.]+$/, ""));
    }

    try {
      const res = await http.post<SuccessResponse<DocumentResponse>>(
        "/documents/upload",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          signal,
          onUploadProgress: (event) => {
            if (event.total) {
              onProgress?.(Math.round((event.loaded * 100) / event.total));
            }
          },
        },
      );
      const payload = res.data?.data ?? res.data;
      return mapDocumentDataItem(payload as DocumentResponse);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // Fallback endpoint POST /documents
        const res = await http.post<SuccessResponse<DocumentResponse>>(
          "/documents",
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
            signal,
            onUploadProgress: (event) => {
              if (event.total) {
                onProgress?.(Math.round((event.loaded * 100) / event.total));
              }
            },
          },
        );
        const payload = res.data?.data ?? res.data;
        return mapDocumentDataItem(payload as DocumentResponse);
      }
      throw err;
    }
  },

  async reprocess(id: string): Promise<KnowledgeDocument> {
    const res = await http.post<SuccessResponse<DocumentResponse>>(
      `/documents/${id}/reprocess`,
    );
    const payload = res.data?.data ?? res.data;
    return mapDocumentDataItem(payload as DocumentResponse);
  },

  async update(
    id: string,
    patch: { enabled?: boolean },
  ): Promise<KnowledgeDocument> {
    const res = await http.patch<SuccessResponse<DocumentResponse>>(
      `/documents/${id}`,
      {
        enabled: patch.enabled,
        is_active: patch.enabled,
      },
    );
    const payload = res.data?.data ?? res.data;
    return mapDocumentDataItem(payload as DocumentResponse);
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/documents/${id}`);
  },
};
