const TOKEN_KEY = 'fullremove-session-token';

let memoryToken = '';

export function getAuthToken(): string {
  if (memoryToken) return memoryToken;
  try {
    const ss = window.sessionStorage.getItem(TOKEN_KEY);
    if (ss) {
      memoryToken = ss;
      return ss;
    }
    const ls = window.localStorage.getItem(TOKEN_KEY);
    if (ls) {
      memoryToken = ls;
      return ls;
    }
  } catch {
    // Storage may be restricted in sandboxed iframes
  }
  return '';
}

export function setAuthToken(token?: string | null): void {
  const clean = (token || '').trim();
  memoryToken = clean;
  try {
    if (clean) {
      window.sessionStorage.setItem(TOKEN_KEY, clean);
      window.localStorage.setItem(TOKEN_KEY, clean);
    } else {
      window.sessionStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage access restrictions
  }
}

export function clearAuthToken(): void {
  setAuthToken('');
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });
}
