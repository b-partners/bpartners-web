import axios from 'axios';
import { ConverterPayloadGeoJSON, ConverterResultGeoJSON } from 'src/operations/annotator';

export const polygonConverterProvider = {
  async coordinatesToPixel(geojson: ConverterPayloadGeoJSON): Promise<ConverterResultGeoJSON> {
    const { data } = await axios.post('https://referencer-test.azurewebsites.net/api/converter', geojson);
    return data;
  },
};
