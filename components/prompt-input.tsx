"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
import { getModelConfig, systemConfig } from "@/lib/models/config";
import { VideoSettings } from "@/types";

interface PromptInputProps {
	prompt: string;
	setPrompt: (prompt: string) => void;
	onGenerate: () => void;
	isGenerating: boolean;
	processingCount: number;
	videoSettings: VideoSettings;
	setVideoSettings: (settings: VideoSettings) => void;
	seed: number;
	setSeed: (seed: number) => void;
	isRandomSeed: boolean;
	setIsRandomSeed: (isRandom: boolean) => void;
	queueItems: QueueItem[];
	disabled?: boolean;
	monthlyQuota?: {
		remainingSeconds: number;
		currentUsage: number;
		limitSeconds: number;
	};
}

interface ButtonState {
	isDisabled: boolean;
	reason: string;
	suggestedFrames: number | null;
}

export function PromptInput({
	prompt,
	setPrompt,
	onGenerate,
	isGenerating,
	videoSettings,
	setVideoSettings,
	seed,
	setSeed,
	isRandomSeed,
	setIsRandomSeed,
	queueItems,
	disabled,
	monthlyQuota,
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
		onGenerate();
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
		console.log(
			"Seed change:",
			JSON.stringify({ newSeed, isRandom, currentSeed: seed }, null, 2)
		);
		setSeed(newSeed);
		setIsRandomSeed(isRandom);
		setVideoSettings({ ...videoSettings, seed: newSeed });
		console.log(
			"After seed change:",
			JSON.stringify({ newSeed, videoSettings: { ...videoSettings, seed: newSeed } }, null, 2)
		);
	};

	const handleNegativePromptChange = (negativePrompt: string) => {
		if (negativePrompt.length <= limits.negativePrompt.maxLength) {
			setVideoSettings({ ...videoSettings, negativePrompt });
		}
	};

	const queuedCount = queueItems.filter(item => item.status === "queued").length;
	const isQueueFull = queuedCount >= systemConfig.concurrentJobs.max;

	// Calculate estimated duration based on frames and fps from model config
	const modelConfig = getModelConfig("mochi-1");
	const fps = modelConfig.fps;
	const estimatedDuration = videoSettings.numFrames / fps;

	// Check if we have enough quota for even the minimum video length
	const hasNoQuotaLeft =
		monthlyQuota && monthlyQuota.remainingSeconds < modelConfig.minimumQuotaSeconds;

	// Get all possible frame counts and their durations
	const possibleLengths = useMemo(() => {
		const lengths = [];
		for (let i = limits.numFrames.min; i <= limits.numFrames.max; i += 6) {
			lengths.push({
				frames: i,
				duration: i / fps,
			});
		}
		return lengths;
	}, [fps, limits.numFrames.min, limits.numFrames.max]);

	// Check if current duration would exceed quota, considering the next higher length
	const wouldExceedQuota = useMemo(() => {
		if (!monthlyQuota) return false;

		// Find the length that's just above the remaining quota
		const nextPossibleLength = possibleLengths.find(
			length => length.duration > monthlyQuota.remainingSeconds
		);

		// Find the length that's just below the remaining quota
		const currentPossibleLength = [...possibleLengths]
			.reverse()
			.find(length => length.duration <= monthlyQuota.remainingSeconds);

		// If we can't find a possible length, don't allow generation
		if (!currentPossibleLength) return true;

		// If the current video length is less than or equal to the current possible length,
		// or if it's the next possible length, allow generation
		return !(
			estimatedDuration <= currentPossibleLength.duration ||
			(nextPossibleLength && estimatedDuration === nextPossibleLength.duration)
		);
	}, [monthlyQuota, estimatedDuration, possibleLengths]);

	// Debug log for quota calculations
	useEffect(() => {
		console.log(
			"Quota Calculations:",
			JSON.stringify(
				{
					currentFrames: videoSettings.numFrames,
					estimatedDuration: estimatedDuration.toFixed(2),
					remainingSeconds: monthlyQuota?.remainingSeconds.toFixed(2),
					wouldExceedQuota,
					possibleLengths: possibleLengths.map(l => ({
						frames: l.frames,
						duration: l.duration.toFixed(2),
					})),
				},
				null,
				2
			)
		);
	}, [
		estimatedDuration,
		monthlyQuota?.remainingSeconds,
		wouldExceedQuota,
		possibleLengths,
		videoSettings.numFrames,
	]);

	// Evaluate all conditions that could disable the button
	const buttonState = useMemo<ButtonState>(() => {
		const state = {
			isDisabled: false,
			reason: "",
			suggestedFrames: null as number | null,
		};

		if (prompt.trim() === "") {
			state.isDisabled = true;
			state.reason = "Please enter a prompt";
		} else if (isGenerating) {
			state.isDisabled = true;
			state.reason = "Generating...";
		} else if (charCount > limits.prompt.maxLength) {
			state.isDisabled = true;
			state.reason = "Prompt is too long";
		} else if (isQueueFull) {
			state.isDisabled = true;
			state.reason = `You can only generate ${systemConfig.concurrentJobs.max} videos at the same time`;
		} else if (disabled) {
			state.isDisabled = true;
			state.reason = "Add a voucher to enable video generation";
		} else if (hasNoQuotaLeft) {
			state.isDisabled = true;
			state.reason = "You have reached your monthly video generation limit";
		} else if (wouldExceedQuota) {
			state.isDisabled = true;
			state.reason = `Video too long. You have ${monthlyQuota?.remainingSeconds.toFixed(2)}s remaining`;
		}

		return state;
	}, [
		prompt,
		isGenerating,
		charCount,
		limits.prompt.maxLength,
		isQueueFull,
		disabled,
		hasNoQuotaLeft,
		wouldExceedQuota,
		monthlyQuota?.remainingSeconds,
		fps,
	]);

	// Auto-adjust video length if a better length is suggested
	useEffect(() => {
		if (buttonState.suggestedFrames && !buttonState.isDisabled) {
			setVideoSettings({
				...videoSettings,
				numFrames: buttonState.suggestedFrames,
			});
		}
	}, [buttonState.suggestedFrames, buttonState.isDisabled, setVideoSettings, videoSettings]);

	// Debug logs
	useEffect(() => {
		console.log(
			"Button State:",
			JSON.stringify(
				{
					numFrames: videoSettings.numFrames,
					fps,
					estimatedDuration: estimatedDuration.toFixed(2),
					remainingSeconds: monthlyQuota?.remainingSeconds.toFixed(2),
					wouldExceedQuota,
					otherConditions: {
						emptyPrompt: prompt.trim() === "",
						isGenerating,
						promptTooLong: charCount > limits.prompt.maxLength,
						isQueueFull,
						disabled,
						hasNoQuotaLeft,
					},
					buttonState: {
						isDisabled: buttonState.isDisabled,
						reason: buttonState.reason,
					},
				},
				null,
				2
			)
		);
	}, [
		videoSettings.numFrames,
		monthlyQuota?.remainingSeconds,
		estimatedDuration,
		wouldExceedQuota,
		prompt,
		isGenerating,
		charCount,
		isQueueFull,
		disabled,
		hasNoQuotaLeft,
		buttonState,
		fps,
		limits.prompt.maxLength,
	]);

	const maxInt4 = 2147483647;

	// Validate seed values on mount
	useEffect(() => {
		if (seed > maxInt4 || videoSettings.seed > maxInt4) {
			console.log(
				"Fixing invalid seed values:",
				JSON.stringify(
					{
						oldSeed: seed,
						oldVideoSettingsSeed: videoSettings.seed,
						maxInt4,
					},
					null,
					2
				)
			);
			const newSeed = Math.min(maxInt4, seed);
			setSeed(newSeed);
			setVideoSettings({
				...videoSettings,
				seed: newSeed,
			});
		}
	}, []); // Only run on mount

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
							min={0}
							max={2147483647}
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
											disabled={buttonState.isDisabled}
										>
											{isGenerating ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												"Generate"
											)}
										</Button>
									</div>
								</TooltipTrigger>
								{buttonState.isDisabled && buttonState.reason && (
									<TooltipContent>
										<p>{buttonState.reason}</p>
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
