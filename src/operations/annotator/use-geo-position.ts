import { GeoPoint, geocodeAddress, setConfig } from '@bpartners/roof-analyser';
import { useEffect, useState } from 'react';
import { ROOF_ANALYSER_CONFIG } from './roof-analyser-config';

interface GeoPositionState {
  position?: GeoPoint;
  isLoading: boolean;
  error?: Error;
}

/**
 * The library's own geocoder, now a bridge on the Dashboard API (`GET {apiUrl}/geodata/geocode` since
 * 0.17.1), called before the annotator is mounted — so the configuration is set by hand here rather than
 * passed to the call. `geocodeAddress` takes only `apiUrl` and `accessToken` as overrides since 0.17.1, so
 * the api key reaches it no other way than through the stored config, which the library refuses to resolve
 * without one. `<RoofAnnotator>` sets that config from its own props once it mounts, to the same values.
 *
 * The key is waited for rather than read from the cache: it is resolved asynchronously beside this, and the
 * library exchanges it for the bridge token itself.
 */
export const useGeoPosition = (address?: string, apiKey?: string): GeoPositionState => {
  const [state, setState] = useState<GeoPositionState>({ isLoading: !!address });

  useEffect(() => {
    if (!address) return setState({ isLoading: false });
    if (!apiKey) return setState({ isLoading: true });
    let isActive = true;
    setState({ isLoading: true });
    setConfig({ ...ROOF_ANALYSER_CONFIG, apiKey });
    geocodeAddress({ address })
      .then(position => isActive && setState({ position, isLoading: false }))
      .catch(error => isActive && setState({ error, isLoading: false }));
    return () => {
      isActive = false;
    };
  }, [address, apiKey]);

  return state;
};
