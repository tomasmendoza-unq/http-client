import axios, { type AxiosInstance } from 'axios';
import { createLogger } from '../logs/logger';
import { setRequestMiddlewares } from '../middlewares/request/request-middlewares';
import { setResponseMiddlewares } from '../middlewares/response/response-middlewares';
import type { ErrorResponse } from '../types/error-response';
import type { HttpClientConfig } from '../types/http-config';

export function createHttpClient<TError extends ErrorResponse = ErrorResponse>(
  config: HttpClientConfig<TError>
): AxiosInstance {
  const logger = createLogger(config.enableLogger ?? false);

  const http = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    withCredentials: config.withCredentials ?? false,
  });

  setRequestMiddlewares(http, config, logger);
  setResponseMiddlewares(http, config, logger);

  return http;
}
