import type { ResponseInit } from "node-fetch";
import { Headers, Response } from "node-fetch";

// Set test database URL
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.DIRECT_URL = process.env.TEST_DIRECT_URL || process.env.TEST_DATABASE_URL;

// Mock fetch for tests
global.fetch = jest.fn();

// Mock Response constructor
global.Response = Response as any;

// Mock Headers constructor
global.Headers = Headers as any;

// Mock Next.js server components
jest.mock("next/server", () => {
	const NextResponse = {
		json: (body: any, init?: ResponseInit) => new Response(JSON.stringify(body), init),
	};

	class NextRequest extends Request {
		constructor(input: RequestInfo | URL, init?: RequestInit) {
			if (typeof input === "string") {
				super(input, init);
			} else if (input instanceof URL) {
				super(input.toString(), init);
			} else {
				super(input);
			}
		}

		public nextUrl = new URL(this.url);
	}

	return {
		NextResponse,
		NextRequest,
	};
});

// Helper to create Response objects in tests
global.createResponse = (body: any, init?: ResponseInit) => {
	return new Response(JSON.stringify(body), init);
};
