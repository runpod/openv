"use client";

import { Clock3, Dices } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

type EssentialVideoSettingsProps = {
	numFrames: number;
	setNumFrames: (frames: number) => void;
	seed: number;
	setSeed: (seed: number) => void;
	isRandomSeed: boolean;
	setIsRandomSeed: (isRandom: boolean) => void;
};

const frameOptions = [
	7, 13, 19, 25, 31, 37, 43, 49, 55, 61, 67, 73, 79, 85, 91, 97, 103, 109, 115, 121, 127,
];

export default function EssentialVideoSettings({
	numFrames,
	setNumFrames,
	seed,
	setSeed,
	isRandomSeed,
	setIsRandomSeed,
}: EssentialVideoSettingsProps) {
	const handleFrameChange = (value: number[]) => {
		const index = Math.round((value[0] - 1) / 0.2);
		setNumFrames(frameOptions[index]);
	};

	const getSeconds = (frames: number) => {
		return (frames / 24).toFixed(2);
	};

	return (
		<div className="flex justify-end items-center space-x-4 mt-2">
			<div className="flex items-center space-x-2">
				<Clock3 className="h-4 w-4 flex-shrink-0" />
				<div className="w-48">
					<Slider
						min={1}
						max={5}
						step={0.2}
						value={[frameOptions.indexOf(numFrames) * 0.2 + 1]}
						onValueChange={handleFrameChange}
					/>
					<div className="flex justify-between text-xs mt-1">
						<span>1s</span>
						<span>5s</span>
					</div>
				</div>
				<span className="text-sm whitespace-nowrap">{getSeconds(numFrames)}s</span>
			</div>

			<div className="flex items-center space-x-2">
				<Dices className="h-4 w-4" />
				<div className="w-32 relative">
					<Input
						type="number"
						id="seed"
						value={seed}
						onChange={e => setSeed(parseInt(e.target.value))}
						className="w-full pr-12"
						placeholder={isRandomSeed ? "Random" : "Enter seed"}
						disabled={isRandomSeed}
					/>
					<div className="absolute inset-y-0 right-0 flex items-center pr-2">
						<Switch
							checked={!isRandomSeed}
							onCheckedChange={() => setIsRandomSeed(!isRandomSeed)}
							className="data-[state=checked]:bg-primary"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
