"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { classes } from "@/lib/utils";
import { Typography } from "@/components/Typography";
import styles from "./HeaderButton.module.css";
import classNames from "classnames";

interface HeaderButtonProps {
	href?: string;
	children: React.ReactNode;
	onClick?: () => void;
	className?: string;
	inverted?: boolean;
	target?: string;
	rel?: string;
	wrapperStyle?:string;
}

/**
 * HeaderButton Component
 *
 * Animated button component for header navigation with two variants:
 * - Text buttons: slide text animation on hover
 * - Icon buttons: slide background layers with icons on hover
 *
 * @param href - Link destination (internal or external)
 * @param children - Button content (string for text, ReactNode for icons)
 * @param onClick - Click handler for button variant
 * @param className - Additional CSS classes
 * @param inverted - If true, button starts with blue background
 * @param target - Link target attribute
 * @param rel - Link rel attribute
 */
export function HeaderButton({
	href,
	children,
	onClick,
	className,
	inverted = false,
	target,
    rel,
    wrapperStyle,
							 }: HeaderButtonProps) {
	// Determine if children is a string (text button) or ReactNode (icon button)
	const isString = useMemo(() => typeof children === "string", [children]);

	const buttonClassName = classes(
		styles.button,
		inverted && styles.inverted,
		!isString && styles.iconButton,
		className
	);

	// Render button content based on type
	const buttonContent = useMemo(
		() =>
			isString ? (
				<>
					{/* Background layers for text buttons */}
					<div className={styles.bgGray} aria-hidden="true" />
					<div className={styles.bgBlue} aria-hidden="true" />

					{/* Text sliding animation container */}
					<div className={styles.overflow}>
						{/* First layer - slides up on hover */}
						<div className={styles.textRel}>
							<Typography size="XXS" font="default" color={inverted ? "black-inverse" : "black"}>
								{children}
							</Typography>
						</div>

						{/* Second layer - slides in from bottom on hover */}
						<div className={styles.textAb}>
							<Typography size="XXS" font="default" color="black-inverse">
								{children}
							</Typography>
						</div>
					</div>
				</>
			) : (
				<>
					{/* Gray background layer with icon - slides up on hover */}
					<div className={styles.bgGray} aria-hidden="true">
						<div className={styles.iconContainer}>
							<div className={styles.iconBlack}>{children}</div>
						</div>
					</div>

					{/* Blue background layer with icon - slides in from bottom on hover */}
					<div className={styles.bgBlue} aria-hidden="true">
						<div className={styles.iconContainer}>
							<div className={styles.iconWhite}>{children}</div>
						</div>
					</div>
				</>
			),
		[children, isString, inverted]
	);

	// External links (PDF, HTTP) - use native <a> tag
	if (href && (target === "_blank" || href.startsWith("http") || href.endsWith(".pdf"))) {
		return (
			<div className={classNames(styles.wrapper, wrapperStyle)}>
				<a
					href={href}
					target={target || "_blank"}
					rel={rel || "noopener noreferrer"}
					className={buttonClassName}
				>
					{buttonContent}
				</a>
			</div>
		);
	}

	// Internal links - use Next.js Link
	if (href) {
		return (
			<div className={styles.wrapper}>
				<Link href={href} className={buttonClassName}>
					{buttonContent}
				</Link>
			</div>
		);
	}

	// Button variant - no href
	return (
		<div className={styles.wrapper}>
			<button onClick={onClick} className={buttonClassName} type="button">
				{buttonContent}
			</button>
		</div>
	);
}
