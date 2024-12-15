export function getSeconds(frames: number, fps: number = 24): number {
	return Number((frames / fps).toFixed(2));
}
