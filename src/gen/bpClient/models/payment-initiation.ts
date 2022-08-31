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
import { RedirectionStatusUrls } from './redirection-status-urls';
/**
 *
 * @export
 * @interface PaymentInitiation
 */
export interface PaymentInitiation {
  /**
   *
   * @type {string}
   * @memberof PaymentInitiation
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof PaymentInitiation
   */
  label?: string;
  /**
   *
   * @type {string}
   * @memberof PaymentInitiation
   */
  reference?: string;
  /**
   *
   * @type {number}
   * @memberof PaymentInitiation
   */
  amount?: number;
  /**
   *
   * @type {string}
   * @memberof PaymentInitiation
   */
  payerName?: string;
  /**
   *
   * @type {string}
   * @memberof PaymentInitiation
   */
  payerEmail?: string;
  /**
   *
   * @type {RedirectionStatusUrls}
   * @memberof PaymentInitiation
   */
  redirectionStatusUrls?: RedirectionStatusUrls;
}
