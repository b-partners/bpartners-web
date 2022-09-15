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
import { CrupdateInvoice } from './crupdate-invoice';
import { Customer } from './customer';
import { InvoiceStatus } from './invoice-status';
import { Product } from './product';
/**
 * 
 * @export
 * @interface Invoice
 */
export interface Invoice extends CrupdateInvoice {
    /**
     * 
     * @type {string}
     * @memberof Invoice
     */
    id?: string;
    /**
     * 
     * @type {Array<Product>}
     * @memberof Invoice
     */
    products?: Array<Product>;
    /**
     * 
     * @type {number}
     * @memberof Invoice
     */
    totalPriceWithoutVat?: number;
    /**
     * 
     * @type {number}
     * @memberof Invoice
     */
    totalPriceWithVat?: number;
    /**
     * 
     * @type {Date}
     * @memberof Invoice
     */
    updatedAt?: Date;
    /**
     * Identifier of the PDF file that is automatically generated for each crupdate. Its value is `null` when generation is not finished yet. 
     * @type {string}
     * @memberof Invoice
     */
    fileId?: string;
}
