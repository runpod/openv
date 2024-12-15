import { auth as clerkAuth } from "@clerk/nextjs/server";

interface AuthError extends Error {
	code?: string;
	status?: number;
}

export interface AuthResult {
	userId: string;
}

interface TestAuthResult extends AuthResult {
	// Add any test-specific fields here if needed
}

async function getTestAuth(): Promise<TestAuthResult> {
	return {
		userId: "test-user-videos-integration",
	};
}

export async function auth(): Promise<AuthResult> {
	if (process.env.NEXT_PUBLIC_TEST_MODE === "true") {
		return getTestAuth();
	}
	const result = await clerkAuth();
	if (!result.userId) {
		const error = new Error("Unauthorized") as AuthError;
		error.status = 401;
		throw error;
	}
	return {
		userId: result.userId,
	};
}

export function requireAuth(result: AuthResult): asserts result is Required<AuthResult> {
	if (!result.userId) {
		const error = new Error("Unauthorized") as AuthError;
		error.status = 401;
		throw error;
	}
}
