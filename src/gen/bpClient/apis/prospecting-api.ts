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
import { InternalServerException } from '../models';
import { Marketplace } from '../models';
import { NotAuthorizedException } from '../models';
import { ResourceNotFoundException } from '../models';
import { TooManyRequestsException } from '../models';
/**
 * ProspectingApi - axios parameter creator
 * @export
 */
export const ProspectingApiAxiosParamCreator = function (configuration?: Configuration) {
  return {
    /**
     *
     * @summary Get marketplaces for an account
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getMarketplaces: async (id: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'id' is not null or undefined
      if (id === null || id === undefined) {
        throw new RequiredError('id', 'Required parameter id was null or undefined when calling getMarketplaces.');
      }
      const localVarPath = `/accounts/{id}/marketplaces`.replace(`{${'id'}}`, encodeURIComponent(String(id)));
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
  };
};

/**
 * ProspectingApi - functional programming interface
 * @export
 */
export const ProspectingApiFp = function (configuration?: Configuration) {
  return {
    /**
     *
     * @summary Get marketplaces for an account
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getMarketplaces(
      id: string,
      options?: AxiosRequestConfig
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Array<Marketplace>>>> {
      const localVarAxiosArgs = await ProspectingApiAxiosParamCreator(configuration).getMarketplaces(id, options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = { ...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url };
        return axios.request(axiosRequestArgs);
      };
    },
  };
};

/**
 * ProspectingApi - factory interface
 * @export
 */
export const ProspectingApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
  return {
    /**
     *
     * @summary Get marketplaces for an account
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getMarketplaces(id: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Array<Marketplace>>> {
      return ProspectingApiFp(configuration)
        .getMarketplaces(id, options)
        .then(request => request(axios, basePath));
    },
  };
};

/**
 * ProspectingApi - object-oriented interface
 * @export
 * @class ProspectingApi
 * @extends {BaseAPI}
 */
export class ProspectingApi extends BaseAPI {
  /**
   *
   * @summary Get marketplaces for an account
   * @param {string} id
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ProspectingApi
   */
  public async getMarketplaces(id: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Array<Marketplace>>> {
    return ProspectingApiFp(this.configuration)
      .getMarketplaces(id, options)
      .then(request => request(this.axios, this.basePath));
  }
}