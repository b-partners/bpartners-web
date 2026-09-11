import { DraftAreaPictureAnnotation } from '@bpartners/typescript-client';

const readSnapshot = (draftAnnotation?: DraftAreaPictureAnnotation) => {
  const saved = draftAnnotation?.properties?.geoSession;
  if (!saved) return undefined;
  try {
    return typeof saved === 'string' ? JSON.parse(saved) : saved;
  } catch {
    return undefined;
  }
};

/**
 * A geo session travels inside the annotation record it saves into, under `properties.geoSession`.
 * Its id is the whole handle on that record, so reading it back is what lets a saved project reopen.
 * A record opened at prospect creation carries only `properties.geoSessionId` until the library's first save.
 */
export const readGeoSessionId = (draftAnnotation?: DraftAreaPictureAnnotation): string | undefined =>
  readSnapshot(draftAnnotation)?.sessionId ?? draftAnnotation?.properties?.geoSessionId;

/** Whether the library has saved a session into the record yet: until it has, the record holds no position to reopen on. */
export const hasSavedGeoSession = (draftAnnotation?: DraftAreaPictureAnnotation): boolean => !!readSnapshot(draftAnnotation)?.sessionId;
