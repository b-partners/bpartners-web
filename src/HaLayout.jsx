import React from 'react';
import { Layout } from '@react-admin/ra-enterprise';
import { AppLocationContext } from '@react-admin/ra-navigation';

import HaAppBar from './HaAppBar';
import HaMenu from './menu/HaMenu';

function HaLayout(props) {
  return (
    <AppLocationContext>
      <Layout {...props} appBar={HaAppBar} menu={HaMenu} />
    </AppLocationContext>
  );
}

export default HaLayout;
