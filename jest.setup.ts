// @ts-nocheck

import { Headers } from "node-fetch";

declare global {
	var fetch: jest.Mock;
	var Response: typeof Response;
	var Headers: typeof Headers;
	var createResponse: (body: any, init?: globalThis.ResponseInit) => globalThis.Response;
}

interface CustomGlobal extends NodeJS.Global {
	fetch: jest.Mock;
	Response: typeof Response;
	Headers: typeof Headers;
	createResponse: (body: any, init?: globalThis.ResponseInit) => globalThis.Response;
}

declare const global: CustomGlobal;

// Set test database URL
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.DIRECT_URL = process.env.TEST_DIRECT_URL || process.env.TEST_DATABASE_URL;

// Mock fetch for tests
global.fetch = jest.fn();

// Mock Response constructor
global.Response = Response;

// Mock Headers constructor
global.Headers = Headers as any;

// Mock Next.js server components
jest.mock("next/server", () => {
	const NextResponse = {
		json: (body: any, init?: globalThis.ResponseInit) =>
			new Response(JSON.stringify(body), init),
	};

	class NextRequest extends Request {
		public nextUrl: URL;

		constructor(input: RequestInfo | URL, init?: RequestInit) {
			const url = input instanceof URL ? input.toString() : input;
			super(url, init);
			this.nextUrl = new URL(this.url);
		}
	}

	return {
		NextResponse,
		NextRequest,
	};
});

// Helper to create Response objects in tests
global.createResponse = (body: any, init?: globalThis.ResponseInit) => {
	return new Response(JSON.stringify(body), init);
};
