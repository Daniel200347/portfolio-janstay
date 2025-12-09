"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Logo, Resume, Menu, Close } from "@/icons";
import { HeaderButton, Tooltip } from "@/components";
import { Typography } from "@/components/Typography";
import { FadeIn } from "@/components/FadeIn";
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
			<FadeIn immediate className={styles.logo}>
				<Link href="/" aria-label="На главную">
					<Logo className={styles.logoIcon} aria-hidden="true" />
				</Link>
			</FadeIn>
			<header className={styles.header}>
				{/* Контейнер навигации */}
				<nav className={styles.nav} aria-label="Основная навигация">
					{/* Секция с цитатой - видна на десктопе */}
					<FadeIn immediate delay={0.1} className={styles.quote}>
						<Typography size="XXS" font="default" color="black">
							{quote}
						</Typography>
					</FadeIn>

					{/* Элементы меню - видны на десктопе и планшете */}
					<div className={styles.menuItems}>
						<FadeIn immediate delay={0.2} style={{ display: 'flex' }}>
							<HeaderButton href="/info">Обо мне</HeaderButton>
						</FadeIn>
						<FadeIn immediate delay={0.3} style={{ display: 'flex' }}>
							<HeaderButton href="/playground">Песочница</HeaderButton>
						</FadeIn>
						<Tooltip text="Смотреть резюме">
							<FadeIn immediate delay={0.4} style={{ display: 'flex' }}>
								<HeaderButton href="/resume.pdf" target="_blank" rel="noopener noreferrer" className={styles.resumeButton}>
									<Resume className={styles.resumeIcon} aria-hidden="true" />
								</HeaderButton>
							</FadeIn>
						</Tooltip>
					</div>

					{/* Кнопка бургер-меню - видна только на мобильных */}
					<FadeIn immediate delay={0.5} className={styles.burgerFadeIn}>
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
					</FadeIn>

					{/* Кнопка Telegram - всегда видна */}
					<FadeIn immediate delay={0.6} style={{ display: 'flex' }}>
						<HeaderButton wrapperStyle={styles.navTelegramButton} href="https://t.me/yajevladimir" target="_blank" rel="noopener noreferrer" inverted className={styles.telegramButton}>
							Написать в тг
						</HeaderButton>
					</FadeIn>
				</nav>
			</header>

			{/* Мобильное меню */}
			<MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
		</>
	);
}
