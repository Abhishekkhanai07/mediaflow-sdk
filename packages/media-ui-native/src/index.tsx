import { useState, useCallback, useRef } from 'react';

// --- useGrid ---
export interface UseGridOptions {
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

export function useGrid({ onLoadMore, hasMore, loading }: UseGridOptions = {}) {
  const getFlatListProps = () => ({
    onEndReached: () => {
      if (!loading && hasMore) {
        onLoadMore?.();
      }
    },
    onEndReachedThreshold: 0.5,
  });

  return {
    getFlatListProps,
  };
}

// --- useLightbox ---
export interface UseLightboxOptions {
  itemsCount: number;
  initialIndex?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onIndexChange?: (index: number) => void;
}

export function useLightbox({
  itemsCount,
  initialIndex = 0,
  isOpen = false,
  onClose,
  onIndexChange,
}: UseLightboxOptions) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev < itemsCount - 1 ? prev + 1 : prev;
      if (next !== prev) onIndexChange?.(next);
      return next;
    });
  }, [itemsCount, onIndexChange]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev > 0 ? prev - 1 : prev;
      if (next !== prev) onIndexChange?.(next);
      return next;
    });
  }, [onIndexChange]);

  return {
    currentIndex,
    setCurrentIndex,
    goToNext,
    goToPrev,
    getModalProps: () => ({
      visible: isOpen,
      onRequestClose: onClose,
      transparent: true,
      animationType: 'fade' as const,
    }),
  };
}

// --- useReelSwiper ---
export interface UseReelSwiperOptions {
  onActiveIndexChange?: (index: number) => void;
}

export function useReelSwiper({ onActiveIndexChange }: UseReelSwiperOptions = {}) {
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null) {
        onActiveIndexChange?.(index);
      }
    }
  });

  const getFlatListProps = () => ({
    pagingEnabled: true,
    showsVerticalScrollIndicator: false,
    viewabilityConfig: viewabilityConfig.current,
    onViewableItemsChanged: onViewableItemsChanged.current,
  });

  return {
    getFlatListProps,
  };
}
