import { Box, Divider, Typography, Button } from '@mui/material';
import { BpFormField, BpNumberField } from '../../../common/components';
import { BP_BUTTON } from 'src/bp-theme';
import { FormProvider, useForm } from 'react-hook-form';
import { importProspects } from 'src/providers';
import { useNotify } from 'react-admin';

const ImportProspects = () => {
  const formState = useForm({ mode: 'all' });
  const notify = useNotify();

  const handleClickImportProspects = formState.handleSubmit(async values => {
    const structureData = {
      spreadsheetImport: {
        spreadsheetName: values.spreadsheetName,
        sheetName: values.sheetName,
        ranges: {
          min: values.min,
          max: values.max,
        },
      },
    };
    try {
      await importProspects(structureData);
      notify('Prospects importés avec succès', { type: 'success' });
    } catch (error) {
      notify(error?.response?.data?.message, { type: 'error' });
    }
  });

  return (
    <FormProvider {...formState}>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h6'>Importer des prospects dans la base de données depuis Google Sheet</Typography>
        <Divider sx={{ mb: 2 }} />
        <form
          id='importProspectsForm'
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '10px', width: '300px', alignItems: 'center' }}
          onSubmit={handleClickImportProspects}
        >
          <BpFormField label='Nom de la feuille de calcul' type='text' name='spreadsheetName' required />
          <BpFormField label='Nom de la feuille' type='text' name='sheetName' required />
          <BpNumberField label='Nombre minimum de lignes' name='min' required />
          <BpNumberField label='Nombre maximum de lignes' name='max' required />

          <Button mt={2} sx={BP_BUTTON} id='confirmation' type='submit'>
            Importer des prospects
          </Button>
        </form>
      </Box>
    </FormProvider>
  );
};

export default ImportProspects;
