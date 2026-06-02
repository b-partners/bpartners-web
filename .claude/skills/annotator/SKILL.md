---
name: annotator
description: Expert agent for the Annotator feature — the 2D/3D roof annotation, analysis, and measurement module. Use when the user asks about, wants to modify, update, debug, or extend any annotator-related code (annotations, polygons, area pictures, roof analysis, CityJSON 3D, measurement tools, LLM results, or annotator sidebar/forms).
---

# Annotator Feature Skill

Deep knowledge base for the Annotator module. Use this skill to make precise changes without breaking the tightly coupled annotation pipeline.

## Feature Overview

The Annotator is a full-page tool for drawing 2D polygon annotations on aerial/satellite images, running AI-powered roof analysis, and visualizing results in 3D via CityJSON. It supports measurement, export, and multi-surface classification.

## Architecture Map

### Entry Points & Routing

| Route | Component | Layout |
|---|---|---|
| `/annotator` | `Annotator.tsx` | Full page, no sidebar |
| `/projects/:projectId` | `Annotator.tsx` | Full page, no sidebar |
| `/projects` | `DraftAreaPictureAnnotations` | List view |

Routes are defined in `src/security/BpAdmin.tsx`.

### Core Components (src/operations/annotator/)

```
Annotator.tsx                          # Router/entry: fetches area picture, loads polygons, orchestrates sub-components
├── AnnotatorComponent.tsx             # Canvas wrapper: renders @bpartners/annotator-component + 3D mode
│   ├── <AnnotatorCanvas>             # External lib: polygon drawing/editing on image
│   └── <Annotator3D>                 # 3D CityJSON viewer (React Three Fiber)
├── SideBar.tsx                        # Right panel: annotation form list
│   ├── AnnotatorFormItem             # Manual annotation form per polygon
│   └── AnnotatorFormResultItem       # AI analysis result form per polygon
├── ScreenSwitchTabs                   # Toggle: annotator | 3d-annotator | llm | roof-analyse
├── SaveStatus                         # Auto-save indicator
└── AddressTopBar / ImageOptionTopBar  # Top bars for address & image layers
```

### 3D Renderer (src/operations/annotator/components/3d-renderer/)

```
annotator-3d.tsx                       # <Canvas> from R3F, loads CityJSON
├── city-scene.tsx                     # Renders CityJSON meshes
├── annotator-3d-raycaster.tsx         # Mouse picking / surface selection
├── annotator-3d-infos.tsx             # Info panel overlay
├── point-measure-line.tsx             # Point-to-point measurement
├── polygon-measure-line.tsx           # Perimeter measurement
├── face-measure-labels.tsx            # Labels on 3D faces
├── 3d-select-dialog.tsx               # Surface selection modal
├── roof-surfaces-list.tsx             # Detected roof surfaces list
├── annotator-3d-save-button.tsx       # Save 3D annotations
├── annotator-3d-save-image.tsx        # Export 3D as image
├── annotator-3d-switch-button.tsx     # Toggle 2D/3D
├── annotator-3d-regenerate-button.tsx # Regenerate CityJSON
└── annotator-3d-error.tsx             # Error boundary for 3D
```

### Loading Animations (src/operations/annotator/components/loading/)

```
llm-loading.tsx        # LLM analysis spinner
roof-analyse.tsx       # Roof analysis animation
earth-loading.tsx      # Globe loading
house-animation.tsx    # House 3D animation
step-loading.tsx       # Multi-step progress
3d-animation.tsx       # Animation framework
3d-geometry.ts         # Three.js geometry helpers
3d-particles.ts        # Particle system
3d-textures.ts         # Texture management
3d-easing.tsx          # Easing functions
3d-constants.ts        # Animation constants
```

### Sub-components (src/operations/annotator/components/)

```
AnnotatorForm.tsx                      # Form for single annotation
AnnotatorActionButtons.tsx             # Back, save, reset buttons
AnnotatorResetConfirmationDialog.tsx   # Reset confirmation modal
AnnotationInfoShow.tsx                 # Read-only annotation details
ExportAnnotationConfirmButton.tsx      # Export button
RefocusImageButton.tsx                 # Reset image focus
save-annotations-button.tsx            # Save trigger
analyse-result-button.tsx              # Show analysis results
llm-result.tsx                         # LLM result display
llm-switch-button.tsx                  # Toggle LLM mode
annotator-form-item.tsx                # Individual annotation form
annotator-form-result-item.tsx         # Analysis result form item
annotator-measurement-2d.tsx           # 2D measurement display
annotation-item-label-type-select.tsx  # Label type selector
annotation-slope-height-alert.tsx      # Slope/height alert
address-top-bar.tsx                    # Address display bar
image-option-top-bar.tsx               # Image layer toggle
annotator-shift-buttons.tsx            # Shift image position
disclaimer.tsx                         # Legal disclaimer
free-autocomplete-input.tsx            # Autocomplete input field
```

## State Management — Zustand Stores (src/common/store/)

### annotator-store.ts — Central annotation state
- `useAnnotatorStore`: Full state (annotations record, polygonToShowMeasurement, threeDFromSegmentation, threeDGenerationId, roofAnalyseId)
- `usePolygonStore`: Polygon list getter/setter
- `useOneAnnotatorStore`: Single annotation data
- `useAnnotatorInfoStore`: All annotation info list
- `useOneAnnotationStore`: Single annotation with update methods

State shape: `annotations: Record<id, { polygon, annotationInfos, isFirst }>`

### annotator-component-store.ts — Component-level state
- `useAnnotatorComponentStore`: roofSlope, imageUrl, geoJsonResultUrl, areaPictureDetails, slopeAndHeightState, llm, globalRate, roofAnalyseProperties, roofDelimiter, imageTileInfoOrigin

### annotator-3d-store.ts — 3D mode state
- `useAnnotator3DStore`: selectedObject, selectedObjectInfo, shouldSelectSurface, cityJsonModel, imageUrl (File), regenerateVersion

### annotator-switch-store.ts — Screen mode
- `useAnnotatorScreenSwitch`: screen ('llm' | 'annotator' | '3d-annotator' | 'roof-analyse'), threeDMode ('pan' | 'roof')

### annotator-component-form-item-store.ts — Form item state
- `useAnnotatorComponentFormItemStore`: annotatorSidebarAccordionItem (number)

## Data Fetching — React Query (src/common/fetcher/)

| Hook | File | Purpose |
|---|---|---|
| `useAnnotatorImageUploadQuery` | annotator-image-query.ts | Upload image as base64 |
| `useAnnotatorExportPdf` | annotator-export-pdf.ts | Export annotations as PDF |
| `useSaveAnnotations` | save-annotations.ts | Save annotations mutation |
| `useAreaPictureDetailsFetcher` | area-picture-details-fetcher.ts | Fetch area picture details |
| `usePolygonMarkerFetcher` | polygon-marker-fetcher.ts | Get marker position |
| `useCitJSONProcessQuery` | city-json-fetcher.ts | Convert roof polygon → CityJSON |
| `usePolygonMeasurement` | polygon-measurement.ts | Polygon measurement data |
| `usePolygonAreaQueries` | polygon-area-queries.ts | Calculate polygon area |
| `useInitRoofAnalyseQuery` | roof-analyse-queries.tsx | Init roof analysis |
| `useRoofAnalyseQuery` | roof-analyse-queries.tsx | Run roof analysis mutation |
| `useSlopeAndHeightQuery` | slope-and-height-queries.ts | Slope & height calculation |
| `useVggResultQuery` | vgg-result-query.ts | VGG segmentation results |
| `useGeojsonQueryResult` | (in annotator utils) | GeoJSON analysis results |

## Providers (src/providers/)

| Provider | Purpose |
|---|---|
| `annotator-provider.ts` | API wrapper: getPictureFormAddress, getAreaPictureById, annotatePicture, pointsToGeoPoints, geoPointsToPoins |
| `area-picture-provider.ts` | Area picture CRUD |
| `polygon-converter-provider.ts` | Polygon format conversion |
| `draft-area-annotations-provider.ts` | Draft annotations CRUD |
| `city-json-provider.ts` | CityJSON generation API |

## Mappers (src/providers/mappers/)

| Mapper | Purpose |
|---|---|
| `annotator-mapper.ts` | API response → annotation format |
| `area-picture-annotation-mapper.ts` | API response → Polygon + AnnotationInfo (`areaPictureAnnotationToPolygonAndAreaPictureInfo`) |
| `polygon-mapper.ts` | Pixel ↔ GeoJSON coordinate mapping |
| `geojson-mapper.ts` | GeoJSON format conversion |
| `roof-analyse-mapper.ts` | Roof analysis result mapping |

## Utilities (src/operations/annotator/utils/)

| Utility | Purpose |
|---|---|
| `annotation-colors.ts` | Color mapping for annotation types |
| `annotation-info-mapper.ts` | Map API response to UI info format |
| `annotation-info-translator.ts` | Translate annotation field labels |
| `annotations-info-form.ts` | Form schema for annotations |
| `city-json-mapper.ts` | CityJSON → exportable format |
| `create-roof-polygon.ts` | Generate default roof polygon |
| `export-annotation-mapper.ts` | Map annotations for export |
| `get-areapicture-shift-for-zoom.ts` | Calculate image shift by zoom level |
| `global-rate-calculator.ts` | Calculate overall roof rating |
| `image-utilities.ts` | Image processing helpers |
| `is-after-analyse.ts` | Check if analysis completed |
| `is-roof-polygon.ts` | Identify roof polygons |
| `llm-result-queries.ts` | LLM result query hooks |
| `measurement-mapper.ts` | Map measurements for display |
| `refresh-image-url.ts` | Update image URL |
| `segment-utilities.ts` | Polygon & segment calculations |
| `shift-polygons.ts` | Adjust polygon positions after zoom/shift |
| `use-crop-polygon.ts` | Crop polygon hook |
| `constants.ts` | Zoom & shift constants |

## CityJSON Library (src/lib/cityjson/)

| File | Purpose |
|---|---|
| `types.ts` | CityJSON TypeScript type definitions |
| `hooks/useCityJsonRenderer.ts` | Three.js renderer for CityJSON |
| `hooks/useCityJsonMeasure.ts` | Measurement in 3D space |
| `hooks/useCityJsonPointMeasure.ts` | Point-to-point measurement |
| `hooks/useCityJsonPolygonMeasure.ts` | Polygon perimeter measurement |
| `hooks/useCityJsonHighlight.ts` | Highlight roof surfaces |

## Roof Edge Classification (src/lib/roof-mapping/)

| File | Purpose |
|---|---|
| `classify-roof-edges.ts` | Classify edges from CityJSON data |
| `types.ts` | Edge type definitions |

## Key Types (src/operations/annotator/types.ts)

```ts
interface AnnotationInfo {
  polygonId?: string;
  labelType?: 'roof' | 'velux' | 'pan';
  covering?: AnnotationCoveringType;
  covering2?: AnnotationCoveringType;
  slope?: number;
  wearLevel?: number;
  obstacle?: string;
  comment?: string;
  wear?: Wearness;
  moldRate?: number;
  fillColor?: string;
  strokeColor?: string;
  labelName?: string;
  humidityLevel?: number;
  height?: number;
  area?: number;
}

type PolygonsForm = Record<`${number}`, Polygon>;
type AnnotationsInfo = Record<`${number}`, AnnotationInfo>;
```

## Constants (src/constants/annotator.ts)

- `ANNOTATION_LABELS_TRANSLATION`: roof, velux, pan
- `coveringTypeMap`: 10+ roof material types (ardoise, bitume, bac acier, etc.)
- `ANNOTATION_WEAR_TRANSLATION`: LOW, PARTIAL, ADVANCED, EXTREME
- `MEASUREMENT_MAP_ON_EXTENDED_AREA = 9`
- `MEASUREMENT_MAP_ON_EXTENDED_LENGTH = 3`

## External Dependencies

- `@bpartners/annotator-component` — External canvas library (AnnotatorCanvas)
- `@bpartners/typescript-client` — API client types
- `@react-three/fiber` — React wrapper for Three.js
- `@react-three/drei` — Three.js helpers
- `three` — 3D engine
- `zustand` — State management
- `@tanstack/react-query` — Data fetching & caching
- `react-hook-form` — Form state management
- `zod` — Schema validation

## API Endpoints

- `GET /users/{userId}/accounts/{accountId}/areaPictures` — List area pictures
- `GET /accounts/{accountId}/areaPictures/{pictureId}` — Get picture details
- `POST /accounts/{accountId}/areaPictures/{pictureId}/annotations` — Create annotation
- `PUT /accounts/{accountId}/areaPictures/{pictureId}/annotations/{annotationId}` — Update annotation
- `GET /accounts/{accountId}/areaPictures/{pictureId}/annotations` — List annotations
- `POST /accounts/{accountId}/areaPictures/convert` — Convert coordinates
- `POST {GEO_MERCATOR_URL}` — External: pixel → geo coordinate conversion
- `POST {CITYJSON_API}` — External: generate CityJSON 3D model

## Tests

| Test File | Coverage |
|---|---|
| `src/__tests__/Annotator.cy.jsx` | Main annotator component |
| `src/__tests__/InvoiceAnnotation.cy.tsx` | Annotation in invoice context |
| `src/__tests__/DraftAnnotations.cy.tsx` | Draft annotations management |
| `src/__tests__/ExportAnnotationInfos.cy.tsx` | Export functionality |
| `src/__tests__/mocks/responses/annotator-api.ts` | Mock data |

## Modification Guidelines

1. **Read before edit**: Always read the target file and its direct imports before making changes.
2. **Store updates**: When adding state, follow the existing Zustand pattern in `annotator-store.ts` — use `create` with `set`/`get`, export individual selector hooks.
3. **New fetchers**: Place in `src/common/fetcher/`, follow the `useXxxQuery` / `useXxxMutation` naming convention, register in the fetcher `index.ts`.
4. **New components**: Follow the `react-component` skill template (Name.tsx + style.ts). Place under `src/operations/annotator/components/`.
5. **Mapper changes**: Mappers in `src/providers/mappers/` transform API ↔ UI data. Changing a mapper affects all consumers — trace usages first.
6. **3D changes**: The 3D pipeline flows: API → CityJSON provider → useCitJSONProcessQuery → annotator-3d.tsx → city-scene.tsx. Changes to CityJSON types affect the entire 3D stack.
7. **Polygon operations**: Polygons flow through annotator-store → polygon-mapper → annotator-provider. Coordinate systems differ between pixel space and geo space.
8. **Screen modes**: Controlled by `useAnnotatorScreenSwitch`. Values: 'llm' | 'annotator' | '3d-annotator' | 'roof-analyse'. Adding a new mode requires updating ScreenSwitchTabs.
