"use client";

import { useState } from "react";

import InspirationGrid from "@/components/inspiration-grid";

export default function InspirationPage() {
	const [gridView, setGridView] = useState<"2x2" | "3x3" | "list">("2x2");
	const [searchQuery, setSearchQuery] = useState("");

	const applyVideoSettings = (video: { prompt: string; frames: number; seed: number }) => {
		// This is just a stub - we'll need to implement state management
		// to share these settings between pages
		console.log("Settings applied:", video);
	};

	return (
		<div className="px-4">
			<InspirationGrid
				applyVideoSettings={applyVideoSettings}
				gridView={gridView}
				setGridView={setGridView}
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
			/>
		</div>
	);
}
