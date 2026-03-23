import BpSelect from '@/common/components/BpSelect';
import { annotatorStore } from '@/common/store';
import { ZOOM_LEVEL } from '@/constants/zoom-level';
import { AreaPictureDetails, AreaPictureMapLayer, CrupdateAreaPictureDetails } from '@bpartners/typescript-client';
import { Stack } from '@mui/material';
import { MutateOptions } from '@tanstack/react-query';
import { FC } from 'react';
import { RefocusImageButton } from './RefocusImageButton';

interface ImageOptionTopBarProps {
  areaPictureDetails: AreaPictureDetails;
  mutateAreaPictureDetail: (variables: CrupdateAreaPictureDetails, options?: MutateOptions<any, Error, CrupdateAreaPictureDetails, unknown>) => void;
  show: boolean;
}

export const ImageOptionTopBar: FC<ImageOptionTopBarProps> = ({ areaPictureDetails, mutateAreaPictureDetail, show }) => {
  const resetAnnotations = annotatorStore.useAnnotatorStore(params => params.resetAnnotations);

  if (!show) return null;

  const { isExtended, zoom, actualLayer: layer, otherLayers } = areaPictureDetails;
  const { level: newZoomLevel } = zoom;

  const handleZoomLvl = async (e: any) => {
    const zoomLevel = e.target.value;
    mutateAreaPictureDetail({ ...areaPictureDetails, zoomLevel, zoom: { level: zoomLevel } });
  };

  const handleLayerChanger = async (e: any) => {
    const selectedLayer = otherLayers.find((layer: any) => layer.name === e.target.value);
    mutateAreaPictureDetail({ ...areaPictureDetails, zoomLevel: newZoomLevel, layerId: selectedLayer.id });
  };

  const refocusImgClick = async () => {
    mutateAreaPictureDetail({ ...areaPictureDetails, zoomLevel: newZoomLevel, isExtended: !isExtended });
    resetAnnotations();
  };

  return (
    <Stack className='image-properties-actions' direction='row' spacing={1} marginBlock={1}>
      <BpSelect
        value={newZoomLevel}
        handleChange={handleZoomLvl}
        options={ZOOM_LEVEL}
        getOptionKey={(option: any) => option.lvl}
        getOptionValue={(option: any) => option.value}
        getOptionLabel={(option: any) => option.label}
        label='Niveau de zoom'
      />
      <BpSelect
        value={layer.name || ''}
        handleChange={handleLayerChanger}
        options={otherLayers}
        getOptionKey={(option: AreaPictureMapLayer) => option.id}
        getOptionValue={(option: AreaPictureMapLayer) => option.name}
        getOptionLabel={(option: AreaPictureMapLayer) => `${option.name} ${option.year} ${option.precisionLevelInCm}cm`}
        label="Source d'image"
      />
      <RefocusImageButton onAccept={refocusImgClick} isExtended={isExtended} />
    </Stack>
  );
};
