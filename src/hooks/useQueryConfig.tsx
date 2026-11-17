import omitBy from "lodash/omitBy";
import isUndefined from "lodash/isUndefined";
import useQueryParams from "./useQueryParams";
import type { ConversationQueryConfig } from "@/types/conversation.type";
import type { UserQueryConfig } from "@/types/user.type";
import type { DocumentQueryConfig } from "@/types/document.type";

export function useConversationQueryConfig() {
  const queryParams = useQueryParams();
  const queryConfig = omitBy(
    {
      page: queryParams.page || "1",
      page_size: queryParams.page_size || "10",
      search: queryParams.search,
      user_id: queryParams.user_id,
    },
    isUndefined,
  ) as Record<keyof ConversationQueryConfig, string>;
  return queryConfig;
}

export function useUserQueryConfig() {
  const queryParams = useQueryParams();
  const queryConfig = omitBy(
    {
      page: queryParams.page || "1",
      page_size: queryParams.page_size || "10",
      search: queryParams.search,
      role: queryParams.role,
      provider: queryParams.provider,
    },
    isUndefined,
  ) as Record<keyof UserQueryConfig, string>;
  return queryConfig;
}

export function useDocumentQueryConfig() {
  const queryParams = useQueryParams();
  const queryConfig = omitBy(
    {
      page: queryParams.page || "1",
      page_size: queryParams.page_size || "10",
      search: queryParams.search,
      status: queryParams.status,
      file_type: queryParams.file_type,
      sort: queryParams.sort,
    },
    isUndefined,
  ) as Record<keyof DocumentQueryConfig, string>;
  return queryConfig;
}
