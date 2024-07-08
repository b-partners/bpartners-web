import { Layout } from '@react-admin/ra-enterprise';
import { AppLocationContext } from '@react-admin/ra-navigation';
import BPErrorPage from './BPErrorPage';

import BpMenu from '../../menu/BpMenu';
import BPAppBar from './BPAppBar';

const BPLayout = props => (
  <AppLocationContext>
    <Layout {...props} appBar={BPAppBar} menu={BpMenu} error={BPErrorPage} breadcrumb={<></>} />
  </AppLocationContext>
);

export default BPLayout;
