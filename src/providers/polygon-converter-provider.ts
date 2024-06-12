import axios from 'axios';
import { ConverterPayloadGeoJSON, ConverterResultGeoJSON } from 'src/operations/annotator';

export const polygonConverterProvider = {
  async coordinatesToPixel(geojson: ConverterPayloadGeoJSON): Promise<ConverterResultGeoJSON[]> {
    const { data } = await axios.post(`${process.env.REACT_APP_ANNOTATOR_PIXEL_CONVERTER_API_URL}/converter`, geojson);
    return data;
  },
};
