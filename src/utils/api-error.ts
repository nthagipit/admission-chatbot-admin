import { isAxiosError } from "axios";

/** Chuyển mọi lỗi (Axios, Error thường, FastAPI `detail`) thành message hiển thị cho người dùng. */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response)
      return "Cannot reach the server. Check your connection and try again.";
    const { status, data } = error.response;
    if (status === 403)
      return "You do not have permission to perform this action.";
    const detail = (data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
    if (status >= 500)
      return "The server ran into a problem. Try again in a moment.";
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Try again.";
}
