"use client";

import { useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Logo, Close } from "@/icons";
import { HeaderButton } from "@/components";
import { Typography } from "@/components/Typography";
import styles from "./MobileMenu.module.css";
import { Footer } from "@/components/Footer";
import { FadeIn } from "@/components/FadeIn";

interface MobileMenuProps {
	isOpen: boolean;
	onClose: () => void;
}

/**
 * MobileMenu Component
 * 
 * Full-screen mobile navigation menu with:
 * - Header with logo and close button
 * - Navigation links
 * - Footer with location/weather info and social links
 * 
 * @param isOpen - Controls menu visibility
 * @param onClose - Callback to close the menu
 */
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
	const scrollPositionRef = useRef<number>(0);

	// Lock body scroll when menu is open
	useEffect(() => {
		if (isOpen) {
			// Сохраняем текущую позицию скролла
			scrollPositionRef.current = window.scrollY;
			document.body.style.position = "fixed";
			document.body.style.top = `-${scrollPositionRef.current}px`;
			document.body.style.width = "100%";
			document.body.style.overflow = "hidden";
		} else {
			// Восстанавливаем стили
			const scrollY = scrollPositionRef.current;
			document.body.style.position = "";
			document.body.style.top = "";
			document.body.style.width = "";
			document.body.style.overflow = "";
			// Восстанавливаем позицию скролла после того, как стили применены
			requestAnimationFrame(() => {
				window.scrollTo(0, scrollY);
			});
		}

		return () => {
			// Cleanup при размонтировании
			if (!isOpen) {
				document.body.style.position = "";
				document.body.style.top = "";
				document.body.style.width = "";
				document.body.style.overflow = "";
			}
		};
	}, [isOpen]);

	const handleMenuLinkClick = useCallback(() => {
		onClose();
	}, [onClose]);

	if (!isOpen) return null;

	return (
		<div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Мобильное меню">
			<div className={styles.menu}>
				{/* Header section */}
				<div className={styles.header}>
					<FadeIn immediate delay={0.1}>
						<Link href="/" className={styles.logo} onClick={handleMenuLinkClick} aria-label="На главную">
							<Logo className={styles.logoIcon} aria-hidden="true" />
						</Link>
					</FadeIn>
					<div className={styles.headerNav}>
						<FadeIn immediate delay={0.15}>
							<button className={styles.closeButton} onClick={onClose} aria-label="Закрыть меню">
								<Close className={styles.closeIcon} aria-hidden="true" />
							</button>
						</FadeIn>
						<FadeIn immediate delay={0.2}>
							<HeaderButton href="https://t.me/yajevladimir" target="_blank" rel="noopener noreferrer" inverted className={styles.telegramButton}>
								НАПИСАТЬ В ТГ
							</HeaderButton>
						</FadeIn>
					</div>
				</div>

				{/* Navigation links */}
				<nav className={styles.menuNav} aria-label="Навигация">
					<FadeIn immediate delay={0.3}>
						<Link href="/info" className={styles.menuLink} onClick={handleMenuLinkClick}>
							<Typography size="XS" font="default" color="black">
								ОБО МНЕ
							</Typography>
						</Link>
					</FadeIn>
					<FadeIn immediate delay={0.4}>
						<Link href="/playground" className={styles.menuLink} onClick={handleMenuLinkClick}>
							<Typography size="XS" font="default" color="black">
								ПЕСОЧНИЦА
							</Typography>
						</Link>
					</FadeIn>
				</nav>

				<div className={styles.footerWrapper}>
					<FadeIn immediate delay={0.5}>
						<Footer />
					</FadeIn>
				</div>
			</div>
		</div>
	);
}
