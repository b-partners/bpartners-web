import axios from 'axios';
import { ConverterGeoJSON } from 'src/operations/annotator';

export const polygonConverterProvider = {
  async coordinatesToPixel(geojson: ConverterGeoJSON) {
    const { data } = await axios.put('https://referencer-test.azurewebsites.net/api/converter', geojson);
    return data;
  },
};
