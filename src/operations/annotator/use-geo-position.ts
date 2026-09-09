import { GeoPoint } from '@bpartners/roof-analyser';
import { useEffect, useState } from 'react';
import { geocodeAddress } from './wms-resolver';

interface GeoPositionState {
  position?: GeoPoint;
  isLoading: boolean;
  error?: Error;
}

export const useGeoPosition = (address?: string): GeoPositionState => {
  const [state, setState] = useState<GeoPositionState>({ isLoading: !!address });

  useEffect(() => {
    if (!address) return setState({ isLoading: false });
    let isActive = true;
    setState({ isLoading: true });
    geocodeAddress(address)
      .then(position => isActive && setState({ position, isLoading: false }))
      .catch(error => isActive && setState({ error, isLoading: false }));
    return () => {
      isActive = false;
    };
  }, [address]);

  return state;
};
