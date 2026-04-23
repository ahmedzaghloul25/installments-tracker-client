/**
 * Thrown by `request()` on any non-2xx response. Mirrors the Nest default
 * HttpException shape: `{ statusCode, message, error }`, where `message` may
 * be a string or an array of strings (validation errors).
 */
export class ApiError extends Error {
  statusCode: number;
  serverMessage: string | string[];

  constructor(statusCode: number, serverMessage: string | string[]) {
    const text = Array.isArray(serverMessage) ? serverMessage.join('; ') : serverMessage;
    super(text || `HTTP ${statusCode}`);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.serverMessage = serverMessage;
  }
}
