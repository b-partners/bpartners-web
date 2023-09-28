import { Box, Dialog, DialogContent, DialogTitle, FormControl, FormControlLabel, Radio, RadioGroup, Typography, FormHelperText } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { BpFormField, BpNumberField } from '../../../common/components';
import { handleSubmit } from '../../../common/utils';
import ProspectDialogActions from './ProspectDialogActions';
import { InvoiceSelection } from './InvoiceSelection';

export const ProspectDialog = props => {
  const {
    open,
    close,
    prospect: { name, status },
    saveOrUpdateProspectSubmit,
    selectedStatus,
  } = props;

  const {
    setValue,
    formState: { errors },
  } = useFormContext();
  const { prospectFeedback } = useWatch();
  const changeProspectFeedBack = e => {
    const { value } = e.target;
    setValue('prospectFeedback', value);
  };

  return (
    <Dialog open={open} onClose={close}>
      <DialogTitle>
        <Typography>Prospect : {name}</Typography>
      </DialogTitle>
      <DialogContent>
        <BpFormField style={{ width: '100%' }} name='email' type='email' label='Email' />
        <BpFormField style={{ width: '100%' }} name='phone' label='Téléphone' />
        <BpFormField style={{ width: '100%' }} name='address' label='Adresse' />
        <BpFormField style={{ width: '100%' }} name='name' label='Nom du prospect' />
        <BpFormField multiline rows={4} style={{ width: '100%' }} name='comment' label='Commentaire' />
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
        {status === 'TO_CONTACT' ? (
          <InvoiceSelection name='invoice' label='Devis' invoiceTypes={['DRAFT']} />
        ) : (
          <InvoiceSelection name='invoice' label='Factures' invoiceTypes={['CONFIRMED', 'PAID']} />
        )}
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
      </DialogContent>
      <ProspectDialogActions
        prospectStatus={status}
        close={close}
        prospectFeedback={prospectFeedback}
        saveOrUpdateProspectSubmit={saveOrUpdateProspectSubmit}
        selectedStatus={selectedStatus}
      />
    </Dialog>
  );
};
