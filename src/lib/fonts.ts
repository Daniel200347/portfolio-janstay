import localFont from 'next/font/local';

// Suisse Intl - основной шрифт
export const suisseIntl = localFont({
	src: [
		{
			path: '../../public/fonts/SuisseIntl-Book.otf',
			weight: '450',
			style: 'normal',
		},
		{
			path: '../../public/fonts/SuisseIntl-Medium.otf',
			weight: '500',
			style: 'normal',
		},
		{
			path: '../../public/fonts/SuisseIntl-SemiBold.otf',
			weight: '600',
			style: 'normal',
		},
	],
	variable: '--font-suisse-intl',
	display: 'swap',
	fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

// JetBrains Mono - моноширинный шрифт
export const jetBrainsMono = localFont({
	src: [
		{
			path: '../../public/fonts/JetBrainsMono.ttf',
			weight: '500',
			style: 'normal',
		},
	],
	variable: '--font-jetbrains-mono',
	display: 'swap',
	fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
});

