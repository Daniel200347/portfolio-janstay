"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Typography } from "@/components/Typography";
import styles from "./Footer.module.css";

interface LocationWeather {
	location: string;
	temperature: number;
	description: string;
}

export function Footer() {
	const [locationWeather, setLocationWeather] = useState<LocationWeather | null>(null);
	const [currentTime, setCurrentTime] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [emailCopied, setEmailCopied] = useState(false);

	const email = "yajevladimir@example.com"; // Замените на реальный email

	useEffect(() => {
		function updateTime() {
			const now = new Date();
			setCurrentTime(now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
		}

		updateTime();
		const timeInterval = setInterval(updateTime, 60000);

		return () => clearInterval(timeInterval);
	}, []);

	// Обновление погоды и локации
	useEffect(() => {
		async function fetchLocationWeather() {
			try {
				const response = await fetch("/api/location-weather");
				if (response.ok) {
					const data = await response.json();
					setLocationWeather(data);
				} else {
					setLocationWeather(null);
				}
			} catch (error) {
				console.error("Failed to fetch location and weather:", error);
				setLocationWeather(null);
			} finally {
				setIsLoading(false);
			}
		}

		fetchLocationWeather();
		const weatherInterval = setInterval(fetchLocationWeather, 10 * 60 * 1000);

		return () => clearInterval(weatherInterval);
	}, []);

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
		<footer className={styles.footer}>
			<div className={styles.container}>
				<div className={styles.content}>
					<div className={styles.geo}>
						<Typography size="XXS" font="default" color="black-inverse">
							{isLoading || !locationWeather ? (
								<>&nbsp;</>
							) : (
								<>
									{locationWeather.location}
									<br />
									{currentTime}, {locationWeather.description} {locationWeather.temperature}°C
								</>
							)}
						</Typography>
					</div>
					<div className={styles.quote}>
						<Typography size="XXS" font="default" color="black-inverse">
							«Никто не уважает то, что не нужно зарабатывать. Никто не ценит то, что всегда есть.» Серафим Рыбкин
						</Typography>
					</div>
					<div className={styles.links}>
						<Link href="https://t.me/yajevladimir" target="_blank" rel="noopener noreferrer" className={styles.link}>
							<Typography size="XXS" font="default" color="black-inverse">
								Телеграм,
							</Typography>
						</Link>
						<Link href="#" onClick={handleEmailClick} className={styles.link}>
							<Typography size="XXS" font="default" color="black-inverse">
								{emailCopied ? "Скопировано" : "Почта,"}
							</Typography>
						</Link>
						<Link href="/resume.pdf" target="_blank" rel="noopener noreferrer" className={styles.link}>
							<Typography size="XXS" font="default" color="black-inverse">
								Резюме
							</Typography>
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}

