import React from "react";
import { classes } from "@/lib/utils";
import styles from "./Typography.module.css";

export type TypographySize = "XXL" | "XL" | "LG" | "MD" | "SM" | "XS" | "XXS" | "XXXS";

export type TypographyFont = "default" | "mono";

export type TypographyColor =
	| "accent"
	| "black"
	| "black-inverse"
	| "secondary";

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
	size?: TypographySize;
	font?: TypographyFont;
	color?: TypographyColor;
	as?: React.ElementType;
	children: React.ReactNode;
}

const sizeStyles: Record<TypographySize, Record<TypographyFont, string>> = {
	XXL: {
		default: styles.sizeXXL,
		mono: styles.sizeXXLMono,
	},
	XL: {
		default: styles.sizeXL,
		mono: styles.sizeXLMono,
	},
	LG: {
		default: styles.sizeLG,
		mono: styles.sizeLGMono,
	},
	MD: {
		default: styles.sizeMD,
		mono: styles.sizeMDMono,
	},
	SM: {
		default: styles.sizeSM,
		mono: styles.sizeSMMono,
	},
	XS: {
		default: styles.sizeXS,
		mono: styles.sizeXSMono,
	},
	XXS: {
		default: styles.sizeXXS,
		mono: styles.sizeXXSMono,
	},
	XXXS: {
		default: styles.sizeXXXS,
		mono: styles.sizeXXXSMono,
	},
};

const colorStyles: Record<TypographyColor, string> = {
	accent: styles.colorAccent,
	black: styles.colorBlack,
	"black-inverse": styles.colorBlackInverse,
	secondary: styles.colorSecondary,
};

export function Typography({
	size = "XS",
	font = "default",
	color = "black",
	as,
	className,
	children,
	...props
}: TypographyProps) {
	const Component = as || getDefaultTag(size);

	return (
		<Component
			className={classes(
				sizeStyles[size][font],
				colorStyles[color],
				className
			)}
			{...props}
		>
			{children}
		</Component>
	);
}

function getDefaultTag(size: TypographySize): React.ElementType {
	if (size === "XXL" || size === "XL" || size === "LG") {
		return "h1";
	}
	if (size === "MD" || size === "SM") {
		return "h2";
	}
	return "p";
}

