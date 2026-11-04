import { AxiosError } from 'axios';

// ============================================================
// Normalized API Error
// ============================================================
// The backend (see src/main.py exception handlers) always returns
// errors shaped like: { "error": "validation_error", "detail": "..." }
// or, for FastAPI's own validation errors, { "detail": "..." }.
// This normalizes both into one consistent shape the UI can rely on.

export interface ApiErrorInfo {
  /** Human-readable message safe to show directly in the UI. */
  message: string;
  /** Machine-readable error type from the backend, e.g. "validation_error". */
  code?: string;
  /** HTTP status code, when available. */
  status?: number;
  /** True if this looks like a network/connectivity failure (no response at all). */
  isNetworkError: boolean;
}

/**
 * Extracts a clean, displayable message + metadata from any error thrown
 * by an API call (axios or otherwise). Never throws itself.
 */
export function getApiError(error: unknown): ApiErrorInfo {
  if (error instanceof AxiosError) {
    // No response at all — network down, CORS failure, timeout, server unreachable.
    if (!error.response) {
      return {
        message: error.code === 'ECONNABORTED'
          ? 'The request timed out. Please try again.'
          : 'Unable to reach the server. Check your connection and try again.',
        isNetworkError: true,
      };
    }

    const status = error.response.status;
    const data = error.response.data as
      | { error?: string; detail?: string }
      | undefined;

    // Our backend's shape: { error: "validation_error", detail: "..." }
    if (data?.detail) {
      return {
        message: data.detail,
        code: data.error,
        status,
        isNetworkError: false,
      };
    }

    // Fallback for endpoints/errors that don't match the expected shape.
    return {
      message: `Request failed with status ${status}.`,
      status,
      isNetworkError: false,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred.',
      isNetworkError: false,
    };
  }

  return {
    message: 'An unexpected error occurred.',
    isNetworkError: false,
  };
}

/** Convenience helper when a component just needs the message string. */
export function getApiErrorMessage(error: unknown): string {
  return getApiError(error).message;
}