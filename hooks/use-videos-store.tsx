"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { HealthStatus, Video, VideoSettings } from "@/types";

interface VideosState {
	videos: Video[];
	prompt: string;
	isGenerating: boolean;
	healthStatus: HealthStatus | null;
	gridView: "2x2" | "3x3" | "list";
	searchQuery: string;
	sortOption: "newest" | "oldest" | "name_asc" | "name_desc";
	isRandomSeed: boolean;
	seed: number;
	videoSettings: VideoSettings;
	setVideos: (videos: Video[]) => void;
	setIsGenerating: (isGenerating: boolean) => void;
	setPrompt: (prompt: string) => void;
	setHealthStatus: (status: HealthStatus | null) => void;
	setGridView: (view: "2x2" | "3x3" | "list") => void;
	setSearchQuery: (query: string) => void;
	setSortOption: (option: "newest" | "oldest" | "name_asc" | "name_desc") => void;
	setIsRandomSeed: (isRandom: boolean) => void;
	setSeed: (seed: number) => void;
	updateVideoStatus: (id: number, status: Video["status"], url?: string) => void;
	addVideo: (video: Video) => void;
	updateVideoJobId: (id: number, jobId: string) => void;
	getProcessingCount: () => number;
	deleteVideo: (id: number) => void;
	setVideoSettings: (settings: VideoSettings) => void;
}

const defaultSettings: VideoSettings = {
	negativePrompt: "",
	width: 848,
	height: 480,
	steps: 40,
	cfg: 6,
	numFrames: 31,
	seed: 42,
};

export const useVideosStore = create<VideosState>()(
	persist(
		(set, get) => ({
			videos: [],
			prompt: "",
			isGenerating: false,
			healthStatus: null,
			gridView: "3x3",
			searchQuery: "",
			sortOption: "newest",
			isRandomSeed: true,
			seed: Math.floor(Math.random() * 2147483647),
			videoSettings: defaultSettings,

			setVideos: videos => set({ videos }),
			setIsGenerating: isGenerating => set({ isGenerating }),
			setPrompt: prompt => set({ prompt }),
			setHealthStatus: status => set({ healthStatus: status }),
			setGridView: view => set({ gridView: view }),
			setSearchQuery: query => set({ searchQuery: query }),
			setSortOption: option => set({ sortOption: option }),
			setIsRandomSeed: isRandom => set({ isRandomSeed: isRandom }),
			setSeed: seed => set({ seed }),

			updateVideoStatus: (id, status, url) =>
				set(state => ({
					videos: state.videos.map(v =>
						v.id === id ? { ...v, status, url: url || v.url } : v
					),
				})),

			addVideo: video =>
				set(state => ({
					videos: [
						...state.videos,
						{
							...video,
							createdAt: new Date().toISOString(),
							status: "queued",
						},
					],
					isGenerating: true,
				})),

			updateVideoJobId: (id, jobId) =>
				set(state => ({
					videos: state.videos.map(v => (v.id === id ? { ...v, jobId } : v)),
				})),

			getProcessingCount: () => {
				const state = get();
				return state.videos.filter(v => v.status === "queued").length;
			},

			deleteVideo: id =>
				set(state => ({
					videos: state.videos.filter(v => v.id !== id),
				})),

			setVideoSettings: settings => set({ videoSettings: settings }),
		}),
		{
			name: "videos-storage",
			partialize: state => ({
				videos: state.videos,
				prompt: state.prompt,
				gridView: state.gridView,
				sortOption: state.sortOption,
				isRandomSeed: state.isRandomSeed,
				seed: state.seed,
				videoSettings: state.videoSettings,
			}),
		}
	)
);
