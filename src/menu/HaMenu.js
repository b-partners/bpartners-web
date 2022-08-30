// in src/MyMenu.js
import { Menu, DashboardMenuItem, MenuItemLink } from 'react-admin';

import {
  AttachMoney,
  AccountCircle
} from '@material-ui/icons';

const HaMenu = () => (
  <Menu>
    <MenuItemLink to="/profile" primaryText="profile" leftIcon={<AccountCircle />} />
    <MenuItemLink to="/transactions" primaryText="transactions" leftIcon={<AttachMoney />} />
  </Menu>
);


export default HaMenu;
