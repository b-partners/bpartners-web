import { Prospect } from '@bpartners/typescript-client';
import { Comment, Home, LocalPhoneOutlined, LocationOn, MailOutline, Star, Update } from '@mui/icons-material';
import { Box, Button, Divider, IconButton, Link, Paper, Popover, Stack, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { FieldErrorMessage } from '../../../common/resolvers';
import { prospectInfoResolver } from '../../../common/resolvers/prospect-info-validator';
import { useProspectContext } from '../../../common/store/prospect-store';
import { getGeoJsonUrl, handleSubmit } from '../../../common/utils';
import { prospectingProvider } from '../../../providers';
import { parseRatingLastEvaluation, parseRatingValue } from '../utils';
import { CardViewField } from './CardViewField';
import { ProspectDialog } from './ProspectDialog';

export const ProspectItem = ({ prospect }) => {
  const [isProspectDialogOpen, setIsProspectDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { setSelectedStatus } = useProspectContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const { handleLoading } = useProspectContext();

  const toggleDialog = (e, isEditing) => {
    e?.stopPropagation();
    setIsProspectDialogOpen(e => !e);
    setIsEditing(isEditing);
    closePopover();
  };

  const openPopover = event => {
    setAnchorEl(event.currentTarget);
  };

  const closePopover = () => {
    setAnchorEl(null);
  };

  const changeStatus = e => {
    const { value } = e.target;
    form.setValue('status', value);
    setSelectedStatus(value);
    toggleDialog(e, false);
  };

  const form = useForm({ mode: 'all', defaultValues: prospect || {}, resolver: prospectInfoResolver });

  const saveOrUpdateProspectSubmit = form.handleSubmit(data => {
    handleLoading(true);
    if (!isEditing && !data.prospectFeedback) {
      form.setError('prospectFeedback', { message: FieldErrorMessage.shouldChoose });
      handleLoading(false);
      return;
    }
    if (prospect.status !== 'TO_CONTACT' && !data.contractAmount) {
      form.setError('contractAmount', { message: FieldErrorMessage.required });
      handleLoading(false);
      return;
    }
    const fetch = async () => {
      await prospectingProvider.update([
        {
          ...prospect,
          ...data,
          invoiceID: data?.invoice?.id,
          invoice: undefined,
          status: data.prospectFeedback === 'NOT_INTERESTED' || data.prospectFeedback === 'PROPOSAL_DECLINED' ? 'TO_CONTACT' : data.status,
        },
      ]);
      handleLoading(false);
      notify(`Prospect mis à jour avec succès !`, { type: 'success' });
      refresh();
      toggleDialog();
    };
    if (
      prospect.status === 'CONTACTED' &&
      data.prospectFeedback !== 'PROPOSAL_DECLINED' &&
      (!data.contractAmount || data?.contractAmount === 0 || data?.contractAmount?.length === 0)
    ) {
      handleLoading(false);
      form.setError('contractAmount', { message: FieldErrorMessage.required });
    } else {
      fetch().catch(() => {
        handleLoading(false);
        notify(`Une erreur s'est produite`, { type: 'error' });
      });
    }
  });

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(saveOrUpdateProspectSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
        <Paper elevation={2} sx={{ p: 1, bgcolor: prospect?.contactNature === 'OLD_CUSTOMER' ? '#dceeff' : '' }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
            <Typography variant='subtitle1' sx={{ textTransform: 'uppercase' }}>
              {prospect.name || 'Non renseigné'}
            </Typography>
            <Stack direction='row' alignItems='center'>
              {prospect.location && (
                <Link href={getGeoJsonUrl(prospect.location)} target='_blank' underline='hover'>
                  <Tooltip title='Voir sur la carte'>
                    <IconButton component='span'>
                      <LocationOn fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </Link>
              )}
              <Button
                style={{
                  background: 'transparent',
                  color: '#000',
                  padding: '4px',
                  border: '1px solid #74737378',
                  fontSize: '12px',
                }}
                variant='text'
                data-testid={`edit-${prospect.id}`}
                aria-describedby={id}
                onClick={openPopover}
              >
                Modifier
              </Button>
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={closePopover}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <Box sx={{ m: 2, width: '250px' }}>
                  <Typography sx={{ paddingBottom: '5px', textAlign: 'center', fontSize: '18px' }}>Changez le statut du prospect pour le protéger</Typography>
                  {changeStatusButtons(prospect.status, changeStatus)}
                  <Typography sx={{ paddingBottom: '5px', textAlign: 'center' }}>Ou</Typography>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button sx={{ m: '10px 0', width: '150px' }} onClick={e => toggleDialog(e, true)} data-testid={`edit-prospect-${prospect.id}`}>
                      Modifier le prospect
                    </Button>
                  </Box>
                </Box>
              </Popover>
            </Stack>
          </Stack>
          <Box sx={{ color: '#4d4d4d' }}>
            <CardViewField icon={<MailOutline />} value={prospect.email} />
            <CardViewField icon={<LocalPhoneOutlined />} value={prospect.phone} />
            <CardViewField icon={<Home />} value={prospect.address} />
            <CardViewField icon={<Comment />} value={prospect.comment ? prospect.comment : prospect.defaultComment} />
            <CardViewField icon={<Star />} value={parseRatingValue(prospect?.rating?.value)} />
            <CardViewField
              icon={<Update />}
              value={prospect?.rating?.lastEvaluation === null ? 'Non renseigné' : parseRatingLastEvaluation(prospect?.rating?.lastEvaluation)}
            />
          </Box>
          {isProspectDialogOpen && (
            <ProspectDialog
              open={isProspectDialogOpen}
              close={toggleDialog}
              prospect={prospect}
              saveOrUpdateProspectSubmit={saveOrUpdateProspectSubmit}
              isEditing={isEditing}
            />
          )}
        </Paper>
      </form>
    </FormProvider>
  );
};
ProspectItem.propTypes = {
  prospect: PropTypes.shape(Prospect).isRequired,
};

const changeStatusButtons = (status, changeStatus) => {
  return (
    <Box sx={{ m: 1, textAlign: 'center' }}>
      {status === 'TO_CONTACT' ? (
        <>
          <Button sx={{ m: '5px 0', width: '150px' }} data-testid='edit-status-to-contacted' value={'CONTACTED'} onClick={handleSubmit(changeStatus)}>
            Contacté
          </Button>
          <Button sx={{ m: '5px 0', width: '150px' }} data-testid='edit-status-to-converted' value={'CONVERTED'} onClick={handleSubmit(changeStatus)}>
            Converti
          </Button>
        </>
      ) : status === 'CONTACTED' ? (
        <>
          <Button sx={{ m: '5px 0', width: '150px' }} data-testid='edit-status-to-to_contact' value='TO_CONTACT' onClick={handleSubmit(changeStatus)}>
            À contacter
          </Button>
          <Button sx={{ m: '5px 0', width: '150px' }} data-testid='edit-status-to-converted' value={'CONVERTED'} onClick={handleSubmit(changeStatus)}>
            Converti
          </Button>
        </>
      ) : (
        status === 'CONVERTED' && (
          <>
            <Button sx={{ m: '5px 0', width: '150px' }} data-testid='edit-status-to-to_contact' value='TO_CONTACT' onClick={handleSubmit(changeStatus)}>
              À contacter
            </Button>
            <Button sx={{ m: '5px 0', width: '150px' }} data-testid='edit-status-to-contacted' value={'CONTACTED'} onClick={handleSubmit(changeStatus)}>
              Contacté
            </Button>
          </>
        )
      )}
    </Box>
  );
};
