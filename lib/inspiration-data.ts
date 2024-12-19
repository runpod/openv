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
	{
		video: "https://utfs.io/f/32258d62-b559-48eb-8395-1febe1b276a3-33s4z.mp4",
		prompt: "An aerial shot of a parade of elephants walking across the African savannah. The camera showcases the herd and the surrounding landscape.",
		seed: 730982,
		num_frames: 127,
	},
	{
		video: "https://utfs.io/f/0d848683-f6b7-46c3-a05a-7f53d02e307a-oz6i3y.mp4",
		prompt: "time-lapse of a high-tech drone swarm assembling a skyscraper piece by piece in a futuristic skyline in 4, high details",
		seed: 919269,
		num_frames: 127,
	},
	{
		video: "https://utfs.io/f/f4fac63f-fbe2-46b0-86d0-15732712e98b-jl4nme.mp4",
		prompt: "A city-sized spaceship docking at a high-tech spaceport, surrounded by smaller ships and drones.",
		seed: 636513,
		num_frames: 127,
	},
	{
		video: "https://utfs.io/f/2274b64d-9cb6-4f8d-9d6b-e25c13240236-8outj3.mp4",
		prompt: "A giant, mechanical creature prowling the outskirts of a neon-lit city, observed by a young hero from behind a barrier.",
		seed: 757760,
		num_frames: 127,
	},
	{
		video: "https://utfs.io/f/e3e67d62-761e-425d-9ce4-d349e8e5c904-87ibs0.mp4",
		prompt: "a post-apocalyptic city overtaken by nature; skyscrapers covered in vines and trees, with a lone cyborg wandering the ruins.",
		seed: 65758,
		num_frames: 127,
	},
	{
		video: "https://utfs.io/f/a655aa95-1f60-4809-8528-25a875d80539-92yd7b.mp4",
		prompt: "An astronaut floating through a neon-lit asteroid field, reaching out to touch glowing, alien rock formations.",
		seed: 461669,
		num_frames: 127,
	},
	{
		video: "https://utfs.io/f/1f81760d-ae49-4135-9187-57fd303db895-5fjej2.mp4",
		prompt: "A jib shot glides over a serene, moonlit ocean. The camera gradually descends to just above the water's surface, capturing the shimmering reflections of the moon and stars on the gentle waves.",
		seed: 20700,
		num_frames: 127,
	},
	{
		video: "https://utfs.io/f/7979a9dc-7736-4771-9bcc-036d9cccca03-pg3f12.mp4",
		prompt: "A quiet, post-apocalyptic forest with towering trees and a single robot foraging for supplies in the undergrowth.",
		seed: 178816,
		num_frames: 127,
	},
	{
		video: "https://utfs.io/f/8cd845d4-9bf4-4742-8c0d-601876bcda86-pj1p4u.mp4",
		prompt: "a dynamic shot of a cyclist racing down a mountain trail, dust kicking up. the camera follows closely, capturing the intensity and focus.",
		seed: 334400,
		num_frames: 127,
	},
];
