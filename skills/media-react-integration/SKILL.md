---
name: media-react-integration
description: Teaches AI how to integrate data from the headless media SDK (media-react) into UI components.
---

# Media React Integration

When building UI that requires media from Pexels, you MUST use the `@mediaflow/react` package. This package is the single source of truth for all data, authentication, and tracking events.

## Rules
1. **Never use the Pexels API directly**. You must use `@mediaflow/react` hooks.
2. **Never import `@mediaflow/core` directly**. All interactions go through `@mediaflow/react`.

## Setup: MediaProvider
The root of the React tree must be wrapped in a `<MediaProvider apiKey="...">`. 
You do not need to manually pass the API key anywhere else.

```tsx
import { MediaProvider } from '@mediaflow/react';

function App() {
  return (
    <MediaProvider apiKey={process.env.VITE_PEXELS_API_KEY}>
      <YourComponent />
    </MediaProvider>
  );
}
```

## Fetching Data: Hooks
Use the provided hooks to fetch data. They return `{ data, loading, error }`.

Available hooks:
- `useMediaSearchPhotos(query, page, perPage)`
- `useMediaCuratedPhotos(page, perPage)`
- `useMediaSearchVideos(query, page, perPage)`

```tsx
import { useMediaSearchPhotos } from '@mediaflow/react';
import { useState } from 'react';

function PhotoList() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useMediaSearchPhotos('nature', page, 15);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.photos.map(photo => (
        <li key={photo.id}>{photo.alt}</li>
      ))}
    </ul>
  );
}
```

## Tracking Events
You must use the `useMediaClient` hook to access the client instance for tracking views and downloads. Note: `useMediaEvent` is used to subscribe to these events globally.

```tsx
import { useMediaClient, useMediaEvent } from '@mediaflow/react';

function PhotoItem({ photo }) {
  const client = useMediaClient();

  const handleView = () => {
    client.trackView(photo);
  };

  const handleDownload = () => {
    client.trackDownload(photo);
  };

  return (
    <div>
      <img src={photo.src.medium} onClick={handleView} />
      <button onClick={handleDownload}>Download</button>
    </div>
  );
}

function GlobalTracker() {
  useMediaEvent((event) => {
    console.log(`User did ${event.type} on ${event.item.id}`);
  });
  return null;
}
```

## AI usage guidance
When asked to build a React component using the Foto Owl SDK, follow these instructions:

1. Wrap the app in `MediaProvider` once at the top level.
2. Use only `@mediaflow/react` hooks to fetch media data.
3. Use `useMediaClient` for tracking, never `MediaClient` directly in UI code.
4. Return `loading`, `error`, and `data` rendering states exactly as shown.

### Example AI prompt
> Build a React component that searches photos using `useMediaSearchPhotos`, shows a loading state, and renders a grid of images. Use `useMediaClient` to track view events when an image is clicked.
