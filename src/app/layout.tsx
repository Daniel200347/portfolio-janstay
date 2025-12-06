import type { Metadata } from "next";
import "./globals.css";

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
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased">
				{children}
			</body>
		</html>
	);
}
