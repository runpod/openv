"use client";

import { useEffect, useState } from "react";

import { Toaster } from "@/components/ui/toaster";

import InspirationGrid from "./InspirationGrid";
import PromptInput from "./PromptInput";
import SettingsSidebar from "./SettingsSidebar";
import VideoGrid, { SortOption } from "./VideoGrid";
import { VideoSettings as VideoSettingsType } from "./VideoSettings";

export type Video = {
	id: string;
	prompt: string;
	frames: number;
	url: string;
	seed: number;
	status: "generating" | "completed" | "failed";
	enhancePrompt: boolean;
	enhancedPromptText?: string;
	jobId?: string;
};

export type QueueItem = {
	id: string;
	prompt: string;
	status: "queued" | "processing" | "completed" | "failed";
};

type GridView = "2x2" | "3x3" | "list";

type HealthStatus = {
	jobs: {
		completed: number;
		failed: number;
		inProgress: number;
		inQueue: number;
		retried: number;
	};
	workers: {
		idle: number;
		initializing: number;
		ready: number;
		running: number;
		throttled: number;
	};
};

export default function HomePage() {
	const [mounted, setMounted] = useState(false);
	const [videos, setVideos] = useState<Video[]>([]);
	const [queue, setQueue] = useState<QueueItem[]>([]);
	const [prompt, setPrompt] = useState("");
	const [gridView, setGridView] = useState<GridView>("2x2");
	const [searchQuery, setSearchQuery] = useState("");
	const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
	const [videoSettings, setVideoSettings] = useState<VideoSettingsType>({
		negativePrompt: "",
		width: 848,
		height: 480,
		steps: 40,
		cfg: 6,
		numFrames: 31,
	});
	const [seed, setSeed] = useState(Math.floor(Math.random() * 1000000));
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isRandomSeed, setIsRandomSeed] = useState(true);
	const [, setGeneratingCount] = useState(0);
	const [, setCompletedCount] = useState(0);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isQueued, setIsQueued] = useState(false);
	const [sortOption, setSortOption] = useState<SortOption>("newest");

	useEffect(() => {
		setMounted(true);
		loadVideosFromLocalStorage();
		fetchHealthStatus();
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			videos.forEach(video => {
				if (video.status === "generating" && video.jobId) {
					checkJobStatus(video.jobId);
				}
			});
		}, 5000);

		return () => clearInterval(interval);
	}, [videos]);

	useEffect(() => {
		const generating = videos.filter(v => v.status === "generating").length;
		const completed = videos.filter(v => v.status === "completed").length;
		setGeneratingCount(generating);
		setCompletedCount(completed);
	}, [videos]);

	const fetchHealthStatus = async () => {
		try {
			const response = await fetch("/api/runpod");
			if (!response.ok) {
				throw new Error("Failed to fetch health status");
			}
			const data = await response.json();
			console.log("RunPod Health Status:", data);
			setHealthStatus(data);
		} catch (error) {
			console.error("Error fetching health status:", error);
		}
	};

	const handleGenerate = async () => {
		setIsGenerating(true);

		const newQueueItem: QueueItem = {
			id: Date.now().toString(),
			prompt: prompt,
			status: "queued",
		};
		setQueue(prevQueue => [...prevQueue, newQueueItem]);

		try {
			const response = await fetch("/api/runpod", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					input: {
						positive_prompt: prompt,
						negative_prompt: videoSettings.negativePrompt,
						width: videoSettings.width,
						height: videoSettings.height,
						seed: isRandomSeed ? Math.floor(Math.random() * 1000000) : seed,
						steps: videoSettings.steps,
						cfg: videoSettings.cfg,
						num_frames: videoSettings.numFrames,
					},
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to submit job");
			}

			const result = await response.json();
			console.log("Job submitted:", result);

			const newVideo: Video = {
				id: newQueueItem.id,
				prompt: prompt,
				frames: videoSettings.numFrames,
				url: "",
				seed: isRandomSeed ? Math.floor(Math.random() * 1000000) : seed,
				status: "generating",
				enhancePrompt: false,
				jobId: result.id,
			};

			setVideos(prevVideos => [...prevVideos, newVideo]);
			saveVideoToLocalStorage(newVideo);
			setQueue(prevQueue =>
				prevQueue.map(item =>
					item.id === newQueueItem.id ? { ...item, status: "processing" } : item
				)
			);

			// Ensure the spinner is shown for at least 1 second
			await new Promise(resolve => setTimeout(resolve, 1000));

			setIsGenerating(false);
			setIsQueued(true);

			// Show "Queued" for at least 1 second
			await new Promise(resolve => setTimeout(resolve, 1000));

			setIsQueued(false);
		} catch (error) {
			console.error("Error submitting job:", error);
			setQueue(prevQueue =>
				prevQueue.map(item =>
					item.id === newQueueItem.id ? { ...item, status: "failed" } : item
				)
			);

			// Ensure the spinner is shown for at least 1 second even in case of error
			await new Promise(resolve => setTimeout(resolve, 1000));

			setIsGenerating(false);
			setIsQueued(false);
		}
	};

	const checkJobStatus = async (jobId: string) => {
		try {
			const response = await fetch(`/api/runpod/${jobId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch job status");
			}
			const result = await response.json();

			if (result.status === "COMPLETED" || result.status === "FAILED") {
				setVideos(prevVideos => {
					const updatedVideos = prevVideos.map(v =>
						v.jobId === jobId
							? {
									...v,
									status: (result.status === "COMPLETED"
										? "completed"
										: "failed") as Video["status"],
									url: result.status === "COMPLETED" ? result.output.url : "",
							  }
							: v
					);
					localStorage.setItem("openVVideos", JSON.stringify(updatedVideos));
					return updatedVideos;
				});

				setQueue(prevQueue =>
					prevQueue.map(item =>
						item.id === jobId
							? {
									...item,
									status: result.status.toLowerCase() as QueueItem["status"],
							  }
							: item
					)
				);
			}
		} catch (error) {
			console.error("Error checking job status:", error);
		}
	};

	const applyVideoSettings = (video: Video) => {
		setPrompt(video.prompt);
		setVideoSettings(prevSettings => ({ ...prevSettings, numFrames: video.frames }));
		setSeed(video.seed);
	};

	const saveVideoToLocalStorage = (video: Video) => {
		const savedVideos = JSON.parse(localStorage.getItem("openVVideos") || "[]");
		const updatedVideos = [...savedVideos, video];
		localStorage.setItem("openVVideos", JSON.stringify(updatedVideos));
	};

	const loadVideosFromLocalStorage = () => {
		const savedVideos = JSON.parse(localStorage.getItem("openVVideos") || "[]");
		setVideos(savedVideos);
	};

	if (!mounted) {
		return null;
	}

	return (
		<div className="h-full min-h-screen w-full bg-background text-foreground">
			<div className="flex h-full">
				<div className="flex-grow">
					<div className="sticky top-0 z-10 bg-background p-4">
						<PromptInput
							prompt={prompt}
							setPrompt={setPrompt}
							onGenerate={handleGenerate}
							onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
							isGenerating={isGenerating}
							isQueued={isQueued}
						/>
					</div>
					<div className="px-4">
						<VideoGrid
							videos={videos}
							queue={queue}
							gridView={gridView}
							setGridView={setGridView}
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							onDelete={id => {
								setVideos(prevVideos => prevVideos.filter(v => v.id !== id));
							}}
							onCopySettings={applyVideoSettings}
							sortOption={sortOption}
							setSortOption={setSortOption}
							inspirationContent={
								<InspirationGrid
									applyVideoSettings={applyVideoSettings}
									gridView={gridView}
									setGridView={setGridView}
									searchQuery={searchQuery}
									setSearchQuery={setSearchQuery}
								/>
							}
						/>
					</div>
				</div>
				<div className="w-[30vw] flex-shrink-0 border-l border-border">
					{isSettingsOpen && (
						<SettingsSidebar
							videoSettings={videoSettings}
							setVideoSettings={setVideoSettings}
							seed={seed}
							setSeed={setSeed}
							isRandomSeed={isRandomSeed}
							setIsRandomSeed={setIsRandomSeed}
						/>
					)}
				</div>
			</div>
			<Toaster />
		</div>
	);
}
