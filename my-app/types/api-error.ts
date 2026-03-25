export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'CONFLICT'
  | 'BAD_REQUEST'
  | 'SERVICE_UNAVAILABLE';

export interface ApiError {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details?: string;
}

export class ApiException extends Error {
  statusCode: number;
  code: ErrorCode;
  details?: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.statusCode = error.statusCode;
    this.code = error.code;
    this.details = error.details;
  }

  getUserMessage(): string {
    return this.message;
  }
}

export const isApiError = (data: unknown): data is ApiError => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'statusCode' in data &&
    'code' in data &&
    'message' in data
  );
};

export const handleApiError = (response: Response, data: unknown): ApiException => {
  if (isApiError(data)) {
    return new ApiException(data);
  }
  return new ApiException({
    statusCode: response.status,
    code: 'INTERNAL_ERROR',
    message: (data as { message?: string })?.message || 'An unexpected error occurred',
  });
};
