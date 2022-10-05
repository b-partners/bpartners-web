/* tslint:disable */
/* eslint-disable */
/**
 * BPartners API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: latest
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import globalAxios, { AxiosResponse, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Configuration } from '../configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from '../base';
import { BadRequestException } from '../models';
import { FileInfo } from '../models';
import { InternalServerException } from '../models';
import { NotAuthorizedException } from '../models';
import { ResourceNotFoundException } from '../models';
import { TooManyRequestsException } from '../models';
/**
 * FilesApi - axios parameter creator
 * @export
 */
export const FilesApiAxiosParamCreator = function (configuration?: Configuration) {
  return {
    /**
     *
     * @summary Download a file
     * @param {string} aId
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    downloadFile: async (aId: string, id: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'aId' is not null or undefined
      if (aId === null || aId === undefined) {
        throw new RequiredError('aId', 'Required parameter aId was null or undefined when calling downloadFile.');
      }
      // verify required parameter 'id' is not null or undefined
      if (id === null || id === undefined) {
        throw new RequiredError('id', 'Required parameter id was null or undefined when calling downloadFile.');
      }
      const localVarPath = `/accounts/{aId}/files/{id}/raw`
        .replace(`{${'aId'}}`, encodeURIComponent(String(aId)))
        .replace(`{${'id'}}`, encodeURIComponent(String(id)));
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com');
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions: AxiosRequestConfig = { method: 'GET', ...baseOptions, ...options };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      // authentication BearerAuth required

      const query = new URLSearchParams(localVarUrlObj.search);
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key]);
      }
      for (const key in options.params) {
        query.set(key, options.params[key]);
      }
      localVarUrlObj.search = new URLSearchParams(query).toString();
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };

      return {
        url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @summary Get information of a file
     * @param {string} aId
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getFileById: async (aId: string, id: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'aId' is not null or undefined
      if (aId === null || aId === undefined) {
        throw new RequiredError('aId', 'Required parameter aId was null or undefined when calling getFileById.');
      }
      // verify required parameter 'id' is not null or undefined
      if (id === null || id === undefined) {
        throw new RequiredError('id', 'Required parameter id was null or undefined when calling getFileById.');
      }
      const localVarPath = `/accounts/{aId}/files/{id}`
        .replace(`{${'aId'}}`, encodeURIComponent(String(aId)))
        .replace(`{${'id'}}`, encodeURIComponent(String(id)));
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com');
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions: AxiosRequestConfig = { method: 'GET', ...baseOptions, ...options };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      // authentication BearerAuth required

      const query = new URLSearchParams(localVarUrlObj.search);
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key]);
      }
      for (const key in options.params) {
        query.set(key, options.params[key]);
      }
      localVarUrlObj.search = new URLSearchParams(query).toString();
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };

      return {
        url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @summary Upload a file. Fails if file already exists.
     * @param {Object} body
     * @param {string} aId
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    uploadFile: async (body: Object, aId: string, id: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError('body', 'Required parameter body was null or undefined when calling uploadFile.');
      }
      // verify required parameter 'aId' is not null or undefined
      if (aId === null || aId === undefined) {
        throw new RequiredError('aId', 'Required parameter aId was null or undefined when calling uploadFile.');
      }
      // verify required parameter 'id' is not null or undefined
      if (id === null || id === undefined) {
        throw new RequiredError('id', 'Required parameter id was null or undefined when calling uploadFile.');
      }
      const localVarPath = `/accounts/{aId}/files/{id}/raw`
        .replace(`{${'aId'}}`, encodeURIComponent(String(aId)))
        .replace(`{${'id'}}`, encodeURIComponent(String(id)));
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com');
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions: AxiosRequestConfig = { method: 'POST', ...baseOptions, ...options };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      // authentication BearerAuth required

      localVarHeaderParameter['Content-Type'] = 'image/jpeg';

      const query = new URLSearchParams(localVarUrlObj.search);
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key]);
      }
      for (const key in options.params) {
        query.set(key, options.params[key]);
      }
      localVarUrlObj.search = new URLSearchParams(query).toString();
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
      const needsSerialization = typeof body !== 'string' || localVarRequestOptions.headers['Content-Type'] === 'application/json';
      localVarRequestOptions.data = needsSerialization ? JSON.stringify(body !== undefined ? body : {}) : body || '';

      return {
        url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
        options: localVarRequestOptions,
      };
    },
  };
};

/**
 * FilesApi - functional programming interface
 * @export
 */
export const FilesApiFp = function (configuration?: Configuration) {
  return {
    /**
     *
     * @summary Download a file
     * @param {string} aId
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async downloadFile(
      aId: string,
      id: string,
      options?: AxiosRequestConfig
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Blob>>> {
      const localVarAxiosArgs = await FilesApiAxiosParamCreator(configuration).downloadFile(aId, id, options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = { ...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url };
        return axios.request(axiosRequestArgs);
      };
    },
    /**
     *
     * @summary Get information of a file
     * @param {string} aId
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getFileById(
      aId: string,
      id: string,
      options?: AxiosRequestConfig
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<FileInfo>>> {
      const localVarAxiosArgs = await FilesApiAxiosParamCreator(configuration).getFileById(aId, id, options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = { ...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url };
        return axios.request(axiosRequestArgs);
      };
    },
    /**
     *
     * @summary Upload a file. Fails if file already exists.
     * @param {Object} body
     * @param {string} aId
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async uploadFile(
      body: Object,
      aId: string,
      id: string,
      options?: AxiosRequestConfig
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Blob>>> {
      const localVarAxiosArgs = await FilesApiAxiosParamCreator(configuration).uploadFile(body, aId, id, options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = { ...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url };
        return axios.request(axiosRequestArgs);
      };
    },
  };
};

/**
 * FilesApi - factory interface
 * @export
 */
export const FilesApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
  return {
    /**
     *
     * @summary Download a file
     * @param {string} aId
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async downloadFile(aId: string, id: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Blob>> {
      return FilesApiFp(configuration)
        .downloadFile(aId, id, options)
        .then(request => request(axios, basePath));
    },
    /**
     *
     * @summary Get information of a file
     * @param {string} aId
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getFileById(aId: string, id: string, options?: AxiosRequestConfig): Promise<AxiosResponse<FileInfo>> {
      return FilesApiFp(configuration)
        .getFileById(aId, id, options)
        .then(request => request(axios, basePath));
    },
    /**
     *
     * @summary Upload a file. Fails if file already exists.
     * @param {Object} body
     * @param {string} aId
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async uploadFile(body: Object, aId: string, id: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Blob>> {
      return FilesApiFp(configuration)
        .uploadFile(body, aId, id, options)
        .then(request => request(axios, basePath));
    },
  };
};

/**
 * FilesApi - object-oriented interface
 * @export
 * @class FilesApi
 * @extends {BaseAPI}
 */
export class FilesApi extends BaseAPI {
  /**
   *
   * @summary Download a file
   * @param {string} aId
   * @param {string} id
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FilesApi
   */
  public async downloadFile(aId: string, id: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Blob>> {
    return FilesApiFp(this.configuration)
      .downloadFile(aId, id, options)
      .then(request => request(this.axios, this.basePath));
  }
  /**
   *
   * @summary Get information of a file
   * @param {string} aId
   * @param {string} id
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FilesApi
   */
  public async getFileById(aId: string, id: string, options?: AxiosRequestConfig): Promise<AxiosResponse<FileInfo>> {
    return FilesApiFp(this.configuration)
      .getFileById(aId, id, options)
      .then(request => request(this.axios, this.basePath));
  }
  /**
   *
   * @summary Upload a file. Fails if file already exists.
   * @param {Object} body
   * @param {string} aId
   * @param {string} id
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FilesApi
   */
  public async uploadFile(body: Object, aId: string, id: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Blob>> {
    return FilesApiFp(this.configuration)
      .uploadFile(body, aId, id, options)
      .then(request => request(this.axios, this.basePath));
  }
}
