export interface Photo {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export interface Video {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: Array<{
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }>;
  video_pictures: Array<{
    id: number;
    picture: string;
    nr: number;
  }>;
}

export interface PaginatedResponse<T> {
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  prev_page?: string;
}

export interface PhotosResponse extends PaginatedResponse<Photo> {
  photos: Photo[];
}

export interface VideosResponse extends PaginatedResponse<Video> {
  videos: Video[];
}

export type MediaEvent = 'view' | 'download';

export type EventCallback = (data: { type: MediaEvent; item: Photo | Video }) => void;

class EventEmitter {
  private listeners: Set<EventCallback> = new Set();

  subscribe(callback: EventCallback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit(type: MediaEvent, item: Photo | Video) {
    for (const listener of this.listeners) {
      listener({ type, item });
    }
  }
}

export class MediaClient {
  private apiKey: string;
  private baseUrl = 'https://api.pexels.com/v1';
  private videoBaseUrl = 'https://api.pexels.com/videos';
  private cache: Map<string, any> = new Map();
  public events = new EventEmitter();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Default listener as per requirements
    this.events.subscribe(({ type, item }) => {
      console.log(`[Media SDK Event] ${type} on item ID: ${item.id}`);
    });
  }

  private async fetch<T>(url: string, params?: Record<string, any>): Promise<T> {
    const urlObj = new URL(url);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          urlObj.searchParams.append(key, String(value));
        }
      });
    }

    const cacheKey = urlObj.toString();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as T;
    }

    const response = await fetch(urlObj.toString(), {
      headers: {
        Authorization: this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Media API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.cache.set(cacheKey, data);
    return data as T;
  }

  async searchPhotos(query: string, page = 1, perPage = 15): Promise<PhotosResponse> {
    return this.fetch<PhotosResponse>(`${this.baseUrl}/search`, { query, page, per_page: perPage });
  }

  async getCuratedPhotos(page = 1, perPage = 15): Promise<PhotosResponse> {
    return this.fetch<PhotosResponse>(`${this.baseUrl}/curated`, { page, per_page: perPage });
  }

  async getPhoto(id: number): Promise<Photo> {
    return this.fetch<Photo>(`${this.baseUrl}/photos/${id}`);
  }

  async searchVideos(query: string, page = 1, perPage = 15): Promise<VideosResponse> {
    return this.fetch<VideosResponse>(`${this.videoBaseUrl}/search`, { query, page, per_page: perPage });
  }

  async getPopularVideos(page = 1, perPage = 15): Promise<VideosResponse> {
    return this.fetch<VideosResponse>(`${this.videoBaseUrl}/popular`, { page, per_page: perPage });
  }

  async getVideo(id: number): Promise<Video> {
    return this.fetch<Video>(`${this.videoBaseUrl}/videos/${id}`);
  }

  trackView(item: Photo | Video) {
    this.events.emit('view', item);
  }

  trackDownload(item: Photo | Video) {
    this.events.emit('download', item);
  }
}
