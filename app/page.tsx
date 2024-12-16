import HeroSection from "@/components/hero-section";
import { MainLayout } from "@/components/layout/main-layout";

export default function Home() {
	return (
		<MainLayout className="flex items-center justify-center w-full h-full min-h-screen">
			<HeroSection />
		</MainLayout>
	);
}
