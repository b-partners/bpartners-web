import { Typography } from '@mui/material';
import { AreaPictureAnnotationInstance } from '@bpartners/typescript-client';
import { FC, useMemo } from 'react';
import { translateAnnotationInfo } from '../utils/annotation-info-translator';
import { mapAreaAnnotationInstanceToAnnotationInfo } from '../utils/annotation-info-mapper';

export type AnnotationInfoShowProps = {
  areaPictureAnnotationInstance: AreaPictureAnnotationInstance;
};

export const AnnotationInfoShow: FC<AnnotationInfoShowProps> = ({ areaPictureAnnotationInstance }) => {
  const labelName = areaPictureAnnotationInstance?.labelName;
  const infos = useMemo(() => {
    const annotationInfo = mapAreaAnnotationInstanceToAnnotationInfo(areaPictureAnnotationInstance);
    return translateAnnotationInfo({ ...annotationInfo, area: areaPictureAnnotationInstance?.metadata?.area });
  }, [areaPictureAnnotationInstance]);

  return (
    <>
      <Typography component='span' fontWeight={'bold'} fontSize={'18px'}>
        {labelName}
      </Typography>
      {infos.map(({ label, value }) => (
        <Typography variant='body2'>
          <span style={{ fontWeight: 'bold' }}>{label}: </span>
          <Typography component='span' fontWeight={'normal'}>
            {value}
          </Typography>
        </Typography>
      ))}
    </>
  );
};
