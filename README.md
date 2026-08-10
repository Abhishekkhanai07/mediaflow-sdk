# Mediaflow SDK Project

This repository implements a headless media SDK ecosystem for a FotoOwl technical assignment.

## Assignment alignment

### ✅ Deliverables covered
- `packages/media-core`
  - `@mediaflow/core` is framework-agnostic and UI-free
  - Provides Pexels API client methods: `searchPhotos`, `getCuratedPhotos`, `searchVideos`, `getPopularVideos`, `getPhoto`, `getVideo`
  - Handles API key auth through `MediaClient(apiKey)`
  - Implements in-memory response caching and request dedupe
  - Emits `view` and `download` events via a simple event emitter
  - Includes a default console listener for SDK events

- `packages/media-react`
  - `@mediaflow/react` is the React-only wrapper
  - Exposes `MediaProvider`, `useMediaClient`, `useMediaSearchPhotos`, `useMediaCuratedPhotos`, `useMediaSearchVideos`, and `useMediaEvent`
  - Contains no business logic beyond adapting `media-core` to React hooks
  - Depends only on `@mediaflow/core`

- `packages/media-ui-react`
  - `@mediaflow/ui-react` is a pure headless UI library
  - Provides `useGrid`, `useLightbox`, and `useReelSwiper`
  - Uses prop-getter pattern only, with no shipped styles or SDK imports
  - Independent of `@mediaflow/core` and wrappers

- `apps/web`
  - React Vite app wiring `@mediaflow/react` + `@mediaflow/ui-react`
  - Implements search, photo grid, lightbox, and vertical reels
  - Uses the SDK for data, auth, events, and tracking

- `skills/`
  - Two AI skill docs are included:
    - `skills/media-react-integration/SKILL.md`
    - `skills/media-ui-react-usage/SKILL.md`
  - These are written to guide an AI assistant on correct wrapper and UI usage

## Architecture summary

The current dependency flow is:

```text
apps/web
   ↳ @mediaflow/react ↳ @mediaflow/core
   ↳ @mediaflow/ui-react
```

The component library is independent from the SDK core and wrappers.

## Architecture diagram

```text
@mediaflow/core          <-- pure SDK, no UI
      ↑
@mediaflow/react        <-- React wrapper, provider + hooks

@mediaflow/ui-react     <-- headless UI prop-getters
      ↑
  apps/web              <-- demo app wiring data + UI
```

## What is implemented

- Search photos and videos via Pexels
- Infinite scroll / load more via `useGrid`
- Lightbox modal with keyboard navigation
- Reels-style vertical swipe via `useReelSwiper`
- App-level event subscription with `useMediaEvent`
- SDK tracking calls with `trackView` and `trackDownload`
- Loading, empty, and error states in the app

## What is still pending

- Live deployment URLs for the app/docs
- Separate published SDK docs and component docs

## AI / skill disclosure

This project uses the assignment's requested AI skill documentation approach:

- `skills/media-react-integration/SKILL.md` describes how to use `@mediaflow/react` without importing the core directly
- `skills/media-ui-react-usage/SKILL.md` describes how to use `@mediaflow/ui-react` headless hooks and prop getters

These docs are designed to be used directly by an AI coding assistant while building the app.

## Run locally

1. Add `VITE_PEXELS_API_KEY` to `apps/web/.env`.
2. From the repo root:

```bash
npm install
npm run build --workspaces --if-present
npm run dev --workspace apps/web
```

## Notes

- The demo app is intentionally functional and lightweight.
- The UI is built around the SDK architecture, not visual polish.
- If deploying, use Vercel or Netlify for the web app and a simple static docs site for README-based docs.
>>>>>>> d8509e7 (Initial cleanup: remove direct @mediaflow/core dependency, add .gitignore and env.example)
