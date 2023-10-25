import { Box, Divider, Typography, Button, CircularProgress } from '@mui/material';
import { BpFormField, BpNumberField } from '../../../common/components';
import { BP_BUTTON } from 'src/bp-theme';
import { FormProvider, useForm } from 'react-hook-form';
import { importProspects } from 'src/providers';
import { useNotify } from 'react-admin';
import { importProspectsResolver } from 'src/common/resolvers/prospect-config-validator';
import { useState } from 'react';
import { SheetNames } from 'src/constants/sheet-names';
import { BpAutoComplete } from 'src/common/components/BpAutoComplete';

const ImportProspects = () => {
  const formState = useForm({
    mode: 'all',
    resolver: importProspectsResolver,
    defaultValues: { import_spreadsheetName: 'Golden source Depa1 Depa 2 - Prospect métier Antinuisibles  Serrurier ' },
  });
  const notify = useNotify();
  const [isLoading, setIsLoading] = useState();

  const handleClickImportProspects = formState.handleSubmit(async values => {
    setIsLoading(true);
    const structureData = {
      spreadsheetImport: {
        spreadsheetName: values.import_spreadsheetName,
        sheetName: values.import_sheetName,
        ranges: {
          min: values.import_min,
          max: values.import_max,
        },
      },
    };
    try {
      await importProspects(structureData);
      notify('resources.prospects.import.success', { type: 'success' });
    } catch (error) {
      notify(error?.response?.data?.message, { type: 'error' });
    } finally {
      setIsLoading(false);
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
          <BpFormField label='Nom de la feuille de calcul' type='text' name='import_spreadsheetName' required />
          {/* <BpFormField label='Nom de la feuille' type='text' name='import_sheetName' required /> */}
          <BpAutoComplete name='import_sheetName' label='Nom de la feuille' options={SheetNames} />
          <BpNumberField label='Nombre minimum de lignes' name='import_min' required />
          <BpNumberField label='Nombre maximum de lignes' name='import_max' required />

          <Button
            mt={2}
            sx={BP_BUTTON}
            id='importProspectsSubmit'
            type='submit'
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress color='inherit' size={18} />}
          >
            Importer des prospects
          </Button>
        </form>
      </Box>
    </FormProvider>
  );
};

export default ImportProspects;
