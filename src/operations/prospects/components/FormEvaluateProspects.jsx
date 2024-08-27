import { BpAutoComplete } from '@/common/components/BpAutoComplete';
import { prospectConfigResolver } from '@/common/resolvers/prospect-config-validator';
import { useProspectContext } from '@/common/store';
import { NewInterventionOptions } from '@/constants/intervention-types';
import { AUTOCOMPLETE_LIST_LENGTH } from '@/constants/invoice';
import { SheetNames } from '@/constants/sheet-names';
import { accountHolderProvider } from '@/providers';
import { prospectFormMapper } from '@/providers/mappers/prospect-form-mapper';
import { prospectingJobsProvider } from '@/providers/prospecting-jobs-provider';
import { Button, Tooltip } from '@mui/material';
import { useState } from 'react';
import { SelectArrayInput } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { v4 as uuid } from 'uuid';
import { AutocompleteBackend, BpFormField, BpNumberField } from '../../../common/components';

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
    if (value) {
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
        <Button mt={2} id='evaluateProspectsSubmit' type='submit'>
          Évaluer les prospects
        </Button>
      </form>
    </FormProvider>
  );
};

export default FormEvaluateProspects;
