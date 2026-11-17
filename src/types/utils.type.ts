export interface SuccessResponse<T> {
  message: string;
  data: T;
}

export interface ErrorResponse<T> {
  message: string;
  data?: T;
}

// Cú pháp loại bỏ undefined
export type NonUndefinedField<T> = {
  [P in keyof T]-?: NonUndefinedField<NonNullable<T[P]>>;
};
