import { Layout } from '@react-admin/ra-enterprise';
import { AppLocationContext } from '@react-admin/ra-navigation';

import BpAppBar from './BpAppBar';
import BpMenu from './menu/BpMenu';

const BpLayout = props => {
  return (
    <AppLocationContext>
      <Layout {...props} appBar={BpAppBar} menu={BpMenu} />
    </AppLocationContext>
  );
};

export default BpLayout;
