/** @type {import('jest').Config} */
const config = {
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
	testMatch: ["**/__tests__/integration/**/*.test.ts"],
};

module.exports = config;
