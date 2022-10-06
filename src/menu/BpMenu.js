import { MenuItemCategory, MultiLevelMenu } from '@react-admin/ra-navigation';
import { Euro, AccountCircle, People, Category, Store } from '@material-ui/icons';

const BpMenu = () => {
  return (
    <MultiLevelMenu variant='categories'>
      <MenuItemCategory to='/transactions' name='transactions' label='Mes transactions' icon={<Euro />} />
      <MenuItemCategory to='/customers' name='customers' label='Mes clients' icon={<People />} />
      <MenuItemCategory to='/account' name='account' label='Mon compte' icon={<AccountCircle />} />
      <MenuItemCategory to='/products' name='products' label='Mes Produits' icon={<Category />} />
      <MenuItemCategory to='/marketplaces' name='marketplaces' label='Les marchés' icon={<Store />} />
    </MultiLevelMenu>
  );
};

export default BpMenu;
