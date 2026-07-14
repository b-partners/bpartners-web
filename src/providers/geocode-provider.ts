import { getApiKey } from './auth-provider';
import { BpDataProviderType } from './bp-data-provider-type';

export const geocodeProvider: BpDataProviderType = {
  getList: function (): Promise<Array<any>> {
    throw new Error('Function not implemented.');
  },
  async getOne(id?: string, option?: any) {
    const params = new URLSearchParams(option).toString();
    const apiKey = await getApiKey();
    const res = await fetch(`${process.env.REACT_APP_GEO_DETECTION_API}/geocode?${params}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    return { id, data };
  },
  saveOrUpdate: function (): Promise<Array<any>> {
    throw new Error('Function not implemented.');
  },
};
