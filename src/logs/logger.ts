import type { ErrorResponse } from '../types/error-response';

export interface HttpLogger {
  success: <T>(debug: { data?: T; message: string; status?: number; path?: string }) => void;
  error: (error: { message: string; data?: ErrorResponse; status?: number }) => void;
  unknown: (status?: number) => void;
}

export function createLogger(enabled = false): HttpLogger {
  return {
    success: (debug) => {
      if (!enabled) return;
      console.info(`[SUCCESS] ${debug.status ?? ''}`, debug.message, {
        data: debug.data,
        path: debug.path,
      });
    },
    error: (error) => {
      if (!enabled) return;
      console.error(`[ERROR] ${error.status ?? ''}`, error.message, {
        data: error.data,
        path: error.data?.path,
      });
    },
    unknown: (status) => {
      if (!enabled) return;
      console.error(`[ERROR] ${status ?? ''}`, 'Hubo un problema inesperado');
    },
  };
}
