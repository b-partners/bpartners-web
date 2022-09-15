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
import { CreatePreUser } from '../models';
import { InternalServerException } from '../models';
import { NotAuthorizedException } from '../models';
import { OnboardingInitiation } from '../models';
import { PreUser } from '../models';
import { Redirection } from '../models';
import { ResourceNotFoundException } from '../models';
import { TooManyRequestsException } from '../models';
/**
 * OnboardingApi - axios parameter creator
 * @export
 */
export const OnboardingApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Pre-onboard users
         * @param {Array<CreatePreUser>} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createPreUsers: async (body: Array<CreatePreUser>, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'body' is not null or undefined
            if (body === null || body === undefined) {
                throw new RequiredError('body','Required parameter body was null or undefined when calling createPreUsers.');
            }
            const localVarPath = `/preUsers`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarHeaderParameter['Content-Type'] = 'application/json';

            const query = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                query.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.params) {
                query.set(key, options.params[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(query)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            const needsSerialization = (typeof body !== "string") || localVarRequestOptions.headers['Content-Type'] === 'application/json';
            localVarRequestOptions.data =  needsSerialization ? JSON.stringify(body !== undefined ? body : {}) : (body || "");

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Initiate an onboarding process
         * @param {OnboardingInitiation} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        initiateOnboarding: async (body: OnboardingInitiation, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'body' is not null or undefined
            if (body === null || body === undefined) {
                throw new RequiredError('body','Required parameter body was null or undefined when calling initiateOnboarding.');
            }
            const localVarPath = `/onboardingInitiation`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarHeaderParameter['Content-Type'] = 'application/json';

            const query = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                query.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.params) {
                query.set(key, options.params[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(query)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            const needsSerialization = (typeof body !== "string") || localVarRequestOptions.headers['Content-Type'] === 'application/json';
            localVarRequestOptions.data =  needsSerialization ? JSON.stringify(body !== undefined ? body : {}) : (body || "");

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * OnboardingApi - functional programming interface
 * @export
 */
export const OnboardingApiFp = function(configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Pre-onboard users
         * @param {Array<CreatePreUser>} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createPreUsers(body: Array<CreatePreUser>, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Array<PreUser>>>> {
            const localVarAxiosArgs = await OnboardingApiAxiosParamCreator(configuration).createPreUsers(body, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * 
         * @summary Initiate an onboarding process
         * @param {OnboardingInitiation} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async initiateOnboarding(body: OnboardingInitiation, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<Redirection>>> {
            const localVarAxiosArgs = await OnboardingApiAxiosParamCreator(configuration).initiateOnboarding(body, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * OnboardingApi - factory interface
 * @export
 */
export const OnboardingApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * 
         * @summary Pre-onboard users
         * @param {Array<CreatePreUser>} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createPreUsers(body: Array<CreatePreUser>, options?: AxiosRequestConfig): Promise<AxiosResponse<Array<PreUser>>> {
            return OnboardingApiFp(configuration).createPreUsers(body, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Initiate an onboarding process
         * @param {OnboardingInitiation} body 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async initiateOnboarding(body: OnboardingInitiation, options?: AxiosRequestConfig): Promise<AxiosResponse<Redirection>> {
            return OnboardingApiFp(configuration).initiateOnboarding(body, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * OnboardingApi - object-oriented interface
 * @export
 * @class OnboardingApi
 * @extends {BaseAPI}
 */
export class OnboardingApi extends BaseAPI {
    /**
     * 
     * @summary Pre-onboard users
     * @param {Array<CreatePreUser>} body 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OnboardingApi
     */
    public async createPreUsers(body: Array<CreatePreUser>, options?: AxiosRequestConfig) : Promise<AxiosResponse<Array<PreUser>>> {
        return OnboardingApiFp(this.configuration).createPreUsers(body, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     * 
     * @summary Initiate an onboarding process
     * @param {OnboardingInitiation} body 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OnboardingApi
     */
    public async initiateOnboarding(body: OnboardingInitiation, options?: AxiosRequestConfig) : Promise<AxiosResponse<Redirection>> {
        return OnboardingApiFp(this.configuration).initiateOnboarding(body, options).then((request) => request(this.axios, this.basePath));
    }
}
