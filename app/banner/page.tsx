import { MainLayout } from "@/components/layout/main-layout";
import { Logo } from "@/components/ui/logo";

export default function BannerPage() {
	return (
		<MainLayout className="flex items-center justify-center w-full h-full min-h-screen">
			<div className="flex flex-col items-center space-y-12">
				<Logo />
				<h1 className="scroll-m-20 text-6xl font-bold tracking-tight leading-[1.72] text-center sm:text-7xl md:text-8xl lg:text-9xl mt-16">
					<span className="relative p-4">
						Generate videos using <br />
						<span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent relative">
							open source AI models
						</span>
					</span>
				</h1>
			</div>
		</MainLayout>
	);
}
