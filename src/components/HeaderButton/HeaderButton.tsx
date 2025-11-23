"use client";

import React from "react";
import Link from "next/link";
import { classes } from "@/lib/utils";
import { Typography } from "@/components/Typography";
import styles from "./HeaderButton.module.css";

interface HeaderButtonProps {
	href?: string;
	children: React.ReactNode;
	onClick?: () => void;
	className?: string;
	inverted?: boolean; // Если true, кнопка изначально синяя, анимация наоборот
	target?: string;
	rel?: string;
}

export function HeaderButton({
	href,
	children,
	onClick,
	className,
	inverted = false,
	target,
	rel,
}: HeaderButtonProps) {
	const buttonClassName = classes(styles.button, inverted && styles.inverted, className);
	const wrapperClassName = styles.wrapper;

	// Определяем, является ли children строкой
	const isString = typeof children === "string";

	const buttonContent = (
		<>
			{/* Gray background layer */}
			<div className={styles.bgGray} />

			{/* Blue background layer */}
			<div className={styles.bgBlue} />

			<div className={styles.overflow}>
				{/* First layer - slides up on hover */}
				<div className={styles.textRel}>
					{isString ? (
						<Typography size="XXS" font="default" color={inverted ? "black-inverse" : "black"}>
							{children}
						</Typography>
					) : (
						<div className={styles.textBlack}>{children}</div>
					)}
				</div>

				{/* Second layer - slides in from bottom on hover */}
				<div className={styles.textAb}>
					{isString ? (
						<Typography size="XXS" font="default" color={inverted ? "black" : "black-inverse"}>
							{children}
						</Typography>
					) : (
						<div className={styles.textWhite}>{children}</div>
					)}
				</div>
			</div>
		</>
	);

	if (href) {
		// Для внешних ссылок (PDF, внешние URL) используем обычный <a>
		if (target === "_blank" || href.startsWith("http") || href.endsWith(".pdf")) {
			return (
				<div className={wrapperClassName}>
					<a href={href} target={target || "_blank"} rel={rel || "noopener noreferrer"} className={buttonClassName}>
						{buttonContent}
					</a>
				</div>
			);
		}
		
		return (
			<div className={wrapperClassName}>
				<Link href={href} className={buttonClassName}>
					{buttonContent}
				</Link>
			</div>
		);
	}

	return (
		<div className={wrapperClassName}>
			<button onClick={onClick} className={buttonClassName}>
				{buttonContent}
			</button>
		</div>
	);
}

