import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { Button } from "./components/ui/buttons";

export const metadata: Metadata = {
	title: "LineUp",
	description: "LineUp Application",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="antialiased">
				{children}

				<Script
					src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
					strategy="beforeInteractive"
				/>
				<Script src="/scripts/liquidGL.js" strategy="beforeInteractive" />
				<Script id="liquidGL-inline" strategy="lazyOnload">
					{`
						document.addEventListener("DOMContentLoaded", () => {
							const glassEffect = liquidGL({
								snapshot: "body",
								target: ".liquidGL",
								resolution: 2.0,
								refraction: 0.01,
								bevelDepth: 0.08,
								bevelWidth: 0.15,
								frost: 0,
								shadow: true,
								specular: true,
								reveal: "fade",
								tilt: false,
								tiltFactor: 5,
								magnify: 1,
								on: {
									init(instance) {
										console.log("liquidGL ready!", instance);
									},
								},
							});
						});
					`}
				</Script>
			</body>
		</html>
	);
}
