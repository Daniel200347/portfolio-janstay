"use client";

import { useState, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { classes } from "@/lib/utils";
import { Typography } from "@/components/Typography";
import styles from "./Tooltip.module.css";

interface TooltipProps {
	children: React.ReactNode;
	text: string;
	className?: string;
}

// Конфигурация пружинной анимации
const SPRING_CONFIG = { damping: 25, stiffness: 150, mass: 0.5 };

// Смещение тултипа относительно курсора
const TOOLTIP_OFFSET_X = 16;
const TOOLTIP_OFFSET_Y = 24;

/**
 * Компонент Tooltip
 * @param children - Элемент, который триггерит тултип
 * @param text - Текст тултипа
 * @param className - Дополнительные CSS классы
 */
export function Tooltip({ children, text, className }: TooltipProps) {
	const [visible, setVisible] = useState(false);

	// Motion values для плавного отслеживания курсора
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	// Пружинная анимация для плавного движения
	const springX = useSpring(mouseX, SPRING_CONFIG);
	const springY = useSpring(mouseY, SPRING_CONFIG);

	/**
	 * Обновление позиции тултипа на основе координат мыши
	 */
	const updatePosition = useCallback((e: React.MouseEvent | MouseEvent) => {
		mouseX.set(e.clientX + TOOLTIP_OFFSET_X);
		mouseY.set(e.clientY + TOOLTIP_OFFSET_Y);
	}, [mouseX, mouseY]);

	/**
	 * Обработка наведения мыши - показываем тултип и устанавливаем начальную позицию
	 */
	const handleMouseEnter = useCallback((e: React.MouseEvent) => {
		updatePosition(e);
		// Мгновенный переход к начальной позиции для быстрой обратной связи
		springX.jump(e.clientX + TOOLTIP_OFFSET_X);
		springY.jump(e.clientY + TOOLTIP_OFFSET_Y);
		setVisible(true);
	}, [updatePosition, springX, springY]);

	/**
	 * Обработка движения мыши - обновляем позицию тултипа
	 */
	const handleMouseMove = useCallback((e: React.MouseEvent) => {
		if (!visible) return;
		updatePosition(e);
	}, [visible, updatePosition]);

	/**
	 * Обработка ухода мыши - скрываем тултип
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
					<Typography className={styles.tooltipText} size="XXXS" font="mono" color="black-inverse">
						{text}
					</Typography>
				</motion.div>
			)}
		</>
	);
}
