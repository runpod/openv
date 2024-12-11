"use client";

import { Scale } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

interface CfgSelectorProps {
	cfg: number;
	onChange: (cfg: number) => void;
}

export function CfgSelector({ cfg, onChange }: CfgSelectorProps) {
	const [open, setOpen] = useState(false);

	const handleCfgChange = (value: number[]) => {
		onChange(value[0]);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="h-8 px-2 text-xs">
					<Scale className="mr-1 h-3 w-3" />
					{cfg}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 popover-content">
				<div className="space-y-2">
					<h4 className="font-medium leading-none">CFG (Classifier Free Guidance)</h4>
					<p className="text-sm text-muted-foreground">
						Adjust how closely the video follows the prompt
					</p>
					<Slider
						min={0}
						max={10}
						step={0.1}
						value={[cfg]}
						onValueChange={handleCfgChange}
						className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
						aria-label="CFG"
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}
