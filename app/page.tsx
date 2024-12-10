import HeroSection from "@/components/hero-section";
import { Logo } from "@/components/ui/logo";

export default function Home() {
	return (
		<div className="min-h-screen relative">
			<div className="absolute top-4 left-4">
				<Logo />
			</div>
			<div className="flex items-center justify-center w-full h-full min-h-screen">
				<HeroSection />
			</div>
		</div>
	);
}
