"server only";

import { UserRole } from "@prisma/client";

import prisma from "@/lib/prisma";
import { userCreateProps } from "@/utils/types";

export const userCreate = async ({
	email,
	first_name,
	last_name,
	profile_image_url,
	user_id,
}: userCreateProps) => {
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
		throw new Error(error.message);
	}
};
