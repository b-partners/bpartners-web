import { GeoPoint, geocodeAddress } from '@bpartners/roof-analyser';
import { useEffect, useState } from 'react';
import { ROOF_ANALYSER_CONFIG } from './roof-analyser-config';

interface GeoPositionState {
  position?: GeoPoint;
  isLoading: boolean;
  error?: Error;
}

/**
 * The library's own geocoder since 0.14.6, called before the annotator is mounted — so it is handed the
 * configuration by hand, `geocodeApiUrl` / `geocodeApiKey` included. The api key is waited for rather than
 * read from the cache: it is resolved asynchronously beside this, and a blank one is what the geocoder
 * falls back on when no `geocodeApiKey` is configured.
 */
export const useGeoPosition = (address?: string, apiKey?: string): GeoPositionState => {
  const [state, setState] = useState<GeoPositionState>({ isLoading: !!address });

  useEffect(() => {
    if (!address) return setState({ isLoading: false });
    if (!apiKey) return setState({ isLoading: true });
    let isActive = true;
    setState({ isLoading: true });
    geocodeAddress({ address, ...ROOF_ANALYSER_CONFIG, apiKey })
      .then(position => isActive && setState({ position, isLoading: false }))
      .catch(error => isActive && setState({ error, isLoading: false }));
    return () => {
      isActive = false;
    };
  }, [address, apiKey]);

  return state;
};
