import { MenuItemCategory, MultiLevelMenu } from '@react-admin/ra-navigation';
import { Euro, AccountCircle, People } from '@material-ui/icons';

const BpMenu = () => {
  return (
    <MultiLevelMenu variant='categories'>
      <MenuItemCategory to='/transactions' name='transactions' label='Mes transactions' icon={<Euro />} />
      <MenuItemCategory to='/customers' name='customers' label='Mes clients' icon={<People />} />
      <MenuItemCategory to='/account' name='account' label='Mon compte' icon={<AccountCircle />} />
    </MultiLevelMenu>
  );
};

export default BpMenu;
