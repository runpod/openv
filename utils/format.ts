/**
 * Convert frames to seconds based on frame rate
 * @param frames - Number of frames
 * @param fps - Frames per second (default: 30)
 * @returns Formatted duration string in MM:SS format
 */
export function framesToSeconds(frames: number | undefined | null, fps: number = 30): string {
	if (!frames) return "00:00";

	const totalSeconds = Math.floor(frames / fps);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
