"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Logo, Close } from "@/icons";
import { HeaderButton } from "@/components";
import { Typography } from "@/components/Typography";
import styles from "./MobileMenu.module.css";

interface MobileMenuProps {
	isOpen: boolean;
	onClose: () => void;
}

interface LocationWeather {
	location: string;
	temperature: number;
	description: string;
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
	const [locationWeather, setLocationWeather] = useState<LocationWeather | null>(null);
	const [currentTime, setCurrentTime] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [emailCopied, setEmailCopied] = useState(false);

	const email = "yajevladimir@example.com";

	// Update time every minute
	useEffect(() => {
		if (!isOpen) return;

		function updateTime() {
			const now = new Date();
			setCurrentTime(now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
		}

		updateTime();
		const timeInterval = setInterval(updateTime, 60000);

		return () => clearInterval(timeInterval);
	}, [isOpen]);

	// Fetch location and weather data
	useEffect(() => {
		if (!isOpen) return;

		async function fetchLocationWeather() {
			try {
				const locationResponse = await fetch("http://ip-api.com/json/?fields=status,message,country,city,lat,lon");
				if (!locationResponse.ok) throw new Error("Failed to fetch location");

				const locationData = await locationResponse.json();
				if (locationData.status === "fail") throw new Error(locationData.message || "Failed to get location");

				if (!locationData.city || !locationData.country || locationData.lat === undefined || locationData.lon === undefined) {
					throw new Error("Incomplete location data");
				}

				// Country and city translation maps
				const countryMap: Record<string, string> = {
					Russia: "Россия",
					Ukraine: "Украина",
					Belarus: "Беларусь",
					Kazakhstan: "Казахстан",
				};

				const cityMap: Record<string, string> = {
					"Rostov-on-Don": "Ростов-на-Дону",
					Moscow: "Москва",
					"Saint Petersburg": "Санкт-Петербург",
					Novosibirsk: "Новосибирск",
					Yekaterinburg: "Екатеринбург",
					Kazan: "Казань",
					"Nizhny Novgorod": "Нижний Новгород",
					Chelyabinsk: "Челябинск",
					Samara: "Самара",
					Omsk: "Омск",
					"Rostov-na-Donu": "Ростов-на-Дону",
				};

				const country = countryMap[locationData.country] || locationData.country;
				const city = cityMap[locationData.city] || locationData.city;
				const location = `${country}, ${city}`;

				const weatherResponse = await fetch(
					`https://api.open-meteo.com/v1/forecast?latitude=${locationData.lat}&longitude=${locationData.lon}&current=temperature_2m,weather_code&timezone=auto`
				);
				if (!weatherResponse.ok) throw new Error("Failed to fetch weather");

				const weatherData = await weatherResponse.json();
				if (!weatherData.current || weatherData.current.temperature_2m === undefined || weatherData.current.weather_code === undefined) {
					throw new Error("Incomplete weather data");
				}

				const temp = Math.round(weatherData.current.temperature_2m);
				const weatherCode = weatherData.current.weather_code;

				const weatherDescriptions: Record<number, string> = {
					0: "ясно",
					1: "преимущественно ясно",
					2: "переменная облачность",
					3: "пасмурно",
					45: "туман",
					48: "туман",
					51: "легкая морось",
					53: "умеренная морось",
					55: "сильная морось",
					56: "легкая ледяная морось",
					57: "сильная ледяная морось",
					61: "легкий дождь",
					63: "умеренный дождь",
					65: "сильный дождь",
					66: "легкий ледяной дождь",
					67: "сильный ледяной дождь",
					71: "легкий снег",
					73: "умеренный снег",
					75: "сильный снег",
					77: "снежные зерна",
					80: "легкий ливень",
					81: "умеренный ливень",
					82: "сильный ливень",
					85: "легкий снежный ливень",
					86: "сильный снежный ливень",
					95: "гроза",
					96: "гроза с градом",
					99: "сильная гроза с градом",
				};

				const description = weatherDescriptions[weatherCode] || "неизвестно";
				const normalizedDescription = description === "переменная облачность" ? "облачно с прояснениями" : description;

				setLocationWeather({
					location,
					temperature: temp,
					description: normalizedDescription,
				});
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
	}, [isOpen]);

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

	// Memoize footer content
	const footerContent = useMemo(
		() =>
			isLoading || !locationWeather ? (
				<>&nbsp;</>
			) : (
				<>
					{locationWeather.location}
					<br />
					{currentTime}, {locationWeather.description} {locationWeather.temperature}°C
				</>
			),
		[isLoading, locationWeather, currentTime]
	);

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
							{footerContent}
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
