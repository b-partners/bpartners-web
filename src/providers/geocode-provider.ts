import { BpDataProviderType } from './bp-data-provider-type';

export const geocodeProvider: BpDataProviderType = {
  getList: function (): Promise<Array<any>> {
    throw new Error('Function not implemented.');
  },
  async getOne(id?: string, option?: any) {
    const params = new URLSearchParams(option).toString();
    const res = await fetch(`${process.env.REACT_APP_ANNOTATOR_GEO_MERCATOR_API_URL}/geocode?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return { id, data: await res.json() };
  },
  saveOrUpdate: function (): Promise<Array<any>> {
    throw new Error('Function not implemented.');
  },
};
