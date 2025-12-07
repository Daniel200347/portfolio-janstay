"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Logo, Close } from "@/icons";
import { HeaderButton } from "@/components";
import { Typography } from "@/components/Typography";
import { useWeather } from "@/lib/hooks/useWeather";
import styles from "./MobileMenu.module.css";

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
	const [emailCopied, setEmailCopied] = useState(false);
	const weatherText = useWeather();

	const email = "yajevladimir@example.com";

	// Lock body scroll when menu is open
	useEffect(() => {
		if (isOpen) {
			const scrollY = window.scrollY;
			document.body.style.position = "fixed";
			document.body.style.top = `-${scrollY}px`;
			document.body.style.width = "100%";
			document.body.style.overflow = "hidden";
		} else {
			const scrollY = document.body.style.top;
			document.body.style.position = "";
			document.body.style.top = "";
			document.body.style.width = "";
			document.body.style.overflow = "";
			if (scrollY) {
				window.scrollTo(0, parseInt(scrollY || "0") * -1);
			}
		}

		return () => {
			document.body.style.position = "";
			document.body.style.top = "";
			document.body.style.width = "";
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	const handleEmailClick = useCallback(async (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		try {
			await navigator.clipboard.writeText(email);
			setEmailCopied(true);
			setTimeout(() => setEmailCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy email:", error);
		}
	}, [email]);

	const handleMenuLinkClick = useCallback(() => {
		onClose();
	}, [onClose]);

	if (!isOpen) return null;

	return (
		<div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Мобильное меню">
			<div className={styles.menu}>
				{/* Header section */}
				<div className={styles.header}>
					<Link href="/" className={styles.logo} onClick={handleMenuLinkClick} aria-label="На главную">
						<Logo className={styles.logoIcon} aria-hidden="true" />
					</Link>
					<div className={styles.headerNav}>
						<button className={styles.closeButton} onClick={onClose} aria-label="Закрыть меню">
							<Close className={styles.closeIcon} aria-hidden="true" />
						</button>
						<HeaderButton href="https://t.me/yajevladimir" target="_blank" rel="noopener noreferrer" inverted className={styles.telegramButton}>
							НАПИСАТЬ В ТГ
						</HeaderButton>
					</div>
				</div>

				{/* Navigation links */}
				<nav className={styles.menuNav} aria-label="Навигация">
					<Link href="/info" className={styles.menuLink} onClick={handleMenuLinkClick}>
						<Typography size="XS" font="default" color="black">
							ОБО МНЕ
						</Typography>
					</Link>
					<Link href="/playground" className={styles.menuLink} onClick={handleMenuLinkClick}>
						<Typography size="XS" font="default" color="black">
							ПЕСОЧНИЦА
						</Typography>
					</Link>
				</nav>

				{/* Footer section */}
				<div className={styles.footer}>
					<div className={styles.geo}>
						<Typography size="XXS" font="default" color="black-inverse">
							Россия, Ростов-на-Дону
							<br />
							{weatherText}
						</Typography>
					</div>
					<div className={styles.footerLinks}>
						<Link href="https://t.me/yajevladimir" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
							<Typography size="XXS" font="default" color="black-inverse">
								Телеграм,
							</Typography>
						</Link>
						<Link href="#" onClick={handleEmailClick} className={styles.footerLink} aria-label="Скопировать email">
							<Typography size="XXS" font="default" color="black-inverse">
								{emailCopied ? "Скопировано" : "Почта,"}
							</Typography>
						</Link>
						<Link href="/resume.pdf" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
							<Typography size="XXS" font="default" color="black-inverse">
								Резюме
							</Typography>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
