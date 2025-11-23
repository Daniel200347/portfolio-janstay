"use client";

import React, { useState, useRef, useEffect } from "react";
import { classes } from "@/lib/utils";
import { Typography } from "@/components/Typography";
import styles from "./Tooltip.module.css";

interface TooltipProps {
	children: React.ReactNode;
	text: string;
	className?: string;
}

export function Tooltip({
	children,
	text,
	className,
}: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const wrapperRef = useRef<HTMLDivElement>(null);

	const handleMouseMove = (e: React.MouseEvent) => {
		setPosition({ x: e.clientX, y: e.clientY });
	};

	const handleMouseEnter = () => {
		setIsVisible(true);
	};

	const handleMouseLeave = () => {
		setIsVisible(false);
	};

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (isVisible) {
				setPosition({ x: e.clientX, y: e.clientY });
			}
		};

		if (isVisible) {
			window.addEventListener("mousemove", handleMouseMove);
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [isVisible]);

	return (
		<div
			ref={wrapperRef}
			className={classes(styles.tooltipWrapper, className)}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onMouseMove={handleMouseMove}
		>
			{children}
			{isVisible && (
				<div
					className={styles.tooltip}
					style={{
						left: `${position.x}px`,
						top: `${position.y}px`,
					}}
				>
					<Typography size="XXXS" font="mono" color="black-inverse">
						{text}
					</Typography>
				</div>
			)}
		</div>
	);
}
