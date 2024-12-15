import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitConfig = {
	enabled: boolean;
	ratelimit: Ratelimit | null;
};

// Rate limiting is disabled by default
const ratelimitConfig: RateLimitConfig = {
	enabled: false,
	ratelimit: null,
};

// Only enable if Redis URL is configured and we explicitly want rate limiting
if (process.env.UPSTASH_REDIS_REST_URL && process.env.ENABLE_RATE_LIMIT === "true") {
	const redis = Redis.fromEnv();

	// Create a new ratelimiter, that allows 5 requests per 10 seconds
	const ratelimitFunction = new Ratelimit({
		redis: redis,
		limiter: Ratelimit.slidingWindow(5, "10 s"),
		analytics: true,
		enableProtection: true,
	});

	ratelimitConfig.enabled = true;
	ratelimitConfig.ratelimit = ratelimitFunction;
}

export { ratelimitConfig };
