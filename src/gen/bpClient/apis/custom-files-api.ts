import { Configuration } from '../configuration';
import globalAxios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BASE_PATH, BaseAPI, RequiredError } from '../base';

export const CustomFilesApiAxiosParamCreator = function (configuration?: Configuration) {
  return {
    /**
     *
     * @summary Upload a file. Fails if file already exists.
     * @param {Object} body
     * @param {string} aId
     * @param {string} id
     * @param {string} [fileType]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async uploadFile(body: Object, aId: string, id: string, fileType?: string, options: AxiosRequestConfig = {}): Promise<any> {
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

      const localVarPath = `/accounts/{aId}/files/{id}/raw?fileType={type}`
        .replace(`{${'aId'}}`, encodeURIComponent(String(aId)))
        .replace(`{${'id'}}`, encodeURIComponent(String(id)))
        .replace(`{${'type'}}`, encodeURIComponent(String(fileType)));

      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarUrlObj = new URL(localVarPath, 'https://example.com');
      const localVarRequestOptions: AxiosRequestConfig = { method: 'POST', ...baseOptions, ...options };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      if (fileType !== undefined) {
        localVarQueryParameter['fileType'] = fileType;
      }

      localVarHeaderParameter['Content-Type'] = 'image/jpeg';

      const query = new URLSearchParams(localVarUrlObj.search);
      for (const key in localVarQueryParameter) {
        query.set(key, localVarQueryParameter[key]);
      }
      for (const key in options.params) {
        query.set(key, options.params[key]);
      }
      localVarUrlObj.search = new URLSearchParams(query).toString();
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...options.headers };
      const needsSerialization = typeof body !== 'string' || localVarRequestOptions.headers['Content-Type'] === 'application/json';
      localVarRequestOptions.data = needsSerialization ? JSON.stringify(body || {}) : body || '';

      // built url
      return {
        url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
        options: localVarRequestOptions,
      };
    },
  };
};

/**
 * CustomFilesApi - functional programming interface
 * @export
 */
export const CustomFilesApiFp = function (configuration?: Configuration) {
  return {
    async uploadFile(
      body: Object,
      aId: string,
      id: string,
      fileType?: string,
      options?: AxiosRequestConfig
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Blob>>> {
      const localVarAxiosArgs = await CustomFilesApiAxiosParamCreator(configuration).uploadFile(body, aId, id, fileType, options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = {
          ...localVarAxiosArgs.options,
          url: basePath + localVarAxiosArgs.url,
        };
        return axios.request(axiosRequestArgs);
      };
    },
  };
};

/**
 * CustomFilesApi - object-oriented interface
 * @export
 * @class {CustomFilesApi}
 * @extends {BaseAPI}
 */
export class CustomFilesApi extends BaseAPI {
  /**
   *
   * @summary Upload a file. Fails if file already exists.
   * @param {Object} body
   * @param {string} aId
   * @param {string} id
   * @param {string} [fileType]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FilesApi
   */
  uploadFile(body: Object, aId: string, id: string, fileType?: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Blob>> {
    return CustomFilesApiFp(this.configuration)
      .uploadFile(body, aId, id, fileType, options)
      .then(request => request(this.axios, this.basePath));
  }
}
