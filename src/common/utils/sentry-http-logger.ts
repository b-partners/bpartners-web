import { getCached } from '@/providers';
import * as Sentry from '@sentry/react';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const MAX_BODY_LENGTH = 4000;
const SENSITIVE_HEADERS = ['authorization', 'cookie', 'set-cookie', 'x-api-key', 'x-amz-security-token'];

const truncate = (value: string) => (value.length > MAX_BODY_LENGTH ? `${value.slice(0, MAX_BODY_LENGTH)}...[truncated]` : value);

const stringify = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') return truncate(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof FormData !== 'undefined' && value instanceof FormData) return '[FormData]';
  if (typeof Blob !== 'undefined' && value instanceof Blob) return '[Blob]';
  if (value instanceof ArrayBuffer) return '[ArrayBuffer]';
  try {
    return truncate(JSON.stringify(value));
  } catch (_err) {
    return '[Unserializable]';
  }
};

const stringifyHeaders = (headers: unknown) => {
  if (!headers || typeof headers !== 'object') return undefined;
  const safeHeaders = Object.entries(headers as Record<string, unknown>)
    .filter(([, value]) => typeof value !== 'function')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: SENSITIVE_HEADERS.includes(key.toLowerCase()) ? '[REDACTED]' : stringify(value) }), {});
  return stringify(safeHeaders);
};

const getUserAttributes = () => {
  try {
    const { user } = getCached.whoami() || {};
    const { companyInfo } = getCached.accountHolder() || {};
    return { userId: user?.id, userFirstName: user?.firstName, userLastName: user?.lastName, userEmail: companyInfo?.email };
  } catch (_err) {
    return {};
  }
};

interface HttpFailure {
  status: number;
  config?: InternalAxiosRequestConfig | AxiosError['config'];
  responseData?: unknown;
  responseHeaders?: unknown;
  errorMessage?: string;
  errorCode?: string;
}

const logHttpFailure = ({ status, config, responseData, responseHeaders, errorMessage, errorCode }: HttpFailure) => {
  const method = String(config?.method || 'get').toUpperCase();
  const url = `${config?.baseURL || ''}${config?.url || ''}`;
  const attributes = {
    ...getUserAttributes(),
    httpStatus: status,
    httpMethod: method,
    requestUrl: url,
    requestParams: stringify(config?.params),
    requestBody: stringify(config?.data),
    requestHeaders: stringifyHeaders(config?.headers),
    responseBody: stringify(responseData),
    responseHeaders: stringifyHeaders(responseHeaders),
    errorMessage,
    errorCode,
  };
  const message = `HTTP ${status || errorCode || 'NETWORK_ERROR'} ${method} ${url}`;
  if (status >= 400 || !status) Sentry.logger.error(message, attributes);
  else Sentry.logger.warn(message, attributes);
};

export const sentryHttpResponseLogger = (response: AxiosResponse) => {
  if (response.status !== 200) {
    logHttpFailure({ status: response.status, config: response.config, responseData: response.data, responseHeaders: response.headers });
  }
  return response;
};

export const sentryHttpErrorLogger = (error: AxiosError) => {
  const { response, config, message, code } = error;
  logHttpFailure({
    status: response?.status,
    config: response?.config || config,
    responseData: response?.data,
    responseHeaders: response?.headers,
    errorMessage: message,
    errorCode: code,
  });
  return Promise.reject(error);
};

export const registerSentryHttpLogger = () => axios.interceptors.response.use(sentryHttpResponseLogger, sentryHttpErrorLogger);
