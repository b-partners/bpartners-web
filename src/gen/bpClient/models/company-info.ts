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
import { BusinessActivity } from './business-activity';
/**
 *
 * @export
 * @interface CompanyInfo
 */
export interface CompanyInfo {
  /**
   *
   * @type {string}
   * @memberof CompanyInfo
   */
  phone?: string;
  /**
   *
   * @type {string}
   * @memberof CompanyInfo
   */
  email?: string;
  /**
   *
   * @type {string}
   * @memberof CompanyInfo
   */
  socialCapital?: string;
  /**
   *
   * @type {string}
   * @memberof CompanyInfo
   */
  tvaNumber?: string;
  /**
   *
   * @type {BusinessActivity}
   * @memberof CompanyInfo
   */
  businessActivity?: BusinessActivity;
}
