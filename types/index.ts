export interface QueueItem {
	id: string;
	prompt: string;
	status: "queued" | "processing" | "completed" | "failed";
	jobId: string;
}

export interface Video {
	id: string;
	prompt: string;
	frames: number;
	url: string;
	downloadUrl?: string;
	seed: number;
	status: "generating" | "completed" | "failed";
	enhancePrompt: boolean;
	jobId: string;
	createdAt: string;
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
};
