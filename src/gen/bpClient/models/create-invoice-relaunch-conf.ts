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
/**
 *
 * @export
 * @interface CreateInvoiceRelaunchConf
 */
export interface CreateInvoiceRelaunchConf {
  /**
   * The frequency of sending the message in days
   * @type {number}
   * @memberof CreateInvoiceRelaunchConf
   */
  unpaidRelaunch?: number;
  /**
   * The frequency of sending the message in days
   * @type {number}
   * @memberof CreateInvoiceRelaunchConf
   */
  draftRelaunch?: number;
}