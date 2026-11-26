import axios, { type AxiosInstance } from "axios";
import type { HttpLogger } from "../../logs/logger";
import type { ErrorResponse } from "../../types/error-response";
import type { HttpClientConfig } from "../../types/http-config";

export function setRequestMiddlewares<TError extends ErrorResponse>(
    http: AxiosInstance,
    config: HttpClientConfig<TError>,
    logger: HttpLogger,
): void {
    http.interceptors.request.use(
        (request) => {
            logger.success({
                data: request.data,
                path: request.url,
                message: "Preparando envío de petición...",
            });
            return request;
        },
        (error: unknown) => {
            if (axios.isAxiosError(error)) {
                logger.error({
                    data: error.request?.data,
                    message: "No se pudo enviar la petición",
                });
            } else {
                logger.unknown();
            }
            return Promise.reject(error);
        },
    );

    if (config.getToken) {
        const getToken = config.getToken;
        http.interceptors.request.use(
            (request) => {
                const token = getToken();
                if (token) {
                    request.headers.setAuthorization(`Bearer ${token}`);
                }
                return request;
            },
            (error) => Promise.reject(error),
        );
    }
}
