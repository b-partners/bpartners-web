import { Layout } from '@react-admin/ra-enterprise';
import { AppLocationContext } from '@react-admin/ra-navigation';

import BpAppBar from './BpAppBar';
import BpMenu from './menu/BpMenu';

const BpLayout = props => (
  <AppLocationContext>
    <Layout {...props} appBar={BpAppBar} menu={BpMenu} breadcrumb={<></>} />
  </AppLocationContext>
);

export default BpLayout;
