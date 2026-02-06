import { redirect } from "next/navigation";

export default function MyVideosLayout({ children }: { children: React.ReactNode }) {
	redirect("/");
}
