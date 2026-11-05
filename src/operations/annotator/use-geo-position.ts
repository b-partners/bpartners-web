import { GeoPoint, geocodeAddress } from '@bpartners/roof-analyser';
import { useEffect, useState } from 'react';
import { ROOF_ANALYSER_CONFIG } from './roof-analyser-config';

interface GeoPositionState {
  position?: GeoPoint;
  isLoading: boolean;
  error?: Error;
}

/**
 * The library's own geocoder, a bridge on the Dashboard API (`GET {apiUrl}/geodata/geocode`), called
 * before the annotator is mounted — so it is handed the deployment and the session token by hand rather
 * than reading them off a configuration nothing has set yet. `geocodeAddress` takes exactly those two as
 * overrides; `<RoofAnnotator>` sets the same pair as its config once it mounts.
 *
 * The token is waited for rather than read from the cache: it is resolved asynchronously beside this.
 */
export const useGeoPosition = (address?: string, accessToken?: string): GeoPositionState => {
  const [state, setState] = useState<GeoPositionState>({ isLoading: !!address });

  useEffect(() => {
    if (!address) return setState({ isLoading: false });
    if (!accessToken) return setState({ isLoading: true });
    let isActive = true;
    setState({ isLoading: true });
    geocodeAddress({ address, apiUrl: ROOF_ANALYSER_CONFIG.apiUrl, accessToken })
      .then(position => isActive && setState({ position, isLoading: false }))
      .catch(error => isActive && setState({ error, isLoading: false }));
    return () => {
      isActive = false;
    };
  }, [address, accessToken]);

  return state;
};
