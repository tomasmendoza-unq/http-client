import type { ErrorCauseType } from './error-cause';

export interface ErrorMotive {
  field: string;
  motive: string;
}

export interface ErrorResponse {
  id?: string;
  title?: string;
  message: string;
  path?: string;
  timestamp?: string | Date;
  status?: number;
  cause?: ErrorCauseType | string;
  motives?: ErrorMotive[];
  errors?: Record<string, string>;
}
