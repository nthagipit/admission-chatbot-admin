export interface ConversationQueryConfig {
  search?: string;
  page?: number | string;
  page_size?: number | string;
  user_id?: number | string;
}

export interface ConversationAdminResponse {
  id: string;
  title: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  total_messages: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationAdmin {
  id: string;
  title: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  totalMessages: number;
  createdAt: string;
  updatedAt: string;
}

export interface PagebleData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CitationResponse {
  document_id?: string;
  document_title?: string;
  document_name?: string;
  page_number: number;
  section?: string;
  source_pages?: number[];
}

export interface ChatMessageResponse {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: CitationResponse[] | null;
  created_at: string;
  updated_at?: string;
}

export interface ConversationDetailResponse {
  id: string;
  title: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
  messages: ChatMessageResponse[];
}

export interface ConversationDetailData {
  conversation: {
    id: string;
    title: string;
    userId: string;
    userName: string;
    userEmail: string;
    userAvatarUrl?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
    citations?: {
      documentId?: string;
      documentName: string;
      documentTitle?: string;
      pageNumber: number;
      section?: string;
      sourcePages?: number[];
    }[];
    createdAt: string;
    updatedAt?: string;
  }[];
}
