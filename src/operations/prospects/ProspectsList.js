import React from 'react';
import { List, useListContext } from 'react-admin';
import { EmptyList } from 'src/common/components/EmptyList';
import ListComponent from 'src/common/components/ListComponent';

const ProspectsList = () => {
  return (
    <>
      <List pagination={false} component={ListComponent} actions={false}>
        <Prospect />
      </List>
    </>
  );
};

const Prospect = () => {
  const { data, isLoading } = useListContext();

  if (isLoading) {
    return null;
  }

  return (
    <>
      <EmptyList content='Cette section est en cours de développement et sera disponible prochainement.' />
    </>
  );
};

export default ProspectsList;
