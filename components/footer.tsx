"use client";

import Link from "next/link";

import { RunPodLogo } from "./ui/runpod-logo";

function XIcon() {
	return (
		<svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
		</svg>
	);
}

function BlueskyIcon() {
	return (
		<svg viewBox="0 -50 600 600" className="h-5 w-5 fill-current">
			<path d="m135.72 44.03C202.216 93.951 273.74 195.17 3e2 249.49c26.262-54.316 97.782-155.54 164.28-205.46C512.26 8.009 590-19.862 590 68.825c0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-.0174-2.9357-1.1937.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07.0-88.687 77.742-60.816 125.72-24.795z"></path>
		</svg>
	);
}

export function Footer() {
	return (
		<footer className="container mx-auto px-4 py-8 mt-20 border-t border-gray-800">
			<div className="grid gap-8 md:grid-cols-3">
				<div className="space-y-4">
					<div className="flex gap-4">
						<Link
							href="https://twitter.com/runpod_io"
							className="text-gray-400 hover:text-white"
						>
							<XIcon />
						</Link>
						<Link
							href="https://bsky.app/profile/runpod.io"
							className="text-gray-400 hover:text-white"
						>
							<BlueskyIcon />
						</Link>
					</div>
				</div>
				<div className="space-y-2">
					<h4 className="text-sm font-medium text-white">Links</h4>
					<ul className="space-y-2">
						<li>
							<Link
								href="/terms"
								className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2"
							>
								Terms & Conditions
							</Link>
						</li>
						<li>
							<Link
								href="https://github.com/runpod/openv"
								className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2"
							>
								Source Code on GitHub
							</Link>
						</li>
					</ul>
				</div>
				<div className="text-sm text-gray-400 flex items-center space-x-2">
					<span>© {new Date().getFullYear()} by</span>
					<Link href="https://www.runpod.io" passHref className="text-white">
						<RunPodLogo className="h-8 w-auto fill-current" />
					</Link>
				</div>
			</div>
		</footer>
	);
}
