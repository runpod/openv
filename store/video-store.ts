import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Video, VideoSettings } from "@/types";

interface VideosState {
	videos: Video[];
	selectedVideoIds: number[];
	selectMode: boolean;
	prompt: string;
	isGenerating: boolean;
	gridView: "2x2" | "3x3" | "list";
	searchQuery: string;
	sortOption: "newest" | "oldest" | "name_asc" | "name_desc";
	isRandomSeed: boolean;
	seed: number;
	videoSettings: VideoSettings;
	currentTimestamp: string | null;
	setVideos: (videos: Video[]) => void;
	setIsGenerating: (isGenerating: boolean) => void;
	setPrompt: (prompt: string) => void;
	setGridView: (view: "2x2" | "3x3" | "list") => void;
	setSearchQuery: (query: string) => void;
	setSortOption: (option: "newest" | "oldest" | "name_asc" | "name_desc") => void;
	setIsRandomSeed: (isRandom: boolean) => void;
	setSeed: (seed: number) => void;
	toggleVideoSelection: (id: number) => void;
	clearVideoSelection: () => void;
	setSelectMode: (active: boolean) => void;
	updateVideoStatus: (
		jobId: string,
		status: Video["status"],
		url?: string,
		error?: string
	) => void;
	addVideo: (video: Video) => void;
	getProcessingCount: () => number;
	deleteVideo: (id: number) => Promise<void>;
	deleteSelectedVideos: () => Promise<void>;
	setVideoSettings: (settings: VideoSettings) => void;
	fetchVideos: () => Promise<{
		monthlyQuota?: {
			remainingSeconds: number;
			currentUsage: number;
			limitSeconds: number;
		};
	}>;
	fetchUpdatedVideos: () => Promise<{
		monthlyQuota?: {
			remainingSeconds: number;
			currentUsage: number;
			limitSeconds: number;
		};
	}>;
	initialize: () => Promise<{
		monthlyQuota?: {
			remainingSeconds: number;
			currentUsage: number;
			limitSeconds: number;
		};
	}>;
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
			selectedVideoIds: [],
			selectMode: false,
			prompt: "",
			isGenerating: false,
			gridView: "3x3",
			searchQuery: "",
			sortOption: "newest",
			isRandomSeed: true,
			seed: Math.min(2147483647, Math.floor(Math.random() * 2147483647)),
			videoSettings: {
				...defaultSettings,
				seed: Math.min(2147483647, defaultSettings.seed),
			},
			currentTimestamp: null,

			setVideos: videos => set({ videos }),
			setIsGenerating: isGenerating => set({ isGenerating }),
			setPrompt: prompt => set({ prompt }),
			setGridView: view => set({ gridView: view }),
			setSearchQuery: query => set({ searchQuery: query }),
			setSortOption: option => set({ sortOption: option }),
			setIsRandomSeed: isRandom => set({ isRandomSeed: isRandom }),
			setSeed: seed =>
				set({
					seed: Math.min(2147483647, seed),
					videoSettings: get().videoSettings
						? {
								...get().videoSettings,
								seed: Math.min(2147483647, seed),
							}
						: defaultSettings,
				}),

			toggleVideoSelection: (id: number) =>
				set(state => ({
					selectedVideoIds: state.selectedVideoIds.includes(id)
						? state.selectedVideoIds.filter(videoId => videoId !== id)
						: [...state.selectedVideoIds, id],
				})),

			clearVideoSelection: () => set({ selectedVideoIds: [] }),

			setSelectMode: (active: boolean) => {
				set(state => {
					if (!active) {
						return { selectMode: active, selectedVideoIds: [] };
					}
					return { selectMode: active };
				});
			},

			updateVideoStatus: (jobId, status, url, error) =>
				set(state => {
					const updatedVideos = state.videos.map(v =>
						v.jobId === jobId
							? {
									...v,
									status,
									...(url ? { url } : {}),
									...(error ? { error } : {}),
									updatedAt: new Date().toISOString(),
								}
							: v
					);

					const newestVideo = updatedVideos.reduce(
						(newest, current) => {
							return !newest ||
								(current.updatedAt && current.updatedAt > newest.updatedAt)
								? current
								: newest;
						},
						null as Video | null
					);

					return {
						videos: updatedVideos,
						...(newestVideo &&
						(!state.currentTimestamp || newestVideo.updatedAt > state.currentTimestamp)
							? { currentTimestamp: newestVideo.updatedAt }
							: {}),
					};
				}),

			addVideo: video =>
				set(state => ({
					videos: [
						...state.videos,
						{
							...video,
							frames: video.frames || state.videoSettings.numFrames,
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
					// Find the video to get its jobId
					const video = get().videos.find(v => v.id === id);

					if (!video?.jobId) {
						throw new Error("Video not found or has no jobId");
					}

					const response = await fetch("/api/videos", {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ jobIds: [video.jobId] }),
					});

					if (!response.ok) {
						const data = await response.json();
						throw new Error(data.error || "Failed to delete video");
					}

					set(state => ({
						videos: state.videos.filter(v => v.id !== id),
					}));
				} catch (error) {
					console.error("Error deleting video:", error);
					throw error;
				}
			},

			deleteSelectedVideos: async () => {
				try {
					const state = get();
					const selectedVideos = state.videos.filter(v =>
						state.selectedVideoIds.includes(v.id)
					);

					const jobIds = selectedVideos
						.map(v => v.jobId)
						.filter((jobId): jobId is string => !!jobId);

					if (jobIds.length === 0) {
						throw new Error("No valid videos selected for deletion");
					}

					const response = await fetch("/api/videos", {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ jobIds }),
					});

					if (!response.ok) {
						const data = await response.json();
						throw new Error(data.error || "Failed to delete videos");
					}

					set(state => ({
						videos: state.videos.filter(v => !state.selectedVideoIds.includes(v.id)),
						selectedVideoIds: [],
					}));
				} catch (error) {
					console.error("Error deleting videos:", error);
					throw error;
				}
			},

			setVideoSettings: settings =>
				set(state => ({
					videoSettings: {
						...defaultSettings,
						...state.videoSettings,
						...settings,
						seed: Math.min(2147483647, settings.seed),
					},
				})),

			fetchVideos: async () => {
				try {
					const response = await fetch("/api/videos");
					if (!response.ok) {
						throw new Error("Failed to fetch videos");
					}
					const data = await response.json();
					const { videos, monthlyQuota } = data;

					const newestVideo = videos.reduce((newest: Video | null, current: Video) => {
						return !newest ||
							(current.updatedAt && current.updatedAt > newest.updatedAt)
							? current
							: newest;
					}, null);

					set({
						videos,
						currentTimestamp: newestVideo?.updatedAt || null,
					});

					return { monthlyQuota };
				} catch (error) {
					console.error("Error fetching videos:", error);
					return {};
				}
			},

			fetchUpdatedVideos: async () => {
				const state = get();
				if (!state.currentTimestamp) {
					await state.fetchVideos();
					return {};
				}

				try {
					const response = await fetch(
						`/api/videos?updatedSince=${state.currentTimestamp}`
					);

					if (!response.ok) {
						if (response.status === 400) {
							console.warn("Invalid timestamp parameter, fetching all videos");
							await state.fetchVideos();
							return {};
						}
						throw new Error(`Failed to fetch updated videos: ${response.statusText}`);
					}

					const data = await response.json();
					const { videos: updatedVideos, monthlyQuota } = data;

					set(state => {
						const videoMap = new Map(state.videos.map(v => [v.id, v]));
						let newestTimestamp = state.currentTimestamp;

						updatedVideos.forEach((video: Video) => {
							videoMap.set(video.id, video);
							if (video.updatedAt && video.updatedAt > newestTimestamp!) {
								newestTimestamp = video.updatedAt;
							}
						});

						return {
							videos: Array.from(videoMap.values()),
							currentTimestamp: newestTimestamp,
						};
					});

					return { monthlyQuota };
				} catch (error) {
					console.error("Error fetching updated videos:", error);
					return {};
				}
			},

			initialize: async () => {
				const { fetchVideos } = get();
				const { monthlyQuota } = await fetchVideos();
				return { monthlyQuota };
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
				videoSettings: {
					...defaultSettings,
					...state.videoSettings,
					seed: Math.min(2147483647, state.videoSettings.seed),
				},
			}),
			migrate: (persistedState: any) => {
				const maxInt4 = 2147483647;
				return {
					...persistedState,
					seed: Math.min(
						maxInt4,
						persistedState.seed || Math.floor(Math.random() * maxInt4)
					),
					videoSettings: {
						...defaultSettings,
						...(persistedState.videoSettings || {}),
						seed: Math.min(
							maxInt4,
							persistedState.videoSettings?.seed || defaultSettings.seed
						),
					},
				};
			},
		}
	)
);
