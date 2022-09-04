import { MenuItemCategory, MultiLevelMenu } from '@react-admin/ra-navigation';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { AttachMoney } from '@material-ui/icons';

const BpMenu = () => {
  return (
    <MultiLevelMenu variant='categories'>
      <MenuItemCategory to='/transactions' name='transactions' label='Mes transactions' icon={<AttachMoney />} />
      <MenuItemCategory to='/account' name='account' label='Mon compte' icon={<AccountCircleIcon />} />
    </MultiLevelMenu>
  );
};

export default BpMenu;
