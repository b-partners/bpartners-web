import { Box, Typography } from '@mui/material';
import { Circle, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BP_COLOR } from 'src/bp-theme';

const BPLocationView = ({ location, ...other }) => {
  // [lat, lng]
  return (
    <>
      {location ? (
        <Box {...other}>
          <MapContainer center={[location.latitude, location.longitude]} zoom={15} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
            <TileLayer url='https://tile.openstreetmap.org/{z}/{x}/{y}.png' />
            <Circle center={[location.latitude, location.longitude]} radius={20} pathOptions={{ color: BP_COLOR[10] }}>
              <Popup>Vous êtes ici</Popup>
            </Circle>
          </MapContainer>
        </Box>
      ) : (
        <Typography variant='caption'>Vous n'avez pas encore renseigné vos coordonnées géographiques.</Typography>
      )}
    </>
  );
};

export default BPLocationView;
