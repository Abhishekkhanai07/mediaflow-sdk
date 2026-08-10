import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MediaClient, PhotosResponse, VideosResponse, Photo, Video, MediaEvent } from '@mediaflow/core';

// Re-export core types for convenience
export type { PhotosResponse, VideosResponse, Photo, Video, MediaEvent };

interface MediaContextValue {
  client: MediaClient;
}

const MediaContext = createContext<MediaContextValue | null>(null);

export interface MediaProviderProps {
  apiKey: string;
  children: React.ReactNode;
}

export function MediaProvider({ apiKey, children }: MediaProviderProps) {
  const client = useMemo(() => new MediaClient(apiKey), [apiKey]);

  return (
    <MediaContext.Provider value={{ client }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMediaClient() {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMediaClient must be used within a MediaProvider');
  }
  return context.client;
}

export function useMediaSearchPhotos(query: string, page: number = 1, perPage: number = 15) {
  const client = useMediaClient();
  const [data, setData] = useState<PhotosResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) return;

    let mounted = true;
    setLoading(true);
    client.searchPhotos(query, page, perPage)
      .then(res => {
        if (mounted) {
          setData(res);
          setError(null);
        }
      })
      .catch(err => {
        if (mounted) setError(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [client, query, page, perPage]);

  return { data, loading, error };
}

export function useMediaCuratedPhotos(page: number = 1, perPage: number = 15) {
  const client = useMediaClient();
  const [data, setData] = useState<PhotosResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    client.getCuratedPhotos(page, perPage)
      .then(res => {
        if (mounted) {
          setData(res);
          setError(null);
        }
      })
      .catch(err => {
        if (mounted) setError(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [client, page, perPage]);

  return { data, loading, error };
}

export function useMediaSearchVideos(query: string, page: number = 1, perPage: number = 15) {
  const client = useMediaClient();
  const [data, setData] = useState<VideosResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) return;

    let mounted = true;
    setLoading(true);
    client.searchVideos(query, page, perPage)
      .then(res => {
        if (mounted) {
          setData(res);
          setError(null);
        }
      })
      .catch(err => {
        if (mounted) setError(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [client, query, page, perPage]);

  return { data, loading, error };
}

export function useMediaEvent(callback: (event: { type: MediaEvent; item: Photo | Video }) => void) {
  const client = useMediaClient();

  useEffect(() => {
    const unsubscribe = client.events.subscribe(callback);
    return () => { unsubscribe(); };
  }, [client, callback]);
}
