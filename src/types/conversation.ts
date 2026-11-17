import type { PageParams } from './common'

export interface Conversation {
  id: string
  userId: string
  userName: string
  userEmail: string
  userAvatarUrl?: string | null
  title: string
  totalMessages: number
  createdAt: string
  lastActivityAt: string
}

export interface Citation {
  documentId?: string
  documentName: string
  documentTitle?: string
  pageNumber: number
  section?: string
  sourcePages?: number[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  citations?: Citation[]
}

export interface ConversationMessages {
  conversation: Conversation
  messages: ChatMessage[]
}

export interface ConversationListParams extends PageParams {
  search?: string
  userId?: string
}
