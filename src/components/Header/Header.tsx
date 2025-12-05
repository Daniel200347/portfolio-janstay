"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Logo, Resume, Menu, Close } from "@/icons";
import { HeaderButton, Tooltip } from "@/components";
import { Typography } from "@/components/Typography";
import { MobileMenu } from "./MobileMenu";
import styles from "./Header.module.css";

interface HeaderProps {
	quote?: string;
}

/**
 * Header Component
 *
 * Main navigation header with logo, quote, menu items, and mobile menu.
 *
 * @param quote - Optional quote text displayed in desktop view
 */
export function Header({ quote = "МЫ ЗАПУТАЛИСЬ В ТЕНЯХ, НЕЙРОСЕТЯХ И СИСТЕМЕ" }: HeaderProps) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = useCallback(() => {
		setIsMobileMenuOpen((prev) => !prev);
	}, []);

	const closeMobileMenu = useCallback(() => {
		setIsMobileMenuOpen(false);
	}, []);

	return (
		<>
			<header className={styles.header}>
				{/* Logo - links to home */}
				<Link href="/" className={styles.logo} aria-label="На главную">
					<Logo className={styles.logoIcon} aria-hidden="true" />
				</Link>

				{/* Navigation container */}
				<nav className={styles.nav} aria-label="Основная навигация">
					{/* Quote section - visible on desktop */}
					<div className={styles.quote}>
						<Typography size="XXS" font="default" color="black">
							{quote}
						</Typography>
					</div>

					{/* Menu items - visible on desktop and tablet */}
					<div className={styles.menuItems}>
						<HeaderButton href="/info">ОБО МНЕ</HeaderButton>
						<HeaderButton href="/playground">ПЕСОЧНИЦА</HeaderButton>
						<Tooltip text="Посмотреть резюме">
							<HeaderButton href="/resume.pdf" target="_blank" rel="noopener noreferrer" className={styles.resumeButton}>
								<Resume className={styles.resumeIcon} aria-hidden="true" />
							</HeaderButton>
						</Tooltip>
					</div>

					{/* Telegram button - always visible */}
					<HeaderButton wrapperStyle={styles.navTelegramButton} href="https://t.me" target="_blank" rel="noopener noreferrer" inverted className={styles.telegramButton}>
						НАПИСАТЬ В ТГ
					</HeaderButton>

					{/* Mobile menu toggle - visible only on mobile */}
					<button
						className={styles.burgerButton}
						onClick={toggleMobileMenu}
						aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
						aria-expanded={isMobileMenuOpen}
					>
						{isMobileMenuOpen ? (
							<Close className={styles.burgerIcon} aria-hidden="true" />
						) : (
							<Menu className={styles.burgerIcon} aria-hidden="true" />
						)}
					</button>
				</nav>
			</header>

			{/* Mobile menu overlay */}
			<MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
		</>
	);
}
