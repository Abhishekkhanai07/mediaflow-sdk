import { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react';

// --- useGrid ---
export interface UseGridOptions {
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

export function useGrid({ onLoadMore, hasMore, loading }: UseGridOptions = {}) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMoreRef = useCallback(
    (node: any) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore?.();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, onLoadMore]
  );

  return {
    getContainerProps: () => ({
      role: 'grid',
    }),
    getItemProps: (id: string | number) => ({
      role: 'gridcell',
      tabIndex: 0,
      'aria-colindex': 1,
      key: id,
    }),
    getLoadMoreProps: () => ({
      ref: loadMoreRef,
      role: 'separator',
      'aria-hidden': true,
    }),
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

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, isOpen]);

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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    },
    [isOpen, onClose, goToNext, goToPrev]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return {
    currentIndex,
    setCurrentIndex,
    goToNext,
    goToPrev,
    getBackdropProps: () => ({
      role: 'dialog',
      'aria-modal': true,
      onClick: onClose,
    }),
    getContentProps: () => ({
      onClick: (e: React.MouseEvent) => e.stopPropagation(),
      role: 'document',
    }),
    getPrevButtonProps: () => ({
      onClick: goToPrev,
      disabled: currentIndex === 0,
      'aria-label': 'Previous',
    }),
    getNextButtonProps: () => ({
      onClick: goToNext,
      disabled: currentIndex === itemsCount - 1,
      'aria-label': 'Next',
    }),
    getCloseButtonProps: () => ({
      onClick: onClose,
      'aria-label': 'Close',
    }),
  };
}

// --- useReelSwiper ---
export interface UseReelSwiperOptions {
  onActiveIndexChange?: (index: number) => void;
}

export function useReelSwiper({ onActiveIndexChange }: UseReelSwiperOptions = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<Map<number, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const getContainerProps = () => ({
    ref: containerRef,
  });

  const getItemProps = (index: number) => ({
    ref: (node: HTMLElement | null) => {
      const previous = itemsRef.current.get(index);
      if (previous && observerRef.current) {
        observerRef.current.unobserve(previous);
      }

      if (node) {
        itemsRef.current.set(index, node);
        if (observerRef.current) {
          observerRef.current.observe(node);
        }
      } else {
        itemsRef.current.delete(index);
      }
    },
  });

  useEffect(() => {
    if (!containerRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(itemsRef.current.entries()).find(
              ([_, node]) => node === entry.target
            )?.[0];
            if (index !== undefined) {
              onActiveIndexChange?.(index);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6,
      }
    );

    itemsRef.current.forEach((node) => observerRef.current?.observe(node));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [onActiveIndexChange]);

  return {
    getContainerProps,
    getItemProps,
  };
}
