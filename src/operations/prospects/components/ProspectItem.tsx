import { BP_COLOR } from '@/bp-theme';
import { FlexBox } from '@/common/components';
import { Prospect, ProspectStatus } from '@bpartners/typescript-client';
import { Comment, Edit, LocalPhoneOutlined, LocationOn, LocationOnOutlined, MailOutline, Star, Update } from '@mui/icons-material';
import { Box, Button, Divider, IconButton, Link, Paper, Popover, Stack, Tooltip, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { IconButtonWithTooltip, useNotify, useRefresh } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { FieldErrorMessage } from '../../../common/resolvers';
import { prospectInfoResolver } from '../../../common/resolvers/prospect-info-validator';
import { useProspectContext } from '../../../common/store';
import { getGeoJsonUrl, handleSubmit } from '../../../common/utils';
import { prospectingProvider } from '../../../providers';
import { parseRatingLastEvaluation, parseRatingValue } from '../utils';
import { CardViewField } from './CardViewField';
import { ProspectDialog } from './ProspectDialog';

export const ProspectItem: FC<{ prospect: Prospect }> = ({ prospect }) => {
  const [isProspectDialogOpen, setIsProspectDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { setSelectedStatus } = useProspectContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const { handleLoading } = useProspectContext();

  const toggleDialog = (e?: any, isEditing?: boolean) => {
    e?.stopPropagation();
    setIsProspectDialogOpen(e => !e);
    setIsEditing(isEditing);
    closePopover();
  };

  const openPopover = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const closePopover = () => {
    setAnchorEl(null);
  };

  const changeStatus = (e: any) => {
    const { value } = e.target;
    form.setValue('status', value);
    setSelectedStatus(value);
    toggleDialog(e, false);
  };

  const form = useForm<any>({ mode: 'all', defaultValues: prospect || {}, resolver: prospectInfoResolver });

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
        <Paper elevation={2} sx={{ p: 2, borderRadius: '12px', bgcolor: prospect?.contactNature === 'OLD_CUSTOMER' ? '#dceeff' : '', transition: 'linear 0s' }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Typography sx={{ fontWeight: 'bold', textTransform: 'uppercase' }} variant='subtitle1'>
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
              <IconButtonWithTooltip
                label='Modifier'
                sx={{ color: BP_COLOR['5'] }}
                data-testid={`edit-${prospect.id}`}
                aria-describedby={id}
                onClick={openPopover}
              >
                <Edit />
              </IconButtonWithTooltip>
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
          <FlexBox
            sx={{
              gap: '5px',
              color: '#4d4d4d',
              flexDirection: 'column',
              alignItems: 'start',
              justifyContent: 'start',
            }}
          >
            <CardViewField icon={<LocationOnOutlined sx={{ color: 'blue !important' }} />} value={prospect.address} />
            <CardViewField icon={<MailOutline />} value={prospect.email} />
            <CardViewField icon={<LocalPhoneOutlined />} value={prospect.phone} />
            <CardViewField icon={<Comment />} value={prospect.comment ? prospect.comment : prospect.defaultComment} />
            <CardViewField icon={<Star />} value={parseRatingValue(prospect?.rating?.value)} />
            <CardViewField
              icon={<Update />}
              value={prospect?.rating?.lastEvaluation === null ? 'Non renseigné' : parseRatingLastEvaluation(prospect?.rating?.lastEvaluation as any)}
            />
          </FlexBox>
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

const changeStatusButtons = (status: ProspectStatus, changeStatus: any) => {
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
