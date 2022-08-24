import { MenuItemCategory, MultiLevelMenu } from '@react-admin/ra-navigation';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { AttachMoney } from '@material-ui/icons';

const HaMenu = () => {
  return (
    <MultiLevelMenu variant='categories'>
      <MenuItemCategory to='/transactions' name='transactions' label='Mes transactions' icon={<AttachMoney />} />
      <MenuItemCategory to='/profile' name='profile' label='Mon profil' icon={<AccountCircleIcon />} />
    </MultiLevelMenu>
  );
};

export default HaMenu;
