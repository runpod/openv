import "@fontsource/inter";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	metadataBase: new URL("https://openv.ai"),
	title: {
		default: "OpenV",
		template: `%s | OpenV`,
	},
	description: "Generate videos using open source AI models",
	openGraph: {
		description: "Generate videos using open source AI models",
		images: ["https://utfs.io/f/Vya1TVrP0e8NKmBcj8UWdzrGQoPbV9q68acFZiTDeIE2NJ5x"],
		url: "https://openv.ai/",
	},
	twitter: {
		card: "summary_large_image",
		title: "OpenV",
		description: "Generate videos using open source AI models",
		siteId: "",
		creator: "@runpod",
		creatorId: "",
		images: ["https://utfs.io/f/Vya1TVrP0e8NKmBcj8UWdzrGQoPbV9q68acFZiTDeIE2NJ5x"],
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={cn("min-h-screen bg-background antialiased", inter.className)}>
				<ClerkProvider>
					<ThemeProvider attribute="class" defaultTheme="dark">
						<QueryProvider>
							{children}
							<Toaster />
						</QueryProvider>
					</ThemeProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}
