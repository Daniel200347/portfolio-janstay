"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "@/icons";
import { Lightbox } from "@/components/Lightbox";
import styles from "./Slider.module.css";

// Пропсы компонента
interface SliderProps {
	images: string[];
	imageAlt?: string;
}

const MIN_SWIPE_DISTANCE = 50; // Минимальное расстояние для смены слайда
const SWIPE_THRESHOLD = 10; // Порог для блокировки скролла при горизонтальном свайпе

export function Slider({ images, imageAlt = "" }: SliderProps) {
	// Текущий индекс слайда
	const [currentIndex, setCurrentIndex] = useState(0);
	// Флаг открытия лайтбокса
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);
	// Индекс изображения для открытия в лайтбоксе
	const [lightboxIndex, setLightboxIndex] = useState(0);

	// Рефы для DOM элементов и состояния
	const sliderRef = useRef<HTMLDivElement>(null);
	// Начальная позиция X при касании
	const touchStartX = useRef<number | null>(null);
	// Начальная позиция Y при касании
	const touchStartY = useRef<number | null>(null);
	// Флаг свайпа (предотвращает открытие лайтбокса после свайпа)
	const hasSwiped = useRef<boolean>(false);
	// Текущий индекс (используется в обработчиках для избежания замыканий)
	const currentIndexRef = useRef(currentIndex);

	// Синхронизация currentIndexRef с состоянием
	useEffect(() => {
		currentIndexRef.current = currentIndex;
	}, [currentIndex]);

	// Переход к предыдущему слайду
	const goToPrevious = useCallback(() => {
		setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
	}, [images.length]);

	// Переход к следующему слайду
	const goToNext = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % images.length);
	}, [images.length]);

	// Переход к конкретному слайду по клику на точку
	const handleDotClick = useCallback((index: number) => {
		setCurrentIndex(index);
	}, []);

	// Закрытие лайтбокса
	const handleLightboxClose = useCallback(() => {
		setIsLightboxOpen(false);
	}, []);

	// Открытие лайтбокса при клике, но не после свайпа
	const handleImageClick = useCallback(() => {
		if (hasSwiped.current) {
			hasSwiped.current = false;
			return;
		}
		setLightboxIndex(currentIndexRef.current);
		setIsLightboxOpen(true);
	}, []);

	// Обработка touch событий для свайпа между слайдами
	useEffect(() => {
		if (!sliderRef.current) return;

		const slider = sliderRef.current;

		// Начало касания - сохраняем начальные координаты
		const handleTouchStart = (e: TouchEvent) => {
			const touch = e.touches[0];
			touchStartX.current = touch.clientX;
			touchStartY.current = touch.clientY;
			hasSwiped.current = false; // Сбрасываем флаг свайпа
		};

		// Движение при касании - блокируем скролл при горизонтальном свайпе
		const handleTouchMove = (e: TouchEvent) => {
			if (touchStartX.current === null || touchStartY.current === null) return;

			const touch = e.touches[0];
			const deltaX = touch.clientX - touchStartX.current;
			const deltaY = touch.clientY - touchStartY.current;

			// Если движение вертикальное - это скролл, не блокируем
			if (Math.abs(deltaY) > Math.abs(deltaX)) {
				return;
			}

			// Блокируем скролл при горизонтальном свайпе
			if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
				e.preventDefault();
			}
		};

		// Конец касания - определяем направление свайпа и переключаем слайд
		const handleTouchEnd = (e: TouchEvent) => {
			if (touchStartX.current === null) return;

			const touch = e.changedTouches[0];
			const deltaX = touch.clientX - touchStartX.current;
			const deltaY = touch.clientY - (touchStartY.current ?? 0);

			// Проверяем, что движение было горизонтальным и достаточным
			if (
				Math.abs(deltaX) > Math.abs(deltaY) && 
				Math.abs(deltaX) > MIN_SWIPE_DISTANCE
			) {
				hasSwiped.current = true; // Устанавливаем флаг, чтобы не открывать лайтбокс
				
				if (deltaX > 0) {
					goToPrevious();
				} else {
					goToNext();
				}
			}

			// Сбрасываем координаты
			touchStartX.current = null;
			touchStartY.current = null;
		};

		slider.addEventListener('touchstart', handleTouchStart, { passive: true });
		slider.addEventListener('touchmove', handleTouchMove, { passive: false });
		slider.addEventListener('touchend', handleTouchEnd, { passive: true });

		return () => {
			slider.removeEventListener('touchstart', handleTouchStart);
			slider.removeEventListener('touchmove', handleTouchMove);
			slider.removeEventListener('touchend', handleTouchEnd);
		};
	}, [goToPrevious, goToNext]);

	// Определение touch-устройства
	const [isTouchDevice, setIsTouchDevice] = useState(false);

	useEffect(() => {
		// Проверяем, является ли устройство touch-устройством
		const checkTouchDevice = () => {
			if (typeof window !== 'undefined') {
				const mediaQuery = window.matchMedia('(pointer: coarse)');
				setIsTouchDevice(mediaQuery.matches);
			}
		};

		checkTouchDevice();

		// Слушаем изменения (на случай, если устройство изменится)
		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(pointer: coarse)');
			const handleChange = (e: MediaQueryListEvent) => {
				setIsTouchDevice(e.matches);
			};

			// Современный способ
			if (mediaQuery.addEventListener) {
				mediaQuery.addEventListener('change', handleChange);
				return () => mediaQuery.removeEventListener('change', handleChange);
			}
			// Fallback для старых браузеров
			else if (mediaQuery.addListener) {
				mediaQuery.addListener(handleChange);
				return () => mediaQuery.removeListener(handleChange);
			}
		}
	}, []);

	// Стили для контейнера слайдов с трансформацией для смены слайдов
	const slidesStyle = useMemo(() => ({
		transform: `translateX(-${currentIndex * 100}%)`,
	}), [currentIndex]);

	// Показывать ли стрелки навигации (только на desktop, не touch-устройство)
	const showNavigation = useMemo(() => images.length > 1 && !isTouchDevice, [images.length, isTouchDevice]);
	// Показывать ли пагинацию (всегда, если больше одного изображения)
	const showDots = useMemo(() => images.length > 1, [images.length]);

	if (images.length === 0) return null;

	return (
		<>
			<div ref={sliderRef} className={styles.slider}>
				<div className={styles.slides} style={slidesStyle}>
					{images.map((src, index) => (
						<div key={index} className={styles.slide}>
							<Image
								src={src}
								alt={`${imageAlt} ${index + 1}`}
								fill
								className={styles.image}
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 65rem"
								onClick={handleImageClick}
								loading={index === 0 ? "eager" : "lazy"}
							/>
						</div>
					))}
				</div>

				{showNavigation && (
					<div className={styles.navigation}>
						<button
							type="button"
							className={styles.navButton}
							onClick={goToPrevious}
							aria-label="Предыдущий слайд"
						>
							<ChevronLeft />
						</button>
						<button
							type="button"
							className={`${styles.navButton} ${styles.navButtonRight}`}
							onClick={goToNext}
							aria-label="Следующий слайд"
						>
							<ChevronRight />
						</button>
					</div>
				)}

				{showDots && (
					<div className={styles.dots}>
						{images.map((_, index) => (
							<button
								key={index}
								type="button"
								className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ""}`}
								onClick={() => handleDotClick(index)}
								aria-label={`Перейти к слайду ${index + 1}`}
								aria-current={index === currentIndex ? "true" : "false"}
							/>
						))}
					</div>
				)}
			</div>

			<Lightbox
				images={images}
				currentIndex={lightboxIndex}
				isOpen={isLightboxOpen}
				onClose={handleLightboxClose}
				imageAlt={imageAlt}
			/>
		</>
	);
}
