import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const suisseIntl = localFont({
	src: [
		{
			path: "../fonts/SuisseIntl-Book.otf",
			weight: "450",
			style: "normal",
		},
		{
			path: "../fonts/SuisseIntl-Medium.otf",
			weight: "500",
			style: "normal",
		},
		{
			path: "../fonts/SuisseIntl-SemiBold.otf",
			weight: "600",
			style: "normal",
		},
	],
	variable: "--font-suisse-intl",
	display: "swap",
});

const jetbrainsMono = localFont({
	src: [
		{
			path: "../fonts/JetBrainsMono-Medium.ttf",
			weight: "500",
			style: "normal",
		},
		{
			path: "../fonts/JetBrainsMono-Medium.ttf",
			weight: "600",
			style: "normal",
		},
	],
	variable: "--font-jetbrains-mono",
	display: "swap",
});

const basePath = process.env.NODE_ENV === 'production' ? '/portfolio-janstay' : '';

export const metadata: Metadata = {
	title: "Владимир Пантюшин — Продуктовый дизайнер",
	description: "Продуктовый дизайнер, 3+ года в fintech и web3. Внедряю DeFi-функции, проектирую платежные сценарии и сложные интерфейсные компоненты.",
	icons: {
		icon: `${basePath}/favicon.png`,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${suisseIntl.variable} ${jetbrainsMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
