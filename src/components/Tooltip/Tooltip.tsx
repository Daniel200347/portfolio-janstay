"use client";

import React, { useState, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { classes } from "@/lib/utils";
import { Typography } from "@/components/Typography";
import styles from "./Tooltip.module.css";

interface TooltipProps {
	children: React.ReactNode;
	text: string;
	className?: string;
}

/**
 * Tooltip Component
 * 
 * Displays a smooth animated tooltip that follows the mouse cursor on hover.
 * Uses framer-motion for spring-based animations and smooth position tracking.
 * 
 * @param children - Element that triggers the tooltip
 * @param text - Tooltip text content
 * @param className - Additional CSS classes
 */
export function Tooltip({ children, text, className }: TooltipProps) {
	const [visible, setVisible] = useState(false);

	// Motion values for smooth cursor tracking
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	// Spring configuration for smooth animation
	const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
	const springX = useSpring(mouseX, springConfig);
	const springY = useSpring(mouseY, springConfig);

	/**
	 * Update tooltip position based on mouse coordinates
	 * Offset: +16px horizontal, +24px vertical
	 */
	const updatePosition = useCallback((e: React.MouseEvent | MouseEvent) => {
		mouseX.set(e.clientX + 16);
		mouseY.set(e.clientY + 24);
	}, [mouseX, mouseY]);

	/**
	 * Handle mouse enter - show tooltip and set initial position
	 */
	const handleMouseEnter = useCallback((e: React.MouseEvent) => {
		updatePosition(e);
		// Jump to initial position for instant feedback
		springX.jump(e.clientX + 16);
		springY.jump(e.clientY + 24);
		setVisible(true);
	}, [updatePosition, springX, springY]);

	/**
	 * Handle mouse move - update tooltip position
	 */
	const handleMouseMove = useCallback((e: React.MouseEvent) => {
		if (!visible) return;
		updatePosition(e);
	}, [visible, updatePosition]);

	/**
	 * Handle mouse leave - hide tooltip
	 */
	const handleMouseLeave = useCallback(() => {
		setVisible(false);
	}, []);

	return (
		<>
			<div
				className={classes(styles.tooltipWrapper, className)}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onMouseMove={handleMouseMove}
				style={{ display: "contents" }}
			>
				{children}
			</div>
			{visible && (
				<motion.div
					className={styles.tooltip}
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						x: springX,
						y: springY,
						pointerEvents: "none",
						zIndex: 9999,
					}}
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.9 }}
					transition={{ duration: 0.15 }}
					role="tooltip"
					aria-live="polite"
				>
					<Typography size="XXXS" font="mono" color="black-inverse">
						{text}
					</Typography>
				</motion.div>
			)}
		</>
	);
}
