import { useState } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { useProspectContext } from '../../../common/store/prospect-store';
import { prospectInfoResolver } from '../../../common/resolvers/prospect-info-validator';
import { FieldErrorMessage } from '../../../common/resolvers';
import { prospectingProvider } from '../../../providers';
import { getGeoJsonUrl, handleSubmit } from '../../../common/utils';
import { Box, FormControl, FormControlLabel, IconButton, Link, Paper, Popover, Radio, RadioGroup, Stack, Tooltip, Typography } from '@mui/material';
import { Comment, Edit, Home, LocalPhoneOutlined, LocationOn, MailOutline, MoreVert, Star, Update } from '@mui/icons-material';
import { CardViewField } from './CardViewField';
import { parseRatingLastEvaluation, parseRatingValue } from '../utils';
import { ProspectDialog } from './ProspectDialog';
import PropTypes from 'prop-types';
import { Prospect } from 'bpartners-react-client';

export const ProspectItem = ({ prospect }) => {
  const [dialogState, setDialogState] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { setSelectedStatus } = useProspectContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const { handleLoading } = useProspectContext();

  const toggleDialog = (e, isEditing) => {
    e?.stopPropagation();
    setDialogState(e => !e);
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

  if (!prospect.location && !prospect.name && !prospect.email) {
    return null;
  }

  return (
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(saveOrUpdateProspectSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
          <Paper elevation={2} sx={{ p: 1 }}>
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
                <Tooltip title='Modifier le status'>
                  <IconButton data-testid={`status${prospect.id}`} aria-describedby={id} component='span' onClick={openPopover}>
                    <MoreVert fontSize='small' />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Modifier le prospect'>
                  <IconButton data-testid={`edit${prospect.id}`} aria-describedby={id} component='span' onClick={e => toggleDialog(e, true)}>
                    <Edit fontSize='small' />
                  </IconButton>
                </Tooltip>
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
                  <Box sx={{ m: 2 }}>
                    <FormControl>
                      <RadioGroup defaultValue={prospect.status} name='status' onChange={handleSubmit(changeStatus)}>
                        <FormControlLabel value='TO_CONTACT' control={<Radio size='small' />} label='À contacter' />
                        <FormControlLabel value='CONTACTED' control={<Radio size='small' />} label='Contacté' />
                        <FormControlLabel value='CONVERTED' control={<Radio size='small' />} label='Converti' />
                      </RadioGroup>
                    </FormControl>
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
              <CardViewField icon={<Update />} value={parseRatingLastEvaluation(prospect?.rating?.lastEvaluation)} />
            </Box>
            {dialogState && (
                <ProspectDialog
                    open={dialogState}
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
