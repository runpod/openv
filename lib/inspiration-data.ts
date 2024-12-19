export type InspirationSettings = {
	prompt: string;
	seed: number;
	num_frames: number;
};

export type InspirationItem = InspirationSettings & {
	video: string;
};

export const inspirationData: InspirationItem[] = [
	{
		video: "https://utfs.io/f/f7dcc426-ec38-43dc-9cdc-ad46ad1caf75-hgafdn.mp4",
		prompt: "A wide-angle shot of a train crossing a towering bridge over a misty valley at sunrise. The camera follows the train's journey, emphasizing the engineering marvel and the natural beauty surrounding it",
		seed: 748027,
		num_frames: 127,
	},
];
