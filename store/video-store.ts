import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Video, VideoSettings } from "@/types";

interface VideosState {
	videos: Video[];
	prompt: string;
	isGenerating: boolean;
	gridView: "2x2" | "3x3" | "list";
	searchQuery: string;
	sortOption: "newest" | "oldest" | "name_asc" | "name_desc";
	isRandomSeed: boolean;
	seed: number;
	videoSettings: VideoSettings;
	setVideos: (videos: Video[]) => void;
	setIsGenerating: (isGenerating: boolean) => void;
	setPrompt: (prompt: string) => void;
	setGridView: (view: "2x2" | "3x3" | "list") => void;
	setSearchQuery: (query: string) => void;
	setSortOption: (option: "newest" | "oldest" | "name_asc" | "name_desc") => void;
	setIsRandomSeed: (isRandom: boolean) => void;
	setSeed: (seed: number) => void;
	updateVideoStatus: (
		jobId: string,
		status: Video["status"],
		url?: string,
		error?: string
	) => void;
	addVideo: (video: Video) => void;
	getProcessingCount: () => number;
	deleteVideo: (id: number) => Promise<void>;
	setVideoSettings: (settings: VideoSettings) => void;
	fetchVideos: () => Promise<void>;
	initialize: () => Promise<void>;
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
			gridView: "3x3",
			searchQuery: "",
			sortOption: "newest",
			isRandomSeed: true,
			seed: Math.floor(Math.random() * 1000000),
			videoSettings: defaultSettings,

			setVideos: videos => set({ videos }),
			setIsGenerating: isGenerating => set({ isGenerating }),
			setPrompt: prompt => set({ prompt }),
			setGridView: view => set({ gridView: view }),
			setSearchQuery: query => set({ searchQuery: query }),
			setSortOption: option => set({ sortOption: option }),
			setIsRandomSeed: isRandom => set({ isRandomSeed: isRandom }),
			setSeed: seed => set({ seed }),

			updateVideoStatus: (jobId, status, url, error) =>
				set(state => ({
					videos: state.videos.map(v =>
						v.jobId === jobId
							? {
									...v,
									status,
									...(url ? { url } : {}),
									...(error ? { error } : {}),
								}
							: v
					),
				})),

			addVideo: video =>
				set(state => ({
					videos: [
						...state.videos,
						{
							...video,
							frames: video.frames || defaultSettings.numFrames,
							seed: get().seed,
							enhancePrompt: false,
						},
					],
					isGenerating: true,
				})),

			getProcessingCount: () => {
				const state = get();
				return state.videos.filter(v => v.status === "queued" || v.status === "processing")
					.length;
			},

			deleteVideo: async (id: number) => {
				try {
					const response = await fetch("/api/videos", {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ id }),
					});

					if (!response.ok) {
						const error = await response.json();
						throw new Error(error.error || "Failed to delete video");
					}

					set(state => ({
						videos: state.videos.filter(v => v.id !== id),
					}));
				} catch (error) {
					console.error("Error deleting video:", error);
					throw error;
				}
			},

			setVideoSettings: settings => set({ videoSettings: settings }),

			fetchVideos: async () => {
				try {
					const response = await fetch("/api/videos");
					if (!response.ok) {
						throw new Error("Failed to fetch videos");
					}
					const videos = await response.json();
					set({ videos });
				} catch (error) {
					console.error("Error fetching videos:", error);
				}
			},

			initialize: async () => {
				const { fetchVideos } = get();
				await fetchVideos();
			},
		}),
		{
			name: "videos-storage",
			partialize: state => ({
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
