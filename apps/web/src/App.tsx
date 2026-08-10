import React, { useState, useEffect } from 'react';
import type { Photo, Video } from '@mediaflow/react';
import { useMediaSearchPhotos, useMediaEvent, useMediaSearchVideos, useMediaClient } from '@mediaflow/react';
import { useGrid, useLightbox, useReelSwiper } from '@mediaflow/ui-react';
import logo from './assets/logo-light.svg';
import './App.css';

export default function App() {
  const [queryInput, setQueryInput] = useState('nature');
  const [searchQuery, setSearchQuery] = useState('nature');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'photos' | 'videos'>('photos');
  const client = useMediaClient();

  const { data: photoData, loading: photosLoading, error: photosError } = useMediaSearchPhotos(searchQuery, page, 15);
  const { data: videoData, loading: videosLoading, error: videosError } = useMediaSearchVideos(searchQuery, page, 15);

  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [allVideos, setAllVideos] = useState<Video[]>([]);

  useEffect(() => {
    if (!photoData) return;

    if (page === 1) {
      setAllPhotos(photoData.photos);
    } else {
      setAllPhotos((prev) => [...prev, ...photoData.photos]);
    }
  }, [photoData, page]);

  useEffect(() => {
    if (!videoData) return;

    if (page === 1) {
      setAllVideos(videoData.videos);
    } else {
      setAllVideos((prev) => [...prev, ...videoData.videos]);
    }
  }, [videoData, page]);

  useMediaEvent((event: any) => {
    console.log('[App.tsx] Event received:', event.type, event.item.id);
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(queryInput.trim() || 'nature');
  };

  const currentLoading = viewMode === 'photos' ? photosLoading : videosLoading;
  const currentError = viewMode === 'photos' ? photosError : videosError;
  const currentItems = viewMode === 'photos' ? allPhotos : allVideos;

  const hasMore = viewMode === 'photos'
    ? !!photoData?.next_page
    : !!videoData?.next_page;

  const { getContainerProps: getGridProps, getItemProps: getGridItemProps, getLoadMoreProps } = useGrid({
    loading: currentLoading,
    hasMore,
    onLoadMore: () => setPage((p) => p + 1),
  });

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const lightbox = useLightbox({
    itemsCount: allPhotos.length,
    initialIndex: lightboxIndex,
    isOpen: lightboxOpen,
    onClose: () => setLightboxOpen(false),
    onIndexChange: (idx) => setLightboxIndex(idx),
  });

  const reelSwiper = useReelSwiper({
    onActiveIndexChange: (index) => {
      if (allVideos[index]) {
        client.trackView(allVideos[index]);
      }
    },
  });

  const renderDownloadButton = (item: Photo | Video, href: string | undefined) => {
    if (!href) return null;
    return (
      <button
        type="button"
        onClick={() => {
          client.trackDownload(item);
          window.open(href, '_blank');
        }}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.7)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        Download
      </button>
    );
  };

  return (
    <div className="app-shell">
      <header className="page-header">
        <img src={logo} alt="Foto Owl logo" className="logo" />
        <div className="page-copy">
          <p className="tagline">Search curated photos and vertical reels with the headless SDK.</p>
        </div>
      </header>

      <form onSubmit={handleSearch} className="search-form">
        <label style={{ display: 'contents' }}>
          <span className="sr-only">Search query</span>
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Search photos and videos"
            className="search-input"
            aria-label="Search query"
          />
        </label>
        <button type="submit" className="search-button">Search</button>
      </form>

      <div className="toggle-group">
        <button
          type="button"
          onClick={() => { setViewMode('photos'); setPage(1); }}
          className={`toggle-button ${viewMode === 'photos' ? 'active' : ''}`}
          aria-pressed={viewMode === 'photos'}
        >
          Photos (Grid & Lightbox)
        </button>
        <button
          type="button"
          onClick={() => { setViewMode('videos'); setPage(1); }}
          className={`toggle-button ${viewMode === 'videos' ? 'active' : ''}`}
          aria-pressed={viewMode === 'videos'}
        >
          Videos (Reels)
        </button>
      </div>

      {currentError && (
        <div className="status-message error" role="alert">
          Unable to load results: {currentError.message}
        </div>
      )}

      {currentLoading && !currentItems.length && (
        <div className="status-message info">Loading results...</div>
      )}

      {!currentLoading && currentItems.length === 0 && (
        <div className="status-message info">No results found. Try a different search term.</div>
      )}

      {viewMode === 'photos' && currentItems.length > 0 && (
        <div {...getGridProps()} className="photo-grid">
          {allPhotos.map((photo, index) => (
            <div
              {...getGridItemProps(photo.id)}
              key={photo.id}
              onClick={() => {
                setLightboxIndex(index);
                setLightboxOpen(true);
                client.trackView(photo);
              }}
              className="grid-item"
            >
              <img
                src={photo.src.medium}
                alt={photo.alt || `Photo by ${photo.photographer}`}
              />
            </div>
          ))}
          <div
            {...getLoadMoreProps()}
            className="load-more"
            aria-live="polite"
          >
            {currentLoading ? 'Loading more...' : hasMore ? 'Scroll to load more' : 'No more photos'}
          </div>
        </div>
      )}

      {viewMode === 'videos' && currentItems.length > 0 && (
        <div {...reelSwiper.getContainerProps()} className="reel-container">
          {allVideos.map((video, index) => {
            const videoSource = video.video_files[0]?.link;
            return (
              <div
                {...reelSwiper.getItemProps(index)}
                key={video.id}
                className="reel-item"
              >
                <div className="reel-card">
                  <video
                    src={videoSource}
                    poster={video.image}
                    controls
                  />
                  <div className="reel-meta">
                    <span>{video.user.name}</span>
                    {videoSource && (
                      <button
                        type="button"
                        onClick={() => {
                          client.trackDownload(video);
                          window.open(videoSource, '_blank');
                        }}
                        className="download-button"
                      >
                        Download Video
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div
            {...getLoadMoreProps()}
            className="load-more"
            aria-live="polite"
          >
            {currentLoading ? 'Loading more...' : hasMore ? 'Scroll down to load more videos' : 'No more videos'}
          </div>
        </div>
      )}

      {lightboxOpen && (
        <div
          {...lightbox.getBackdropProps()}
          className="lightbox-overlay"
        >
          <div
            {...lightbox.getContentProps()}
            className="lightbox-content"
          >
            <div className="lightbox-controls">
              <button
                {...lightbox.getPrevButtonProps()}
                className="lightbox-button"
              >
                &lt;
              </button>
              <button
                {...lightbox.getNextButtonProps()}
                className="lightbox-button"
              >
                &gt;
              </button>
            </div>
            <img
              src={allPhotos[lightbox.currentIndex]?.src.large}
              alt={allPhotos[lightbox.currentIndex]?.alt || `Photo ${lightbox.currentIndex + 1}`}
            />
            <button
              {...lightbox.getCloseButtonProps()}
              className="lightbox-close"
              aria-label="Close lightbox"
            >
              &times;
            </button>
            {renderDownloadButton(allPhotos[lightbox.currentIndex], allPhotos[lightbox.currentIndex]?.src.original)}
          </div>
        </div>
      )}
    </div>
  );
}
