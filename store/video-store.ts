import { create } from 'zustand'

import { Video } from '@/types'

interface VideoStore {
  videos: Video[]
  addVideo: (video: Video) => void
  updateVideoStatus: (
    id: string, 
    status: Video['status'], 
    url?: string,
    downloadUrl?: string
  ) => void
}

export const useVideoStore = create<VideoStore>((set) => ({
  videos: [],
  addVideo: (video) => 
    set((state) => ({
      videos: [...state.videos, video]
    })),
  updateVideoStatus: (id, status, url, downloadUrl) => {
    set((state) => ({
      videos: state.videos.map((video) =>
        video.id === id
          ? {
              ...video,
              status,
              ...(url ? { url } : {}),
              ...(downloadUrl ? { downloadUrl } : {}),
            }
          : video
      ),
    }))
  },
})) 