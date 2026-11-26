import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { HttpError } from '../../errors/http-error';
import type { HttpLogger } from '../../logs/logger';
import { notifySessionExpired } from '../../session/session-expired';
import { ErrorCause } from '../../types/error-cause';
import type { ErrorResponse } from '../../types/error-response';
import type { HttpClientConfig } from '../../types/http-config';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export function setResponseMiddlewares<TError extends ErrorResponse>(
  http: AxiosInstance,
  config: HttpClientConfig<TError>,
  logger: HttpLogger
): void {
  http.interceptors.response.use(
    (response) => {
      logger.success({
        data: response.data,
        status: response.status,
        path: response.config.url,
        message: '¡Respuesta exitosa!',
      });
      return response;
    },
    (error: unknown) => {
      if (axios.isAxiosError<TError>(error) && error.response) {
        logger.error({
          data: error.response.data,
          status: error.response.status,
          message: error.response.data?.message || 'Respuesta fallida',
        });
      } else {
        logger.unknown();
      }
      return Promise.reject(error);
    }
  );

  if (config.refreshConfig) {
    const { refreshPath, shouldRefresh, onRefreshFailed } = config.refreshConfig;
    http.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<TError>) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined;
        if (!originalRequest || originalRequest._retry || !shouldRefresh(error)) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;
        try {
          await http.post(refreshPath);
          return http(originalRequest);
        } catch {
          onRefreshFailed?.();
          notifySessionExpired();
          return Promise.reject(error);
        }
      }
    );
  }

  http.interceptors.response.use(
    (response) => response,
    (error: AxiosError<TError>) => {
      if (error.response) {
        const { data, status } = error.response;
        const normalized = {
          ...(data ?? {}),
          status,
          message: data?.message || 'Error en la solicitud',
          path: data?.path ?? error.config?.url,
        } as TError;
        return Promise.reject(new HttpError<TError>(normalized, status));
      }

      const networkError = new HttpError(
        {
          id: 'NETWORK_ERROR',
          title: 'Network error',
          status: 503,
          message: error.message || 'No se pudo conectar con el servidor',
          path: error.config?.url ?? '',
          timestamp: new Date(),
          cause: ErrorCause.INTERNAL_SERVER_ERROR,
        },
        503
      );
      return Promise.reject(networkError);
    }
  );

  if (config.onTokenReceived) {
    const onTokenReceived = config.onTokenReceived;
    http.interceptors.response.use(
      (response) => {
        const authorization = response.headers.authorization;
        const token = authorization?.replace(/^Bearer\s+/i, '');
        if (token) {
          onTokenReceived(token);
        }
        return response;
      },
      (error) => Promise.reject(error)
    );
  }
}
