import { Box, Dialog, DialogContent, DialogTitle, FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup, Typography } from '@mui/material';

import PropTypes from 'prop-types';
import { useFormContext, useWatch } from 'react-hook-form';
import { BpFormField, BpNumberField } from '../../../common/components';
import { handleSubmit } from '../../../common/utils';
import { InvoiceSelection } from './InvoiceSelection';
import ProspectDialogActions from './ProspectDialogActions';

const getDialogTitle = (prospectName, isCreating) => {
  return isCreating ? "Renseignez l'adresse de votre prospect ou votre client et analysez les images haute résolution de sa toiture." : `Prospect : ${prospectName}`;
}

export const ProspectDialog = props => {
  const { open, close, prospect = {}, saveOrUpdateProspectSubmit, isEditing, isCreating } = props;
  const { name, status, comment } = prospect;

  const {
    setValue,
    formState: { errors },
  } = useFormContext();

  const changeProspectFeedBack = e => {
    const { value } = e.target;
    setValue('prospectFeedback', value);
  };

  const { prospectFeedback } = useWatch();

  return (
    <Dialog open={open} onClose={close}>
      <DialogTitle>
        <Typography>{getDialogTitle(name, isCreating)}</Typography>
      </DialogTitle>
      <DialogContent>
        <BpFormField required style={{ width: '100%' }} name='address' label='Adresse' />
        <BpFormField required style={{ width: '100%' }} name='name' label='Nom du prospect' />
        <BpFormField required={false} shouldValidate={false} style={{ width: '100%' }} name='firstName' label='Prénom du prospect' />
        <BpFormField required={false} shouldValidate={false} style={{ width: '100%' }} name='email' type='email' label='Email' />
        <BpFormField required={false} shouldValidate={false} style={{ width: '100%' }} name='phone' label='Téléphone' />
        <BpFormField required={false} shouldValidate={false} multiline rows={4} style={{ width: '100%' }} name={comment ? 'comment' : 'defaultComment'} label='Commentaire' />
        {(!isEditing && !isCreating) && (
          <Box>
            <FormControl>
              <RadioGroup
                name='prospectFeedback'
                required
                sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }}
                onChange={handleSubmit(changeProspectFeedBack)}
                value={prospectFeedback}
              >
                {status === 'TO_CONTACT' ? (
                  <>
                    <FormControlLabel value='NOT_INTERESTED' control={<Radio size='small' />} label='Pas intéressé' sx={{ marginRight: '20px' }} />
                    <FormControlLabel value='INTERESTED' control={<Radio size='small' />} label='Intéressé' sx={{ marginRight: '20px' }} />
                    <FormControlLabel value='PROPOSAL_SENT' control={<Radio size='small' />} label='Devis envoyé' sx={{ marginRight: '20px' }} />
                  </>
                ) : (
                  <>
                    <FormControlLabel value='PROPOSAL_ACCEPTED' control={<Radio size='small' />} label='Devis accepté' sx={{ marginRight: '20px' }} />
                    <FormControlLabel value='PROPOSAL_DECLINED' control={<Radio size='small' />} label='Devis refusé' sx={{ marginRight: '20px' }} />
                    <FormControlLabel value='INVOICE_SENT' control={<Radio size='small' />} label='Facture envoyée' sx={{ marginRight: '20px' }} />
                  </>
                )}
              </RadioGroup>
              {errors['prospectFeedback'] && <FormHelperText error>{errors['prospectFeedback'].message}</FormHelperText>}
            </FormControl>
          </Box>
        )}
        {
          !isCreating && (
            <>
              {
                status === 'TO_CONTACT' ? (
                  <InvoiceSelection name='invoice' label={'resources.invoices.status.proposal'} invoiceTypes={['DRAFT']} />
                ) : (
                  <InvoiceSelection name='invoice' label='resources.invoices.status.confirmed' invoiceTypes={['CONFIRMED', 'PAID']} />
                )
              }
              <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: 1 }}>
                {status === 'TO_CONTACT' ? (
                  <>
                    <Typography sx={{ marginRight: 4 }}>
                      Optionel <br />
                      Valeur potentielle du contrat en €
                    </Typography>
                    <BpNumberField style={{ width: '45%' }} name='contractAmount' label='Montant' />
                  </>
                ) : (
                  <>
                    <Typography sx={{ marginRight: 4 }}>
                      Obligatoire <br />
                      Valeur potentielle du contrat en €
                    </Typography>
                    <BpNumberField style={{ width: '45%' }} name='contractAmount' label='Montant' required />
                  </>
                )}
              </Box>
            </>
          )
        }
      </DialogContent>
      <ProspectDialogActions
        prospectStatus={status}
        close={close}
        saveOrUpdateProspectSubmit={saveOrUpdateProspectSubmit}
        isEditing={isEditing}
        isCreating={isCreating}
      />
    </Dialog>
  );
};
ProspectDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  name: PropTypes.string,
  status: PropTypes.string,
  comment: PropTypes.string,
  saveOrUpdateProspectSubmit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  isCreating: PropTypes.bool,
};
