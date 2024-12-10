import AuthenticatedLayout from "@/components/layout/authenticated-layout";

export default function InspirationLayout({ children }: { children: React.ReactNode }) {
	return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
