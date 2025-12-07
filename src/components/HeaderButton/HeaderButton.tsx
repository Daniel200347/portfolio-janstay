"use client";

import { useMemo } from "react";
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
	wrapperStyle?: string;
}

/**
 * HeaderButton Component
 *
 * Анимированная кнопка для навигации в хедере с двумя вариантами:
 * - Текстовые кнопки: скольжение текста при наведении
 * - Кнопки с иконками: скольжение фоновых слоёв с иконками при наведении
 *
 * @param href - Ссылка (внутренняя или внешняя)
 * @param children - Содержимое кнопки (строка для текста, ReactNode для иконок)
 * @param onClick - Обработчик клика для варианта кнопки
 * @param className - Дополнительные CSS классы
 * @param inverted - Если true, кнопка начинается с синего фона
 * @param target - Атрибут target для ссылки
 * @param rel - Атрибут rel для ссылки
 * @param wrapperStyle - Стили для обёртки
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
	const isString = useMemo(() => typeof children === "string", [children]);

	const buttonClassName = classes(
		styles.button,
		inverted && styles.inverted,
		!isString && styles.iconButton,
		className
	);

	const buttonContent = useMemo(
		() =>
			isString ? (
				<>
					<div className={styles.bgGray} aria-hidden="true" />
					<div className={styles.bgBlue} aria-hidden="true" />

					<div className={styles.textWidth} aria-hidden="true">
						<Typography size="XXS" font="default" color={inverted ? "black-inverse" : "black"}>
							{children}
						</Typography>
					</div>

					<div className={styles.overflow}>
						<div className={styles.textRel}>
							<Typography size="XXS" font="default" color={inverted ? "black-inverse" : "black"}>
								{children}
							</Typography>
						</div>

						<div className={styles.textAb}>
							<Typography size="XXS" font="default" color="black-inverse">
								{children}
							</Typography>
						</div>
					</div>
				</>
			) : (
				<>
					<div className={styles.bgGray} aria-hidden="true">
						<div className={styles.iconContainer}>
							<div className={styles.iconBlack}>{children}</div>
						</div>
					</div>

					<div className={styles.bgBlue} aria-hidden="true">
						<div className={styles.iconContainer}>
							<div className={styles.iconWhite}>{children}</div>
						</div>
					</div>
				</>
			),
		[children, isString, inverted]
	);

	// Внешние ссылки (PDF, HTTP) - используем нативный <a> тег
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

	// Внутренние ссылки - используем Next.js Link
	if (href) {
		return (
			<div className={styles.wrapper}>
				<Link href={href} className={buttonClassName}>
					{buttonContent}
				</Link>
			</div>
		);
	}

	// Вариант кнопки без ссылки
	return (
		<div className={styles.wrapper}>
			<button onClick={onClick} className={buttonClassName} type="button">
				{buttonContent}
			</button>
		</div>
	);
}
