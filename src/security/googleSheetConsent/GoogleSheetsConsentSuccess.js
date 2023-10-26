import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { sheetProvider } from 'src/providers/sheet-provider';
import { redirect } from 'src/common/utils/redirect';
import { BP_COLOR } from 'src/bp-theme.js';
import { useNotify } from 'react-admin';

const GoogleSheetsConsentSuccess = () => {
  const notify = useNotify();
  const location = useLocation();
  const getCode = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    return code;
  }, [location.search]);

  useEffect(() => {
    const sheetProviderFunc = async () => {
      try {
        const code = getCode();
        const response = await sheetProvider.oauth2ExchangeToken(code);
        localStorage.setItem('expiredAt_validationToken_googleSheet', response.expiredAt);
      } catch (error) {
        notify('messages.global.error', { type: 'error' });
      }
    };
    sheetProviderFunc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCode]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      redirect('/prospects?tab=administration');

      return () => {
        clearTimeout(timeoutId);
      };
    }, 5000);
  }, []);

  return (
    <Box sx={{ width: '100%', height: '90%', position: 'relative' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: 2,
          paddingLeft: 0,
          width: 500,
        }}
      >
        <CircularProgress sx={{ color: BP_COLOR[10] }} />
      </Box>
    </Box>
  );
};

export default GoogleSheetsConsentSuccess;
