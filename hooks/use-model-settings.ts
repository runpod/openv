import { getModelConfig, type ModelName } from "@/lib/models/config";

export function useModelSettings(modelName: ModelName = "mochi-1") {
	const config = getModelConfig(modelName);

	return {
		limits: config.limits,
		aspectRatios: config.aspectRatios,
	};
}
