"use client";

import Link from "next/link";

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
		<footer className="border-t">
			<div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
				<div className="lg:grid lg:grid-cols-2">
					<div className="border-b py-8 lg:order-last lg:border-b-0 lg:border-s lg:py-16 lg:ps-16">
						<div className="mt-8 space-y-4 lg:mt-0">
							<div>
								<p className="mt-4 max-w-lg text-muted-foreground">
									OpenV is an open source project that makes it easy to generate
									videos using open source AI models like{" "}
									<Link
										href="https://genmo.ai/mochi"
										target="_blank"
										className="font-medium text-primary hover:underline"
									>
										Mochi 1 from Genmo
									</Link>
									.
								</p>
							</div>
						</div>
					</div>

					<div className="py-8 lg:py-16 lg:pe-16">
						<div className="mt-8">
							<div>
								<p className="font-medium">Socials</p>

								<ul className="mt-6 flex gap-4">
									<li>
										<Link
											href="https://twitter.com/runpod_io"
											target="_blank"
											className="transition hover:opacity-75"
											title="X (Twitter)"
										>
											<XIcon />
										</Link>
									</li>
									<li>
										<Link
											href="https://bsky.app/profile/runpod.io"
											target="_blank"
											className="transition hover:opacity-75"
											title="Bluesky"
										>
											<BlueskyIcon />
										</Link>
									</li>
								</ul>
							</div>
						</div>

						<div className="mt-8 border-t pt-8">
							<ul className="flex flex-wrap gap-4 text-xs">
								<li>
									<Link href="/terms" className="transition hover:opacity-75">
										Terms & Conditions
									</Link>
								</li>
							</ul>

							<p className="mt-8 text-xs text-muted-foreground">
								&copy; {new Date().getFullYear()} RunPod, Inc. Provided with ❤️ as{" "}
								<Link
									href="https://github.com/runpod/openv"
									target="_blank"
									className="font-medium text-primary hover:underline"
								>
									open source
								</Link>
								.
							</p>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
