import axios from 'axios';
import { ReferencerGeoJSON } from 'src/operations/annotator';

export const getReferencerProvider = {
  async getCoordinatesToPx(geojson: ReferencerGeoJSON) {
    const { data } = await axios.put('https://referencer-test.azurewebsites.net/api/converter', geojson);
    return data;
  },
};
