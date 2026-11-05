---
name: annotator
description: Expert agent for the Annotator feature — the roof annotation, analysis and measurement screen, now provided by the @bpartners/roof-analyser library. Use when the user asks about, wants to modify, update, debug, or extend anything annotator-related (annotations, polygons, area pictures, roof analysis, CityJSON 3D, measurement tools, LLM results, WMS imagery, or annotator sidebar/forms).
---

# Annotator Feature Skill

The annotator is **no longer implemented in this repository**. It ships as the `@bpartners/roof-analyser`
npm package (source: `/Users/macbook/Documents/work/roof-analyser`, published to the CodeArtifact
`annotator-imagery-store` registry). This repo only mounts it.

The library has two independent flows. **This app uses the lon/lat session flow**: a Leaflet map on WMS
imagery where the roof outline is drawn straight on the photo, with no prospect attached to the record.
Its other flow (the address flow, which is the old pixel-space annotator canvas vendored verbatim) is
kept only as a fallback for legacy drafts — see below.

## What lives here

| File | Role |
|---|---|
| `src/operations/annotator/Annotator.tsx` | The `/projects/:projectId` screen: picks the flow, resolves credentials, renders `<RoofAnnotator>` |
| `src/operations/annotator/use-geo-position.ts` | Geocodes the address of a brand-new session into the position the map locks onto, through the library's own `geocodeAddress` — `setConfig` first, since 0.17.1 takes only `apiUrl`/`accessToken` as call overrides and nothing is mounted yet to have set the config, and waiting on the api key |
| `src/operations/annotator/geo-session.ts` | `readGeoSessionId` — pulls the session id back out of a saved record's `properties.geoSession` |
| `src/operations/annotator/roof-analyser-config.ts` | Maps `process.env.REACT_APP_*` / `LLM_*` variables to the library's `RoofAnalyserConfig`, and `REACT_APP_ROOF_MODEL_MARGIN_M` to `ROOF_MODEL_MARGIN_M` (the `roofModelMarginM` prop, 0.7.0+: meters added around the roof sent to the 3D generation; the library dropped its in-app setting for it, blank keeps its 2 m default). 0.8.0+: `REACT_APP_ROOF_SNAP_TOLERANCE_M` / `REACT_APP_ROOF_SIMPLIFY_TOLERANCE_M` / `REACT_APP_ROOF_NEAR_VERTEX_BLOCK_ENABLED` → `roofSnapToleranceM` / `roofSimplifyToleranceM` / `roofNearVertexBlockEnabled` (debug knobs on the generated roof cleanup; blank keeps the library defaults). All of them are spread into `<RoofAnnotator>` via `ROOF_MODEL_OPTIONS`, only when set. 0.12.0+: `REACT_APP_ROOF_DISABLE_SWITCH_BACK` → `disableSwitchBack`, spread separately via `GEO_SESSION_OPTIONS` (lon/lat flow only: closes the 2D tab for good once the analysis or the 3D generation has run, and drops the 3D screen's way back to the map; blank keeps the library's `false`). 0.17.1 cut `RoofAnalyserConfig` down to `apiUrl`, `geojsonBaseUrl`, the credentials and the account ids — every per-service url key is gone, so only those two variables are mapped here |
| `src/operations/annotator/use-roof-analyser-credentials.ts` | Resolves `apiKey` (`getApiKey`) and `accountId` / `accountHolderId` / `userId` from the cached whoami |

Route: `/projects/:projectId` in `src/security/BpAdmin.tsx` (`CustomRoutes noLayout`).

## Session identity

The library owns saving. A lon/lat session is written continuously into **one annotation record addressed
by a single session id** — `geoRecordIds(sessionId)` derives the area picture, annotation and file ids from
it with uuid v5, so the id is the whole handle on the record. For a new project the app opens that record
itself, right after creating the prospect (see below), so the area picture carries the `prospectId`.
`areaPictureId` defaults to `geoRecordIds(sessionId).areaPictureId` (the app passes the draft's own id
explicitly when reopening from a list).

**0.14.6 turned that contract around.** The library can now open a visit from an address alone:
`<RoofAnnotator address=… />` routes to `GeoAddressRoofAnnotator`, whose `createRoofSession` geocodes,
creates the prospect, the area picture and the draft annotation, and hands the minted id up through
`onSessionIdChange`; `areaPictureId` / `annotationId` / `idAnnotations` are `@deprecated` there. **This
app does not use that path** — it keeps creating the prospect itself (its CRM form, its error dialog, its
step progress) and always passes `sessionId`. The branch is picked in this order: `address || position`
→ `GeoAddressRoofAnnotator`, unless `sessionId` comes with a position → `GeoRoofAnnotator`; `sessionId`
alone → `GeoSessionRoofAnnotator`; `areaPictureId` alone → the legacy address flow. The app only ever
passes `address` together with a position and a `sessionId`, so it still lands on `GeoRoofAnnotator`.

Two ways in, and the route param means a different thing in each:

| Entry | URL | `projectId` is | Props passed |
|---|---|---|---|
| New project (address given) | `/projects/<new uuid>?flow=geo&address=…` | the **session id**, minted by `useMutateProspect` | `sessionId` + `latitude`/`longitude` (geocoded here) + `address` + both resolvers |
| Saved project (from a list) | `/projects/<areaPictureId>` | the **area picture id** of the draft | the page reads the draft, pulls `sessionId` out of `properties.geoSession`, passes `sessionId` + `areaPictureId` + both resolvers — the record supplies the position and the address |
| Opened, never saved (from a list) | `/projects/<areaPictureId>` | the **area picture id** of the draft | the draft only carries `properties.geoSessionId` (set at prospect creation, replaced by the library's first save): the page geocodes the area picture's address and passes it like a new project |
| Legacy draft (no `geoSession`) | `/projects/<areaPictureId>` | the **area picture id** | falls back to the address flow: `areaPictureId` + `idAnnotations`, so pre-migration drafts still open |

Never reintroduce a local save path — auto-save, analyse results, 3D mapping and the PDF export all live
inside the library.

## Entering the screen

- `src/common/fetcher/prospect-queries.tsx` (`useMutateProspect`): creates the prospect, mints a session id,
  then opens its record under `geoRecordIds(sessionId)` — the area picture (with `prospectId`,
  `downloadImage: false`), then a draft annotation with default values (`annotations: []`,
  `properties: { geoSessionId }`) — and navigates with `flow=geo`, handing the library the session id.
- `src/operations/home/project-list-item.tsx` and
  `src/operations/prospects/components/DraftAnnotationItem.tsx`: navigate with the draft's area picture id
  and let the page resolve the session. Geo records created before the app opened them itself carry no
  `prospectId`, so both guard their prospect lookup with `enabled: !!prospectId`.

## Imagery

**The app wires nothing.** Since 0.17.1 the library resolves and fetches its own aerial imagery through
the Dashboard API, and `<RoofAnnotator>` is mounted without `resolveWmsLayers` / `resolveActiveWmsLayer`
— passing either one takes `createImagerySource()` out of the loop entirely, which is what used to send
every cell straight to the GeoServer.

Everything answers under `REACT_APP_BPARTNERS_API_URL`, on the Bearer the library mints from the
account's api key (`POST {apiUrl}/token`, cached per key, renewed on expiry):

- `GET {apiUrl}/map/layers/actual?lat=&lon=` → `{ layer, secureLinkToken }` — the single layer the map
  opens on, and the only call it waits for.
- `GET {apiUrl}/map/layers?lat=&lon=` → `{ layers: [{ layer, reachable }], secureLinkToken }` — the
  slower full list, which only fills the layer switcher; unreachable candidates are shown disabled.
- `GET {apiUrl}/geoserver/wms?…&request=GetMap` — every cell, carrying the `secureLinkToken` as `token=`
  and `expires=` on top of the Bearer.
- `GET {apiUrl}/geodata/geocode?address=…` — an address, which `use-geo-position.ts` calls before the
  annotator mounts.

So no tile and no token ever reaches `geoserver.birdia.fr` directly, and there is no WMS proxy: the
`/wms-proxy` dev-server entry, `REACT_APP_WMS_TILE_BASE_URL` and `GEOSERVER_ORIGIN` are all gone. The
bridge must answer CORS for the app's origin — if cells come back as CORS failures that is a backend
configuration matter, not a reason to reintroduce a proxy.

A refused cell is reported by the library's own error panel (`.geo-error-title`), so the app needs no
probe of its own; the former `checkImagery` went with the resolvers.

## What the app still owns

- Prospect creation (CRM), and opening the new project's record right after it, linked to the prospect.
  The library never re-declares an existing area picture (its PUT is a full replace on the backend, which
  would drop the `prospectId`).
- The drafts list (`src/operations/prospects/DraftAreaPictureAnnotations.tsx`) and its filters.
- The invoice-side read-only annotation info panel:
  `src/operations/invoice/components/AnnotationInfoShow.tsx` +
  `src/operations/invoice/utils/annotation-info.ts` + `use-invoice-annotation.ts`.

## Library features that need no wiring here

Added in 0.14.4–0.14.6 and self-contained — the app renders `<RoofAnnotator>` and gets them:

- **Custom report pages** — `CustomPageEditor` in the export dialog writes extra pages, uploads their
  pictures as attachments through the BPartners API itself (`uploadPageImages`) and keeps them on the
  session, so the couvreur's automatic export carries them too.
- **User-written edge types** on the 3D model (name and colour), kept across regenerations as
  `GeoRoof3DSnapshot.customEdgeTypes`.
- A PDF-in-progress notice in the roofer footer, a texture-loading pill on the model, and the position
  pinned on the pan photo while nothing is drawn.

Exported and unused: `searchAddresses` (BPartners `POST /address/autocomplete`, one `searchId` per field
so a lookup is billed once rather than per keystroke) would fit the prospect form's address input, and
`createRoofSession` duplicates what `useMutateProspect` does today.

## Changing annotator behaviour

Edit the library, not this repo. Rebuild it there, publish (the
**Publish Library to CodeArtifact** workflow), then bump `@bpartners/roof-analyser` here.
The library's own `README.md` documents both flows and every prop.
`src/__tests__/GeoAnnotatorSession.cy.tsx` guards the wiring: it stubs the token exchange, the layer
endpoints and the cells at `**/geoserver/wms?*`, asserts the map stage (`.geo-pans-stage`) mounts on the
geocoded position with a `Bearer` on both the layer call and the cells, and asserts that nothing is
requested from `geoserver.birdia.fr` or `/wms-proxy`. The lon/lat flow no longer draws on Leaflet, and a
refused cell surfaces through the library's own error panel (`.geo-error-title`).
