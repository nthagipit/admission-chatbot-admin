import HttpStatusCode from "@/constants/httpStatusCode.enum";
import type { AxiosError } from "axios";
import axios from "axios";
import { type ErrorResponse } from "@/types/utils.type";

export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error);
}

export function isAxiosUnprocessableEntityError<FormError>(
  error: unknown,
): error is AxiosError<FormError> {
  return (
    isAxiosError(error) &&
    error.response?.status === HttpStatusCode.UnprocessableEntity
  );
}

export function isAxiosUnauthorizedError<UnauthorizedError>(
  error: unknown,
): error is AxiosError<UnauthorizedError> {
  return (
    isAxiosError(error) &&
    error.response?.status === HttpStatusCode.Unauthorized
  );
}

export function isAxiosExpiredTokenError<UnauthorizedError>(
  error: unknown,
): error is AxiosError<UnauthorizedError> {
  return (
    isAxiosUnauthorizedError<ErrorResponse<{ name: string; message: string }>>(
      error,
    ) && error.response?.data.data?.name === "EXPIRED_TOKEN"
  );
}

export function formatCurrency(currency: number) {
  return new Intl.NumberFormat("de-DE").format(currency);
}

export function formatNumberToSocialStyle(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(value)
    .replace(".", ",")
    .toLowerCase();
}

export const rateSale = (original: number, sale: number) =>
  Math.round(((original - sale) / original) * 100) + "%";

// export const removeSpecialCharacter = (str: string) =>
//   str.replace(
//     /!|@|%|\^|\*|\(|\)|\+|\=|\|<|>|\?|\/|,|\.|\:|\;|\\'|\\"|\&|\#|\[|\]|~|\$|_|`|-|\{|\}|\\|\|/g,
//     "",
//   );

// export const generateNameId = ({ name, id }: { name: string; id: string }) => {
//   return removeSpecialCharacter(name).replace(/\s/g, "-") + `-id.${id}`;
// };

export const getIdFromNameId = (nameId: string) => {
  const arr = nameId.split("-id.");
  return arr[arr.length - 1];
};
