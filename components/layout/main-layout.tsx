import { Footer } from "@/components/footer";
import { Logo } from "@/components/ui/logo";

interface MainLayoutProps {
	children: React.ReactNode;
	className?: string;
}

export function MainLayout({ children, className = "" }: MainLayoutProps) {
	return (
		<div className="min-h-screen relative flex flex-col">
			<div className="absolute top-4 left-4">
				<Logo />
			</div>
			<div className={className}>{children}</div>
			<Footer />
		</div>
	);
}
