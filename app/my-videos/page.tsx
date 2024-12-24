"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AccessRestricted } from "@/components/access-restricted";
import { PromptInput } from "@/components/prompt-input";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { VideoGrid } from "@/components/video-grid";
import { useVideosStore } from "@/store/video-store";

import { useMyVideos } from "./provider";

export default function MyVideosPage() {
	const { toast } = useToast();
	const { hasAccess, monthlyQuota, updateMonthlyQuota } = useMyVideos();
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
				const { monthlyQuota: updatedQuota } = await fetchUpdatedVideos();
				if (updatedQuota) {
					updateMonthlyQuota(updatedQuota);
				}
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
					input: {
						positive_prompt: prompt,
						negative_prompt: videoSettings.negativePrompt,
						width: videoSettings.width,
						height: videoSettings.height,
						steps: videoSettings.steps,
						cfg: videoSettings.cfg,
						num_frames: videoSettings.numFrames,
						seed: videoSettings.seed,
					},
				}),
			});

			const data = await response.json();

			// Always update quota if it's included in the response
			if (data.monthlyQuota) {
				updateMonthlyQuota(data.monthlyQuota);
			}

			if (!response.ok) {
				toast({
					variant: "destructive",
					title: "Error",
					description: data.message || data.error || "Failed to generate video",
				});
				throw new Error(data.message || data.error || "Failed to generate video");
			}

			// Add video to state
			addVideo(data);

			if (isRandomSeed) {
				// Generate a random seed within PostgreSQL INT4 range (max 2147483647)
				const maxInt4 = 2147483647;
				const newSeed = Math.floor(Math.random() * maxInt4);
				setSeed(newSeed);
				setVideoSettings({ ...videoSettings, seed: newSeed });
			}
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
								monthlyQuota={monthlyQuota}
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
