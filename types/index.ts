export interface QueueItem {
	id: string;
	prompt: string;
	status: "queued" | "processing" | "completed" | "failed";
	jobId: string;
}

export interface Video {
	id: number;
	jobId: string;
	userId: string;
	prompt: string;
	status: "queued" | "processing" | "completed" | "failed";
	createdAt: string;
	updatedAt: string;
	modelName?: string;
	duration?: number;
	url?: string;
	error?: string;
	// UI-specific fields
	frames?: number;
	enhancePrompt?: boolean;
	seed?: number;
}

export type HealthStatus = {
	jobs: {
		completed: number;
		failed: number;
		inProgress: number;
		inQueue: number;
		retried: number;
	};
	workers: {
		idle: number;
		initializing: number;
		ready: number;
		running: number;
		throttled: number;
	};
};

export type VideoSettings = {
	negativePrompt: string;
	width: number;
	height: number;
	steps: number;
	cfg: number;
	numFrames: number;
	seed: number;
};
