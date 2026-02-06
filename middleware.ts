import { NextRequest, NextResponse } from "next/server";

const REDIRECTED_PATHS = [
	"/sign-in",
	"/sign-up",
	"/my-videos",
	"/account",
	"/inspiration",
	"/terms",
];

export default function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (REDIRECTED_PATHS.some(path => pathname.startsWith(path))) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Skip Next.js internals and all static files
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/api/:path*",
	],
};
