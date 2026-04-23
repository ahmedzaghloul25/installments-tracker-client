import { API_BASE_URL } from '../constants/config';
import { ApiError } from './errors';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const parsed = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const serverMessage =
      parsed && typeof parsed === 'object' && 'message' in parsed
        ? (parsed as { message: string | string[] }).message
        : res.statusText;
    throw new ApiError(res.status, serverMessage);
  }

  return parsed as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
