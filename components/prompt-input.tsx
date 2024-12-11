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
	const MAX_CHARS = 500;

	useEffect(() => {
		setCharCount(prompt.length);
	}, [prompt]);

	const handleGenerate = () => {
		if (prompt.trim() === "" || charCount > MAX_CHARS) {
			return;
		}
		onGenerate(prompt);
	};

	const getButtonContent = () => {
		if (isGenerating) {
			return (
				<>
					<Loader2 className="h-5 w-5 animate-spin mr-2" />
					Generating...
				</>
			);
		}
		return "Generate";
	};

	const handleAspectRatioChange = (aspectRatio: "16:9" | "9:16" | "1:1") => {
		let newWidth, newHeight;
		switch (aspectRatio) {
			case "16:9":
				newWidth = 848;
				newHeight = 480;
				break;
			case "9:16":
				newWidth = 480;
				newHeight = 848;
				break;
			case "1:1":
				newWidth = 640;
				newHeight = 640;
				break;
		}
		setVideoSettings({ ...videoSettings, width: newWidth, height: newHeight });
	};

	const getCurrentAspectRatio = (): "16:9" | "9:16" | "1:1" => {
		const { width, height } = videoSettings;
		if (width === 848 && height === 480) return "16:9";
		if (width === 480 && height === 848) return "9:16";
		if (width === 640 && height === 640) return "1:1";
		return "16:9";
	};

	const handleSeedChange = (newSeed: number, isRandom: boolean) => {
		setSeed(newSeed);
		setIsRandomSeed(isRandom);
		setVideoSettings({ ...videoSettings, seed: newSeed });
	};

	const handleNegativePromptChange = (negativePrompt: string) => {
		setVideoSettings({ ...videoSettings, negativePrompt });
	};

	return (
		<div className="relative bg-secondary p-2 rounded-lg shadow-md">
			<div className="relative">
				<Textarea
					placeholder="Describe your video..."
					value={prompt}
					onChange={e => {
						if (e.target.value.length <= MAX_CHARS) {
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
						/>
						<StepsSelector
							steps={videoSettings.steps}
							onChange={steps => setVideoSettings({ ...videoSettings, steps })}
						/>
						<CfgSelector
							cfg={videoSettings.cfg}
							onChange={cfg => setVideoSettings({ ...videoSettings, cfg })}
						/>
						<SeedSelector
							seed={seed}
							isRandomSeed={isRandomSeed}
							onChange={handleSeedChange}
						/>
						<NegativePromptSelector
							negativePrompt={videoSettings.negativePrompt}
							onChange={handleNegativePromptChange}
						/>
					</div>
					<div className="backdrop-blur-sm rounded-md p-2 flex items-center space-x-2">
						<span className="text-sm text-muted-foreground">
							{charCount} / {MAX_CHARS}
						</span>
						<QueueButton queueItems={queueItems} isProcessing={isGenerating} />
						<Button
							variant="default"
							className="text-primary-foreground bg-primary hover:bg-primary/90 flex-1"
							onClick={handleGenerate}
							disabled={prompt.trim() === "" || isGenerating || charCount > MAX_CHARS}
						>
							{getButtonContent()}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
