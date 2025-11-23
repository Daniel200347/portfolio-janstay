"use client";

import React from "react";
import Link from "next/link";
import { classes } from "@/lib/utils";
import { Typography } from "@/components/Typography";
import styles from "./MenuButton.module.css";

interface MenuButtonProps {
	href?: string;
	children: React.ReactNode;
	onClick?: () => void;
	className?: string;
}

export function MenuButton({
	href,
	children,
	onClick,
	className,
}: MenuButtonProps) {
	const baseClassName = classes(styles.menuButton, className);

	if (href) {
		return (
			<Link href={href} className={baseClassName}>
				<Typography size="XXS" font="default" color="black-inverse">
					{children}
				</Typography>
			</Link>
		);
	}

	return (
		<button onClick={onClick} className={baseClassName}>
			<Typography size="XXS" font="default" color="black-inverse">
				{children}
			</Typography>
		</button>
	);
}

