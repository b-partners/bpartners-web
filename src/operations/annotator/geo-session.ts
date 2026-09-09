import { DraftAreaPictureAnnotation } from '@bpartners/typescript-client';

/**
 * A geo session travels inside the annotation record it saves into, under `properties.geoSession`.
 * Its id is the whole handle on that record, so reading it back is what lets a saved project reopen.
 */
export const readGeoSessionId = (draftAnnotation?: DraftAreaPictureAnnotation): string | undefined => {
  const saved = draftAnnotation?.properties?.geoSession;
  if (!saved) return undefined;
  try {
    const snapshot = typeof saved === 'string' ? JSON.parse(saved) : saved;
    return snapshot?.sessionId;
  } catch {
    return undefined;
  }
};
