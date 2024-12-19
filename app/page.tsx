import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ArrowRight, Gift, Star, Trophy, Users } from "lucide-react";
import { Inter } from "next/font/google";
import Link from "next/link";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

const linkClass = "text-blue-400 hover:text-blue-300 underline underline-offset-2";

export default function Page() {
	return (
		<MainLayout>
			<div className={`min-h-screen bg-black text-white ${inter.className}`}>
				{/* Header */}
				<header className="p-4">
					<nav className="flex items-center justify-end space-x-6">
						<Link
							href="#competition"
							className="text-gray-300 hover:text-white transition-colors"
						>
							Competition
						</Link>
						<Link
							href="#community"
							className="text-gray-300 hover:text-white transition-colors"
						>
							Community
						</Link>
						<Link
							href="#startup-template"
							className="text-gray-300 hover:text-white transition-colors"
						>
							Startup Template
						</Link>
						<SignedOut>
							<SignInButton mode="modal">
								<Button
									variant="outline"
									className="border-purple-500 text-purple-500 hover:bg-purple-500/10"
								>
									Sign In
								</Button>
							</SignInButton>
						</SignedOut>
						<SignedIn>
							<UserButton
								appearance={{
									elements: {
										avatarBox: "w-10 h-10",
										userButtonPopoverCard: "bg-gray-900 border border-gray-800",
										userButtonPopoverFooter: "hidden",
									},
								}}
								afterSignOutUrl="/"
							/>
						</SignedIn>
					</nav>
				</header>

				{/* Hero Section */}
				<section className="container mx-auto px-4 min-h-[80vh] flex items-center">
					<div className="max-w-4xl mx-auto text-center space-y-16">
						<div className="space-y-4">
							<h1 className="text-4xl md:text-6xl font-bold tracking-tight">
								Generate videos using{" "}
								<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
									open source AI models
								</span>
							</h1>
							<div className="flex justify-center space-x-4">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Link
												href="https://github.com/genmoai/mochi"
												className="block transition-transform hover:scale-105 focus:scale-105"
												target="_blank"
												rel="noopener noreferrer"
											>
												<div className="bg-green-500 text-black text-sm font-bold px-4 py-2 rounded-full">
													Mochi 1
												</div>
											</Link>
										</TooltipTrigger>
										<TooltipContent>
											<p>Ready to use</p>
										</TooltipContent>
									</Tooltip>

									<Tooltip>
										<TooltipTrigger asChild>
											<Link
												href="https://huggingface.co/FastVideo/FastHunyuan"
												className="block transition-transform hover:scale-105 focus:scale-105"
												target="_blank"
												rel="noopener noreferrer"
											>
												<div className="bg-yellow-500 text-black text-sm font-bold px-4 py-2 rounded-full">
													FastHunyuan
												</div>
											</Link>
										</TooltipTrigger>
										<TooltipContent>
											<p>Soon</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>
						<div className="flex flex-col items-center justify-center gap-8">
							<SignedOut>
								<SignInButton mode="modal">
									<Button
										size="lg"
										className="bg-purple-600 hover:bg-purple-700 text-2xl py-8 px-12 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 text-white"
									>
										Try for free*
									</Button>
								</SignInButton>
							</SignedOut>
							<SignedIn>
								<Link href="/my-videos">
									<Button
										size="lg"
										className="bg-purple-600 hover:bg-purple-700 text-6xl py-12 px-12 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 text-white"
									>
										let's go
									</Button>
								</Link>
							</SignedIn>
							<p className="text-sm text-gray-400 mx-auto">
								*Free for Project Odyssey Contestants from Dec 16, 2024 to Jan 16,
								2025 — Official AI video tool from RunPod for{" "}
								<Link
									href="https://www.projectodyssey.ai"
									className={linkClass}
									target="_blank"
									rel="noopener noreferrer"
								>
									Project Odyssey 2024
								</Link>{" "}
								by CivitAI
							</p>
						</div>
					</div>
				</section>

				{/* Competition Section */}
				<section
					id="competition"
					className="container mx-auto px-4 min-h-[90vh] flex items-center bg-gradient-to-br from-purple-900 to-indigo-900"
				>
					<div className="max-w-4xl mx-auto space-y-8">
						<div className="text-center space-y-4">
							<h2 className="text-3xl md:text-5xl font-bold tracking-tight">
								Enter the{" "}
								<span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
									Sponsored Tools Category
								</span>
							</h2>
							<p className="text-xl text-gray-300">
								Create AI-generated videos with OpenV and win big in Project Odyssey
								2024!
							</p>
						</div>
						<div className="bg-white bg-opacity-10 p-8 rounded-lg space-y-6 backdrop-blur-sm">
							<div className="flex items-center justify-center space-x-4 mb-6">
								<Trophy className="h-12 w-12 text-yellow-400" />
								<Gift className="h-12 w-12 text-orange-500" />
								<Star className="h-12 w-12 text-yellow-400" />
							</div>
							<h3 className="text-2xl font-semibold text-center text-white mb-4">
								How to Participate and Win
							</h3>
							<ul className="space-y-4">
								<li className="flex items-start space-x-2">
									<ArrowRight className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
									<span className="text-gray-200">
										Create your video using OpenV during the competition period
										(Dec 16, 2024 - Jan 16, 2025)
									</span>
								</li>
								<li className="flex items-start space-x-2">
									<ArrowRight className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
									<span className="text-gray-200">
										Submit your entry to the "Sponsored Tools" category in
										Project Odyssey 2024
									</span>
								</li>
								<li className="flex items-start space-x-2">
									<ArrowRight className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
									<span className="text-gray-200">
										Showcase your creativity and the capabilities of
										AI-generated videos
									</span>
								</li>
							</ul>
							<p className="text-white text-center font-semibold mt-6">
								Don't miss this opportunity to demonstrate your skills and win
								amazing prizes!
							</p>
							<div className="pt-4 flex justify-center">
								<Link
									href="https://www.projectodyssey.ai"
									passHref
									target="_blank"
									rel="noopener noreferrer"
								>
									<Button
										size="lg"
										className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
									>
										Learn More About the Competition{" "}
										<ArrowRight className="ml-2 h-5 w-5" />
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</section>

				{/* Community-Driven Development Section */}
				<section
					id="community"
					className="container mx-auto px-4 min-h-[90vh] flex items-center"
				>
					<div className="max-w-4xl mx-auto space-y-8">
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center">
							Join Our{" "}
							<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								Community-Driven Development
							</span>
						</h2>
						<p className="text-xl text-gray-400 text-center">
							OpenV is a platform built by the community, for the community. We
							welcome contributions to improve and expand our features.
						</p>
						<div className="bg-gray-900 p-8 rounded-lg space-y-6">
							<h3 className="text-2xl font-semibold flex items-center gap-2">
								<Users className="h-6 w-6 text-purple-400" />
								How You Can Contribute
							</h3>
							<ul className="grid md:grid-cols-2 gap-4">
								<li className="flex items-start space-x-2">
									<ArrowRight className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
									<span className="text-gray-300">
										Add new AI models and capabilities
									</span>
								</li>
								<li className="flex items-start space-x-2">
									<ArrowRight className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
									<span className="text-gray-300">
										Improve user interface and experience
									</span>
								</li>
								<li className="flex items-start space-x-2">
									<ArrowRight className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
									<span className="text-gray-300">
										Enhance documentation and tutorials
									</span>
								</li>
								<li className="flex items-start space-x-2">
									<ArrowRight className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
									<span className="text-gray-300">
										Fix bugs and optimize performance
									</span>
								</li>
							</ul>
							<p className="text-gray-300">
								Join our open-source community and help shape the future of
								AI-powered video generation!
							</p>
							<div className="pt-4">
								<Link
									href="https://github.com/runpod/openv"
									passHref
									target="_blank"
									rel="noopener noreferrer"
								>
									<Button
										size="lg"
										variant="outline"
										className="border-purple-500 text-purple-500 hover:bg-purple-500/10"
									>
										Contribute on GitHub <ArrowRight className="ml-2 h-5 w-5" />
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</section>

				{/* Startup Template Section */}
				<section
					id="startup-template"
					className="container mx-auto px-4 min-h-[90vh] flex items-center justify-center flex-col gap-20 py-20 bg-gray-900"
				>
					<div className="max-w-4xl w-full text-center">
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight">
							Build Your Startup with Our{" "}
							<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								AI Startup Template
							</span>
						</h2>
						<p className="text-xl text-gray-400 mt-8">
							OpenV is more than just a video generation tool. It's a complete startup
							template to help you launch your own AI venture.
						</p>
					</div>

					<div className="text-white w-full max-w-6xl">
						<div className="w-full space-y-8">
							{/* Web App and genAI video API in 2 column grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								{/* Web App */}
								<div className="border border-gray-700 p-3 sm:p-4 rounded-lg">
									<h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
										Web App
									</h2>
									<div className="grid grid-cols-1 gap-3 sm:gap-4 h-[calc(100%-3rem)]">
										<div className="bg-cyan-600 p-4 sm:p-6 rounded-lg h-full">
											<div className="flex flex-col gap-2 h-full">
												<Link
													href="https://nextjs.org"
													className="text-lg sm:text-xl font-semibold hover:text-cyan-300 underline-offset-4 hover:underline"
													target="_blank"
													rel="noopener noreferrer"
												>
													Next.js
												</Link>
												<span className="text-xs sm:text-sm text-gray-200">
													Web app with{" "}
													<Link
														href="https://ui.shadcn.com"
														className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
														target="_blank"
														rel="noopener noreferrer"
													>
														shadcn UI
													</Link>
													, based on{" "}
													<Link
														href="https://github.com/michaelshimeles/nextjs-starter-kit"
														className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
														target="_blank"
														rel="noopener noreferrer"
													>
														nextjs-starter-kit
													</Link>{" "}
													by{" "}
													<Link
														href="https://www.rasmic.xyz/"
														className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
														target="_blank"
														rel="noopener noreferrer"
													>
														Ras Mic
													</Link>
												</span>
											</div>
										</div>
										<div className="bg-amber-600 p-4 sm:p-6 rounded-lg h-full">
											<div className="flex flex-col gap-2 h-full">
												<Link
													href="https://vercel.com"
													className="text-lg sm:text-xl font-semibold hover:text-amber-300 underline-offset-4 hover:underline"
													target="_blank"
													rel="noopener noreferrer"
												>
													Vercel
												</Link>
												<span className="text-xs sm:text-sm text-gray-200">
													Frontend deployment and hosting
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* genAI video API */}
								<div className="border border-gray-700 p-3 sm:p-4 rounded-lg">
									<h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
										Video AI API
									</h2>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
										<div className="bg-rose-600 p-4 sm:p-6 rounded-lg">
											<div className="flex flex-col gap-2">
												<Link
													href="https://github.com/runpod-workers/worker-mochi"
													className="text-lg sm:text-xl font-semibold hover:text-rose-300 underline-offset-4 hover:underline"
													target="_blank"
													rel="noopener noreferrer"
												>
													worker-mochi
												</Link>
												<span className="text-xs sm:text-sm text-gray-200">
													<Link
														href="https://github.com/genmoai/mochi"
														className="hover:text-rose-200 underline underline-offset-4"
														target="_blank"
														rel="noopener noreferrer"
													>
														Mochi 1 preview
													</Link>{" "}
													by{" "}
													<Link
														href="https://www.genmo.ai/"
														className="hover:text-rose-200 underline underline-offset-4"
														target="_blank"
														rel="noopener noreferrer"
													>
														Genmo
													</Link>
												</span>
											</div>
										</div>
										<div className="bg-purple-600 p-4 sm:p-6 rounded-lg">
											<div className="flex flex-col gap-2">
												<Link
													href="https://huggingface.co/FastVideo/FastHunyuan"
													className="text-lg sm:text-xl font-semibold hover:text-purple-300 underline-offset-4 hover:underline"
													target="_blank"
													rel="noopener noreferrer"
												>
													worker-fasthunyuan
												</Link>
												<span className="text-xs sm:text-sm text-gray-200">
													<Link
														href="https://huggingface.co/FastVideo/FastHunyuan"
														className="hover:text-purple-200 underline underline-offset-4"
														target="_blank"
														rel="noopener noreferrer"
													>
														FastHunyuan
													</Link>{" "}
													by{" "}
													<Link
														href="https://huggingface.co/FastVideo"
														className="hover:text-purple-200 underline underline-offset-4"
														target="_blank"
														rel="noopener noreferrer"
													>
														FastVideo
													</Link>
													, based on{" "}
													<Link
														href="https://huggingface.co/tencent/HunyuanVideo"
														className="hover:text-purple-200 underline underline-offset-4"
														target="_blank"
														rel="noopener noreferrer"
													>
														HunyuanVideo
													</Link>{" "}
												</span>

												<div className="inline-flex items-center bg-yellow-500 text-black text-sm font-bold px-2 py-1 rounded-full mt-2">
													Soon
												</div>
											</div>
										</div>

										<div className="bg-indigo-600 p-4 sm:p-6 rounded-lg sm:col-span-2">
											<div className="flex flex-col gap-2">
												<Link
													href="https://www.runpod.io"
													className="text-lg sm:text-xl font-semibold hover:text-indigo-300 underline-offset-4 hover:underline"
													target="_blank"
													rel="noopener noreferrer"
												>
													RunPod
												</Link>
												<span className="text-xs sm:text-sm text-gray-200">
													GPU infrastructure for AI inference
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* External APIs */}
							<div className="border border-gray-700 p-3 sm:p-4 rounded-lg">
								<h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
									Third Party APIs
								</h2>
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
									<div className="bg-blue-600 p-4 sm:p-6 rounded-lg">
										<div className="flex flex-col gap-2">
											<Link
												href="https://clerk.com"
												className="text-lg sm:text-xl font-semibold hover:text-blue-300 underline-offset-4 hover:underline"
												target="_blank"
												rel="noopener noreferrer"
											>
												Clerk
											</Link>
											<span className="text-xs sm:text-sm text-gray-200">
												Authentication and user management
											</span>
										</div>
									</div>
									<div className="bg-emerald-600 p-4 sm:p-6 rounded-lg">
										<div className="flex flex-col gap-2">
											<Link
												href="https://supabase.com"
												className="text-lg sm:text-xl font-semibold hover:text-emerald-300 underline-offset-4 hover:underline"
												target="_blank"
												rel="noopener noreferrer"
											>
												Supabase
											</Link>
											<span className="text-xs sm:text-sm text-gray-200">
												Database
											</span>
										</div>
									</div>
									<div className="bg-pink-600 p-4 sm:p-6 rounded-lg">
										<div className="flex flex-col gap-2">
											<Link
												href="https://uploadthing.com"
												className="text-lg sm:text-xl font-semibold hover:text-pink-300 underline-offset-4 hover:underline"
												target="_blank"
												rel="noopener noreferrer"
											>
												UploadThing
											</Link>
											<span className="text-xs sm:text-sm text-gray-200">
												Video storage and streaming
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="pt-8">
						<div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-lg text-gray-400 border border-gray-700">
							<span className="text-sm font-medium">Soon</span>
						</div>
					</div>
				</section>
			</div>
		</MainLayout>
	);
}
