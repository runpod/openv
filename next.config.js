/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		APP_ENV: process.env.APP_ENV || "development",
	},
};

module.exports = nextConfig;
