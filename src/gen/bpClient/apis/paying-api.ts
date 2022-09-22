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
import { CreateProduct } from '../models';
import { CreateTransactionCategory } from '../models';
import { CrupdateInvoice } from '../models';
import { InternalServerException } from '../models';
import { Invoice } from '../models';
import { NotAuthorizedException } from '../models';
import { PaymentInitiation } from '../models';
import { PaymentRedirection } from '../models';
import { Product } from '../models';
import { ResourceNotFoundException } from '../models';
import { TooManyRequestsException } from '../models';
import { Transaction } from '../models';
import { TransactionCategory } from '../models';
/**
 * PayingApi - axios parameter creator
 * @export
 */
export const PayingApiAxiosParamCreator = function (configuration?: Configuration) {
  return {
    /**
     *
     * @summary Create products of an invoice
     * @param {Array<CreateProduct>} body
     * @param {string} aId Account identifier
     * @param {string} iId Invoice identifier
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createProducts: async (body: Array<CreateProduct>, aId: string, iId: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError('body', 'Required parameter body was null or undefined when calling createProducts.');
      }
      // verify required parameter 'aId' is not null or undefined
      if (aId === null || aId === undefined) {
        throw new RequiredError('aId', 'Required parameter aId was null or undefined when calling createProducts.');
      }
      // verify required parameter 'iId' is not null or undefined
      if (iId === null || iId === undefined) {
        throw new RequiredError('iId', 'Required parameter iId was null or undefined when calling createProducts.');
      }
      const localVarPath = `/accounts/{aId}/invoices/{iId}/products`
        .replace(`{${'aId'}}`, encodeURIComponent(String(aId)))
        .replace(`{${'iId'}}`, encodeURIComponent(String(iId)));
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

      localVarHeaderParameter['Content-Type'] = 'application/json';

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
    /**
     *
     * @summary Create transaction categories
     * @param {string} aId Account identifier
     * @param {string} tId Transaction identifier
     * @param {Array<CreateTransactionCategory>} [body]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createTransactionCategories: async (
      aId: string,
      tId: string,
      body?: Array<CreateTransactionCategory>,
      options: AxiosRequestConfig = {}
    ): Promise<RequestArgs> => {
      // verify required parameter 'aId' is not null or undefined
      if (aId === null || aId === undefined) {
        throw new RequiredError('aId', 'Required parameter aId was null or undefined when calling createTransactionCategories.');
      }
      // verify required parameter 'tId' is not null or undefined
      if (tId === null || tId === undefined) {
        throw new RequiredError('tId', 'Required parameter tId was null or undefined when calling createTransactionCategories.');
      }
      const localVarPath = `/accounts/{aId}/transactions/{tId}/transactionCategories`
        .replace(`{${'aId'}}`, encodeURIComponent(String(aId)))
        .replace(`{${'tId'}}`, encodeURIComponent(String(tId)));
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

      localVarHeaderParameter['Content-Type'] = 'application/json';

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
    /**
     *
     * @summary Crupdate an invoice
     * @param {CrupdateInvoice} body
     * @param {string} aId Account identifier
     * @param {string} iId Invoice identifier
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    crupdateInvoice: async (body: CrupdateInvoice, aId: string, iId: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError('body', 'Required parameter body was null or undefined when calling crupdateInvoice.');
      }
      // verify required parameter 'aId' is not null or undefined
      if (aId === null || aId === undefined) {
        throw new RequiredError('aId', 'Required parameter aId was null or undefined when calling crupdateInvoice.');
      }
      // verify required parameter 'iId' is not null or undefined
      if (iId === null || iId === undefined) {
        throw new RequiredError('iId', 'Required parameter iId was null or undefined when calling crupdateInvoice.');
      }
      const localVarPath = `/accounts/{aId}/invoices/{iId}`
        .replace(`{${'aId'}}`, encodeURIComponent(String(aId)))
        .replace(`{${'iId'}}`, encodeURIComponent(String(iId)));
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, 'https://example.com');
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }
      const localVarRequestOptions: AxiosRequestConfig = { method: 'PUT', ...baseOptions, ...options };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      // authentication BearerAuth required

      localVarHeaderParameter['Content-Type'] = 'application/json';

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
    /**
     *
     * @summary Get an invoice
     * @param {string} aId Account identifier
     * @param {string} iId Invoice identifier
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getInvoiceById: async (aId: string, iId: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'aId' is not null or undefined
      if (aId === null || aId === undefined) {
        throw new RequiredError('aId', 'Required parameter aId was null or undefined when calling getInvoiceById.');
      }
      // verify required parameter 'iId' is not null or undefined
      if (iId === null || iId === undefined) {
        throw new RequiredError('iId', 'Required parameter iId was null or undefined when calling getInvoiceById.');
      }
      const localVarPath = `/accounts/{aId}/invoices/{iId}`
        .replace(`{${'aId'}}`, encodeURIComponent(String(aId)))
        .replace(`{${'iId'}}`, encodeURIComponent(String(iId)));
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
     * @summary Get known products of the specified account
     * @param {string} id
     * @param {boolean} [unique] If description is null, this parameter is required.
     * @param {string} [description] Filter product by description
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getProducts: async (id: string, unique?: boolean, description?: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'id' is not null or undefined
      if (id === null || id === undefined) {
        throw new RequiredError('id', 'Required parameter id was null or undefined when calling getProducts.');
      }
      const localVarPath = `/accounts/{id}/products`.replace(`{${'id'}}`, encodeURIComponent(String(id)));
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

      if (unique !== undefined) {
        localVarQueryParameter['unique'] = unique;
      }

      if (description !== undefined) {
        localVarQueryParameter['description'] = description;
      }

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
     * @summary Get known transaction categories of an account
     * @param {string} aId Account identifier
     * @param {boolean} unique If disabled, all transaction categories are given
     * @param {boolean} [userDefined]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getTransactionCategories: async (aId: string, unique: boolean, userDefined?: boolean, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'aId' is not null or undefined
      if (aId === null || aId === undefined) {
        throw new RequiredError('aId', 'Required parameter aId was null or undefined when calling getTransactionCategories.');
      }
      // verify required parameter 'unique' is not null or undefined
      if (unique === null || unique === undefined) {
        throw new RequiredError('unique', 'Required parameter unique was null or undefined when calling getTransactionCategories.');
      }
      const localVarPath = `/accounts/{aId}/transactionCategories`.replace(`{${'aId'}}`, encodeURIComponent(String(aId)));
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

      if (unique !== undefined) {
        localVarQueryParameter['unique'] = unique;
      }

      if (userDefined !== undefined) {
        localVarQueryParameter['userDefined'] = userDefined;
      }

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
     * @summary Get transactions of an account
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getTransactions: async (id: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'id' is not null or undefined
      if (id === null || id === undefined) {
        throw new RequiredError('id', 'Required parameter id was null or undefined when calling getTransactions.');
      }
      const localVarPath = `/accounts/{id}/transactions`.replace(`{${'id'}}`, encodeURIComponent(String(id)));
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
     * @summary Initiate payment processes to an account
     * @param {Array<PaymentInitiation>} body
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    initiatePayments: async (body: Array<PaymentInitiation>, id: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      // verify required parameter 'body' is not null or undefined
      if (body === null || body === undefined) {
        throw new RequiredError('body', 'Required parameter body was null or undefined when calling initiatePayments.');
      }
      // verify required parameter 'id' is not null or undefined
      if (id === null || id === undefined) {
        throw new RequiredError('id', 'Required parameter id was null or undefined when calling initiatePayments.');
      }
      const localVarPath = `/accounts/{id}/paymentInitiations`.replace(`{${'id'}}`, encodeURIComponent(String(id)));
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

      localVarHeaderParameter['Content-Type'] = 'application/json';

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
 * PayingApi - functional programming interface
 * @export
 */
export const PayingApiFp = function (configuration?: Configuration) {
  return {
    /**
     *
     * @summary Create products of an invoice
     * @param {Array<CreateProduct>} body
     * @param {string} aId Account identifier
     * @param {string} iId Invoice identifier
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createProducts(
      body: Array<CreateProduct>,
      aId: string,
      iId: string,
      options?: AxiosRequestConfig
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Invoice>>> {
      const localVarAxiosArgs = await PayingApiAxiosParamCreator(configuration).createProducts(body, aId, iId, options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = { ...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url };
        return axios.request(axiosRequestArgs);
      };
    },
    /**
     *
     * @summary Create transaction categories
     * @param {string} aId Account identifier
     * @param {string} tId Transaction identifier
     * @param {Array<CreateTransactionCategory>} [body]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createTransactionCategories(
      aId: string,
      tId: string,
      body?: Array<CreateTransactionCategory>,
      options?: AxiosRequestConfig
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Array<TransactionCategory>>>> {
      const localVarAxiosArgs = await PayingApiAxiosParamCreator(configuration).createTransactionCategories(aId, tId, body, options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = { ...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url };
        return axios.request(axiosRequestArgs);
      };
    },
    /**
     *
     * @summary Crupdate an invoice
     * @param {CrupdateInvoice} body
     * @param {string} aId Account identifier
     * @param {string} iId Invoice identifier
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async crupdateInvoice(
      body: CrupdateInvoice,
      aId: string,
      iId: string,
      options?: AxiosRequestConfig
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Invoice>>> {
      const localVarAxiosArgs = await PayingApiAxiosParamCreator(configuration).crupdateInvoice(body, aId, iId, options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = { ...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url };
        return axios.request(axiosRequestArgs);
      };
    },
    /**
     *
     * @summary Get an invoice
     * @param {string} aId Account identifier
     * @param {string} iId Invoice identifier
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getInvoiceById(
      aId: string,
      iId: string,
      options?: AxiosRequestConfig
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Invoice>>> {
      const localVarAxiosArgs = await PayingApiAxiosParamCreator(configuration).getInvoiceById(aId, iId, options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = { ...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url };
        return axios.request(axiosRequestArgs);
      };
    },
    /**
     *
     * @summary Get known products of the specified account
     * @param {string} id
     * @param {boolean} [unique] If description is null, this parameter is required.
     * @param {string} [description] Filter product by description
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getProducts(
      id: string,
      unique?: boolean,
      description?: string,
      options?: AxiosRequestConfig
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Array<Product>>>> {
      const localVarAxiosArgs = await PayingApiAxiosParamCreator(configuration).getProducts(id, unique, description, options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = { ...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url };
        return axios.request(axiosRequestArgs);
      };
    },
    /**
     *
     * @summary Get known transaction categories of an account
     * @param {string} aId Account identifier
     * @param {boolean} unique If disabled, all transaction categories are given
     * @param {boolean} [userDefined]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getTransactionCategories(
      aId: string,
      unique: boolean,
      userDefined?: boolean,
      options?: AxiosRequestConfig
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Array<TransactionCategory>>>> {
      const localVarAxiosArgs = await PayingApiAxiosParamCreator(configuration).getTransactionCategories(aId, unique, userDefined, options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = { ...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url };
        return axios.request(axiosRequestArgs);
      };
    },
    /**
     *
     * @summary Get transactions of an account
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getTransactions(
      id: string,
      options?: AxiosRequestConfig
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Array<Transaction>>>> {
      const localVarAxiosArgs = await PayingApiAxiosParamCreator(configuration).getTransactions(id, options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = { ...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url };
        return axios.request(axiosRequestArgs);
      };
    },
    /**
     *
     * @summary Initiate payment processes to an account
     * @param {Array<PaymentInitiation>} body
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async initiatePayments(
      body: Array<PaymentInitiation>,
      id: string,
      options?: AxiosRequestConfig
    ): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Array<PaymentRedirection>>>> {
      const localVarAxiosArgs = await PayingApiAxiosParamCreator(configuration).initiatePayments(body, id, options);
      return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
        const axiosRequestArgs: AxiosRequestConfig = { ...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url };
        return axios.request(axiosRequestArgs);
      };
    },
  };
};

/**
 * PayingApi - factory interface
 * @export
 */
export const PayingApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
  return {
    /**
     *
     * @summary Create products of an invoice
     * @param {Array<CreateProduct>} body
     * @param {string} aId Account identifier
     * @param {string} iId Invoice identifier
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createProducts(body: Array<CreateProduct>, aId: string, iId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Invoice>> {
      return PayingApiFp(configuration)
        .createProducts(body, aId, iId, options)
        .then(request => request(axios, basePath));
    },
    /**
     *
     * @summary Create transaction categories
     * @param {string} aId Account identifier
     * @param {string} tId Transaction identifier
     * @param {Array<CreateTransactionCategory>} [body]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createTransactionCategories(
      aId: string,
      tId: string,
      body?: Array<CreateTransactionCategory>,
      options?: AxiosRequestConfig
    ): Promise<AxiosResponse<Array<TransactionCategory>>> {
      return PayingApiFp(configuration)
        .createTransactionCategories(aId, tId, body, options)
        .then(request => request(axios, basePath));
    },
    /**
     *
     * @summary Crupdate an invoice
     * @param {CrupdateInvoice} body
     * @param {string} aId Account identifier
     * @param {string} iId Invoice identifier
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async crupdateInvoice(body: CrupdateInvoice, aId: string, iId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Invoice>> {
      return PayingApiFp(configuration)
        .crupdateInvoice(body, aId, iId, options)
        .then(request => request(axios, basePath));
    },
    /**
     *
     * @summary Get an invoice
     * @param {string} aId Account identifier
     * @param {string} iId Invoice identifier
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getInvoiceById(aId: string, iId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Invoice>> {
      return PayingApiFp(configuration)
        .getInvoiceById(aId, iId, options)
        .then(request => request(axios, basePath));
    },
    /**
     *
     * @summary Get known products of the specified account
     * @param {string} id
     * @param {boolean} [unique] If description is null, this parameter is required.
     * @param {string} [description] Filter product by description
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getProducts(id: string, unique?: boolean, description?: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Array<Product>>> {
      return PayingApiFp(configuration)
        .getProducts(id, unique, description, options)
        .then(request => request(axios, basePath));
    },
    /**
     *
     * @summary Get known transaction categories of an account
     * @param {string} aId Account identifier
     * @param {boolean} unique If disabled, all transaction categories are given
     * @param {boolean} [userDefined]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getTransactionCategories(
      aId: string,
      unique: boolean,
      userDefined?: boolean,
      options?: AxiosRequestConfig
    ): Promise<AxiosResponse<Array<TransactionCategory>>> {
      return PayingApiFp(configuration)
        .getTransactionCategories(aId, unique, userDefined, options)
        .then(request => request(axios, basePath));
    },
    /**
     *
     * @summary Get transactions of an account
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getTransactions(id: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Array<Transaction>>> {
      return PayingApiFp(configuration)
        .getTransactions(id, options)
        .then(request => request(axios, basePath));
    },
    /**
     *
     * @summary Initiate payment processes to an account
     * @param {Array<PaymentInitiation>} body
     * @param {string} id
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async initiatePayments(body: Array<PaymentInitiation>, id: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Array<PaymentRedirection>>> {
      return PayingApiFp(configuration)
        .initiatePayments(body, id, options)
        .then(request => request(axios, basePath));
    },
  };
};

/**
 * PayingApi - object-oriented interface
 * @export
 * @class PayingApi
 * @extends {BaseAPI}
 */
export class PayingApi extends BaseAPI {
  /**
   *
   * @summary Create products of an invoice
   * @param {Array<CreateProduct>} body
   * @param {string} aId Account identifier
   * @param {string} iId Invoice identifier
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PayingApi
   */
  public async createProducts(body: Array<CreateProduct>, aId: string, iId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Invoice>> {
    return PayingApiFp(this.configuration)
      .createProducts(body, aId, iId, options)
      .then(request => request(this.axios, this.basePath));
  }
  /**
   *
   * @summary Create transaction categories
   * @param {string} aId Account identifier
   * @param {string} tId Transaction identifier
   * @param {Array<CreateTransactionCategory>} [body]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PayingApi
   */
  public async createTransactionCategories(
    aId: string,
    tId: string,
    body?: Array<CreateTransactionCategory>,
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<Array<TransactionCategory>>> {
    return PayingApiFp(this.configuration)
      .createTransactionCategories(aId, tId, body, options)
      .then(request => request(this.axios, this.basePath));
  }
  /**
   *
   * @summary Crupdate an invoice
   * @param {CrupdateInvoice} body
   * @param {string} aId Account identifier
   * @param {string} iId Invoice identifier
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PayingApi
   */
  public async crupdateInvoice(body: CrupdateInvoice, aId: string, iId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Invoice>> {
    return PayingApiFp(this.configuration)
      .crupdateInvoice(body, aId, iId, options)
      .then(request => request(this.axios, this.basePath));
  }
  /**
   *
   * @summary Get an invoice
   * @param {string} aId Account identifier
   * @param {string} iId Invoice identifier
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PayingApi
   */
  public async getInvoiceById(aId: string, iId: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Invoice>> {
    return PayingApiFp(this.configuration)
      .getInvoiceById(aId, iId, options)
      .then(request => request(this.axios, this.basePath));
  }
  /**
   *
   * @summary Get known products of the specified account
   * @param {string} id
   * @param {boolean} [unique] If description is null, this parameter is required.
   * @param {string} [description] Filter product by description
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PayingApi
   */
  public async getProducts(id: string, unique?: boolean, description?: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Array<Product>>> {
    return PayingApiFp(this.configuration)
      .getProducts(id, unique, description, options)
      .then(request => request(this.axios, this.basePath));
  }
  /**
   *
   * @summary Get known transaction categories of an account
   * @param {string} aId Account identifier
   * @param {boolean} unique If disabled, all transaction categories are given
   * @param {boolean} [userDefined]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PayingApi
   */
  public async getTransactionCategories(
    aId: string,
    unique: boolean,
    userDefined?: boolean,
    options?: AxiosRequestConfig
  ): Promise<AxiosResponse<Array<TransactionCategory>>> {
    return PayingApiFp(this.configuration)
      .getTransactionCategories(aId, unique, userDefined, options)
      .then(request => request(this.axios, this.basePath));
  }
  /**
   *
   * @summary Get transactions of an account
   * @param {string} id
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PayingApi
   */
  public async getTransactions(id: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Array<Transaction>>> {
    return PayingApiFp(this.configuration)
      .getTransactions(id, options)
      .then(request => request(this.axios, this.basePath));
  }
  /**
   *
   * @summary Initiate payment processes to an account
   * @param {Array<PaymentInitiation>} body
   * @param {string} id
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PayingApi
   */
  public async initiatePayments(body: Array<PaymentInitiation>, id: string, options?: AxiosRequestConfig): Promise<AxiosResponse<Array<PaymentRedirection>>> {
    return PayingApiFp(this.configuration)
      .initiatePayments(body, id, options)
      .then(request => request(this.axios, this.basePath));
  }
}
