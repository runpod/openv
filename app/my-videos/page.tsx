"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AccessRestricted } from "@/components/access-restricted";
import { PromptInput } from "@/components/prompt-input";
import { Toaster } from "@/components/ui/toaster";
import { VideoGrid } from "@/components/video-grid";
import { useVideosStore } from "@/store/video-store";

import { useMyVideos } from "./provider";

export default function MyVideosPage() {
	const { hasAccess } = useMyVideos();
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
		gridView,
		setGridView,
		searchQuery,
		setSearchQuery,
		sortOption,
		setSortOption,
	} = useVideosStore();

	const [mounted, setMounted] = useState(false);

	const { data: updatedVideos } = useQuery({
		queryKey: ["videos", "polling"],
		queryFn: async () => {
			const processingCount = getProcessingCount();
			if (processingCount > 0) {
				await fetchUpdatedVideos();
			}
			return null;
		},
		refetchInterval: 20000,
	});

	// Initialize store and set mounted state
	useEffect(() => {
		initialize().then(() => setMounted(true));
	}, [initialize]);

	const handleGenerate = async () => {
		if (!prompt || !hasAccess) return;

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
			status: video.status as "queued" | "processing" | "completed",
		}));

	if (!mounted) {
		return (
			<div className="h-screen w-full flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="h-full min-h-screen w-full bg-background text-foreground mt-16">
			{!hasAccess && (
				<div className="max-w-screen-xl mx-auto px-4 mb-8">
					<AccessRestricted />
				</div>
			)}
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
								disabled={!hasAccess}
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
