"server only";

import { user, UserRole } from "@prisma/client";

import prisma from "@/lib/prisma";
import { userCreateProps } from "@/utils/types";

type ErrorResponse = {
	code: string;
	message: string;
};

export const userCreate = async ({
	email,
	first_name,
	last_name,
	profile_image_url,
	user_id,
}: userCreateProps): Promise<user | ErrorResponse> => {
	try {
		// First check if user exists
		const existingUser = await prisma.user.findUnique({
			where: {
				user_id,
			},
		});

		if (existingUser) {
			return existingUser;
		}

		// Create new user if they don't exist
		const newUser = await prisma.user.create({
			data: {
				email,
				first_name,
				last_name,
				profile_image_url,
				user_id,
				role: UserRole.restricted,
			},
		});

		return newUser;
	} catch (error: any) {
		console.error("[userCreate] Error:", error);
		return {
			code: error.code || "UNKNOWN_ERROR",
			message: error.message || "An unknown error occurred",
		};
	}
};
