import { useState } from 'react';
import { SelectArrayInput } from 'react-admin';
import { Button, Tooltip } from '@mui/material';
import { BP_BUTTON } from 'src/bp-theme';
import { AutocompleteBackend, BpFormField, BpNumberField } from '../../../common/components';
import { FormProvider, useForm } from 'react-hook-form';
import { accountHolderProvider } from 'src/providers';
import { prospectConfigResolver } from 'src/common/resolvers/prospect-config-validator';
import { AUTOCOMPLETE_LIST_LENGTH } from 'src/constants/invoice';
import { prospectingJobsProvider } from 'src/providers/prospecting-jobs-provider';
import { v4 as uuid } from 'uuid';
import { prospectFormMapper } from 'src/providers/mappers/prospect-form-mapper';
import { useProspectContext } from 'src/common/store/prospect-store';
import { SheetNames } from 'src/constants/sheet-names';
import { BpAutoComplete } from 'src/common/components/BpAutoComplete';
import { NewInterventionOptions } from 'src/constants/intervention-types';

const FormEvaluateProspects = () => {
  const formState = useForm({
    mode: 'all',
    resolver: prospectConfigResolver,
    defaultValues: {
      profession: 'ANTI_HARM',
      infestationType: 'souris',
      spreadsheetName: 'Golden source Depa1 Depa 2 - Prospect métier Antinuisibles  Serrurier ',
      newInterventionOption: 'NEW_PROSPECT',
    },
  });
  const [selectedOption_ArtisanOwner, setSelectedOption_ArtisanOwner] = useState('');
  const { getProspectingJobs } = useProspectContext();
  const id = uuid();

  const handleChange = value => {
    if (!!value) {
      setSelectedOption_ArtisanOwner(value);
    }
  };

  const evaluateProspects = formState.handleSubmit(async values => {
    const metadata = {
      ...values,
      jobId: id,
      artisanOwner: selectedOption_ArtisanOwner.id,
      interventionTypes: [values.interventionTypes].toString(),
      min: values.min.toString(),
      max: values.max.toString(),
      minCustomerRating: values.minCustomerRating.toString(),
      minProspectRating: values.minProspectRating.toString(),
    };
    const structureData = {
      ...values,
      jobId: id,
      metadata: metadata,
      artisanOwner: selectedOption_ArtisanOwner.id,
    };

    const newStructuredData = prospectFormMapper(structureData);
    const response = await prospectingJobsProvider.saveOrUpdate(newStructuredData);
    if (response.length > 0) {
      getProspectingJobs();
      formState.reset();
    }
  });

  const fetcher = async EnteredText => {
    return await accountHolderProvider.getList(1, AUTOCOMPLETE_LIST_LENGTH, { name: EnteredText });
  };

  return (
    <FormProvider {...formState}>
      <form
        id='evaluateProspectsForm'
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '10px', width: '300px', alignItems: 'center' }}
        onSubmit={evaluateProspects}
      >
        <AutocompleteBackend
          fetcher={fetcher}
          getLabel={accountHolder => (accountHolder ? accountHolder.name : '')}
          label='resources.prospects.values.artisan'
          name={'artisanOwner'}
          onChange={handleChange}
          value={selectedOption_ArtisanOwner}
          sync={true}
          isRequired={true}
          sx={{ width: 300, marginBlock: '3px' }}
          asForm={false}
        />
        <SelectArrayInput
          name='interventionTypes'
          source='Types intervention'
          choices={[
            { id: 'INSECT_CONTROL', name: 'INSECT_CONTROL' },
            { id: 'DISINFECTION', name: 'DISINFECTION' },
            { id: 'RAT_REMOVAL', name: 'RAT_REMOVAL' },
          ]}
        />
        <BpAutoComplete name='newInterventionOption' label="Nouvelle option d'intervention" options={NewInterventionOptions} />
        <Tooltip title="Seule la valeur ANTI_HARM est supportée pour l'instant">
          <span>
            <BpFormField label='Profession' type='text' name='profession' disabled />
          </span>
        </Tooltip>
        <BpFormField label='Nom de la feuille de calcul' type='text' name='spreadsheetName' />

        <BpAutoComplete name='sheetName' label='Nom de la feuille' options={SheetNames} />
        <BpNumberField label='Nombre minimum de lignes' name='min' />
        <BpNumberField label='Nombre maximum de lignes' name='max' />
        <BpNumberField label='Note minimale du client' name='minCustomerRating' />
        <BpNumberField label='Note minimale des prospects' name='minProspectRating' />

        <Button mt={2} sx={BP_BUTTON} id='evaluateProspectsSubmit' type='submit'>
          Évaluer les prospects
        </Button>
      </form>
    </FormProvider>
  );
};

export default FormEvaluateProspects;
