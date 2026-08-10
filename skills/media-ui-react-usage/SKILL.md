---
name: media-ui-react-usage
description: Teaches AI how to build UI components using the headless media-ui-react library via prop-getters.
---

# Media UI React Usage

When building UI for the Foto Owl SDK, you MUST use the headless hooks provided by `@mediaflow/ui-react`. These hooks use the "prop-getter" pattern. They do not render any DOM elements themselves, nor do they include any CSS. You must supply your own markup and spread the props onto your elements.

## Rules
1. **Never use `@mediaflow/ui-react` imports to fetch data**. It only manages UI state (accessibility, interactions, focus).
2. **Apply styles yourself**. The hooks only provide accessibility and interaction logic (ARIA, event handlers).

## Grid Setup: `useGrid`
Provides infinite scroll triggering and grid accessibility.

```tsx
import { useGrid } from '@mediaflow/ui-react';

function MyGrid({ items, loading, hasMore, fetchMore }) {
  const { getContainerProps, getItemProps, getLoadMoreProps } = useGrid({
    loading,
    hasMore,
    onLoadMore: fetchMore
  });

  return (
    <div {...getContainerProps()} style={{ display: 'grid' }}>
      {items.map(item => (
        <div {...getItemProps(item.id)} key={item.id}>
          {item.name}
        </div>
      ))}
      <div {...getLoadMoreProps()}>Loading more...</div>
    </div>
  );
}
```

## Lightbox Setup: `useLightbox`
Provides modal state, keyboard navigation (Esc, Arrows), and index management.

```tsx
import { useLightbox } from '@mediaflow/ui-react';

function MyLightbox({ itemsCount, isOpen, onClose }) {
  const {
    currentIndex,
    getBackdropProps,
    getContentProps,
    getPrevButtonProps,
    getNextButtonProps,
    getCloseButtonProps
  } = useLightbox({
    itemsCount,
    isOpen,
    onClose
  });

  if (!isOpen) return null;

  return (
    <div {...getBackdropProps()} style={{ position: 'fixed' }}>
      <div {...getContentProps()}>
        <button {...getCloseButtonProps()}>Close</button>
        <button {...getPrevButtonProps()}>Prev</button>
        <span>Viewing {currentIndex}</span>
        <button {...getNextButtonProps()}>Next</button>
      </div>
    </div>
  );
}
```

## Reel Swiper Setup: `useReelSwiper`
Provides TikTok/Reels-style vertical snapping and active item detection.

```tsx
import { useReelSwiper } from '@mediaflow/ui-react';

function MyReelSwiper({ videos, onActiveChange }) {
  const { getContainerProps, getItemProps } = useReelSwiper({
    onActiveIndexChange: onActiveChange
  });

  return (
    <div {...getContainerProps()} style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}>
      {videos.map((video, idx) => (
        <div {...getItemProps(idx)} key={video.id} style={{ height: '100vh', scrollSnapAlign: 'start' }}>
          <video src={video.url} controls />
        </div>
      ))}
    </div>
  );
}
```

## AI usage guidance
When asked to build a UI using `@mediaflow/ui-react`, do this:

1. Never connect `useGrid`, `useLightbox`, or `useReelSwiper` to data fetching.
2. Always spread the returned prop objects onto your markup.
3. Add your own styling and ARIA attributes for accessibility.
4. Keep markup separate from hook logic.

### Example AI prompt
> Use `useGrid` to render a photo tile layout with infinite scrolling. Use `useLightbox` to show a photo modal with next/prev and Escape support.

### Recommended structure
- fetch data with `@mediaflow/react` hooks
- pass media items into the app component
- connect UI state with `@mediaflow/ui-react`
- render markup and styles in the app layer
