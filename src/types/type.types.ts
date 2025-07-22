
// type for standardized promise return types
export interface ReturnType<T> {
  success: boolean;
  errorMessage?: string;
  data?: T;
}
export type PromiseReturnType<T> = Promise<ReturnType<T>>;