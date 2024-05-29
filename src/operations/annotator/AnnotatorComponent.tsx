import { AnnotatorCanvas } from '@bpartners/annotator-component';
import { AreaPictureMapLayer } from '@bpartners/typescript-client';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { getUrlParams, parseUrlParams } from 'src/common/utils';
import { ZOOM_LEVEL } from 'src/constants/zoom-level';
import { annotatorProvider } from 'src/providers/annotator-provider';
import SelectZoomLevel from './components/SelectZoomLevel';

const AnnotatorComponent = ({ allowAnnotation = true, poly_gone, allowSelectZoomLevel = true, width }: any) => {
  const { polygons, updatePolygonList } = useCanvasAnnotationContext();
  const { pictureId, prospectId, fileId } = parseUrlParams();
  const [newZoomLevel, setNewZoomLevel] = useState('HOUSES_0');
  const [newzoomLevelAsNumber, setNewZoomLevelAsNumber] = useState(20);
  const [fileInfo, setFileInfo] = useState({ filename: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [currentlayer, setCurrentlayer] = useState<AreaPictureMapLayer>({});
  const notify = useNotify();

  useEffect(() => {
    annotatorProvider.getAreaPictureById(pictureId).then(pictureDetail => {
      const { filename, address, zoom, actualLayer } = pictureDetail;
      if (allowSelectZoomLevel) {
        setNewZoomLevel(zoom.level);
        setNewZoomLevelAsNumber(zoom.number);
      }
      setFileInfo({ filename, address });
      setCurrentlayer(actualLayer);
      setLoading(false);
    });
  }, [pictureId, newZoomLevel, allowSelectZoomLevel]);

  const handleZoomLvl = async (e: any) => {
    const selectedZoom = ZOOM_LEVEL.find(level => level.value === e.target.value);

    try {
      setLoading(true);
      await annotatorProvider.getPictureFormAddress(pictureId, {
        address: fileInfo.address,
        fileId,
        filename: fileInfo.filename,
        prospectId,
        zoomLevel: e.target.value,
      });
      setNewZoomLevel(e.target.value);
      setNewZoomLevelAsNumber(selectedZoom.lvl);
    } catch (error) {
      notify('messages.global.error', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box width='100%' height='580px' position='relative' sx={{ mb: 4 }}>
      {allowSelectZoomLevel && <SelectZoomLevel newZoomLevel={newZoomLevel} handleZoomLvl={handleZoomLvl} loading={loading} />}
      {fileInfo.filename && (
        <AnnotatorCanvas
          allowAnnotation={allowAnnotation}
          width={width || '100%'}
          height='500px'
          image={getUrlParams(window.location.search, 'imgUrl')}
          setPolygons={updatePolygonList}
          polygonList={poly_gone ? poly_gone : polygons}
          polygonLineSizeProps={{
            imageName: `${fileInfo.filename}.jpg`,
            showLineSize: true,
            converterApiUrl: process.env.REACT_APP_ANNOTATOR_GEO_CONVERTER_API_URL || '',
          }}
          zoom={newzoomLevelAsNumber}
        />
      )}
      {Object.keys(currentlayer).length > 0 && (
        <Box sx={{ textAlign: 'center', p: 1, border: '1px solid #ebebeb' }}>
          <Typography variant='body2' style={{ fontWeight: 'bold' }}>
            Source de l'image: {currentlayer.name}, {currentlayer.precisionLevelInCm}cm, {currentlayer.year}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AnnotatorComponent;
