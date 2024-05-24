import { AnnotatorCanvas } from '@bpartners/annotator-component';
import { OpenStreetMapLayer } from '@bpartners/typescript-client';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { getUrlParams, parseUrlParams } from 'src/common/utils';
import { ZOOM_LEVEL } from 'src/constants/zoom-level';
import { annotatorProvider } from 'src/providers/annotator-provider';
import SelectZoomLevel from './components/SelectZoomLevel';

const AnnotatorComponent = ({ allowAnnotation = true, poly_gone, allowSelectZoomLevel = true }: any) => {
  const { polygons, updatePolygonList } = useCanvasAnnotationContext();
  const { pictureId, prospectId, fileId } = parseUrlParams();
  const [newZoomLevel, setNewZoomLevel] = useState('HOUSES_0');
  const [newzoomLevelAsNumber, setNewZoomLevelAsNumber] = useState(20);
  const [fileInfo, setFileInfo] = useState({ filename: '', address: '' });
  const [loading, setLoading] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    annotatorProvider.getAreaPictureById(pictureId).then(pictureDetail => {
      const { filename, address, zoom } = pictureDetail;

      if (allowSelectZoomLevel) {
        setNewZoomLevel(zoom.level);
        setNewZoomLevelAsNumber(zoom.number);
      }
      setFileInfo({ filename, address });
      setLoading(false);
    });
  }, [pictureId, newZoomLevel, allowSelectZoomLevel]);

  const handleZoomLvl = async (e: any) => {
    const selectedZoom = ZOOM_LEVEL.find(level => level.value === e.target.value);

    console.log('OpenStreetMapLayer', OpenStreetMapLayer);

    try {
      setLoading(true);
      await annotatorProvider.getPictureFormAddress(pictureId, {
        address: fileInfo.address,
        fileId,
        filename: fileInfo.filename,
        prospectId,
        layer: OpenStreetMapLayer.tous_fr,
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
    <Box width='100%' height='580px' position='relative'>
      {allowSelectZoomLevel && <SelectZoomLevel newZoomLevel={newZoomLevel} handleZoomLvl={handleZoomLvl} loading={loading} />}
      {fileInfo.filename && (
        <AnnotatorCanvas
          allowAnnotation={allowAnnotation}
          width='100%'
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
    </Box>
  );
};

export default AnnotatorComponent;
