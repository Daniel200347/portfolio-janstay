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
 * Компонент Header
 * @param quote - Опциональный текст цитаты, отображаемый на десктопе
 */
export function Header({ quote = "Мы запутались в тенях, нейросетях и системе" }: HeaderProps) {
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
				{/* Логотип - ссылка на главную */}
				<Link href="/" className={styles.logo} aria-label="На главную">
					<Logo className={styles.logoIcon} aria-hidden="true" />
				</Link>

				{/* Контейнер навигации */}
				<nav className={styles.nav} aria-label="Основная навигация">
					{/* Секция с цитатой - видна на десктопе */}
					<div className={styles.quote}>
						<Typography size="XXS" font="default" color="black">
							{quote}
						</Typography>
					</div>

					{/* Элементы меню - видны на десктопе и планшете */}
					<div className={styles.menuItems}>
						<HeaderButton href="/info">Обо мне</HeaderButton>
						<HeaderButton href="/playground">Песочница</HeaderButton>
						<Tooltip text="Смотреть резюме">
							<HeaderButton href="/resume.pdf" target="_blank" rel="noopener noreferrer" className={styles.resumeButton}>
								<Resume className={styles.resumeIcon} aria-hidden="true" />
							</HeaderButton>
						</Tooltip>
					</div>

					{/* Кнопка бургер-меню - видна только на мобильных */}
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

					{/* Кнопка Telegram - всегда видна */}
					<HeaderButton wrapperStyle={styles.navTelegramButton} href="https://t.me/yajevladimir" target="_blank" rel="noopener noreferrer" inverted className={styles.telegramButton}>
						Написать в тг
					</HeaderButton>
				</nav>
			</header>

			{/* Мобильное меню */}
			<MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
		</>
	);
}
