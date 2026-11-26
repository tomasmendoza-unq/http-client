import { jwtDecode, type JwtPayload } from 'jwt-decode';

export function createJwtStorage(tokenKey = 'TOKEN_KEY') {
  const isExpired = (token: string): boolean => {
    try {
      const { exp } = jwtDecode<JwtPayload>(token);
      if (!exp) return false;
      return Date.now() > exp * 1000;
    } catch {
      return true;
    }
  };

  return {
    setToken: (token: string): void => {
      localStorage.setItem(tokenKey, token);
    },
    getToken: (): string | null => {
      return localStorage.getItem(tokenKey);
    },
    removeToken: (): void => {
      localStorage.removeItem(tokenKey);
    },
    isAuthenticated: (): boolean => {
      const token = localStorage.getItem(tokenKey);
      return token ? !isExpired(token) : false;
    },
    getSubject: (): string | undefined => {
      const token = localStorage.getItem(tokenKey);
      if (!token) return undefined;
      return jwtDecode<JwtPayload>(token).sub;
    },
  };
}
