"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AspectRatioSelector } from "@/components/aspect-ratio-selector";
import { CfgSelector } from "@/components/cfg-selector";
import { LengthSelector } from "@/components/length-selector";
import { NegativePromptSelector } from "@/components/negative-prompt-selector";
import { QueueButton, QueueItem } from "@/components/queue-button";
import { SeedSelector } from "@/components/seed-selector";
import { StepsSelector } from "@/components/steps-selector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useModelSettings } from "@/hooks/use-model-settings";
import { systemConfig } from "@/lib/models/config";
import { VideoSettings } from "@/types";

interface PromptInputProps {
	prompt: string;
	setPrompt: (prompt: string) => void;
	onGenerate: (prompt: string) => void;
	isGenerating: boolean;
	processingCount: number;
	videoSettings: VideoSettings;
	setVideoSettings: (settings: VideoSettings) => void;
	seed: number;
	setSeed: (seed: number) => void;
	isRandomSeed: boolean;
	setIsRandomSeed: (isRandom: boolean) => void;
	queueItems: QueueItem[];
}

export function PromptInput({
	prompt,
	setPrompt,
	onGenerate,
	isGenerating,
	processingCount,
	videoSettings,
	setVideoSettings,
	seed,
	setSeed,
	isRandomSeed,
	setIsRandomSeed,
	queueItems,
}: PromptInputProps) {
	const [charCount, setCharCount] = useState(0);
	const { limits, aspectRatios } = useModelSettings();

	useEffect(() => {
		setCharCount(prompt.length);
	}, [prompt]);

	const handleGenerate = () => {
		if (prompt.trim() === "" || charCount > limits.prompt.maxLength) {
			return;
		}
		onGenerate(prompt);
	};

	const handleAspectRatioChange = (aspectRatio: "16:9" | "9:16" | "1:1") => {
		const { width, height } = aspectRatios[aspectRatio];
		setVideoSettings({ ...videoSettings, width, height });
	};

	const getCurrentAspectRatio = (): "16:9" | "9:16" | "1:1" => {
		const { width, height } = videoSettings;
		if (width === aspectRatios["16:9"].width && height === aspectRatios["16:9"].height)
			return "16:9";
		if (width === aspectRatios["9:16"].width && height === aspectRatios["9:16"].height)
			return "9:16";
		if (width === aspectRatios["1:1"].width && height === aspectRatios["1:1"].height)
			return "1:1";
		return "16:9";
	};

	const handleSeedChange = (newSeed: number, isRandom: boolean) => {
		setSeed(newSeed);
		setIsRandomSeed(isRandom);
		setVideoSettings({ ...videoSettings, seed: newSeed });
	};

	const handleNegativePromptChange = (negativePrompt: string) => {
		if (negativePrompt.length <= limits.negativePrompt.maxLength) {
			setVideoSettings({ ...videoSettings, negativePrompt });
		}
	};

	const queuedCount = queueItems.filter(item => item.status === "queued").length;
	const isQueueFull = queuedCount >= systemConfig.concurrentJobs.max;

	return (
		<div className="relative bg-secondary p-2 rounded-lg shadow-md">
			<div className="relative">
				<Textarea
					placeholder="Describe your video..."
					value={prompt}
					onChange={e => {
						if (e.target.value.length <= limits.prompt.maxLength) {
							setPrompt(e.target.value);
						}
					}}
					onKeyDown={e => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleGenerate();
						}
					}}
					className="min-h-[120px] resize-none text-lg md:text-lg bg-background/50 backdrop-blur-sm border-2 rounded-md"
				/>

				<div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
					<div className="backdrop-blur-sm rounded-md p-2 flex items-center space-x-2 overflow-x-auto max-w-[70%]">
						<AspectRatioSelector
							aspectRatio={getCurrentAspectRatio()}
							onChange={handleAspectRatioChange}
						/>
						<LengthSelector
							numFrames={videoSettings.numFrames}
							onChange={frames =>
								setVideoSettings({ ...videoSettings, numFrames: frames })
							}
							min={limits.numFrames.min}
							max={limits.numFrames.max}
						/>
						<StepsSelector
							steps={videoSettings.steps}
							onChange={steps => setVideoSettings({ ...videoSettings, steps })}
							min={limits.steps.min}
							max={limits.steps.max}
						/>
						<CfgSelector
							cfg={videoSettings.cfg}
							onChange={cfg => setVideoSettings({ ...videoSettings, cfg })}
							min={limits.cfg.min}
							max={limits.cfg.max}
						/>
						<SeedSelector
							seed={seed}
							isRandomSeed={isRandomSeed}
							onChange={handleSeedChange}
							min={limits.seed.min}
							max={limits.seed.max}
						/>
						<NegativePromptSelector
							negativePrompt={videoSettings.negativePrompt}
							onChange={handleNegativePromptChange}
							maxLength={limits.negativePrompt.maxLength}
						/>
					</div>
					<div className="backdrop-blur-sm rounded-md p-2 flex items-center space-x-2">
						<span className="text-sm text-muted-foreground">
							{charCount} / {limits.prompt.maxLength}
						</span>
						<QueueButton queueItems={queueItems} isProcessing={isGenerating} />
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<Button
											variant="default"
											className="text-primary-foreground bg-primary hover:bg-primary/90 w-[100px] flex-1"
											onClick={handleGenerate}
											disabled={
												prompt.trim() === "" ||
												isGenerating ||
												charCount > limits.prompt.maxLength ||
												isQueueFull
											}
										>
											{isGenerating ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												"Generate"
											)}
										</Button>
									</div>
								</TooltipTrigger>
								{isQueueFull && (
									<TooltipContent>
										<p>
											You can only generate {systemConfig.concurrentJobs.max}{" "}
											videos at the same time
										</p>
									</TooltipContent>
								)}
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
			</div>
		</div>
	);
}
