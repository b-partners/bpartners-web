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
import { CreateProduct } from './create-product';
/**
 *
 * @export
 * @interface Product
 */
export interface Product extends CreateProduct {
  /**
   *
   * @type {string}
   * @memberof Product
   */
  id?: string;
  /**
   *
   * @type {number}
   * @memberof Product
   */
  totalVat?: number;
  /**
   *
   * @type {number}
   * @memberof Product
   */
  totalPriceWithVat?: number;
  /**
   *
   * @type {number}
   * @memberof Product
   */
  unitPriceWithVat?: number;
}
