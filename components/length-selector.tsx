"use client";

import { Clock3 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { getSeconds } from "@/lib/time";

interface LengthSelectorProps {
	numFrames: number;
	onChange: (frames: number) => void;
	min: number;
	max: number;
}

export function LengthSelector({ numFrames, onChange, min, max }: LengthSelectorProps) {
	const [open, setOpen] = useState(false);

	// Generate frame options dynamically based on min/max
	const frameOptions = useMemo(() => {
		const options: number[] = [];
		// Generate options with a step of 6 frames (roughly 0.2 seconds)
		for (let i = min; i <= max; i += 6) {
			options.push(i);
		}
		// Make sure to include max if it's not already included
		if (options[options.length - 1] !== max) {
			options.push(max);
		}
		return options;
	}, [min, max]);

	const handleFrameChange = (value: number[]) => {
		// Find the closest frame option to the slider value
		const sliderValue = value[0];
		const closestFrame = frameOptions.reduce((prev, curr) => {
			return Math.abs(curr - sliderValue) < Math.abs(prev - sliderValue) ? curr : prev;
		});
		onChange(closestFrame);
	};

	// Find the closest valid frame option for the current value
	const currentValue = useMemo(() => {
		return frameOptions.reduce((prev, curr) => {
			return Math.abs(curr - numFrames) < Math.abs(prev - numFrames) ? curr : prev;
		});
	}, [numFrames, frameOptions]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="h-8 w-[68px] px-2 text-xs">
					<Clock3 className="mr-1 h-3 w-3" />
					<span className="w-[28px] text-right">{getSeconds(currentValue)}s</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 popover-content">
				<div className="space-y-2">
					<h4 className="font-medium leading-none">Video Length</h4>
					<div className="grid grid-cols-[32px_1fr_32px] gap-2 items-center">
						<div className="text-xs text-muted-foreground text-right">
							{getSeconds(min)}s
						</div>
						<Slider
							min={min}
							max={max}
							step={1}
							value={[currentValue]}
							onValueChange={handleFrameChange}
							className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
							aria-label="Video length"
						/>
						<div className="text-xs text-muted-foreground">{getSeconds(max)}s</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
