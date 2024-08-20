import { accountHolderProvider } from '@/providers';
import { FormControlLabel, FormControlLabelProps, FormGroup, Switch } from '@mui/material';
import { FC, useState } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { SubjectToVatSwitchProps } from './types';

export const SubjectToVatSwitch: FC<SubjectToVatSwitchProps> = ({ data }) => {
  const [isLoading, setIsLoading] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();

  const handleChange: FormControlLabelProps['onChange'] = (_event, checked) => {
    const fetch = async () => {
      await accountHolderProvider.saveOrUpdate([{ ...data?.companyInfo, isSubjectToVat: !checked }]);
      refresh();
    };
    setIsLoading(true);
    fetch()
      .catch(() => notify('messages.global.error', { type: 'error' }))
      .finally(() => setIsLoading(false));
  };

  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch disabled={isLoading} checked={!data?.companyInfo?.isSubjectToVat} onChange={handleChange} />}
        label={!data?.companyInfo?.isSubjectToVat ? 'Oui' : 'Non'}
      />
    </FormGroup>
  );
};
