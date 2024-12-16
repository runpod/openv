import { z } from "zod";

// System-wide configuration that cannot be changed by users
export const systemConfig = {
	concurrentJobs: {
		max: 3,
	},
} as const;

export const MODEL_NAMES = ["mochi-1"] as const;
export type ModelName = (typeof MODEL_NAMES)[number];

export interface ModelConfig {
	name: ModelName;
	limits: {
		width: { min: number; max: number; default: number };
		height: { min: number; max: number; default: number };
		steps: { min: number; max: number; default: number };
		cfg: { min: number; max: number; default: number };
		numFrames: { min: number; max: number; default: number };
		seed: { min: number; max: number; default: number };
		prompt: { minLength: number; maxLength: number };
		negativePrompt: { maxLength: number };
	};
	aspectRatios: {
		"16:9": { width: number; height: number };
		"9:16": { width: number; height: number };
		"1:1": { width: number; height: number };
	};
}

export const modelConfigs: Record<ModelName, ModelConfig> = {
	"mochi-1": {
		name: "mochi-1",
		limits: {
			width: { min: 384, max: 848, default: 848 },
			height: { min: 384, max: 848, default: 480 },
			steps: { min: 10, max: 65, default: 40 },
			cfg: { min: 1, max: 20, default: 6 },
			numFrames: { min: 7, max: 127, default: 31 },
			seed: { min: 0, max: Number.MAX_SAFE_INTEGER, default: 42 },
			prompt: { minLength: 1, maxLength: 500 },
			negativePrompt: { maxLength: 500 },
		},
		aspectRatios: {
			"16:9": { width: 848, height: 480 },
			"9:16": { width: 480, height: 848 },
			"1:1": { width: 640, height: 640 },
		},
	},
};

// Create a dynamic schema based on model name
export function createVideoSchema(modelName: ModelName) {
	const config = modelConfigs[modelName];

	return z.object({
		modelName: z.enum(MODEL_NAMES),
		prompt: z.string().min(config.limits.prompt.minLength).max(config.limits.prompt.maxLength),
		input: z.object({
			positive_prompt: z
				.string()
				.min(config.limits.prompt.minLength)
				.max(config.limits.prompt.maxLength),
			negative_prompt: z.string().max(config.limits.negativePrompt.maxLength).optional(),
			width: z.number().int().min(config.limits.width.min).max(config.limits.width.max),
			height: z.number().int().min(config.limits.height.min).max(config.limits.height.max),
			steps: z.number().int().min(config.limits.steps.min).max(config.limits.steps.max),
			cfg: z.number().min(config.limits.cfg.min).max(config.limits.cfg.max),
			num_frames: z
				.number()
				.int()
				.min(config.limits.numFrames.min)
				.max(config.limits.numFrames.max),
			seed: z.number().int().min(config.limits.seed.min).max(config.limits.seed.max),
		}),
	});
}

// Helper to validate video generation input
export function validateVideoInput(input: unknown): z.infer<ReturnType<typeof createVideoSchema>> {
	// First validate just the modelName to get the right schema
	const { modelName } = z
		.object({
			modelName: z.enum(MODEL_NAMES),
		})
		.parse(input);

	// Then validate the full input with the correct model's limits
	return createVideoSchema(modelName).parse(input);
}

// Add a new type for the video input
export type GenerateVideoInput = z.infer<ReturnType<typeof createVideoSchema>>;

// Helper to get config for a model
export function getModelConfig(modelName: ModelName): ModelConfig {
	return modelConfigs[modelName];
}

// Helper to get default settings for a model
export function getDefaultSettings(modelName: ModelName = "mochi-1") {
	const config = getModelConfig(modelName);
	return {
		width: config.limits.width.default,
		height: config.limits.height.default,
		steps: config.limits.steps.default,
		cfg: config.limits.cfg.default,
		numFrames: config.limits.numFrames.default,
		seed: config.limits.seed.default,
		negativePrompt: "",
	};
}
