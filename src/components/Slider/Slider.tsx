"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./Slider.module.css";

interface SliderProps {
	images: string[];
	imageAlt?: string;
	interval?: number; // в миллисекундах
}

export function Slider({ images, imageAlt = "", interval = 5000 }: SliderProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [progress, setProgress] = useState(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const startTimeRef = useRef<number>(Date.now());

	const showSlide = (index: number) => {
		const newIndex = (index + images.length) % images.length;
		setCurrentIndex(newIndex);
		setProgress(0);
		startTimeRef.current = Date.now();
	};

	useEffect(() => {
		// Очистка предыдущих интервалов и анимаций
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
		if (animationFrameRef.current !== null) {
			cancelAnimationFrame(animationFrameRef.current);
		}

		const updateProgress = () => {
			const elapsed = Date.now() - startTimeRef.current;
			const newProgress = Math.min((elapsed / interval) * 100, 100);
			setProgress(newProgress);
			
			if (newProgress < 100) {
				animationFrameRef.current = requestAnimationFrame(updateProgress);
			}
		};

		// Интервал для переключения слайдов
		intervalRef.current = setInterval(() => {
			setCurrentIndex((prev) => {
				const newIndex = (prev + 1) % images.length;
				setProgress(0);
				startTimeRef.current = Date.now();
				// Запускаем обновление прогресса
				if (animationFrameRef.current !== null) {
					cancelAnimationFrame(animationFrameRef.current);
				}
				animationFrameRef.current = requestAnimationFrame(updateProgress);
				return newIndex;
			});
		}, interval);

		// Запускаем обновление прогресса через requestAnimationFrame для плавности
		startTimeRef.current = Date.now();
		animationFrameRef.current = requestAnimationFrame(updateProgress);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [images.length, interval]);

	const handleDotClick = (index: number) => {
		// Очищаем интервалы и анимации перед переключением
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
		if (animationFrameRef.current !== null) {
			cancelAnimationFrame(animationFrameRef.current);
		}
		
		showSlide(index);
		
		const updateProgress = () => {
			const elapsed = Date.now() - startTimeRef.current;
			const newProgress = Math.min((elapsed / interval) * 100, 100);
			setProgress(newProgress);
			
			if (newProgress < 100) {
				animationFrameRef.current = requestAnimationFrame(updateProgress);
			}
		};
		
		// Перезапускаем интервалы
		intervalRef.current = setInterval(() => {
			setCurrentIndex((prev) => {
				const newIndex = (prev + 1) % images.length;
				setProgress(0);
				startTimeRef.current = Date.now();
				// Запускаем обновление прогресса
				if (animationFrameRef.current !== null) {
					cancelAnimationFrame(animationFrameRef.current);
				}
				animationFrameRef.current = requestAnimationFrame(updateProgress);
				return newIndex;
			});
		}, interval);

		// Запускаем обновление прогресса
		animationFrameRef.current = requestAnimationFrame(updateProgress);
	};

	return (
		<div className={styles.slider}>
			<div className={styles.slides} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
				{images.map((src, index) => (
					<div key={index} className={styles.slide}>
						<Image
							src={src}
							alt={`${imageAlt} ${index + 1}`}
							fill
							className={styles.image}
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 65rem"
						/>
					</div>
				))}
			</div>

			<div className={styles.dots}>
				{images.map((_, index) => (
					<button
						key={index}
						type="button"
						className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ""}`}
						onClick={() => handleDotClick(index)}
						aria-label={`Перейти к слайду ${index + 1}`}
					>
						{index === currentIndex && (
							<div
								className={styles.dotFill}
								style={{ width: `${progress}%` }}
							/>
						)}
					</button>
				))}
			</div>
		</div>
	);
}

