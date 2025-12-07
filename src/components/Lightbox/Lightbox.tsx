"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import { Close, ChevronLeft, ChevronRight } from "@/icons";
import styles from "./Lightbox.module.css";

// ============================================================================
// ТИПЫ И ИНТЕРФЕЙСЫ
// ============================================================================

interface LightboxProps {
	images: string[];
	currentIndex: number;
	isOpen: boolean;
	onClose: () => void;
	imageAlt?: string;
}

interface ZoomState {
	scale: number;
	translateX: number;
	translateY: number;
}

interface TouchState {
	startX: number;
	startY: number;
	startScale: number;
	startTranslateX: number;
	startTranslateY: number;
	lastDistance: number;
	touches: number;
	isZooming: boolean;
	isDragging: boolean;
}

interface Point {
	x: number;
	y: number;
}

// ============================================================================
// КОНСТАНТЫ
// ============================================================================

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.15;
const DOUBLE_CLICK_SCALE = 2.5;
const DOUBLE_CLICK_TIME_THRESHOLD = 300;
const DOUBLE_CLICK_DISTANCE_THRESHOLD = 5;
const DRAG_START_DELAY = 100;
const MIN_SWIPE_DISTANCE = 50;
const CLOSE_SWIPE_THRESHOLD = 100;
const CLOSE_SWIPE_START_THRESHOLD = 30;
const MOBILE_BREAKPOINT = 768;
const MOBILE_PADDING = 40;
const DESKTOP_PADDING = 32;
const MOBILE_THUMBNAILS_HEIGHT = 80;
const DESKTOP_THUMBNAILS_HEIGHT = 100;

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export function Lightbox({
	images,
	currentIndex: initialIndex,
	isOpen,
	onClose,
	imageAlt = "",
}: LightboxProps) {
	
	// ============================================================================
	// STATE
	// ============================================================================

	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const [zoom, setZoom] = useState<ZoomState>({ scale: 1, translateX: 0, translateY: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
	const [isClosing, setIsClosing] = useState(false);
	const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
	const [isTouchDevice, setIsTouchDevice] = useState(false);

	// ============================================================================
	// REFS
	// ============================================================================

	// DOM элементы
	const containerRef = useRef<HTMLDivElement>(null);
	const imageContainerRef = useRef<HTMLDivElement>(null);
	const imageWrapperRef = useRef<HTMLDivElement>(null);
	const thumbnailsRef = useRef<HTMLDivElement>(null);

	// Состояния для обработчиков событий (избегаем замыканий)
	const touchStateRef = useRef<TouchState | null>(null);
	const isClosingRef = useRef(false);
	const zoomRef = useRef<ZoomState>(zoom);
	const isDraggingRef = useRef(false);

	// Двойной клик
	const lastClickTimeRef = useRef(0);
	const lastClickCoordsRef = useRef<Point>({ x: 0, y: 0 });
	const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// ============================================================================
	// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (объявлены до useEffect для использования в них)
	// ============================================================================

	// Центрирование активной миниатюры в полосе прокрутки
	const centerThumbnail = useCallback((index: number) => {
		if (!thumbnailsRef.current) return;
		const activeThumb = thumbnailsRef.current.children[index] as HTMLElement;
		if (activeThumb) {
			activeThumb.scrollIntoView({ inline: 'center', behavior: 'smooth' });
		}
	}, []);

	// ============================================================================
	// ОПРЕДЕЛЕНИЕ TOUCH-УСТРОЙСТВА
	// ============================================================================

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

	// ============================================================================
	// СИНХРОНИЗАЦИЯ REFS С STATE
	// ============================================================================

	useEffect(() => {
		zoomRef.current = zoom;
	}, [zoom]);

	useEffect(() => {
		isDraggingRef.current = isDragging;
	}, [isDragging]);

	// ============================================================================
	// СБРОС СОСТОЯНИЯ ПРИ ОТКРЫТИИ/СМЕНЕ ИЗОБРАЖЕНИЯ
	// ============================================================================

	useEffect(() => {
		if (isOpen) {
			setCurrentIndex(initialIndex);
			setZoom({ scale: 1, translateX: 0, translateY: 0 });
			setDragOffset({ x: 0, y: 0 });
			setIsClosing(false);
			isClosingRef.current = false;
			setImageSize(null);
			lastClickTimeRef.current = 0;
			if (clickTimeoutRef.current) {
				clearTimeout(clickTimeoutRef.current);
				clickTimeoutRef.current = null;
			}
			// Центрируем активную миниатюру при открытии
			setTimeout(() => centerThumbnail(initialIndex), 100);
		}
	}, [initialIndex, isOpen, centerThumbnail]);

	// ============================================================================
	// ОЧИСТКА ПРИ РАЗМОНТИРОВАНИИ
	// ============================================================================

	useEffect(() => {
		return () => {
			if (clickTimeoutRef.current) {
				clearTimeout(clickTimeoutRef.current);
			}
		};
	}, []);

	// ============================================================================
	// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
	// ============================================================================

	// Вычисление расстояния между двумя точками для pinch-to-zoom
	const getDistance = useCallback((touches: TouchList): number => {
		if (touches.length < 2) return 0;
		const dx = touches[0].clientX - touches[1].clientX;
		const dy = touches[0].clientY - touches[1].clientY;
		return Math.hypot(dx, dy);
	}, []);

	// Вычисление центра между двумя точками для зума
	const getCenter = useCallback((touches: TouchList): Point => {
		if (touches.length < 2) return { x: 0, y: 0 };
		const t0 = touches[0];
		const t1 = touches[1];
		return {
			x: (t0.clientX + t1.clientX) * 0.5,
			y: (t0.clientY + t1.clientY) * 0.5,
		};
	}, []);

	// ============================================================================
	// ОБРАБОТКА ЗАГРУЗКИ ИЗОБРАЖЕНИЯ
	// ============================================================================

	const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
		if (typeof window === 'undefined') return;
		
		const img = e.currentTarget;
		const { naturalWidth, naturalHeight } = img;
		
		const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
		const padding = isMobile ? MOBILE_PADDING : DESKTOP_PADDING;
		const thumbnailsHeight = isMobile ? MOBILE_THUMBNAILS_HEIGHT : DESKTOP_THUMBNAILS_HEIGHT;
		const maxWidth = window.innerWidth - padding;
		const maxHeight = window.innerHeight - padding - thumbnailsHeight;
		
		const widthRatio = maxWidth / naturalWidth;
		const heightRatio = maxHeight / naturalHeight;
		const ratio = Math.min(widthRatio, heightRatio, 1);
		
		setImageSize({ 
			width: naturalWidth * ratio, 
			height: naturalHeight * ratio 
		});
	}, []);

	// ============================================================================
	// НАВИГАЦИЯ ПО ИЗОБРАЖЕНИЯМ
	// ============================================================================

	const goToPrevious = useCallback(() => {
		if (zoomRef.current.scale > 1) return;
		setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
		setZoom({ scale: 1, translateX: 0, translateY: 0 });
	}, [images.length]);

	const goToNext = useCallback(() => {
		if (zoomRef.current.scale > 1) return;
		setCurrentIndex((prev) => (prev + 1) % images.length);
		setZoom({ scale: 1, translateX: 0, translateY: 0 });
	}, [images.length]);

	const goToImage = useCallback((index: number) => {
		if (zoomRef.current.scale > 1) return;
		setCurrentIndex(index);
		setZoom({ scale: 1, translateX: 0, translateY: 0 });
		setTimeout(() => centerThumbnail(index), 100);
	}, [centerThumbnail]);

	// ============================================================================
	// TOUCH СОБЫТИЯ (pinch-to-zoom, свайп, перетаскивание)
	// ============================================================================

	useEffect(() => {
		if (!isOpen || !containerRef.current) return;

		const container = containerRef.current;
		let rafId: number | null = null;

		const handleTouchStart = (e: TouchEvent) => {
			// Отменяем любые запланированные обновления при новом касании
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			const touches = e.touches;
			
			if (touches.length === 1) {
				const touch = touches[0];
				const currentZoom = zoomRef.current;
				touchStateRef.current = {
					startX: touch.clientX,
					startY: touch.clientY,
					startScale: currentZoom.scale,
					startTranslateX: currentZoom.translateX,
					startTranslateY: currentZoom.translateY,
					lastDistance: 0,
					touches: 1,
					isZooming: false,
					isDragging: currentZoom.scale > 1,
				};
			} else if (touches.length === 2) {
				const distance = getDistance(touches);
				const center = getCenter(touches);
				
				if (imageWrapperRef.current) {
					const rect = imageWrapperRef.current.getBoundingClientRect();
					const centerX = center.x - rect.left - rect.width / 2;
					const centerY = center.y - rect.top - rect.height / 2;
					const currentZoom = zoomRef.current;
					
					touchStateRef.current = {
						startX: centerX,
						startY: centerY,
						startScale: currentZoom.scale,
						startTranslateX: currentZoom.translateX,
						startTranslateY: currentZoom.translateY,
						lastDistance: distance,
						touches: 2,
						isZooming: true,
						isDragging: false,
					};
				}
			}
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (!touchStateRef.current) return;
			
			const touches = e.touches;
			const state = touchStateRef.current;

			// Переход от 2 пальцев к 1 при pinch-to-zoom - переключаемся на перетаскивание
			if (touches.length === 1 && state.isZooming && state.startScale > 1) {
				// Отменяем RAF для перетаскивания если был
				if (rafId !== null) {
					cancelAnimationFrame(rafId);
					rafId = null;
				}
				
				const touch = touches[0];
				const currentZoom = zoomRef.current;
				// Обновляем состояние для перетаскивания
				state.isZooming = false;
				state.isDragging = true;
				state.startX = touch.clientX;
				state.startY = touch.clientY;
				state.startTranslateX = currentZoom.translateX;
				state.startTranslateY = currentZoom.translateY;
				return;
			}

			if (touches.length === 2 && state.isZooming) {
				// Pinch-to-zoom - отменяем RAF для перетаскивания
				if (rafId !== null) {
					cancelAnimationFrame(rafId);
					rafId = null;
				}
				
				e.preventDefault();
				const distance = getDistance(touches);
				const center = getCenter(touches);
				
				if (imageWrapperRef.current && state.lastDistance > 0) {
					const rect = imageWrapperRef.current.getBoundingClientRect();
					const scaleChange = distance / state.lastDistance;
					const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, state.startScale * scaleChange));
					
					const centerX = center.x - rect.left - rect.width / 2;
					const centerY = center.y - rect.top - rect.height / 2;
					
					const deltaX = centerX - state.startX;
					const deltaY = centerY - state.startY;
					
					// Формула для зума в точке: translateX = startTranslateX + deltaX * (newScale / startScale - 1)
					setZoom({
						scale: newScale,
						translateX: state.startTranslateX + deltaX * (newScale / state.startScale - 1),
						translateY: state.startTranslateY + deltaY * (newScale / state.startScale - 1),
					});
					
					state.lastDistance = distance;
				}
			} else if (touches.length === 1 && state.isDragging && state.startScale > 1) {
				// Перетаскивание при зуме на мобильных - используем RAF для плавности
				e.preventDefault();
				const touch = touches[0];
				
				// Сохраняем координаты перед RAF (событие может быть устаревшим к моменту выполнения)
				const currentX = touch.clientX;
				const currentY = touch.clientY;
				
				// Отменяем предыдущий RAF если он еще не выполнился
				if (rafId !== null) {
					cancelAnimationFrame(rafId);
				}
				
				// Используем requestAnimationFrame для батчинга обновлений и предотвращения накопления ошибок
				rafId = requestAnimationFrame(() => {
					if (!touchStateRef.current) {
						rafId = null;
						return;
					}
					
					const currentState = touchStateRef.current;
					
					if (!currentState.isDragging || currentState.startScale <= 1) {
						rafId = null;
						return;
					}
					
					// КРИТИЧНО: синхронизируем координаты из zoomRef перед вычислением дельты
					// Это гарантирует, что мы используем актуальные координаты, а не устаревшие из state
					// Без этого координаты накапливаются и картинка отстреливает
					const currentZoom = zoomRef.current;
					currentState.startTranslateX = currentZoom.translateX;
					currentState.startTranslateY = currentZoom.translateY;
					
					// Вычисляем дельту движения пальца относительно начальной точки касания
					const deltaX = currentX - currentState.startX;
					const deltaY = currentY - currentState.startY;
					
					// Вычисляем новое смещение: текущее смещение + дельта движения
					const newTranslateX = currentState.startTranslateX + deltaX;
					const newTranslateY = currentState.startTranslateY + deltaY;
					
					// Обновляем через ref синхронно
					zoomRef.current = {
						...zoomRef.current,
						translateX: newTranslateX,
						translateY: newTranslateY,
					};
					
					// Обновляем state для ререндера
					setZoom(zoomRef.current);
					
					// Обновляем начальные координаты касания для следующего touchmove
					// startTranslateX/Y обновляются из zoomRef в начале следующего RAF
					currentState.startX = currentX;
					currentState.startY = currentY;
					
					rafId = null;
				});
			} else if (touches.length === 1 && state.startScale === 1) {
				// Свайп для закрытия или навигации
				const touch = touches[0];
				const deltaX = touch.clientX - state.startX;
				const deltaY = touch.clientY - state.startY;
				
				if (deltaY > CLOSE_SWIPE_START_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
					e.preventDefault();
					setDragOffset({ x: deltaX, y: deltaY });
					if (!isClosingRef.current) {
						setIsClosing(true);
						isClosingRef.current = true;
					}
				} else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
					e.preventDefault();
				}
			}
		};

		const handleTouchEnd = (e: TouchEvent) => {
			// Отменяем любые запланированные обновления
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			
			if (!touchStateRef.current) return;
			
			const state = touchStateRef.current;
			const touch = e.changedTouches[0];
			
			// Если было перетаскивание при зуме, синхронизируем state
			if (state.isDragging && state.startScale > 1) {
				setZoom(zoomRef.current);
			}
			
			if (isClosingRef.current && touch) {
				const deltaY = touch.clientY - state.startY;
				if (deltaY > CLOSE_SWIPE_THRESHOLD) {
					onClose();
				} else {
					setDragOffset({ x: 0, y: 0 });
					setIsClosing(false);
					isClosingRef.current = false;
				}
			} else if (state.startScale === 1 && touch) {
				const deltaX = touch.clientX - state.startX;
				const deltaY = touch.clientY - state.startY;
				
				if (
					images.length > 1 &&
					Math.abs(deltaX) > Math.abs(deltaY) &&
					Math.abs(deltaX) > MIN_SWIPE_DISTANCE
				) {
					if (deltaX > 0) {
						goToPrevious();
					} else {
						goToNext();
					}
				}
			}
			
			touchStateRef.current = null;
		};

		// Обработка touchcancel (когда жест прерывается системой)
		const handleTouchCancel = (e: TouchEvent) => {
			// Отменяем любые запланированные обновления
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			
			// Сбрасываем состояние при прерывании жеста
			if (touchStateRef.current?.isDragging && touchStateRef.current.startScale > 1) {
				setZoom(zoomRef.current);
			}
			touchStateRef.current = null;
			setDragOffset({ x: 0, y: 0 });
			setIsClosing(false);
			isClosingRef.current = false;
		};

		// Стандартные паттерны для мобильных устройств (iOS/Android):
		// - touchstart: passive: true (не нужен preventDefault, только чтение координат)
		// - touchmove: passive: false (нужен preventDefault для блокировки скролла и нативных жестов)
		// - touchend: passive: true (не нужен preventDefault)
		// - touchcancel: passive: true (обработка прерывания жеста системой)
		container.addEventListener('touchstart', handleTouchStart, { passive: true });
		container.addEventListener('touchmove', handleTouchMove, { passive: false });
		container.addEventListener('touchend', handleTouchEnd, { passive: true });
		container.addEventListener('touchcancel', handleTouchCancel, { passive: true });

		return () => {
			// Отменяем любые запланированные обновления при размонтировании
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			
			container.removeEventListener('touchstart', handleTouchStart);
			container.removeEventListener('touchmove', handleTouchMove);
			container.removeEventListener('touchend', handleTouchEnd);
			container.removeEventListener('touchcancel', handleTouchCancel);
		};
	}, [isOpen, images.length, goToPrevious, goToNext, onClose, getDistance, getCenter]);

	// ============================================================================
	// КЛАВИАТУРА (Escape, стрелки)
	// ============================================================================

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (zoomRef.current.scale > 1) {
					setZoom({ scale: 1, translateX: 0, translateY: 0 });
				} else {
					onClose();
				}
			} else if (e.key === "ArrowLeft" && zoomRef.current.scale === 1) {
				goToPrevious();
			} else if (e.key === "ArrowRight" && zoomRef.current.scale === 1) {
				goToNext();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
		};
	}, [isOpen, onClose, goToPrevious, goToNext]);

	// ============================================================================
	// БЛОКИРОВКА СКРОЛЛА ПРИ ОТКРЫТИИ
	// ============================================================================

	useEffect(() => {
		if (!isOpen) return;

		const savedScrollY = window.scrollY;
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

		document.body.style.position = 'fixed';
		document.body.style.top = `-${savedScrollY}px`;
		document.body.style.width = '100%';
		document.body.style.paddingRight = `${scrollbarWidth}px`;

		return () => {
			const scrollY = document.body.style.top;
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.width = '';
			document.body.style.paddingRight = '';
			window.scrollTo(0, parseInt(scrollY || '0') * -1);
		};
	}, [isOpen]);

	// ============================================================================
	// ЗУМ КОЛЕСИКОМ МЫШИ
	// ============================================================================

	const handleWheel = useCallback((e: WheelEvent) => {
		if (!imageWrapperRef.current) return;
		
		e.preventDefault();
		const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
		const currentZoom = zoomRef.current;
		const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, currentZoom.scale + delta));
		
		if (newScale === 1) {
			setZoom({ scale: 1, translateX: 0, translateY: 0 });
		} else {
			const rect = imageWrapperRef.current.getBoundingClientRect();
			const centerX = e.clientX - rect.left - rect.width / 2;
			const centerY = e.clientY - rect.top - rect.height / 2;
			
			// Масштабируем смещение так, чтобы точка под курсором осталась на месте
			const scaleRatio = newScale / currentZoom.scale;
			setZoom((prev) => ({
				scale: newScale,
				translateX: centerX - (centerX - prev.translateX) * scaleRatio,
				translateY: centerY - (centerY - prev.translateY) * scaleRatio,
			}));
		}
	}, []);

	// Регистрация обработчика wheel с passive: false для возможности preventDefault
	useEffect(() => {
		if (!isOpen || !imageContainerRef.current) return;

		const container = imageContainerRef.current;
		container.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			container.removeEventListener('wheel', handleWheel);
		};
	}, [isOpen, handleWheel]);

	// ============================================================================
	// ДВОЙНОЙ КЛИК ДЛЯ ЗУМА
	// ============================================================================

	const handleImageClick = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		
		const now = Date.now();
		const timeSinceLastClick = now - lastClickTimeRef.current;
		const coords: Point = { x: e.clientX, y: e.clientY };
		const dx = coords.x - lastClickCoordsRef.current.x;
		const dy = coords.y - lastClickCoordsRef.current.y;
		const distance = Math.hypot(dx, dy);
		
		if (timeSinceLastClick < DOUBLE_CLICK_TIME_THRESHOLD && distance < DOUBLE_CLICK_DISTANCE_THRESHOLD) {
			if (clickTimeoutRef.current) {
				clearTimeout(clickTimeoutRef.current);
				clickTimeoutRef.current = null;
			}
			
			e.preventDefault();
			const currentZoom = zoomRef.current;
			
			if (currentZoom.scale > 1) {
				setZoom({ scale: 1, translateX: 0, translateY: 0 });
			} else {
				if (!imageWrapperRef.current) return;
				
				const rect = imageWrapperRef.current.getBoundingClientRect();
				const clickX = e.clientX - rect.left - rect.width / 2;
				const clickY = e.clientY - rect.top - rect.height / 2;
				
				// Формула для зума в точке клика: translateX = -clickX * (scale - 1)
				// При transform: translate() scale() в CSS, translate применяется после масштабирования
				const translateX = -clickX * (DOUBLE_CLICK_SCALE - 1);
				const translateY = -clickY * (DOUBLE_CLICK_SCALE - 1);
				
				setZoom({
					scale: DOUBLE_CLICK_SCALE,
					translateX,
					translateY,
				});
			}
			
			lastClickTimeRef.current = 0;
		} else {
			lastClickTimeRef.current = now;
			lastClickCoordsRef.current = coords;
			
			if (clickTimeoutRef.current) {
				clearTimeout(clickTimeoutRef.current);
			}
			clickTimeoutRef.current = setTimeout(() => {
				lastClickTimeRef.current = 0;
				clickTimeoutRef.current = null;
			}, DOUBLE_CLICK_TIME_THRESHOLD);
		}
	}, []);

	// ============================================================================
	// ПЕРЕТАСКИВАНИЕ МЫШЬЮ
	// ============================================================================

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		if (zoomRef.current.scale > 1 && e.button === 0) {
			const now = Date.now();
			const timeSinceLastClick = now - lastClickTimeRef.current;
			
			// Задержка перед началом драга для избежания конфликта с двойным кликом
			if (timeSinceLastClick < DRAG_START_DELAY) {
				return;
			}
			
			e.preventDefault();
			e.stopPropagation();
			
			isDraggingRef.current = true;
			setIsDragging(true);
			
			const currentZoom = zoomRef.current;
			touchStateRef.current = {
				startX: e.clientX,
				startY: e.clientY,
				startScale: currentZoom.scale,
				startTranslateX: currentZoom.translateX,
				startTranslateY: currentZoom.translateY,
				lastDistance: 0,
				touches: 1,
				isZooming: false,
				isDragging: true,
			};
			
			if (imageContainerRef.current) {
				imageContainerRef.current.style.cursor = 'grabbing';
			}
		}
	}, []);

	// ============================================================================
	// ГЛОБАЛЬНЫЕ ОБРАБОТЧИКИ МЫШИ НА DOCUMENT
	// Работают независимо от позиции курсора - решают проблему блокировки
	// ============================================================================

	useEffect(() => {
		let rafId: number | null = null;
		
		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (!isDraggingRef.current || !touchStateRef.current || zoomRef.current.scale <= 1) return;
			
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
			}
			
			rafId = requestAnimationFrame(() => {
				const state = touchStateRef.current;
				if (!state) return;
				
				const deltaX = e.clientX - state.startX;
				const deltaY = e.clientY - state.startY;
				
				const newTranslateX = state.startTranslateX + deltaX;
				const newTranslateY = state.startTranslateY + deltaY;
				
				zoomRef.current = {
					...zoomRef.current,
					translateX: newTranslateX,
					translateY: newTranslateY,
				};
				
				setZoom(zoomRef.current);
				
				// Обновляем начальные координаты для предотвращения накопления ошибок
				state.startX = e.clientX;
				state.startY = e.clientY;
				state.startTranslateX = newTranslateX;
				state.startTranslateY = newTranslateY;
				
				rafId = null;
			});
		};

		const handleGlobalMouseUp = () => {
			if (isDraggingRef.current) {
				isDraggingRef.current = false;
				setIsDragging(false);
				
				if (imageContainerRef.current && zoomRef.current.scale > 1) {
					imageContainerRef.current.style.cursor = 'grab';
				}
				
				if (touchStateRef.current?.touches === 1 && !touchStateRef.current.isZooming) {
					touchStateRef.current = null;
				}
			}
		};

		document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
		document.addEventListener('mouseup', handleGlobalMouseUp, { capture: true, passive: true });

		return () => {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
			}
			document.removeEventListener('mousemove', handleGlobalMouseMove);
			document.removeEventListener('mouseup', handleGlobalMouseUp, { capture: true });
		};
	}, []);

	// ============================================================================
	// ЗАКРЫТИЕ ПРИ КЛИКЕ НА ФОН
	// ============================================================================

	const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}, [onClose]);

	const handleContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		const target = e.target as HTMLElement;
		const isInteractive = 
			target.tagName === 'BUTTON' || 
			target.closest('button') !== null ||
			target.tagName === 'IMG' || 
			target.closest('img') !== null ||
			target.closest(`.${styles.thumbnails}`) !== null;
		
		if (!isInteractive) {
			onClose();
		}
	}, [onClose, styles.thumbnails]);

	// ============================================================================
	// ВЫЧИСЛЯЕМЫЕ СТИЛИ
	// ============================================================================

	const closingOpacity = useMemo(() => {
		return isClosing 
			? Math.max(0.3, 1 - Math.abs(dragOffset.y) / CLOSE_SWIPE_THRESHOLD) 
			: 1;
	}, [isClosing, dragOffset.y]);

	const wrapperStyle = useMemo(() => {
		const translateX = zoom.translateX + dragOffset.x;
		const translateY = zoom.translateY + dragOffset.y;

		return {
			transform: `translate(${translateX}px, ${translateY}px) scale(${zoom.scale})`,
			transition: isDragging || isClosing ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
			opacity: closingOpacity,
			maxWidth: zoom.scale > 1 ? 'none' : undefined,
			maxHeight: zoom.scale > 1 ? 'none' : undefined,
		};
	}, [zoom, dragOffset, isDragging, isClosing, closingOpacity]);

	const overlayStyle = useMemo(() => ({
		opacity: closingOpacity,
		transition: isClosing ? 'none' : 'opacity 0.2s ease-out',
	}), [closingOpacity, isClosing]);

	const cursorStyle = useMemo(() => ({
		cursor: zoom.scale > 1 ? (isDraggingRef.current ? 'grabbing' : 'grab') : 'default',
	}), [zoom.scale, isDragging]);

	const showNavigation = useMemo(() => 
		images.length > 1 && zoom.scale === 1 && !isTouchDevice,
		[images.length, zoom.scale, isTouchDevice]
	);

	// ============================================================================
	// РЕНДЕР
	// ============================================================================

	if (!isOpen) return null;

	return (
		<div 
			className={styles.overlay} 
			onClick={handleOverlayClick}
			style={overlayStyle}
		>
			<div
				ref={containerRef}
				className={styles.container}
				onClick={handleContainerClick}
			>
				<button
					type="button"
					className={styles.closeButton}
					onClick={onClose}
					aria-label="Закрыть лайтбокс"
				>
					<Close />
				</button>

				{showNavigation && (
					<>
						<button
							type="button"
							className={styles.navButton}
							onClick={goToPrevious}
							aria-label="Предыдущее изображение"
						>
							<ChevronLeft />
						</button>
						<button
							type="button"
							className={`${styles.navButton} ${styles.navButtonRight}`}
							onClick={goToNext}
							aria-label="Следующее изображение"
						>
							<ChevronRight />
						</button>
					</>
				)}

				<div
					ref={imageContainerRef}
					className={styles.imageContainer}
					onClick={handleImageClick}
					onMouseDown={handleMouseDown}
					style={cursorStyle}
				>
					<div 
						ref={imageWrapperRef}
						className={styles.imageWrapper}
						style={{ 
							width: imageSize ? `${imageSize.width}px` : 'auto',
							height: imageSize ? `${imageSize.height}px` : imageSize === null ? '1px' : 'auto',
							minHeight: imageSize === null ? '1px' : 'auto',
							...wrapperStyle,
						}}
					>
						<Image
							src={images[currentIndex]}
							alt={`${imageAlt} ${currentIndex + 1}`}
							fill
							className={styles.image}
							style={{ opacity: closingOpacity }}
							sizes="100vw"
							priority
							quality={95}
							draggable={false}
							onLoad={handleImageLoad}
						/>
					</div>
				</div>

				{images.length > 1 && zoom.scale === 1 && (
					<div ref={thumbnailsRef} className={styles.thumbnails}>
						{images.map((src, index) => (
							<button
								key={index}
								type="button"
								className={`${styles.thumbnail} ${index === currentIndex ? styles.thumbnailActive : ''}`}
								onClick={() => goToImage(index)}
								aria-label={`Перейти к изображению ${index + 1}`}
								aria-selected={index === currentIndex}
								tabIndex={index === currentIndex ? 0 : -1}
							>
								<Image
									src={src}
									alt={`${imageAlt} ${index + 1}`}
									fill
									className={styles.thumbnailImage}
									sizes="60px"
									loading="lazy"
								/>
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
