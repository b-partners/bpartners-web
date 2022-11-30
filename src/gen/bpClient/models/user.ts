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
import { EnableStatus } from './enable-status';
import { IdentificationStatus } from './identification-status';
/**
 *
 * @export
 * @interface User
 */
export interface User {
  /**
   *
   * @type {string}
   * @memberof User
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof User
   */
  firstName?: string;
  /**
   *
   * @type {string}
   * @memberof User
   */
  lastName?: string;
  /**
   *
   * @type {boolean}
   * @memberof User
   */
  idVerified?: boolean;
  /**
   *
   * @type {IdentificationStatus}
   * @memberof User
   */
  identificationStatus?: IdentificationStatus;
  /**
   *
   * @type {string}
   * @memberof User
   */
  phone?: string;
  /**
   *
   * @type {number}
   * @memberof User
   */
  monthlySubscriptionAmount?: number;
  /**
   *
   * @type {string}
   * @memberof User
   */
  logoFileId?: string;
  /**
   *
   * @type {EnableStatus}
   * @memberof User
   */
  status?: EnableStatus;
}
