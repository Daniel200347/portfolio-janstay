"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo, Resume, Menu, Close } from "@/icons";
import { HeaderButton, Tooltip } from "@/components";
import { Typography } from "@/components/Typography";
import { MobileMenu } from "./MobileMenu";
import styles from "./Header.module.css";

interface HeaderProps {
	quote?: string;
}

export function Header({ quote = "МЫ ЗАПУТАЛИСЬ В ТЕНЯХ, НЕЙРОСЕТЯХ И СИСТЕМЕ" }: HeaderProps) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<>
			<header className={styles.header}>
				<Link href="/" className={styles.logo}>
					<Logo className={styles.logoIcon} />
				</Link>
				<nav className={styles.nav}>
					<div className={styles.quote}>
						<Typography size="XXS" font="default" color="black">
							{quote}
						</Typography>
					</div>
					<div className={styles.menuItems}>
						<HeaderButton href="/info">ОБО МНЕ</HeaderButton>
						<HeaderButton href="/playground">ПЕСОЧНИЦА</HeaderButton>
						<Tooltip text="Посмотреть резюме">
							<HeaderButton href="/resume.pdf" target="_blank" className={styles.resumeButton}>
								<Resume className={styles.resumeIcon} />
							</HeaderButton>
						</Tooltip>
					</div>
					<HeaderButton href="https://t.me" inverted className={styles.telegramButton}>
						НАПИСАТЬ В ТГ
					</HeaderButton>
					<button className={styles.burgerButton} onClick={toggleMobileMenu} aria-label="Меню">
						{isMobileMenuOpen ? (
							<Close className={styles.burgerIcon} />
						) : (
							<Menu className={styles.burgerIcon} />
						)}
					</button>
				</nav>
			</header>
			<MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
		</>
	);
}

