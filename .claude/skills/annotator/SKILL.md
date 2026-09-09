---
name: annotator
description: Expert agent for the Annotator feature — the 2D/3D roof annotation, analysis, and measurement screen, now provided by the @bpartners/roof-analyser library. Use when the user asks about, wants to modify, update, debug, or extend anything annotator-related (annotations, polygons, area pictures, roof analysis, CityJSON 3D, measurement tools, LLM results, or annotator sidebar/forms).
---

# Annotator Feature Skill

The annotator is **no longer implemented in this repository**. It ships as the `@bpartners/roof-analyser`
npm package (source: `/Users/macbook/Documents/work/roof-analyser`, published to the CodeArtifact
`annotator-imagery-store` registry). This repo only mounts it.

## What lives here

| File | Role |
|---|---|
| `src/operations/annotator/Annotator.tsx` | The `/projects/:projectId` screen: resolves credentials + address, renders `<RoofAnnotator>` |
| `src/operations/annotator/roof-analyser-config.ts` | Maps `process.env.REACT_APP_*` / `LLM_*` variables to the library's `RoofAnalyserConfig` |
| `src/operations/annotator/use-roof-analyser-credentials.ts` | Resolves `apiKey` (`getApiKey`) and `accountId` / `accountHolderId` / `userId` from the cached whoami |
| `src/operations/annotator/style.ts` | Full-viewport wrapper style |

Route: `/projects/:projectId` in `src/security/BpAdmin.tsx` (`CustomRoutes noLayout`).
`projectId` is the **area picture id**; the query string carries `address` and `draftAnnotationId`.

## Session identity

The library owns saving. It writes through bpartners' own save-annotations endpoint, addressed by the
pair this app hands it:

- `areaPictureId={projectId}` — when a draft annotation already exists for it, the library loads that
  saved work instead of creating a new prospect.
- `idAnnotations={draftAnnotationId}` — the annotation id used when a fresh prospect/annotation is created.

These are exactly the ids the previous in-repo implementation saved under, so existing drafts reopen
unchanged. Never reintroduce a local save path — auto-save, manual save, 3D mapping, analyse results and
the PDF export all live inside the library.

## Entering the screen

Three places navigate to it, all with the same URL shape:

- `src/operations/home/project-list-item.tsx` (project list)
- `src/operations/prospects/components/DraftAnnotationItem.tsx` (draft list)
- `src/common/fetcher/prospect-queries.tsx` (`useMutateProspect`, after creating prospect + area picture + empty draft annotation)

## What the app still owns

- Prospect / area-picture / draft-annotation **creation** (`useMutateProspect`, `area-picture-provider`,
  `draft-area-annotations-provider`).
- The drafts list (`src/operations/prospects/DraftAreaPictureAnnotations.tsx`) and its filters.
- The invoice-side read-only annotation info panel:
  `src/operations/invoice/components/AnnotationInfoShow.tsx` +
  `src/operations/invoice/utils/annotation-info.ts` + `use-invoice-annotation.ts`.

## Changing annotator behaviour

Edit the library, not this repo. Rebuild it there, publish (the
**Publish Library to CodeArtifact** workflow), then bump `@bpartners/roof-analyser` here.
The library's own `README.md` documents both flows (address flow and lon/lat session flow) and every prop.
