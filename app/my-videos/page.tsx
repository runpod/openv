"use client";

import { useEffect, useState } from "react";

import { PromptInput } from "@/components/prompt-input";
import { Toaster } from "@/components/ui/toaster";
import { VideoGrid } from "@/components/video-grid";
import { useVideosStore } from "@/store/video-store";

export default function MyVideosPage() {
	const {
		videos,
		isGenerating,
		setIsGenerating,
		prompt,
		setPrompt,
		videoSettings,
		setVideoSettings,
		seed,
		setSeed,
		isRandomSeed,
		setIsRandomSeed,
		addVideo,
		getProcessingCount,
		deleteVideo,
		initialize,
		fetchUpdatedVideos,
	} = useVideosStore();

	const [mounted, setMounted] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortOption, setSortOption] = useState<"newest" | "oldest" | "name_asc" | "name_desc">(
		"newest"
	);
	const [gridView, setGridView] = useState<"2x2" | "3x3" | "list">("3x3");

	// Initialize store and set mounted state
	useEffect(() => {
		initialize().then(() => setMounted(true));
	}, [initialize]);

	// Poll for video updates
	useEffect(() => {
		const interval = setInterval(async () => {
			const processingCount = getProcessingCount();
			if (processingCount > 0) {
				await fetchUpdatedVideos();
			}
		}, 20000);

		return () => clearInterval(interval);
	}, [fetchUpdatedVideos, getProcessingCount]);

	const handleGenerate = async () => {
		if (!prompt) return;

		setIsGenerating(true);

		try {
			const response = await fetch("/api/runpod", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt,
					modelName: "mochi-1",
					frames: videoSettings.numFrames,
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
				const error = await response.json();
				throw new Error(error.error || "Failed to generate video");
			}

			const video = await response.json();
			addVideo(video);
		} catch (error) {
			console.error("Error generating video:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const applyVideoSettings = (video: { prompt: string; frames?: number; seed?: number }) => {
		setPrompt(video.prompt);
		if (video.seed) setSeed(video.seed);
	};

	// Transform videos to queue items
	const queueItems = videos
		.filter(video => video.status === "queued" || video.status === "processing")
		.map(video => ({
			id: video.id.toString(),
			prompt: video.prompt,
			status: "processing" as const,
		}));

	if (!mounted) {
		return null;
	}

	return (
		<div className="h-full min-h-screen w-full bg-background text-foreground mt-16">
			<div className="flex h-full">
				<div className="flex-grow">
					<div className="sticky top-0 z-10 bg-background p-4">
						<div className="max-w-screen-xl mx-auto">
							<PromptInput
								prompt={prompt}
								setPrompt={setPrompt}
								onGenerate={handleGenerate}
								isGenerating={isGenerating}
								processingCount={getProcessingCount()}
								videoSettings={videoSettings}
								setVideoSettings={setVideoSettings}
								seed={seed}
								setSeed={setSeed}
								isRandomSeed={isRandomSeed}
								setIsRandomSeed={setIsRandomSeed}
								queueItems={queueItems}
							/>
						</div>
					</div>
					<div className="py-4 px-4 xl:px-0 2xl:px-16">
						<VideoGrid
							videos={videos}
							gridView={gridView}
							setGridView={setGridView}
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							onDelete={deleteVideo}
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
