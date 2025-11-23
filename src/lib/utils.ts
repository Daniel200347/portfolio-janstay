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

export { classes };
