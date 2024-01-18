import { useEffect } from 'react';
import { getUrlParams } from 'src/common/utils';

const RedirectionMobilePage = () => {
  useEffect(() => {
    const code = getUrlParams(window.location.search, 'code');
    window.location.assign(`bpartners://?code=${code}`);
  }, []);
  return <p style={{ textAlign: 'center' }}>Redirection en cours...</p>;
};

export default RedirectionMobilePage;
