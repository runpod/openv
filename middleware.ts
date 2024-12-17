import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { checkTermsMiddleware } from "@/lib/terms";

// Paths that require terms acceptance
const TOS_PROTECTED_PATHS = ["/my-videos"];

export default process.env.NEXT_PUBLIC_TEST_MODE === "true"
	? () => NextResponse.next()
	: clerkMiddleware(async (_, req) => {
			const pathname = new URL(req.url).pathname;

			// Check terms acceptance for protected paths
			if (TOS_PROTECTED_PATHS.includes(pathname)) {
				return await checkTermsMiddleware(req);
			}
		});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/api/:path*",
	],
};
