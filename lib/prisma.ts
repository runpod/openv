import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
	return new PrismaClient({
		log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
	});
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

declare global {
	var prismaGlobal: PrismaClientSingleton | undefined;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
