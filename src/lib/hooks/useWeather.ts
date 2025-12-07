import { useEffect, useState } from "react";

const LATITUDE = 47.2357;
const LONGITUDE = 39.7015;

const weatherDescriptions: Record<number, string> = {
	0: "ясно",
	1: "малооблачно",
	2: "облачно с прояснениями",
	3: "пасмурно",
	45: "туман",
	48: "туман с изморозью",
	51: "слабая морось",
	53: "морось",
	55: "сильная морось",
	56: "слабая ледяная морось",
	57: "ледяная морось",
	61: "небольшой дождь",
	63: "дождь",
	65: "сильный дождь",
	66: "небольшой ледяной дождь",
	67: "ледяной дождь",
	71: "небольшой снег",
	73: "снег",
	75: "сильный снег",
	77: "снежная крупа",
	80: "слабый дождь",
	81: "дождь",
	82: "сильный ливень",
	85: "слабый снег",
	86: "снегопад",
	95: "гроза",
	96: "гроза с градом",
	99: "сильная гроза с градом",
};

export function useWeather() {
	const [weatherText, setWeatherText] = useState("Загрузка...");
	const [weatherData, setWeatherData] = useState<{ temp: number; description: string } | null>(null);

	// Обновление времени каждую минуту
	useEffect(() => {
		const updateTime = () => {
			if (weatherData) {
				const now = new Date();
				const hours = String(now.getHours()).padStart(2, "0");
				const minutes = String(now.getMinutes()).padStart(2, "0");
				const timeStr = `${hours}:${minutes}`;

				setWeatherText(`${timeStr}, ${weatherData.description} ${weatherData.temp}°C`);
			}
		};

		updateTime();
		const timeInterval = setInterval(updateTime, 60000); // Каждую минуту

		return () => clearInterval(timeInterval);
	}, [weatherData]);

	useEffect(() => {
		const fetchWeather = async () => {
			try {
				const response = await fetch(
					`https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weather_code&timezone=Europe/Moscow`
				);
				const data = await response.json();

				const temp = Math.round(data.current.temperature_2m);
				const weatherCode = Number(data.current.weather_code);
				const description = weatherDescriptions[weatherCode] || "неизвестно";

				setWeatherData({ temp, description });
			} catch (error) {
				console.error("Ошибка загрузки погоды:", error);
				setWeatherText("Ошибка загрузки");
			}
		};

		fetchWeather();
		const weatherInterval = setInterval(fetchWeather, 600000); // Каждые 10 минут

		return () => clearInterval(weatherInterval);
	}, []);

	return weatherText;
}

