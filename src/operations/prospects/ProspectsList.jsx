import { FileType, ZoomLevel } from '@bpartners/typescript-client';
import { Box, Button, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { useNotify } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';

import TabPanel from '@/common/components/TabPanel';
import { ProspectContextProvider } from '@/common/store';
import { ProspectDialog, ProspectFilterInput, Prospects } from './components';
import { DraftAreaPictureAnnotations } from './DraftAreaPictureAnnotations';
import ProspectsAdministration from './ProspectsAdministration';
import ProspectsConfiguration from './ProspectsConfiguration';

import { importantCSS } from '@/bp-theme';
import { BPButton, FlexBox } from '@/common/components';
import { PALETTE_COLORS } from '@/common/config/theme';
import { useLoadingHandler, useTabManager } from '@/common/hooks';
import { useDialog } from '@/common/store/dialog';
import { parseLocalStorage } from '@/common/utils/local-storage';
import { annotatorProvider } from '@/providers/annotator-provider';
import { Add } from '@mui/icons-material';
import { prospectInfoResolver } from '../../common/resolvers/prospect-info-validator';
import { getFileUrl, handleSubmit } from '../../common/utils';
import { clearPolygons, prospectingProvider } from '../../providers';

const BP_USER_CACHE_NAME = 'bp_user';
export const ProspectDialogProvider = ({ ComponentChild }) => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { isLoading, stopLoading, startLoading, setIsLoading } = useLoadingHandler();
  const bpUser = parseLocalStorage(BP_USER_CACHE_NAME);

  const form = useForm({ mode: 'blur', defaultValues: { status: 'TO_CONTACT' }, resolver: prospectInfoResolver });
  const { open: openDialog, close: closeDialog } = useDialog();

  const saveOrUpdateProspectSubmit = (toggleDialog, isCreating, event) => {
    const doSubmit = form.handleSubmit(async data => {
      startLoading();

      if (isCreating) {
        notify('En cours de recherche de l’image de la zone');
      }

      const fetch = async () => {
        clearPolygons();
        const prospectId = uuidV4();
        await prospectingProvider.saveOrUpdate([
          {
            ...data,
            id: prospectId,
            invoiceID: data?.invoice?.id,
            invoice: undefined,
          },
        ]);
        notify(`Prospect créé avec succès !`, { type: 'success' });
        try {
          const fileId = uuidV4();
          const pictureId = uuidV4();
          const fileUrl = getFileUrl(fileId, FileType.AREA_PICTURE);
          await annotatorProvider.getPictureFormAddress(pictureId, {
            address: data.address,
            fileId,
            filename: `Layer ${data.address}`,
            prospectId,
            zoomLevel: ZoomLevel.HOUSES_0,
          });
          navigate(
            `/annotator?imgUrl=${encodeURIComponent(fileUrl)}&address=${data.address}&zoomLevel=${ZoomLevel.HOUSES_0}&pictureId=${pictureId}&useDrafts=false&prospectId=${prospectId}&fileId=${fileId}`
          );
          return;
        } catch {
          toggleDialog();
          openDialog(
            <>
              <DialogTitle>Adresse introuvable</DialogTitle>
              <DialogContent>
                <DialogContentText>L'adresse que vous avez spécifiée n'est pas encore pris en charge. Veuillez réessayer ultérieurement.</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeDialog}>Fermer</Button>
              </DialogActions>
            </>
          );
        }
        stopLoading();
      };

      fetch().catch(() => {
        stopLoading();
      });
    });

    doSubmit(event);
  };

  return (
    <ProspectContextProvider loading={isLoading} setLoading={setIsLoading}>
      <FormProvider {...form}>
        <ComponentChild bpUser={bpUser} isLoading={isLoading} setIsLoading={setIsLoading} saveOrUpdateProspectSubmit={saveOrUpdateProspectSubmit} />
      </FormProvider>
    </ProspectContextProvider>
  );
};

const PROSPECT_LIST_TABS = ['prospects', 'drafts', 'configuration', 'administration'];
const ProspectsListContent = ({ bpUser, saveOrUpdateProspectSubmit }) => {
  const [isCreating, setIsCreating] = useState(false);
  const { tabIndex, handleTabChange } = useTabManager({
    values: PROSPECT_LIST_TABS,
  });

  const toggleDialog = e => {
    e?.stopPropagation();
    setIsCreating(!isCreating);
  };

  const saveOrUpdateProspect = event => saveOrUpdateProspectSubmit(toggleDialog, isCreating, event);

  return (
    <Box sx={{ pb: 2, px: 2, mt: 1 }}>
      <Tabs value={tabIndex} onChange={(_e, newTabIndex) => handleTabChange(newTabIndex)}>
        <Tab label='Mes prospects' component={Link} to='?tab=prospects' data-cy='prospects-tab' />
        <Tab label='Avec brouillons' component={Link} to='?tab=drafts' data-cy='drafts-tab' />
        <Tab label='Configuration' component={Link} to='?tab=configuration' data-cy='configuration-tab' />
        {bpUser?.roles[0] === 'EVAL_PROSPECT' && <Tab label='Administration' component={Link} to='?tab=administration' data-cy='administration-tab' />}
      </Tabs>

      <TabPanel value={tabIndex} index={0} sx={{ mt: 1 }}>
        <FlexBox sx={{ justifyContent: 'end', gap: 2, mb: 1 }}>
          <ProspectFilterInput variant='outlined' style={{ width: '400px' }} />
          <BPButton
            sx={{
              bgcolor: PALETTE_COLORS.forest,
              '&:hover': {
                bgcolor: importantCSS(PALETTE_COLORS.pine),
              },
            }}
            style={{ width: 200 }}
            size='large'
            icon={<Add />}
            label='resources.prospects.add'
            onClick={toggleDialog}
          />
        </FlexBox>
        <Prospects />
        {isCreating && (
          <form onSubmit={handleSubmit(saveOrUpdateProspect)} style={{ display: 'flex', flexDirection: 'column' }}>
            <ProspectDialog open={isCreating} close={toggleDialog} saveOrUpdateProspectSubmit={saveOrUpdateProspect} isCreating={isCreating} />
          </form>
        )}
      </TabPanel>

      <TabPanel value={tabIndex} index={1} sx={{ p: 3 }}>
        <DraftAreaPictureAnnotations />
      </TabPanel>

      <TabPanel value={tabIndex} index={2} sx={{ p: 3 }}>
        <ProspectsConfiguration />
      </TabPanel>

      {bpUser?.roles[0] === 'EVAL_PROSPECT' && (
        <TabPanel value={tabIndex} index={3} sx={{ p: 3 }}>
          <ProspectsAdministration />
        </TabPanel>
      )}
    </Box>
  );
};

const ProspectsList = () => <ProspectDialogProvider ComponentChild={ProspectsListContent} />;
export default ProspectsList;
