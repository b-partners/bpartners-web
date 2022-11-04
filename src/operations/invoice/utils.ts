import { Product } from 'src/gen/bpClient';
import { getUserInfo } from 'src/providers/invoice-provider';
import { accessTokenItem } from 'src/providers/auth-provider';
import { BASE_PATH } from 'src/gen/bpClient/base';

const vatTotalPrice = (totalPrice: number) => {
  return (totalPrice * 20) / 100 + totalPrice;
};

export const totalCalculus = (products: Product[]) => {
  if (products.length === 0) {
    return 0;
  }
  const productsTemp = products.map(e => {
    const productTemp = { ...e };
    if (isNaN(e.quantity)) {
      productTemp.quantity = 0;
    } else if (e.quantity === 0) {
      productTemp.quantity = 1;
    }
    return productTemp;
  });

  return productsTemp
    .map(e => vatTotalPrice(e.quantity * e.unitPrice))
    .reduce((a, b) => a + b, 0)
    .toFixed(2);
};

export const invoiceDateValidator = (date1: string, date2?: string) => {
  if (date2) {
    if (date2.length === 0) {
      return 'Ce champ est requis';
    } else if (new Date(date1) < new Date(date2)) {
      return "La date d'envoie doit précéder celle du payement";
    }
  } else if (date1.length === 0) {
    return 'Ce champ est requis';
  } else if (new Date() < new Date(date1)) {
    return "La date d'envoie doit précéder celle d'aujourd'hui";
  }
  return true;
};

export const getInvoicePdfUrl = async (id: string) => {
  const { accountId } = await getUserInfo();
  const accessToken = localStorage.getItem(accessTokenItem) || '';
  return `${BASE_PATH}/accounts/${accountId}/files/${id}/raw?accessToken=${accessToken}&fileType=INVOICE`;
};
