"use client";

import { useState } from "react";
import Link from "next/link";
import { Typography } from "@/components/Typography";
import { useWeather } from "@/lib/hooks/useWeather";
import { useDailyQuote } from "@/lib/hooks/useDailyQuote";
import { UnderlineRedraw } from "@/components/UnderlineRedraw";
import styles from "./Footer.module.css";

const AnimatedLink = UnderlineRedraw(Link);

export function Footer() {
	const [emailCopied, setEmailCopied] = useState(false);
	const weatherText = useWeather();
	const quote = useDailyQuote();

	const email = "yajevladimir@example.com"; // Замените на реальный email

	const handleEmailClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		try {
			await navigator.clipboard.writeText(email);
			setEmailCopied(true);
			setTimeout(() => setEmailCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy email:", error);
		}
	};

	return (
		<footer className={styles.footer} data-footer>
			<div className={styles.container}>
				<div className={styles.content}>
					<div className={styles.geo}>
						<Typography size="XXS" font="default" color="black-inverse">
							Россия, Ростов-на-Дону
						</Typography>
						<Typography size="XXS" font="default" color="black-inverse">
							{weatherText}
						</Typography>
					</div>
					<div className={styles.wrapper}>
						<div className={styles.quote}>
							<Typography size="XXS" font="default" color="black-inverse">
								{quote}
							</Typography>
						</div>
						<div className={styles.links}>
							<AnimatedLink href="https://t.me/yajevladimir" target="_blank" rel="noopener noreferrer" className={styles.link}>
								<Typography size="XXS" font="default" color="black-inverse">
									Телеграм
								</Typography>
							</AnimatedLink>
							<AnimatedLink href="#" onClick={handleEmailClick} className={styles.link}>
								<Typography size="XXS" font="default" color="black-inverse">
									{emailCopied ? "Скопировано" : "Почта"}
								</Typography>
							</AnimatedLink>
							<AnimatedLink href="/resume.pdf" target="_blank" rel="noopener noreferrer" className={styles.link}>
								<Typography size="XXS" font="default" color="black-inverse">
									Резюме
								</Typography>
							</AnimatedLink>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}

