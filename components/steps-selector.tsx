"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

interface StepsSelectorProps {
	steps: number;
	onChange: (steps: number) => void;
	min: number;
	max: number;
}

export function StepsSelector({ steps, onChange, min, max }: StepsSelectorProps) {
	const [open, setOpen] = useState(false);

	const handleStepsChange = (value: number[]) => {
		onChange(value[0]);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="h-8 w-[60px] px-2 text-xs">
					<SlidersHorizontal className="mr-1 h-3 w-3" />
					<span className="w-[20px] text-right">{steps}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 popover-content">
				<div className="space-y-2">
					<h4 className="font-medium leading-none">Inference Steps</h4>
					<p className="text-sm text-muted-foreground">
						Higher values produce better quality but take longer to generate.
					</p>
					<div className="grid grid-cols-[32px_1fr_32px] gap-2 items-center">
						<div className="text-xs text-muted-foreground text-right">{min}</div>
						<Slider
							min={min}
							max={max}
							step={1}
							value={[steps]}
							onValueChange={handleStepsChange}
							className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
							aria-label="Steps"
						/>
						<div className="text-xs text-muted-foreground">{max}</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
