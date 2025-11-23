import { NextRequest, NextResponse } from "next/server";

interface LocationData {
	city: string;
	country: string;
	lat: number;
	lon: number;
}

interface WeatherData {
	temperature: number;
	description: string;
	time: string;
}

interface LocationWeatherResponse {
	location: string;
	temperature: number;
	description: string;
}

const cache = new Map<string, { data: LocationWeatherResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function isPrivateIP(ip: string): boolean {
	if (ip.startsWith("192.168.")) return true;
	if (ip.startsWith("10.")) return true;
	if (ip.startsWith("172.")) {
		const parts = ip.split(".");
		if (parts.length >= 2) {
			const secondOctet = parseInt(parts[1]);
			if (secondOctet >= 16 && secondOctet <= 31) return true;
		}
	}
	if (ip.startsWith("169.254.")) return true;
	if (ip === "127.0.0.1" || ip === "localhost") return true;
	
	if (ip === "::1") return true;
	if (ip.startsWith("fe80:")) return true;
	if (ip.startsWith("fc00:") || ip.startsWith("fd00:")) return true;
	
	return false;
}

function getClientIP(request: NextRequest): string | null {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		const ip = forwarded.split(",")[0].trim();
		if (ip && !isPrivateIP(ip)) return ip;
	}

	const realIP = request.headers.get("x-real-ip");
	if (realIP && !isPrivateIP(realIP)) {
		return realIP;
	}

	return null;
}

async function getLocationByIP(ip: string | null): Promise<LocationData> {
	const url = "http://ip-api.com/json/?fields=status,message,country,city,lat,lon";
	
	const response = await fetch(url, {
		headers: {
			"Accept": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch location");
	}

	const data = await response.json();

	if (data.status === "fail") {
		throw new Error(data.message || "Failed to get location");
	}

	if (!data.city || !data.country || data.lat === undefined || data.lon === undefined) {
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

	const country = countryMap[data.country] || data.country;
	const city = cityMap[data.city] || data.city;

	return {
		city: city,
		country: country,
		lat: data.lat,
		lon: data.lon,
	};
}

async function getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000);

	try {
		const response = await fetch(
			`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
			{
				headers: {
					"Accept": "application/json",
				},
				signal: controller.signal,
			}
		);

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`Failed to fetch weather: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();

		if (!data.current || data.current.temperature_2m === undefined || data.current.weather_code === undefined) {
			throw new Error("Incomplete weather data");
		}

		const temp = Math.round(data.current.temperature_2m);
		const weatherCode = data.current.weather_code;

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

		return {
			temperature: temp,
			description: normalizedDescription,
			time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
		};
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error && error.name === "AbortError") {
			throw new Error("Weather API request timeout");
		}
		console.error("getWeatherByCoordinates error:", error);
		throw error;
	}
}

export async function GET(request: NextRequest) {
	try {
		const ip = getClientIP(request);
		const cacheKey = ip || "default";

		const cached = cache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
			return NextResponse.json(cached.data, {
				headers: {
					"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
				},
			});
		}

		const location = await getLocationByIP(ip);
		const weather = await getWeatherByCoordinates(location.lat, location.lon);

		const response: LocationWeatherResponse = {
			location: `${location.country}, ${location.city}`,
			temperature: weather.temperature,
			description: weather.description,
		};

		cache.set(cacheKey, { data: response, timestamp: Date.now() });

		return NextResponse.json(response, {
			headers: {
				"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
			},
		});
	} catch (error) {
		console.error("Location-Weather API error:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ error: "Failed to fetch location and weather", details: errorMessage },
			{
				status: 500,
				headers: {
					"Cache-Control": "no-cache",
				},
			}
		);
	}
}

