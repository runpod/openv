import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CreateVideoParams {
	prompt: string;
	modelName?: string;
	duration?: number;
}

type VideoStatus = "queued" | "processing" | "completed" | "failed";

interface VideoResponse {
	id: number;
	jobId: string;
	userId: string;
	prompt: string;
	status: VideoStatus;
	createdAt: string;
	updatedAt: string;
	modelName?: string;
	duration?: number;
	url?: string;
	error?: string;
}

export function useVideoStatus(jobId: string | null) {
	return useQuery<VideoResponse | null, Error>({
		queryKey: ["video-status", jobId],
		queryFn: async () => {
			if (!jobId) return null;
			const response = await fetch(`/api/runpod/${jobId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch video status");
			}
			const data = await response.json();
			return data;
		},
		enabled: !!jobId,
		refetchInterval: query => {
			const data = query.state.data as VideoResponse | null;
			if (data && (data.status === "queued" || data.status === "processing")) {
				return 3000;
			}
			return false;
		},
		retry: true,
		retryDelay: 1000,
		refetchIntervalInBackground: true,
		staleTime: 0,
		gcTime: 0,
	});
}

export function useCreateVideo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ prompt, modelName, duration }: CreateVideoParams) => {
			const response = await fetch("/api/runpod", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt, modelName, duration }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create video");
			}

			const data = await response.json();
			return data as VideoResponse;
		},
		onSuccess: data => {
			queryClient.invalidateQueries({ queryKey: ["videos"] });
			queryClient.invalidateQueries({ queryKey: ["video-status", data.jobId] });
		},
	});
}
