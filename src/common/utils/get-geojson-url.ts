export const getGeoJsonUrl = (location: any) => {
  const geojsonBaseurl = process.env.REACT_APP_GEOJSON_BASEURL;
  const data = { coordinates: [location.longitude, location.latitude], type: location.type };

  return encodeURI(`${geojsonBaseurl}/#data=data:application/json,${JSON.stringify(data)}`);
};
