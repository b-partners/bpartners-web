import { FileType, ZoomLevel } from '@bpartners/typescript-client';
import { Box, Button, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';

import TabPanel from '@/common/components/TabPanel';
import {
  annotatorStore,
  ProspectContextProvider,
  useAnnotator3DStore,
  useAnnotatorComponentFormItemStore,
  useAnnotatorComponentStore,
  useAnnotatorScreenSwitch,
} from '@/common/store';
import { ProspectFilterInput, ProspectFormDialog, Prospects } from './components';
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
import { copyObject, getFileUrl, handleSubmit } from '../../common/utils';
import { clearPolygons, clearRoofDelimiter, getCached, prospectingProvider } from '../../providers';

const BP_USER_CACHE_NAME = 'bp_user';
export const ProspectDialogProvider = ({ ComponentChild, address }) => {
  const notify = useNotify();
  const navigate = useNavigate();

  const { isLoading, stopLoading, startLoading, setIsLoading } = useLoadingHandler();
  const bpUser = parseLocalStorage(BP_USER_CACHE_NAME);

  const form = useForm({ mode: 'blur', defaultValues: { status: 'TO_CONTACT', address }, resolver: prospectInfoResolver });
  const { open: openDialog, close: closeDialog } = useDialog();
  const annotatorComponentStore = useAnnotatorComponentStore();
  const { setAnnotatorSidebarAccordionItem: setAnnotatorSidebarAccordionItem } = useAnnotatorComponentFormItemStore();
  const { setScreen } = useAnnotatorScreenSwitch();
  const { reset } = useAnnotator3DStore();
  const resetAnnotations = annotatorStore.useAnnotatorStore(params => params.resetAnnotations);
  const { reset: reset3DStore } = useAnnotator3DStore();
  useEffect(() => {
    form.setValue('address', address);
  }, [address]);

  const saveOrUpdateProspectSubmit = (toggleDialog, isCreating, event) => {
    const doSubmit = form.handleSubmit(async rhfData => {
      setScreen('annotator');
      reset();
      reset3DStore();
      startLoading();

      const prospect = copyObject(rhfData);

      if (!prospect.email || prospect.email.length === 0) prospect.email = getCached.accountHolder().companyInfo.email;

      if (isCreating) notify('notify.searchImagePending');

      const fetch = async () => {
        clearPolygons();
        clearRoofDelimiter();

        prospect.id = uuidV4();
        prospect.invoiceID = prospect?.invoice?.id;
        prospect.invoice = undefined;

        await prospectingProvider.saveOrUpdate([prospect]);
        notify(`resources.prospects.creation.success`, { type: 'success' });

        try {
          const fileId = uuidV4();
          const pictureId = uuidV4();
          const fileUrl = getFileUrl(fileId, FileType.AREA_PICTURE);

          await annotatorProvider.getPictureFormAddress(pictureId, {
            address: prospect.address,
            fileId,
            filename: `Layer ${prospect.address}`,
            prospectId: prospect.id,
            zoomLevel: ZoomLevel.BUILDING,
            isExtended: true,
          });

          annotatorComponentStore.reset();
          setAnnotatorSidebarAccordionItem(0);
          resetAnnotations();
          clearPolygons();
          navigate(
            `/annotator?imgUrl=${encodeURIComponent(fileUrl)}&address=${prospect.address}&zoomLevel=${ZoomLevel.BUILDING}&pictureId=${pictureId}&useDrafts=false&prospectId=${prospect.id}&fileId=${fileId}`
          );
          return;
        } catch (err) {
          let errorMessage = "Une erreur s'est produite, veuillez réessayer.";

          const notSupportedPattern = /Address or zone [\s\S]* not yet supported/i;
          const temporarilyUnavailablePattern = /Address or zone [\s\S]* temporarily unavailable/i;

          if (err.message === 'precisionLevelInCm' || temporarilyUnavailablePattern.test(err.message)) errorMessage = 'Adresse momentanément indisponible.';
          if (notSupportedPattern.test(err.message)) errorMessage = "La zone contenant cette adresse n'est pas encore supporté.";
          if (err.message.includes('Roof analysis consumption ') && err.message.includes(' limit exceeded for free trial period for User.id='))
            errorMessage = 'La limite des analyses gratuites a été atteinte.';

          openDialog(
            <>
              <DialogTitle>Erreur</DialogTitle>
              <DialogContent>
                <DialogContentText>{errorMessage}</DialogContentText>
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

const PROSPECT_LIST_TABS = ['prospects', 'configuration', 'administration'];
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
            <ProspectFormDialog open={isCreating} close={toggleDialog} saveOrUpdateProspectSubmit={saveOrUpdateProspect} isCreating={isCreating} />
          </form>
        )}
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

const ProspectsList = () => {
  useEffect(() => {
    clearPolygons();
    clearRoofDelimiter();
  }, []);

  return <ProspectDialogProvider ComponentChild={ProspectsListContent} />;
};
export default ProspectsList;
