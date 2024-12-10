import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CreateVideoParams {
  prompt: string;
}

type RunPodStatus = 
  | 'IN_QUEUE' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'TIMED_OUT';

interface VideoResponse {
  id: string;
  status: RunPodStatus;
}

export function useVideoStatus(videoId: string | null) {
  return useQuery<VideoResponse | null, Error>({
    queryKey: ['video-status', videoId],
    queryFn: async () => {
      if (!videoId) return null;
      console.log('Fetching status for:', videoId); // Debug log
      const response = await fetch(`/api/runpod/${videoId}`);
      const data = await response.json();
      console.log('Status response:', data); // Debug log
      return data;
    },
    enabled: !!videoId,
    refetchInterval: (query) => {
      const data = query.state.data as VideoResponse | null;
      // Continue polling if data exists and status is not terminal
      if (data && (data.status === 'IN_QUEUE' || data.status === 'IN_PROGRESS')) {
        console.log('Continuing to poll...'); // Debug log
        return 3000;
      }
      console.log('Stopping poll - terminal status reached'); // Debug log
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
    mutationFn: async ({ prompt }: CreateVideoParams) => {
      const response = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to create video");
      }

      const data = await response.json();
      console.log('Created video with ID:', data.id); // Debug log
      return data as VideoResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ['video-status', data.id] });
    },
  });
} 