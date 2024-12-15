"use client";

import { Clock3 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { getSeconds } from "@/lib/time";

const frameOptions = [
	7, 13, 19, 25, 31, 37, 43, 49, 55, 61, 67, 73, 79, 85, 91, 97, 103, 109, 115, 121, 127,
];

interface LengthSelectorProps {
	numFrames: number;
	onChange: (frames: number) => void;
}

export function LengthSelector({ numFrames, onChange }: LengthSelectorProps) {
	const [open, setOpen] = useState(false);

	const handleFrameChange = (value: number[]) => {
		const index = Math.round((value[0] - 1) / 0.2);
		onChange(frameOptions[index]);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="h-8 px-2 text-xs">
					<Clock3 className="mr-1 h-3 w-3" />
					{getSeconds(numFrames)}s
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 popover-content">
				<div className="space-y-2">
					<h4 className="font-medium leading-none">Video Length</h4>
					<p className="text-sm text-muted-foreground">Adjust the length of your video</p>
					<Slider
						min={1}
						max={5}
						step={0.2}
						value={[frameOptions.indexOf(numFrames) * 0.2 + 1]}
						onValueChange={handleFrameChange}
						className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
						aria-label="Video length"
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}
