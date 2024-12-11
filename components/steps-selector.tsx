"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

interface StepsSelectorProps {
	steps: number;
	onChange: (steps: number) => void;
}

export function StepsSelector({ steps, onChange }: StepsSelectorProps) {
	const [open, setOpen] = useState(false);

	const handleStepsChange = (value: number[]) => {
		onChange(value[0]);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="h-8 px-2 text-xs">
					<SlidersHorizontal className="mr-1 h-3 w-3" />
					{steps}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 popover-content">
				<div className="space-y-2">
					<h4 className="font-medium leading-none">Steps</h4>
					<p className="text-sm text-muted-foreground">
						Adjust the number of steps for video generation
					</p>
					<Slider
						min={10}
						max={80}
						step={1}
						value={[steps]}
						onValueChange={handleStepsChange}
						className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
						aria-label="Steps"
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}
