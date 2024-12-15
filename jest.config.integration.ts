import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "node",
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	transform: {
		"^.+\\.(t|j)sx?$": [
			"ts-jest",
			{
				useESM: true,
			},
		],
	},
	transformIgnorePatterns: ["node_modules/(?!(runpod-sdk)/)"],
	setupFiles: ["<rootDir>/jest.setup.integration.ts"],
	testMatch: ["**/__tests__/integration/**/*.integration.test.ts"],
	extensionsToTreatAsEsm: [".ts"],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	testTimeout: 30000,
};

export default config;
