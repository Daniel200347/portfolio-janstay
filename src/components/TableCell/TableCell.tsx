import React from "react";
import { classes } from "@/lib/utils";
import { Typography } from "@/components/Typography";
import styles from "./TableCell.module.css";

interface TableCellProps {
	children: React.ReactNode;
	variant?: "title" | "default";
	className?: string;
}

export function TableCell({
	children,
	variant = "default",
	className,
}: TableCellProps) {
	return (
		<div className={classes(styles.cell, styles[variant], className)}>
			<Typography
				size="XS"
				font="default"
				color={variant === "title" ? "secondary" : "black"}
			>
				{children}
			</Typography>
		</div>
	);
}

