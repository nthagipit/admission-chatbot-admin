import http from "@/utils/http";
import { ENDPOINTS } from "@/constants/endpoint";
import type {
  ConversationAdmin,
  ConversationAdminResponse,
  ConversationDetailData,
  ConversationDetailResponse,
  ConversationQueryConfig,
  PagebleData,
} from "@/types/conversation.type";
import type { SuccessResponse } from "@/types/utils.type";

export function mapConversationDataItem(
  raw: ConversationAdminResponse,
): ConversationAdmin {
  return {
    id: raw.id,
    fullName: raw.full_name || raw.email?.split("@")[0] || "User",
    email: raw.email,
    userId: raw.user_id,
    title: raw.title,
    totalMessages: raw.total_messages,
    avatarUrl: raw.avatar_url || null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export function mapConversationData(
  raw: PagebleData<ConversationAdminResponse>,
): PagebleData<ConversationAdmin> {
  if (!raw || !Array.isArray(raw.items)) {
    return { items: [], page: 1, page_size: 10, total: 0, total_pages: 1 };
  }
  return {
    items: raw.items.map(mapConversationDataItem),
    page: raw.page,
    page_size: raw.page_size,
    total: raw.total,
    total_pages: raw.total_pages,
  };
}

export function mapConversationDetail(
  raw: ConversationDetailResponse,
): ConversationDetailData {
  return {
    conversation: {
      id: raw.id,
      title: raw.title || "Untitled Conversation",
      userId: raw.user_id,
      userName: raw.full_name || raw.email?.split("@")[0] || "User",
      userEmail: raw.email,
      userAvatarUrl: raw.avatar_url || null,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    },
    messages: (raw.messages || []).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      citations: Array.isArray(m.citations)
        ? m.citations.map((c) => ({
            documentId: c.document_id,
            documentName: c.document_title || c.document_name || "Document",
            documentTitle: c.document_title || c.document_name || "Document",
            pageNumber: c.page_number,
            section: c.section,
            sourcePages: c.source_pages,
          }))
        : undefined,
    })),
  };
}

export const conversationApi = {
  async getAllConversations(
    params: ConversationQueryConfig,
  ): Promise<{ data: SuccessResponse<PagebleData<ConversationAdmin>> }> {
    const res = await http.get<
      SuccessResponse<PagebleData<ConversationAdminResponse>>
    >(`${ENDPOINTS.CONVERSATION}/admin`, {
      params,
    });
    return {
      ...res,
      data: {
        ...res.data,
        data: mapConversationData(res.data.data),
      },
    };
  },

  async getConversationById(
    id: string,
  ): Promise<{ data: SuccessResponse<ConversationDetailData> }> {
    const res = await http.get<SuccessResponse<ConversationDetailResponse>>(
      `${ENDPOINTS.CONVERSATION}/${id}/admin`,
    );
    return {
      ...res,
      data: {
        ...res.data,
        data: mapConversationDetail(res.data.data),
      },
    };
  },

  async getMessages(id: string): Promise<ConversationDetailData> {
    const res = await this.getConversationById(id);
    return res.data.data;
  },
};
