import { stringCutter } from '@/common/utils';
import { AreaPictureDetails } from '@bpartners/typescript-client';
import { Public } from '@mui/icons-material';
import { Stack, Tooltip, Typography } from '@mui/material';
import { FC } from 'react';
import { addressStyle } from '../style';
import { AnnotatorHelpButton } from '../utils';

interface AddressTopBarProps {
  areaPictureDetails: AreaPictureDetails;
  show: boolean;
}

export const AddressTopBar: FC<AddressTopBarProps> = ({ areaPictureDetails, show }) => {
  if (!show) return null;

  const { address } = areaPictureDetails;

  return (
    <Stack direction='row' gap={1} sx={addressStyle}>
      <Stack direction='row' gap={1}>
        <Public />
        <Tooltip title={`${address} | (GPS ${areaPictureDetails?.geoPositions?.[0]?.latitude}, ${areaPictureDetails?.geoPositions?.[0]?.longitude}`}>
          <Typography>
            Adresse: {stringCutter(address, 25)} (GPS {areaPictureDetails?.geoPositions?.[0]?.latitude}, {areaPictureDetails?.geoPositions?.[0]?.longitude})
          </Typography>
        </Tooltip>
      </Stack>
      <AnnotatorHelpButton />
    </Stack>
  );
};
