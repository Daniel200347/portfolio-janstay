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
				// Получаем локацию по IP
				const locationResponse = await fetch("http://ip-api.com/json/?fields=status,message,country,city,lat,lon");
				if (!locationResponse.ok) throw new Error("Failed to fetch location");

				const locationData = await locationResponse.json();
				if (locationData.status === "fail") throw new Error(locationData.message || "Failed to get location");

				if (!locationData.city || !locationData.country || locationData.lat === undefined || locationData.lon === undefined) {
					throw new Error("Incomplete location data");
				}

				const countryMap: Record<string, string> = {
					"Russia": "Россия",
					"Ukraine": "Украина",
					"Belarus": "Беларусь",
					"Kazakhstan": "Казахстан",
				};

				const cityMap: Record<string, string> = {
					"Rostov-on-Don": "Ростов-на-Дону",
					"Moscow": "Москва",
					"Saint Petersburg": "Санкт-Петербург",
					"Novosibirsk": "Новосибирск",
					"Yekaterinburg": "Екатеринбург",
					"Kazan": "Казань",
					"Nizhny Novgorod": "Нижний Новгород",
					"Chelyabinsk": "Челябинск",
					"Samara": "Самара",
					"Omsk": "Омск",
					"Rostov-na-Donu": "Ростов-на-Дону",
				};

				const country = countryMap[locationData.country] || locationData.country;
				const city = cityMap[locationData.city] || locationData.city;
				const location = `${country}, ${city}`;

				// Получаем погоду по координатам
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
				const normalizedDescription = description === "переменная облачность"
					? "облачно с прояснениями"
					: description;

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
					<div className={styles.wrapper}>
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
			</div>
		</footer>
	);
}

