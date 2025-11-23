"use client";

import React from "react";
import Link from "next/link";
import { classes } from "@/lib/utils";
import { Typography } from "@/components/Typography";
import styles from "./Button.module.css";

interface ButtonProps {
	href?: string;
	children: React.ReactNode;
	onClick?: () => void;
	variant?: "default" | "primary" | "flip";
	className?: string;
	type?: "button" | "submit" | "reset";
}

export function Button({
	href,
	children,
	onClick,
	variant = "default",
	className,
	type = "button",
}: ButtonProps) {
	const baseClassName = classes(
		styles.button,
		variant === "flip" ? styles.flip : styles[variant],
		className
	);

	const textContent1 = (
		<Typography size="XXS" font="default" color="black">
			{children}
		</Typography>
	);

	const textContent2 = (
		<Typography size="XXS" font="default" color="black-inverse">
			{children}
		</Typography>
	);

	// Для flip варианта используем data-атрибуты для псевдоэлементов
	if (variant === "flip") {
		// Извлекаем текст из children для data-атрибутов
		const getTextContent = (node: React.ReactNode): string => {
			if (typeof node === "string") return node;
			if (typeof node === "number") return String(node);
			if (Array.isArray(node)) return node.map(getTextContent).join("");
			if (node && typeof node === "object" && "props" in node) {
				return getTextContent((node as any).props?.children || "");
			}
			return "";
		};
		const content = getTextContent(children);
		const props = {
			className: baseClassName,
			"data-front": content,
			"data-back": content,
		};

		if (href) {
			return (
				<Link href={href} {...props}>
					{/* Контент будет через псевдоэлементы */}
				</Link>
			);
		}

		return (
			<button type={type} onClick={onClick} {...props}>
				{/* Контент будет через псевдоэлементы */}
			</button>
		);
	}

	const content = (
		<>
			<div className={styles.buttonFace1}>{textContent1}</div>
			<div className={styles.buttonFace2}>{textContent2}</div>
			<div className={styles.buttonFaceNone}>{textContent1}</div>
		</>
	);

	if (href) {
		return (
			<Link href={href} className={baseClassName}>
				{content}
			</Link>
		);
	}

	return (
		<button type={type} onClick={onClick} className={baseClassName}>
			{content}
		</button>
	);
}

