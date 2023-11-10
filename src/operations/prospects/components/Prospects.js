import { useEffect, useState } from 'react';
import { useListContext } from 'react-admin';
import { Box, Grid, TextField } from '@mui/material';
import { groupBy } from 'lodash';
import { BPButton } from '../../../common/components/BPButton';
import { ProspectColumn } from './ProspectColumn';
import { EmptyList } from '../../../common/components/EmptyList';

export const Prospects = props => {
  const { toggleDialog } = props;
  const { data, isLoading, setFilters, filterValues } = useListContext();
  const [prospects, setProspects] = useState();

  useEffect(() => {
    data && setProspects(groupBy(sortProspectsByDate(data), 'status'));
  }, [data]);

  if (isLoading) {
    return null;
  }

  function sortProspectsByDate(data) {
    // Sort the prospects by "lastEvaluation" date from most recent to least recent
    return data.sort((a, b) => {
      const dateA = new Date(a?.rating?.lastEvaluation);
      const dateB = new Date(b?.rating?.lastEvaluation);
      return dateB - dateA;
    });
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          data-testid='prospect-filter'
          defaultValue={filterValues.searchName}
          label='Rechercher un prospect'
          onChange={e => setFilters({ searchName: e.target.value }, { searchName: e.target.value }, true)}
        />
        <BPButton label='resources.prospects.add' onClick={toggleDialog} style={{ width: '15rem', height: '3rem' }} />
      </Box>
      {(data || []).length > 0 ? (
        <>
          {prospects ? (
            <Grid container justifyContent='space-between' spacing={2}>
              <ProspectColumn title='À contacter' list={prospects['TO_CONTACT']} color='#005ce6' />
              <ProspectColumn title='Contactés' list={prospects['CONTACTED']} color='#cc0099' />
              <ProspectColumn title='Convertis' list={prospects['CONVERTED']} color='#00cc33' />
            </Grid>
          ) : (
            <EmptyList content='Les données sont en cours de chargement, veuillez patienter.' />
          )}
        </>
      ) : (
        <EmptyList />
      )}
    </Box>
  );
};
