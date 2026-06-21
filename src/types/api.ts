export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export interface StandardError {
  timestamp: string;
  status: number;
  errors: string[];
  message: string;
  path: string;
}
