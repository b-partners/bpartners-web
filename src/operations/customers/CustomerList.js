import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, TextField as MuiTextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Datagrid, List, TextField, useListContext } from 'react-admin';
import { BPImport } from '../../common/components/BPImport';
import BPListActions from '../../common/components/BPListActions';
import { EmptyList } from '../../common/components/EmptyList';
import ListComponent from '../../common/components/ListComponent';
import Pagination, { pageSize } from '../../common/components/Pagination';
import ArchiveBulkAction from 'src/common/components/ArchiveBulkAction';

const ClientFilter = () => {
  const { setFilters, filterValues } = useListContext();
  const [{ lastName, firstName, email, city, country, phoneNumber }, setFiltersState] = useState({});

  useEffect(() => {
    setFiltersState(filterValues || {});
  }, []);

  const handleChange = event => {
    const value = (event.target.value || '').length !== 0 ? event.target.value : undefined;
    setFiltersState(e => {
      const newFilters = { ...e, [event.target.name]: value };
      setFilters(newFilters);
      return newFilters;
    });
  };

  return (
    <Accordion sx={{ marginBlock: 2 }}>
      <AccordionSummary data-testid='customer-filter-accordion' expandIcon={<ExpandMoreIcon />}>
        Filtres
      </AccordionSummary>
      <AccordionDetails sx={{ display: 'flex', justifyContent: 'space-around' }}>
        <MuiTextField label='Filtrer par nom' size='small' name='lastName' value={lastName} onChange={handleChange} />
        <MuiTextField label='Filtrer par prénom' size='small' name='firstName' value={firstName} onChange={handleChange} />
        <MuiTextField label='Filtrer par email' size='small' name='email' value={email} onChange={handleChange} />
        <MuiTextField label='Filtrer par numéro de téléphone' size='small' type='number' name='phoneNumber' value={phoneNumber} onChange={handleChange} />
        <MuiTextField label='Filtrer par adresse' size='small' name='city' value={city} onChange={handleChange} />
        <MuiTextField label='Filtrer par pays' size='small' name='country' value={country} onChange={handleChange} />
      </AccordionDetails>
    </Accordion>
  );
};

const CustomerList = props => (
  <List
    {...props}
    perPage={pageSize}
    actions={<BPListActions buttons={<ArchiveBulkAction source='lastName ||| firstName' />} importComponent={<BPImport source='customer' />} />}
    resource='customers'
    hasCreate={true}
    hasEdit={false}
    hasList={false}
    hasShow={false}
    component={ListComponent}
    pagination={<Pagination />}
    sx={{
      '& .RaBulkActionsToolbar-toolbar': { display: 'none' },
    }}
  >
    <CustomerGrid />
  </List>
);

const CustomerGrid = () => {
  const { isLoading } = useListContext();

  if (isLoading) return null;

  return (
    <>
      <ClientFilter />
      <Datagrid rowClick='edit' empty={<EmptyList />}>
        <TextField source='lastName' label='Nom' />
        <TextField source='firstName' label='Prénom' />
        <TextField source='email' label='Email' />
        <TextField source='address' label='Adresse' />
        <TextField source='phone' label='Téléphone' />
      </Datagrid>
    </>
  );
};

export default CustomerList;
