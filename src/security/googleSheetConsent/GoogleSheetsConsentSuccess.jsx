import { Box, CircularProgress } from '@mui/material';
import { useCallback, useEffect } from 'react';
import { useNotify } from 'react-admin';
import { useLocation } from 'react-router-dom';
import { BP_COLOR } from '@/bp-theme.js';
import { Redirect } from '@/common/utils';
import { sheetProvider } from '@/providers/sheet-provider';

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
      Redirect.toURL('/prospects?tab=administration');

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
