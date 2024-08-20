import { Box } from '@mui/material';
import { useState } from 'react';

import { ShowBase, useRefresh } from 'react-admin';
import { AccountEditionLayout } from './AccountEditionLayout';
import { AdditionalInformation, LogoShowLayout, ProfileShowLayout } from './components';
import { BACKDROP_STYLE, BOX_CONTENT_STYLE, SHOW_LAYOUT_STYLE } from './style';
import { ACCOUNT_HOLDER_LAYOUT } from './utils';

export const AccountShow = () => {
  const [layout, setLayout] = useState(ACCOUNT_HOLDER_LAYOUT.VIEW);
  const refresh = useRefresh();

  const toggleAccountHolderLayout = () => {
    setLayout(property => (property === ACCOUNT_HOLDER_LAYOUT.VIEW ? ACCOUNT_HOLDER_LAYOUT.CONFIGURATION : ACCOUNT_HOLDER_LAYOUT.VIEW));
    refresh();
  };

  return (
    <ShowBase id='' resource='accountHolder'>
      {layout === ACCOUNT_HOLDER_LAYOUT.VIEW ? (
        <Box sx={SHOW_LAYOUT_STYLE}>
          <Box sx={BOX_CONTENT_STYLE}>
            <LogoShowLayout />
            <ProfileShowLayout />
          </Box>

          <Box sx={BOX_CONTENT_STYLE}>
            <AdditionalInformation onEdit={toggleAccountHolderLayout} />
          </Box>

          <Box sx={BACKDROP_STYLE}></Box>
        </Box>
      ) : (
        <AccountEditionLayout onClose={toggleAccountHolderLayout} />
      )}
    </ShowBase>
  );
};
