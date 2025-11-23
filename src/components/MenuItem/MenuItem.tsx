"use client";

import React from "react";
import Link from "next/link";
import { classes } from "@/lib/utils";
import { Typography } from "@/components/Typography";
import { Tooltip } from "@/components/Tooltip";
import styles from "./MenuItem.module.css";

interface MenuItemProps {
	href?: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
	onClick?: () => void;
	tooltip?: string;
	className?: string;
}

export function MenuItem({
	href,
	icon,
	children,
	onClick,
	tooltip,
	className,
}: MenuItemProps) {
	const iconElement = icon ? (
		<span className={styles.icon}>
			{icon}
		</span>
	) : null;

	const content = (
		<>
			{iconElement}
			<Typography size="XXS" font="default" color="black">
				{children}
			</Typography>
		</>
	);

	const baseClassName = classes(
		styles.menuItem,
		icon ? styles.withIcon : styles.textOnly,
		className
	);

	const menuItem = href ? (
		<Link href={href} className={baseClassName}>
			{content}
		</Link>
	) : (
		<button onClick={onClick} className={baseClassName}>
			{content}
		</button>
	);

	if (tooltip && href && icon) {
		return (
			<Tooltip text={tooltip}>
				{menuItem}
			</Tooltip>
		);
	}

	return menuItem;
}

