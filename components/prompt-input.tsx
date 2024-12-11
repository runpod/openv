"use client";

import { Clock3, Dices, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { VideoSettings } from "@/types";

const frameOptions = [
	7, 13, 19, 25, 31, 37, 43, 49, 55, 61, 67, 73, 79, 85, 91, 97, 103, 109, 115, 121, 127,
];

interface PromptInputProps {
	prompt: string;
	setPrompt: (prompt: string) => void;
	onGenerate: () => void;
	isGenerating: boolean;
	processingCount: number;
	children?: React.ReactNode;
	videoSettings: VideoSettings;
	setVideoSettings: (settings: VideoSettings) => void;
	seed: number;
	setSeed: (seed: number) => void;
	isRandomSeed: boolean;
	setIsRandomSeed: (isRandom: boolean) => void;
}

export default function PromptInput({
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
		onGenerate();
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

	const updateSettings = (key: string, value: any) => {
		setVideoSettings({ ...videoSettings, [key]: value });
	};

	const handleFrameChange = (value: number[]) => {
		const index = Math.round((value[0] - 1) / 0.2);
		updateSettings("numFrames", frameOptions[index]);
	};

	const getSeconds = (frames: number) => {
		return (frames / 24).toFixed(2);
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
			</div>

			{/* Settings Section */}
			<div className="mt-4 space-y-4 border-t pt-4">
				<div>
					<Label htmlFor="negativePrompt">Negative Prompt</Label>
					<Input
						id="negativePrompt"
						value={videoSettings.negativePrompt}
						onChange={e => updateSettings("negativePrompt", e.target.value)}
						placeholder="Describe what you don't want in the video..."
					/>
				</div>

				<div className="flex items-center space-x-4">
					<div className="flex-1 space-y-2">
						<div className="flex items-center space-x-2">
							<Clock3 className="h-4 w-4 flex-shrink-0" />
							<Label>Length: {getSeconds(videoSettings.numFrames)}s</Label>
						</div>
						<Slider
							min={1}
							max={5}
							step={0.2}
							value={[frameOptions.indexOf(videoSettings.numFrames) * 0.2 + 1]}
							onValueChange={handleFrameChange}
						/>
					</div>

					<div className="flex-1 space-y-2">
						<div className="flex items-center space-x-2">
							<Dices className="h-4 w-4" />
							<Label>Seed</Label>
						</div>
						<div className="flex items-center space-x-2">
							<Input
								type="number"
								value={seed}
								onChange={e => setSeed(parseInt(e.target.value))}
								placeholder={isRandomSeed ? "Random" : "Enter seed"}
								disabled={isRandomSeed}
							/>
							<Switch
								checked={!isRandomSeed}
								onCheckedChange={() => setIsRandomSeed(!isRandomSeed)}
							/>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label htmlFor="width">Width</Label>
						<Input
							id="width"
							type="number"
							value={videoSettings.width}
							onChange={e => updateSettings("width", parseInt(e.target.value))}
						/>
					</div>
					<div>
						<Label htmlFor="height">Height</Label>
						<Input
							id="height"
							type="number"
							value={videoSettings.height}
							onChange={e => updateSettings("height", parseInt(e.target.value))}
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label htmlFor="steps">Steps ({videoSettings.steps})</Label>
						<Slider
							id="steps"
							min={10}
							max={80}
							value={[videoSettings.steps]}
							onValueChange={value => updateSettings("steps", value[0])}
						/>
					</div>
					<div>
						<Label htmlFor="cfg">CFG ({videoSettings.cfg})</Label>
						<Slider
							id="cfg"
							min={0}
							max={10}
							step={0.1}
							value={[videoSettings.cfg]}
							onValueChange={value => updateSettings("cfg", value[0])}
						/>
					</div>
				</div>
			</div>

			<nav className="mt-2 flex justify-end items-center text-sm text-muted-foreground">
				<div className="flex items-center gap-6">
					<span>
						{charCount} / {MAX_CHARS} characters
					</span>
					<span>Processing: {processingCount}</span>
					<Button
						variant="default"
						className="text-primary-foreground bg-primary hover:bg-primary/90 flex-1"
						onClick={handleGenerate}
						disabled={prompt.trim() === "" || isGenerating || charCount > MAX_CHARS}
					>
						{getButtonContent()}
					</Button>
				</div>
			</nav>
		</div>
	);
}
