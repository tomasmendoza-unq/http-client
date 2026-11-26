import type { AxiosError } from 'axios';
import type { ErrorResponse } from './error-response';

export interface RefreshSessionConfig<TError extends ErrorResponse = ErrorResponse> {
  refreshPath: string;
  shouldRefresh: (error: AxiosError<TError>) => boolean;
  onRefreshFailed?: () => void;
}

export interface HttpClientConfig<TError extends ErrorResponse = ErrorResponse> {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
  enableLogger?: boolean;
  getToken?: () => string | null | undefined;
  onTokenReceived?: (token: string) => void;
  refreshConfig?: RefreshSessionConfig<TError>;
}
