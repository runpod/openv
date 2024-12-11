"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
	prompt: string;
	setPrompt: (prompt: string) => void;
	onGenerate: () => void;
	isGenerating: boolean;
	processingCount: number;
	children?: React.ReactNode;
	onToggleSettings?: () => void;
}

export default function PromptInput({
	prompt,
	setPrompt,
	onGenerate,
	isGenerating,
	processingCount,
	children,
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
