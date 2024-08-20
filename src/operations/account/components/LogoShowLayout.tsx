import { BP_COLOR } from '@/bp-theme';
import { SmallAvatar } from '@/common/components/SmallAvatar';
import { getMimeType, printError } from '@/common/utils';
import { cache, fileProvider, getAccountLogoUrl, getCached } from '@/providers';
import { FileType } from '@bpartners/typescript-client';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { Avatar, Badge, Box, Skeleton } from '@mui/material';
import { grey } from '@mui/material/colors';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { v4 as uuid } from 'uuid';
import { ACCOUNT_HOLDER_STYLE } from '../style';

export const LogoShowLayout = () => {
  const notify = useNotify();
  const [logo, setLogo] = useState(undefined);
  const [logoLoading, setLogoLoading] = useState(false);

  const getLogo = async () => {
    const logoUrl = getAccountLogoUrl();
    if (logoUrl) {
      try {
        setLogoLoading(true);
        const result = await fetch(logoUrl);
        const blob = await result.blob();
        setLogo(URL.createObjectURL(blob));
      } finally {
        setLogoLoading(false);
      }
    }
  };

  const handleUpdateLogo = (files: ChangeEvent<HTMLInputElement>) => {
    const updateLogo = async () => {
      setLogoLoading(true);
      const type = getMimeType(files);
      const [, logoExtension] = type.split('/');
      const logoFileId = `${uuid()}.${logoExtension}`;

      const resources = { files: files, fileId: logoFileId, fileType: FileType.LOGO };
      await fileProvider.saveOrUpdate(resources as any as []);

      notify('Téléchargement du logo terminé, les modifications seront propagées dans quelques instants.', { type: 'success' });
      const user = getCached.user();
      const whoami = getCached.whoami();
      cache.user({ ...user, logoFileId: logoFileId });
      cache.whoami({ ...whoami, user: { ...user, logoFileId: logoFileId } });
      getLogo().catch(printError);
    };

    updateLogo()
      .catch(() => notify('messages.global.error', { type: 'error' }))
      .finally(() => {
        getLogo().catch(printError);
      });
  };

  useEffect(() => {
    getLogo().catch(printError);
  }, []);

  return (
    <Box sx={ACCOUNT_HOLDER_STYLE}>
      <label htmlFor='upload-photo' style={{ cursor: 'pointer' }} id='upload-photo-label'>
        <input style={{ display: 'none' }} id='upload-photo' name='upload-photo' type='file' onChange={handleUpdateLogo} />
        <Badge
          overlap='circular'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={<SmallAvatar alt='PhotoCamera' children={<PhotoCameraIcon sx={{ color: BP_COLOR[10] }} />} />}
        >
          {!logoLoading ? (
            <Avatar
              alt='company logo'
              src={logo}
              sx={{
                height: '8rem',
                width: '8rem',
              }}
            />
          ) : (
            <Skeleton animation='wave' variant='circular' width={128} height={128} sx={{ bgcolor: grey[400] }} />
          )}
        </Badge>
      </label>
    </Box>
  );
};
