/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useNotify } from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import { invoiceProvider } from '../../../providers';
import { AUTOCOMPLETE_LIST_LENGTH } from 'src/constants/invoice';
import { AutocompleteBackend } from 'src/common/components';

export const InvoiceSelection = props => {
  const { name, label, sx, invoiceTypes } = props;

  const { setValue } = useFormContext();
  const { invoice, invoiceID: invoiceId } = useWatch();

  const notify = useNotify();

  const getInvoice = invoice => (invoice ? `${invoice.title}` : '');

  const fetcher = async q =>
    await invoiceProvider.getList(1, AUTOCOMPLETE_LIST_LENGTH, {
      invoiceListSearch: q,
      invoiceTypes,
    });

  useEffect(() => {
    if (!invoice && !!invoiceId) {
      invoiceProvider
        .getOne(invoiceId)
        .then(currentInvoice => {
          setValue('invoice', currentInvoice);
        })
        .catch(() => {
          notify(`Une erreur s'est produite`, { type: 'error' });
        });
    }
  }, [invoiceId]);

  const handleChange = value => {
    if (!!value) {
      setValue(name, value);
    }
  };

  return (
    <AutocompleteBackend
      fetcher={fetcher}
      getLabel={getInvoice}
      label={label}
      name={name}
      onChange={handleChange}
      value={invoice}
      error={false}
      sx={{ width: '100%', marginBlock: '3px', ...sx }}
      sync={true}
    />
  );
};
