import HeroSection from "@/components/homepage/hero-section";
import PageWrapper from "@/components/wrapper/page-wrapper";

export default function Home() {
	return (
		<PageWrapper>
			<div className="flex min-h-[calc(100vh-8rem)] items-center justify-center w-full">
				<HeroSection />
			</div>
		</PageWrapper>
	);
}
