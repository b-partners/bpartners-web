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
 * @interface CreateProduct
 */
export interface CreateProduct {
  /**
   *
   * @type {string}
   * @memberof CreateProduct
   */
  description?: string;
  /**
   *
   * @type {number}
   * @memberof CreateProduct
   */
  quantity?: number;
  /**
   *
   * @type {number}
   * @memberof CreateProduct
   */
  unitPrice?: number;
  /**
   *
   * @type {number}
   * @memberof CreateProduct
   */
  vatPercent?: number;
  /**
   *
   * @type {number}
   * @memberof CreateProduct
   */
  totalVat?: number;
  /**
   *
   * @type {number}
   * @memberof CreateProduct
   */
  totalPriceWithVat?: number;
}
