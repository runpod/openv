/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		APP_ENV: process.env.APP_ENV || "development",
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "github.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "utfs.io",
				port: "",
				pathname: "/**",
			},
		],
	},
};

module.exports = nextConfig;
