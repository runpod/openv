// Set up test environment variables if needed
process.env.RUNPOD_WEBHOOK_TOKEN = process.env.RUNPOD_WEBHOOK_TOKEN || "test-webhook-token";

// Add global error handlers for better debugging
process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
