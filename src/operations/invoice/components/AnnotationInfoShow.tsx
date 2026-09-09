import { AreaPictureAnnotationInstance } from '@bpartners/typescript-client';
import { Box, Typography } from '@mui/material';
import { FC, useMemo } from 'react';
import { EMPTY_ANNOTATION_INFO_VALUE, mapAreaAnnotationInstanceToAnnotationInfo, translateAnnotationInfo } from '../utils/annotation-info';
import { AnnotationInfoShowStyle } from './style';

export interface AnnotationInfoShowProps {
  areaPictureAnnotationInstance: AreaPictureAnnotationInstance;
}

export const AnnotationInfoShow: FC<AnnotationInfoShowProps> = ({ areaPictureAnnotationInstance, ...rest }) => {
  const infos = useMemo(() => {
    const annotationInfo = mapAreaAnnotationInstanceToAnnotationInfo(areaPictureAnnotationInstance);
    return translateAnnotationInfo({ ...annotationInfo, area: areaPictureAnnotationInstance?.metadata?.area });
  }, [areaPictureAnnotationInstance]);

  return (
    <Box sx={AnnotationInfoShowStyle} {...rest}>
      <Typography className='annotation-info-label'>{areaPictureAnnotationInstance?.labelName ?? EMPTY_ANNOTATION_INFO_VALUE}</Typography>
      {infos.map(({ label, value }) => (
        <Typography className='annotation-info-row' key={label} variant='body2'>
          <span className='annotation-info-key'>{label}: </span>
          {value}
        </Typography>
      ))}
    </Box>
  );
};
