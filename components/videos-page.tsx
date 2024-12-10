"use client";

import { useEffect, useState } from "react";

import { Toaster } from "@/components/ui/toaster";
import { useVideosStore } from "@/hooks/use-videos-store";
import { Video } from "@/types";

import PromptInput from "./prompt-input";
import VideoGrid from "./video-grid";

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

export default function VideosPage() {
	const {
		videos,
		setVideos,
		isGenerating,
		setIsGenerating,
		prompt,
		setPrompt,
		isSettingsOpen,
		setIsSettingsOpen,
		videoSettings,
		addVideo,
		updateVideoJobId,
		updateVideoStatus,
		getProcessingCount,
	} = useVideosStore();

	const [mounted, setMounted] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortOption, setSortOption] = useState<SortOption>("newest");

	useEffect(() => {
		setMounted(true);
	}, []);

	// Poll for video status updates
	useEffect(() => {
		const interval = setInterval(async () => {
			const generatingVideos = videos.filter(v => v.status === "generating" && v.jobId);

			for (const video of generatingVideos) {
				try {
					const response = await fetch(`/api/runpod/${video.jobId}`);
					const data = await response.json();

					if (!response.ok) {
						console.error(`Error checking status for video ${video.id}:`, data.error);
						updateVideoStatus(video.id, "failed");
						continue;
					}

					if (data.status === "COMPLETED") {
						if (data.output?.url) {
							updateVideoStatus(video.id, "completed", data.output.url);
						} else {
							console.error(`No URL in completed response for video ${video.id}`);
							updateVideoStatus(video.id, "failed");
						}
					} else if (data.status === "FAILED") {
						console.error(`Job failed for video ${video.id}`);
						updateVideoStatus(video.id, "failed");
					}
					// For "IN_PROGRESS" or "IN_QUEUE", we keep the current status
				} catch (error) {
					console.error(`Error polling status for video ${video.id}:`, error);
				}
			}
		}, 5000); // Poll every 5 seconds

		return () => clearInterval(interval);
	}, [videos, updateVideoStatus]);

	const handleGenerate = async () => {
		if (!prompt) return;

		setIsGenerating(true);

		const id = new Date().getTime().toString();
		const seed = Math.floor(Math.random() * 1000000);

		const newVideo: Video = {
			id,
			prompt,
			frames: videoSettings.numFrames,
			url: "",
			seed,
			status: "generating",
			enhancePrompt: false,
			jobId: "",
			createdAt: new Date().toISOString(),
		};

		addVideo(newVideo);

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
						seed,
						steps: videoSettings.steps,
						cfg: videoSettings.cfg,
						num_frames: videoSettings.numFrames,
					},
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to generate video");
			}

			updateVideoJobId(id, data.id);
			updateVideoStatus(id, "generating");
			setIsGenerating(false);
		} catch (error) {
			console.error("Error generating video:", error);
			updateVideoStatus(id, "failed");
			setIsGenerating(false);
		}
	};

	const applyVideoSettings = (video: { prompt: string; frames: number; seed: number }) => {
		setPrompt(video.prompt);
	};

	if (!mounted) {
		return null;
	}

	return (
		<div className="h-full min-h-screen w-full bg-background text-foreground">
			<div className="flex h-full">
				<div className="flex-grow">
					<div className="sticky top-0 z-10 bg-background p-4 max-w-screen-xl">
						<PromptInput
							prompt={prompt}
							setPrompt={setPrompt}
							onGenerate={handleGenerate}
							onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
							isGenerating={isGenerating}
							processingCount={getProcessingCount()}
						/>
					</div>
					<div className="py-4">
						<VideoGrid
							videos={videos}
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							onDelete={id => {
								updateVideoStatus(id, "failed");
							}}
							onCopySettings={applyVideoSettings}
							sortOption={sortOption}
							setSortOption={setSortOption}
						/>
					</div>
				</div>
			</div>
			<Toaster />
		</div>
	);
}
