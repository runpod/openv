import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Video } from "@/types";

export function useVideos() {
	const queryClient = useQueryClient();

	const {
		data: videos = [],
		isLoading,
		error,
	} = useQuery<Video[]>({
		queryKey: ["videos"],
		queryFn: async () => {
			const response = await fetch("/api/videos");
			if (!response.ok) {
				throw new Error("Failed to fetch videos");
			}
			return response.json();
		},
	});

	const deleteVideo = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch("/api/videos", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete video");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["videos"] });
		},
	});

	return {
		videos,
		isLoading,
		error,
		deleteVideo: deleteVideo.mutate,
		isDeletingVideo: deleteVideo.isPending,
	};
}
