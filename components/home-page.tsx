"use client";

import { useEffect, useState } from "react";

import PromptInput from "@/components/prompt-input";
import { Toaster } from "@/components/ui/toaster";
import VideoGrid from "@/components/video-grid";
import { useVideosStore } from "@/hooks/use-videos-store";
import { type Video } from "@/types";

export default function HomePage() {
	const {
		videos,
		prompt,
		setPrompt,
		isGenerating,
		setIsGenerating,
		getProcessingCount,
		videoSettings,
		setHealthStatus,
		gridView,
		setGridView,
		searchQuery,
		setSearchQuery,
		sortOption,
		setSortOption,
		isRandomSeed,
		seed,
		setSeed,
		addVideo,
		updateVideoJobId,
		updateVideoStatus,
	} = useVideosStore();

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		fetchHealthStatus();
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			videos.forEach((video: Video) => {
				if (video.status === "generating" && video.jobId) {
					console.log("Checking status for video:", video.jobId);
					checkJobStatus(video.jobId);
				}
			});
		}, 3000);

		return () => clearInterval(interval);
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
		if (!prompt) return;

		setIsGenerating(true);

		const id = new Date().getTime().toString();
		const currentSeed = isRandomSeed ? Math.floor(Math.random() * 1000000) : seed;

		const newVideo: Video = {
			id,
			prompt,
			frames: videoSettings.numFrames,
			url: "",
			seed: currentSeed,
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
						seed: currentSeed,
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

		if (isRandomSeed) {
			setSeed(Math.floor(Math.random() * 1000000));
		}
	};

	const checkJobStatus = async (jobId: string) => {
		try {
			const response = await fetch(`/api/runpod/${jobId}`);
			const result = await response.json();

			console.log(`Job ${jobId} status:`, result);

			if (result.status === "COMPLETED") {
				const video = videos.find((v: Video) => v.jobId === jobId);
				if (video) {
					updateVideoStatus(video.id, "completed", result.output?.url);
				}
			} else if (result.status === "FAILED") {
				const video = videos.find((v: Video) => v.jobId === jobId);
				if (video) {
					updateVideoStatus(video.id, "failed");
				}
			}
		} catch (error) {
			console.error("Error checking job status:", error);
		}
	};

	const applyVideoSettings = (video: { prompt: string; frames: number; seed: number }) => {
		setPrompt(video.prompt);
	};

	if (!mounted) {
		return null;
	}

	return (
		<div className="flex flex-col h-full bg-background text-foreground">
			<div className="sticky top-0 z-10 bg-background p-4 border-b">
				<PromptInput
					prompt={prompt}
					setPrompt={setPrompt}
					onGenerate={handleGenerate}
					isGenerating={isGenerating}
					processingCount={getProcessingCount()}
				/>
			</div>
			<div className="flex-1 overflow-y-auto">
				<div className="px-4">
					<VideoGrid
						videos={videos}
						gridView={gridView}
						setGridView={setGridView}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						onDelete={(id: string) => {
							updateVideoStatus(id, "failed");
						}}
						onCopySettings={applyVideoSettings}
						sortOption={sortOption}
						setSortOption={setSortOption}
					/>
				</div>
			</div>
			<Toaster />
		</div>
	);
}
