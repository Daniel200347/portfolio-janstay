import { twMerge } from "tailwind-merge";

type ClassValue = string | number | boolean | undefined | null | Record<string, boolean> | ClassValue[];

function classes(...inputs: ClassValue[]): string {
	const result: string[] = [];

	for (const input of inputs) {
		if (!input) continue;

		if (typeof input === "string" || typeof input === "number") {
			result.push(String(input));
		} else if (Array.isArray(input)) {
			const inner = classes(...input);
			if (inner) result.push(inner);
		} else if (typeof input === "object") {
			for (const key in input) {
				if (input[key]) {
					result.push(key);
				}
			}
		}
	}

	return twMerge(result.join(" "));
}

// Утилита для получения basePath (нужна для статического экспорта на GitHub Pages)
export function getBasePath(): string {
	if (typeof window !== 'undefined') {
		// На клиенте используем window.location
		const path = window.location.pathname;
		if (path.startsWith('/portfolio-janstay')) {
			return '/portfolio-janstay';
		}
	}
	// На сервере или при билде используем переменную окружения или дефолт
	return process.env.NODE_ENV === 'production' ? '/portfolio-janstay' : '';
}

export { classes };
