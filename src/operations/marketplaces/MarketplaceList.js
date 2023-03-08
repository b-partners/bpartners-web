import { Box, Card, CardContent, CardHeader, Paper, Typography } from '@mui/material';
import { useGetList } from 'ra-core';
import { MARKETPLACE } from './style';
import { groupBy } from 'lodash';
import { useEffect, useState } from 'react';
import { EmptyList } from 'src/common/components/EmptyList';

const MarketplaceList = () => {
  const [prospectList, setProspectList] = useState(null);
  const { data } = useGetList('prospects');

  useEffect(() => {
    // regroup data by [ TO_CONTACT, CONTACTED, CONVERTED ]
    data && setProspectList(groupBy(data, 'status'));
  }, [data]);

  return data && data.length > 0 ? (
    <Box sx={MARKETPLACE.LAYOUT}>
      <ProspectList label='À contacter' prospects={prospectList && prospectList.TO_CONTACT} />
      <ProspectList label='Contacté' prospects={prospectList && prospectList.CONTACTED} />
      <ProspectList label='Converti' prospects={prospectList && prospectList.CONVERTED} />{' '}
    </Box>
  ) : (
    <EmptyList />
  );
};

const ProspectList = props => {
  const { prospects, label } = props;
  const dataTestId = `${label}_prospect_list`;

  return (
    <Card data-testid={dataTestId} sx={MARKETPLACE.LIST}>
      <CardHeader title={label} />
      <CardContent sx={MARKETPLACE.LIST_CONTENT}>
        {(prospects || []).map(prospect => (
          <ProspectItem prospect={prospect} />
        ))}
      </CardContent>
    </Card>
  );
};

const ProspectItem = props => {
  const {
    prospect: { name, email, phone, location },
  } = props;

  return (
    <Card elevation={0}>
      <CardHeader title={name} />
      <CardContent>
        <Typography>{email}</Typography>
        <Typography>{phone}</Typography>
        <Typography>{location}</Typography>
      </CardContent>
    </Card>
  );
};

export default MarketplaceList;
