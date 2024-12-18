"server only";
import prisma from "@/lib/prisma";
import { userUpdateProps } from "@/utils/types";

export const userUpdate = async ({
	email,
	first_name,
	last_name,
	profile_image_url,
	user_id,
}: userUpdateProps) => {
	try {
		const updatedUser = await prisma.user.update({
			where: {
				user_id,
			},
			data: {
				email,
				first_name,
				last_name,
				profile_image_url,
			},
		});

		return updatedUser;
	} catch (error: any) {
		console.error("[userUpdate] Error:", error);
		throw new Error(error.message);
	}
};
