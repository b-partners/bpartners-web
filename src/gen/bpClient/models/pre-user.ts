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
import { CreatePreUser } from './create-pre-user';
/**
 *
 * @export
 * @interface PreUser
 */
export interface PreUser extends CreatePreUser {
  /**
   *
   * @type {string}
   * @memberof PreUser
   */
  id?: string;
  /**
   *
   * @type {Date}
   * @memberof PreUser
   */
  entranceDatetime?: Date;
}
