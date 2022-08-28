import { MultiLevelMenu, MenuItemCategory } from '@react-admin/ra-navigation'
import { AttachMoney, AccountCircle } from '@material-ui/icons'

const HaMenu = () => (
  <MultiLevelMenu variant='categories'>
    <MenuItemCategory to='/profile' name='profile' label='Profil' icon={<AccountCircle />} />
    <MenuItemCategory to='/transactions' name='transactions' label='Transactions' icon={<AttachMoney />} />
  </MultiLevelMenu>
);

export default HaMenu;
