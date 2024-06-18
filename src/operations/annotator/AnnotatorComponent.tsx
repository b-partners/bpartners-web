import { AnnotatorCanvas, Point } from '@bpartners/annotator-component';
import { AreaPictureDetails, AreaPictureMapLayer, CrupdateAreaPictureDetails, ZoomLevel } from '@bpartners/typescript-client';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { BPLoader } from 'src/common/components';
import BpSelect from 'src/common/components/BpSelect';
import { usePolygonMarkerFetcher } from 'src/common/fetcher';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { getUrlParams, parseUrlParams, reload } from 'src/common/utils';
import { ZOOM_LEVEL } from 'src/constants/zoom-level';
import { clearPolygons, geojsonMapper } from 'src/providers';
import { annotatorProvider } from 'src/providers/annotator-provider';
import { RefocusDialog } from './RefocusDialog';

const AnnotatorComponent = ({ allowAnnotation = true, poly_gone, allowSelect = true, width }: any) => {
  const { polygons, updatePolygonList } = useCanvasAnnotationContext();

  const { pictureId, prospectId, fileId } = parseUrlParams();
  const [newZoomLevel, setNewZoomLevel] = useState<ZoomLevel>(ZoomLevel.HOUSES_0);
  const [newZoomLevelAsNumber, setNewZoomLevelAsNumber] = useState(20);
  const [fileInfo, setFileInfo] = useState({ filename: '', address: '' });
  const [loading, setLoading] = useState({
    zoomLvl: false,
    layer: false,
    refocusImg: false,
  });
  const [layer, setLayer] = useState<AreaPictureMapLayer>({});
  const [otherLayers, setOtherLayers] = useState([]);
  const [changing, setChanging] = useState(false);
  const [isExtended, setIsExtended] = useState(false);
  const [areaPictureDetails, setAreaPictureDetails] = useState<AreaPictureDetails | null>(null);
  const notify = useNotify();
  const [markerPosition, setMarker] = useState<Point | null>(null);

  const { data: marker } = usePolygonMarkerFetcher({ areaPictureDetails });

  useEffect(() => {
    const markerPositionMapped = geojsonMapper.toMarker((marker || [null])[0]);
    setMarker(markerPositionMapped.length > 0 && polygons.length === 0 && (!poly_gone || poly_gone.length === 0) ? markerPositionMapped[0] : null);
    updatePolygonList(polygons);
  }, [marker, polygons, poly_gone, updatePolygonList]);

  useEffect(() => {
    if (!pictureId) return;
    annotatorProvider.getAreaPictureById(pictureId).then(pictureDetail => {
      const { address, zoom, actualLayer, otherLayers, isExtended, filename } = pictureDetail;
      if (allowSelect) {
        setNewZoomLevel(zoom.level);
        setNewZoomLevelAsNumber(zoom.number);
      }

      setLayer(actualLayer);
      setOtherLayers(otherLayers);
      setFileInfo({ filename, address });
      setIsExtended(isExtended);
      setAreaPictureDetails(pictureDetail);
    });
  }, [pictureId, newZoomLevel, allowSelect, changing]);

  const handleAction = async (actionType: string, fetchParams: CrupdateAreaPictureDetails, updateState: () => void) => {
    try {
      setLoading(prev => ({ ...prev, [actionType]: true }));
      await annotatorProvider.getPictureFormAddress(pictureId, fetchParams);
      updateState();
    } catch (error) {
      notify('messages.global.error', { type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, [actionType]: false }));
    }
  };
  const handleZoomLvl = async (e: any) => {
    const selectedZoom = ZOOM_LEVEL.find(level => level.value === e.target.value);

    const fetchParams = {
      ...fileInfo,
      fileId,
      prospectId,
      zoomLevel: e.target.value,
    };

    const updateState = () => {
      setNewZoomLevel(e.target.value);
      setNewZoomLevelAsNumber(selectedZoom.lvl);
    };

    handleAction('zoomLvl', fetchParams, updateState);
  };

  const handleLayerChanger = async (e: any) => {
    const selectedLayer = otherLayers.find(layer => layer.name === e.target.value);

    const fetchParams = {
      ...fileInfo,
      fileId,
      prospectId,
      zoomLevel: newZoomLevel,
      layerId: selectedLayer.id,
    };

    const updateState = () => {
      setLayer(selectedLayer);
      setChanging(!changing);
    };

    handleAction('layer', fetchParams, updateState);
  };

  const refocusImgClick = async () => {
    const fetchParams = {
      ...fileInfo,
      fileId,
      prospectId,
      zoomLevel: newZoomLevel,
      isExtended: true,
    };

    const updateState = () => {
      setChanging(!changing);
      clearPolygons();
      reload();
    };

    handleAction('refocusImg', fetchParams, updateState);
  };

  if (!fileInfo.filename) {
    return <BPLoader sx={{ width: width || undefined }} message="Chargement des données d'annotation..." />;
  }

  return (
    <Box width='100%' height='580px' position='relative'>
      {allowSelect && (
        <>
          <BpSelect
            value={newZoomLevel}
            handleChange={handleZoomLvl}
            loading={loading.zoomLvl}
            options={ZOOM_LEVEL}
            getOptionKey={(option: any) => option.lvl}
            getOptionValue={(option: any) => option.value}
            getOptionLabel={(option: any) => option.label}
            label='Niveau de zoom'
          />
          <BpSelect
            value={layer.name || ''}
            handleChange={handleLayerChanger}
            loading={loading.layer}
            options={otherLayers}
            getOptionKey={(option: AreaPictureMapLayer) => option.id}
            getOptionValue={(option: AreaPictureMapLayer) => option.name}
            getOptionLabel={(option: AreaPictureMapLayer) => `${option.name} ${option.year} ${option.precisionLevelInCm}cm`}
            label="Source d'image"
          />
          <RefocusDialog onAccept={refocusImgClick} isLoading={loading.refocusImg} disabled={isExtended} />
        </>
      )}
      {fileInfo.filename && (
        <AnnotatorCanvas
          markerPosition={markerPosition}
          allowAnnotation={allowAnnotation}
          width={width || '100%'}
          height='500px'
          image={getUrlParams(window.location.search, 'imgUrl')}
          setPolygons={updatePolygonList}
          polygonList={poly_gone ? poly_gone : polygons}
          polygonLineSizeProps={{
            imageName: `${fileInfo.filename}.jpg`,
            showLineSize: true,
            converterApiUrl: `${process.env.REACT_APP_ANNOTATOR_GEO_CONVERTER_API_URL}/api/reference` || '',
          }}
          zoom={newZoomLevelAsNumber}
        />
      )}
      {Object.keys(layer).length > 0 && (
        <Box sx={{ textAlign: 'center', p: 1, border: '1px solid #ebebeb' }}>
          <Typography variant='body2' style={{ fontWeight: 'bold' }}>
            Source de l'image: {layer.name}, {layer.precisionLevelInCm}cm, {layer.year}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AnnotatorComponent;
