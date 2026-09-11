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
| `src/operations/annotator/wms-resolver.ts` | `resolveActiveWmsLayer` + `resolveWmsLayers` + `geocodeAddress` against the GeoData resolver lambda (`REACT_APP_WMS_RESOLVER`, `x-api-key`) |
| `src/operations/annotator/use-geo-position.ts` | Geocodes the address of a brand-new session into the position the map locks onto |
| `src/operations/annotator/geo-session.ts` | `readGeoSessionId` — pulls the session id back out of a saved record's `properties.geoSession` |
| `src/operations/annotator/roof-analyser-config.ts` | Maps `process.env.REACT_APP_*` / `LLM_*` variables to the library's `RoofAnalyserConfig` |
| `src/operations/annotator/use-roof-analyser-credentials.ts` | Resolves `apiKey` (`getApiKey`) and `accountId` / `accountHolderId` / `userId` from the cached whoami |

Route: `/projects/:projectId` in `src/security/BpAdmin.tsx` (`CustomRoutes noLayout`).

## Session identity

The library owns saving. A lon/lat session is written continuously into **one annotation record addressed
by a single session id** — `geoRecordIds(sessionId)` derives the area picture, annotation and file ids from
it with uuid v5, so the id is the whole handle on the record. No prospect is created for it.

Two ways in, and the route param means a different thing in each:

| Entry | URL | `projectId` is | Props passed |
|---|---|---|---|
| New project (address given) | `/projects/<new uuid>?flow=geo&address=…` | the **session id**, minted by `useMutateProspect` | `sessionId` + `latitude`/`longitude` (geocoded here) + `address` + both resolvers |
| Saved project (from a list) | `/projects/<areaPictureId>` | the **area picture id** of the draft | the page reads the draft, pulls `sessionId` out of `properties.geoSession`, passes `sessionId` + both resolvers — the record supplies the position and the address |
| Legacy draft (no `geoSession`) | `/projects/<areaPictureId>` | the **area picture id** | falls back to the address flow: `areaPictureId` + `idAnnotations`, so pre-migration drafts still open |

Never reintroduce a local save path — auto-save, analyse results, 3D mapping and the PDF export all live
inside the library.

## Entering the screen

- `src/common/fetcher/prospect-queries.tsx` (`useMutateProspect`): creates **only the prospect**, mints a
  session id and navigates with `flow=geo`. It no longer creates an area picture or a draft annotation —
  the library creates those under the session-derived ids.
- `src/operations/home/project-list-item.tsx` and
  `src/operations/prospects/components/DraftAnnotationItem.tsx`: navigate with the draft's area picture id
  and let the page resolve the session. Geo records carry no `prospectId`, so both guard their prospect
  lookup with `enabled: !!prospectId`.

## Imagery

Two resolvers, both the integrator's job, both required by `RoofAnnotator` in the lon/lat flow (0.3.0+):

- `resolveActiveWmsLayer` — `GET {REACT_APP_WMS_RESOLVER}/map/layers/actual?lat=&lon=`. The fast half: the
  library waits on it before showing the map. The live endpoint wraps the layer as `{ wmsBaseUrl, layer }`
  (the library playground's own parser reads a bare layer — both are accepted).
- `resolveWmsLayers` — `GET {REACT_APP_WMS_RESOLVER}/map/layers?lat=&lon=` → `{ layers: [{ layer, reachable }] }`.
  The slow half: only feeds the layer switcher; unreachable candidates are shown disabled.

Both authenticate with `x-api-key` (`REACT_APP_WMS_RESOLVER_API_KEY`, falling back to the account's key).
Addresses are geocoded through the same lambda's `/geocode`.

**Tiles never go to the `wmsBaseUrl` the endpoints return.** The library reads each cell with
`fetch` + `createImageBitmap`, which needs a same-origin, CORS-clean url, and the GeoServer sends no CORS
headers. Tiles are built against `REACT_APP_WMS_TILE_BASE_URL`, default `/wms-proxy` — the Vite dev
server's proxy (vite.config.ts) to `GEOSERVER_ORIGIN`, default `http://35.181.83.111`, which serves
tiles with no token. `https://geoserver.birdia.fr` 401s every token tried, prod id and access tokens
included. **A deployed build has no `/wms-proxy`**: it needs a same-origin https proxy and
`REACT_APP_WMS_TILE_BASE_URL` pointed at it.

Each tile still carries `token=` = `bp_access_token` (`getCached.token()`), falling back to a live Amplify
session only when the cache is empty.

A refused cell is a blank square with nothing said, so both resolvers await **one shared probe per
position** (`checkImagery`): it fetches one cell exactly as the library does and throws
`L'imagerie n'a pas pu être chargée (HTTP …)` on a non-2xx or non-image answer — the latter catches a
deployment serving its own `index.html` for a missing proxy. It has to fail both resolvers: the library
opens the map on `/actual` **or**, failing that, on the `/layers` list, and reports an error only when
neither yields a layer.

## What the app still owns

- Prospect creation (CRM). Geo records are **not** linked to a prospect — the library creates the area
  picture itself, without a `prospectId`.
- The drafts list (`src/operations/prospects/DraftAreaPictureAnnotations.tsx`) and its filters.
- The invoice-side read-only annotation info panel:
  `src/operations/invoice/components/AnnotationInfoShow.tsx` +
  `src/operations/invoice/utils/annotation-info.ts` + `use-invoice-annotation.ts`.

## Changing annotator behaviour

Edit the library, not this repo. Rebuild it there, publish (the
**Publish Library to CodeArtifact** workflow), then bump `@bpartners/roof-analyser` here.
The library's own `README.md` documents both flows and every prop.
`src/__tests__/GeoAnnotatorSession.cy.tsx` guards the wiring: it stubs the resolver and asserts the
Leaflet map mounts on the geocoded position.
