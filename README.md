# `@tomasmendoza-unq/http-client`

Cliente HTTP modular sobre Axios con `HttpError` tipado genérico, pipeline de middlewares (logger, autenticación Bearer, refresh de sesión y manejo de errores) y utilidades JWT.

## Instalación en un proyecto cliente

1. Crear un archivo `.npmrc` en la raíz del frontend:
```ini
@tomasmendoza-unq:registry=https://npm.pkg.github.com
```

2. Instalar el paquete:
```bash
pnpm add @tomasmendoza-unq/http-client axios jwt-decode
```

## Uso básico (Estética Grisel / APIs REST estándar)

```ts
import { createHttpClient } from '@tomasmendoza-unq/http-client';

export const http = createHttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  enableLogger: import.meta.env.DEV,
});
```

## Uso avanzado (Refresh automático + JWT en localStorage)

```ts
import { createHttpClient, createJwtStorage, onSessionExpired } from '@tomasmendoza-unq/http-client';

export const jwtStorage = createJwtStorage('TOKEN_KEY');

export const http = createHttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  enableLogger: import.meta.env.DEV,
  getToken: () => jwtStorage.getToken(),
  onTokenReceived: (token) => jwtStorage.setToken(token),
  refreshConfig: {
    refreshPath: '/api/v1/session/refresh',
    shouldRefresh: (error) => error.response?.data?.cause === 'EXPIRED_SESSION',
    onRefreshFailed: () => jwtStorage.removeToken(),
  },
});

onSessionExpired(() => {
  window.location.href = '/login';
});
```
