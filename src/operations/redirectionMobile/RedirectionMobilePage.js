import { useEffect } from 'react';

const RedirectionMobilePage = () => {
  useEffect(() => {
    window.location.assign('bpartners://');
  }, []);
  return <p style={{ textAlign: 'center' }}>Redirection en cours...</p>;
};

export default RedirectionMobilePage;
