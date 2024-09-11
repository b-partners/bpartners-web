import { FileType, ZoomLevel } from '@bpartners/typescript-client';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
import { List, useNotify } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';

import ListComponent from '@/common/components/ListComponent';
import TabPanel from '@/common/components/TabPanel';
import { ProspectContextProvider } from '@/common/store';
import { ProspectDialog, ProspectFilterInput, Prospects } from './components';
import { DraftAreaPictureAnnotations } from './DraftAreaPictureAnnotations';
import TabManager from './components/TabManager';
import ProspectsAdministration from './ProspectsAdministration';
import ProspectsConfiguration from './ProspectsConfiguration';

import { BPButton } from '@/common/components';
import { useDialog } from '@/common/store/dialog';
import { annotatorProvider } from '@/providers/annotator-provider';
import { prospectInfoResolver } from '../../common/resolvers/prospect-info-validator';
import { getFileUrl, handleSubmit } from '../../common/utils';
import { clearPolygons, getCached, prospectingProvider } from '../../providers';

const ProspectsList = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const notify = useNotify();
  const navigate = useNavigate();
  const BP_USER = JSON.parse(localStorage.getItem('bp_user'));
  const accountHolder = getCached.accountHolder();

  // Fonction pour mettre à jour l'URL avec le nouvel onglet sélectionné
  const updateURLWithTab = index => {
    const searchParams = new URLSearchParams();
    if (index === 0) {
      searchParams.set('tab', 'prospects');
    } else if (index === 1) {
      searchParams.set('tab', 'drafts');
    } else if (index === 2) {
      searchParams.set('tab', 'configuration');
    } else if (index === 3) {
      searchParams.set('tab', 'administration');
    }
    const newURL = `${location.pathname}?${searchParams.toString()}`;
    window.history.pushState({}, '', newURL);
  };

  const handleTabChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex);
    updateURLWithTab(newTabIndex);
  };

  const toggleDialog = e => {
    e?.stopPropagation();
    setIsCreating(!isCreating);
  };

  const handleLoading = isLoading => {
    setLoading(isLoading);
  };

  const form = useForm({ mode: 'blur', defaultValues: { status: 'TO_CONTACT' }, resolver: prospectInfoResolver });
  const { open: openDialog, close: closeDialog } = useDialog();

  const saveOrUpdateProspectSubmit = form.handleSubmit(async data => {
    handleLoading(true);

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
            `/annotator?imgUrl=${encodeURIComponent(fileUrl)}&zoomLevel=${ZoomLevel.HOUSES_0}&pictureId=${pictureId}&prospectId=${prospectId}&fileId=${fileId}`
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
      handleLoading(false);
    };

    fetch().catch(() => {
      handleLoading(false);
    });
  });

  return (
    <ProspectContextProvider loading={loading} setLoading={setLoading}>
      <FormProvider {...form}>
        <TabManager location={location} setTabIndex={setTabIndex} />
        <Box sx={{ p: 2 }}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label='Mes prospects' component={Link} to='?tab=prospects' data-cy='prospects-tab' />
            <Tab label='Avec brouillons' component={Link} to='?tab=drafts' data-cy='drafts-tab' />
            <Tab label='Configuration' component={Link} to='?tab=configuration' data-cy='configuration-tab' />
            {BP_USER?.roles[0] === 'EVAL_PROSPECT' && <Tab label='Administration' component={Link} to='?tab=administration' data-cy='administration-tab' />}
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
                  <form onSubmit={handleSubmit(saveOrUpdateProspectSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
                    <ProspectDialog open={isCreating} close={toggleDialog} saveOrUpdateProspectSubmit={saveOrUpdateProspectSubmit} isCreating={isCreating} />
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

          {BP_USER?.roles[0] === 'EVAL_PROSPECT' && (
            <TabPanel value={tabIndex} index={3} sx={{ p: 3 }}>
              <ProspectsAdministration />
            </TabPanel>
          )}
        </Box>
      </FormProvider>
    </ProspectContextProvider>
  );
};
export default ProspectsList;
