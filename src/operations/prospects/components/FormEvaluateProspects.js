import { useState } from 'react';
import { SelectArrayInput } from 'react-admin';
import { Button, Autocomplete, TextField, Tooltip } from '@mui/material';
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

const newInterventionOptions = ['ALL', 'NEW_PROSPECT', 'OLD_CUSTOMER'];

const FormEvaluateProspects = () => {
  const formState = useForm({ mode: 'all', resolver: prospectConfigResolver, defaultValues: { profession: 'ANTI_HARM', infestationType: 'souris' } });
  const [selectedOption_ArtisanOwner, setSelectedOption_ArtisanOwner] = useState(''); // { name: '' }
  const [selectedOption_newIntervention, setSelectedOption_newIntervention] = useState('NEW_PROSPECT');
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
      newInterventionOption: selectedOption_newIntervention,
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
      newInterventionOption: selectedOption_newIntervention,
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
      <div>
        <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '10px', width: '300px', alignItems: 'center' }} onSubmit={evaluateProspects}>
          <SelectArrayInput
            name='interventionTypes'
            source='Types intervention'
            choices={[
              { id: 'INSECT_CONTROL', name: 'INSECT_CONTROL' },
              { id: 'DISINFECTION', name: 'DISINFECTION' },
              { id: 'RAT_REMOVAL', name: 'RAT_REMOVAL' },
            ]}
            required
          />
          <AutocompleteBackend
            fetcher={fetcher}
            getLabel={accountHolder => (accountHolder ? accountHolder.name : '')}
            label={'Propriétaire artisan'}
            name={'artisanOwner'}
            onChange={handleChange}
            value={selectedOption_ArtisanOwner}
            sync={true}
            isRequired={true}
            sx={{ width: 300, marginBlock: '3px' }}
          />
          <Autocomplete
            options={newInterventionOptions || []}
            value={selectedOption_newIntervention}
            onChange={(event, newValue) => {
              setSelectedOption_newIntervention(newValue);
            }}
            renderInput={params => <TextField required {...params} label={"Nouvelle option d'intervention"} />}
          />
          <Tooltip title="Seule la valeur ANTI_HARM est supportée pour l'instant">
            <span>
              <BpFormField label='Profession' type='text' name='profession' disabled />
            </span>
          </Tooltip>
          <BpFormField label='Nom de la feuille de calcul' type='text' name='spreedSheetName' required />
          <BpFormField label='Nom de la feuille' type='text' name='sheetName' required />
          <BpNumberField label='Nombre minimum de lignes' name='min' required />
          <BpNumberField label='Nombre maximum de lignes' name='max' required />
          <BpNumberField label='Note minimale du client' name='minCustomerRating' required />
          <BpNumberField label='Note minimale des prospects' name='minProspectRating' required />

          <Button mt={2} sx={BP_BUTTON} id='confirmation' type='submit'>
            Évaluer les prospects
          </Button>
        </form>
      </div>
    </FormProvider>
  );
};

export default FormEvaluateProspects;
