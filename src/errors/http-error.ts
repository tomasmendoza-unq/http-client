import type { ErrorCauseType } from '../types/error-cause';
import type { ErrorResponse } from '../types/error-response';
import type { ErrorSide } from '../types/error-side';

export class HttpError<TError extends ErrorResponse = ErrorResponse> extends Error {
  private readonly data: TError;
  private readonly status: number;
  private readonly side: ErrorSide;

  constructor(data: TError, status: number) {
    super(data.message);
    this.name = 'HttpError';
    this.data = data;
    this.status = status;
    this.side = this.resolveSide(status);
  }

  get getData(): TError {
    return this.data;
  }

  get getCause(): TError['cause'] {
    return this.data.cause;
  }

  get getTitle(): string | undefined {
    return this.data.title;
  }

  get getMessage(): string {
    return this.data.message;
  }

  get getStatus(): number {
    return this.status;
  }

  get getSideError(): ErrorSide {
    return this.side;
  }

  get getFieldErrors(): Record<string, string> | undefined {
    return this.data.errors;
  }

  isCause(cause: ErrorCauseType | string): boolean {
    return this.data.cause === cause;
  }

  private resolveSide(status: number): ErrorSide {
    if (status >= 500) return 'Server';
    if (status >= 400) return 'Client';
    return 'Unknown';
  }
}
