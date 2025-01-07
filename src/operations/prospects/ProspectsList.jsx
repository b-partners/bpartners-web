import { FileType, ZoomLevel } from '@bpartners/typescript-client';
import {
  Box,
  Button,
  Card,
  CardContent,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
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

import { BPButton } from '@/common/components';
import { useDialog } from '@/common/store/dialog';
import { useTabManager, useLoadingHandler } from '@/common/hooks';
import { annotatorProvider } from '@/providers/annotator-provider';
import { prospectInfoResolver } from '../../common/resolvers/prospect-info-validator';
import { getFileUrl, handleSubmit } from '../../common/utils';
import { clearPolygons, getCached, prospectingProvider } from '../../providers';
import { parseLocalStorage } from '@/common/utils/local-storage';

const BP_USER_CACHE_NAME = "bp_user";
export const ProspectDialogProvider = ({ ComponentChild }) => {
  const notify = useNotify();
  const navigate = useNavigate();
  const {
    isLoading,
    stopLoading,
    startLoading,
    setIsLoading
  } = useLoadingHandler();
  const bpUser = parseLocalStorage(BP_USER_CACHE_NAME);
  const accountHolder = getCached.accountHolder();

  const form = useForm({ mode: 'blur', defaultValues: { status: 'TO_CONTACT' }, resolver: prospectInfoResolver });
  const { open: openDialog, close: closeDialog } = useDialog();

  const saveOrUpdateProspectSubmit = (toggleDialog, isCreating, event) => {
    const doSubmit = form.handleSubmit((async data => {
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
        const isRoofer = accountHolder?.businessActivities?.primary === 'Couvreur' || accountHolder?.businessActivities?.secondary === 'Couvreur';
        if (isRoofer) {
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
              `/annotator?imgUrl=${encodeURIComponent(fileUrl)}&address=${data.address}&zoomLevel=${ZoomLevel.HOUSES_0}&pictureId=${pictureId}&useDrafts=false`
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
        }
        stopLoading();
      };

      fetch().catch(() => {
        stopLoading();
      });
    }));

    doSubmit(event);
  }

  return (
    <ProspectContextProvider loading={isLoading} setLoading={setIsLoading}>
      <FormProvider {...form}>
        <ComponentChild
          bpUser={bpUser}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          saveOrUpdateProspectSubmit={saveOrUpdateProspectSubmit}
        />
      </FormProvider>
    </ProspectContextProvider>
  )
}

const PROSPECT_LIST_TABS = [
  "prospects",
  "drafts",
  "configuration",
  "administration"
]
const ProspectsListContent = ({ bpUser, saveOrUpdateProspectSubmit }) => {
  const [isCreating, setIsCreating] = useState(false);
  const { tabIndex, handleTabChange } = useTabManager({
    values: PROSPECT_LIST_TABS
  });

  const toggleDialog = e => {
    e?.stopPropagation();
    setIsCreating(!isCreating);
  };

  const saveOrUpdateProspect = (event) => saveOrUpdateProspectSubmit(toggleDialog, isCreating, event);

  return (
    <Box sx={{ p: 2 }}>
      <Tabs value={tabIndex} onChange={(_e, newTabIndex) => handleTabChange(newTabIndex)}>
        <Tab label='Mes prospects' component={Link} to='?tab=prospects' data-cy='prospects-tab' />
        <Tab label='Avec brouillons' component={Link} to='?tab=drafts' data-cy='drafts-tab' />
        <Tab label='Configuration' component={Link} to='?tab=configuration' data-cy='configuration-tab' />
        {bpUser?.roles[0] === 'EVAL_PROSPECT' && <Tab label='Administration' component={Link} to='?tab=administration' data-cy='administration-tab' />}
      </Tabs>

      <TabPanel value={tabIndex} index={0} sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Stack direction='row' width='100%' mb={1} justifyContent='space-between' alignItems='center'>
              <ProspectFilterInput />
              <BPButton label='resources.prospects.add' onClick={toggleDialog} />
            </Stack>
            <Prospects />
            {isCreating && (
              <form onSubmit={handleSubmit(saveOrUpdateProspect)} style={{ display: 'flex', flexDirection: 'column' }}>
                <ProspectDialog open={isCreating} close={toggleDialog} saveOrUpdateProspectSubmit={saveOrUpdateProspect} isCreating={isCreating} />
              </form>
            )}
          </CardContent>
        </Card>
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
