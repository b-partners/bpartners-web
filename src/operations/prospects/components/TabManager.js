import { useCallback, useEffect } from 'react';

const TabManager = ({ location, setTabIndex }) => {
  // Utilise useCallback pour déclarer la fonction en tant que dépendance stable
  const getTabIndexFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const tabValue = params.get('tab');
    if (tabValue === 'prospects') {
      return 0;
    } else if (tabValue === 'configuration') {
      return 1;
    } else if (tabValue === 'administration') {
      return 2;
    } else {
      return 0;
    }
  }, [location.search]);

  // Mettre à jour le tabIndex initial lors du chargement de la page
  useEffect(() => {
    setTabIndex(getTabIndexFromURL());
  }, [getTabIndexFromURL, setTabIndex]);

  return null;
};

export default TabManager;
