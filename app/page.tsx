import { Github } from "lucide-react";
import { Inter } from "next/font/google";
import Link from "next/link";

import { MainLayout } from "@/components/layout/main-layout";

const inter = Inter({ subsets: ["latin"] });

export default function Page() {
	return (
		<MainLayout>
			<div className={`min-h-screen bg-black text-white ${inter.className}`}>
				<section className="container mx-auto px-4 min-h-[90vh] flex items-center justify-center">
					<div className="max-w-2xl mx-auto text-center space-y-12">
						<div className="space-y-6">
							<h1 className="text-5xl md:text-7xl font-bold tracking-tight">
								<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
									OpenV
								</span>
							</h1>

							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
								<div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
								<span className="text-yellow-400 text-sm font-medium">
									Currently on Hold
								</span>
							</div>
						</div>

						<div className="space-y-4 text-gray-400">
							<p className="text-lg">
								OpenV was the official AI video generation tool from{" "}
								<Link
									href="https://www.runpod.io"
									className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
									target="_blank"
									rel="noopener noreferrer"
								>
									Runpod
								</Link>{" "}
								for{" "}
								<Link
									href="https://www.projectodyssey.ai"
									className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
									target="_blank"
									rel="noopener noreferrer"
								>
									Project Odyssey 2024
								</Link>{" "}
								by CivitAI.
							</p>
							<p className="text-gray-500">
								The competition season has ended. We're taking time to refactor
								and come back with a revamped experience featuring updated AI
								models.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Link
								href="https://discord.com/invite/cUpRmau42V"
								className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] transition-colors text-white font-medium"
								target="_blank"
								rel="noopener noreferrer"
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
								</svg>
								Join our Discord for updates
							</Link>

							<Link
								href="https://github.com/runpod/openv"
								className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors text-gray-300 hover:text-white font-medium"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Github className="w-5 h-5" />
								View on GitHub
							</Link>
						</div>
					</div>
				</section>
			</div>
		</MainLayout>
	);
}
