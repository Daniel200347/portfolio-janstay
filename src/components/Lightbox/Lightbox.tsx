"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
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

interface PointerData {
	id: number;
	x: number;
	y: number;
}

interface GestureState {
	pointers: Map<number, PointerData>;
	startScale: number;
	startTranslateX: number;
	startTranslateY: number;
	initialDistance: number;
	initialCenter: Point;
	initialWrapperCenter: Point;
	lastCenter: Point;
	isZooming: boolean;
	isDragging: boolean;
	hasStartedGesture: boolean;
}

interface Point {
	x: number;
	y: number;
}

// ============================================================================
// КОНСТАНТЫ
// ============================================================================

const MIN_SCALE = 1;
const MAX_SCALE = 10;
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
	// STATE (только для UI состояния, не для координат во время жеста)
	// ============================================================================

	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const [zoom, setZoom] = useState<ZoomState>({ scale: 1, translateX: 0, translateY: 0 });
	const [currentZoomScale, setCurrentZoomScale] = useState(1); // Отдельный state для отслеживания scale для показа thumbnails
	const [isClosing, setIsClosing] = useState(false);
	const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
	const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
	const [isTouchDevice, setIsTouchDevice] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [isDragging, setIsDragging] = useState(false); // Для отслеживания перетаскивания для курсора

	// ============================================================================
	// REFS
	// ============================================================================

	// DOM элементы
	const containerRef = useRef<HTMLDivElement>(null);
	const imageContainerRef = useRef<HTMLDivElement>(null);
	const imageWrapperRef = useRef<HTMLDivElement>(null);
	const thumbnailsRef = useRef<HTMLDivElement>(null);

	// Активные данные жеста (хранятся в ref для прямого DOM манипулирования)
	const zoomRef = useRef<ZoomState>({ scale: 1, translateX: 0, translateY: 0 });
	const gestureStateRef = useRef<GestureState | null>(null);
	const isClosingRef = useRef(false);
	const rafIdRef = useRef<number | null>(null);

	// Двойной клик
	const lastClickTimeRef = useRef(0);
	const lastClickCoordsRef = useRef<Point>({ x: 0, y: 0 });
	const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	
	// Ref для хранения текущего изображения
	const currentImageRef = useRef<HTMLImageElement | null>(null);

	// ============================================================================
	// МОНТИРОВАНИЕ ПОРТАЛА
	// ============================================================================

	useEffect(() => {
		setMounted(true);
		return () => setMounted(false);
	}, []);

	// ============================================================================
	// СИНХРОНИЗАЦИЯ REFS С STATE
	// ============================================================================

	useEffect(() => {
		zoomRef.current = zoom;
	}, [zoom]);

	// ============================================================================
	// ОПРЕДЕЛЕНИЕ TOUCH-УСТРОЙСТВА
	// ============================================================================

	useEffect(() => {
		const checkTouchDevice = () => {
			if (typeof window !== 'undefined') {
				const mediaQuery = window.matchMedia('(pointer: coarse)');
				setIsTouchDevice(mediaQuery.matches);
			}
		};

		checkTouchDevice();

		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(pointer: coarse)');
			const handleChange = (e: MediaQueryListEvent) => {
				setIsTouchDevice(e.matches);
			};

			if (mediaQuery.addEventListener) {
				mediaQuery.addEventListener('change', handleChange);
				return () => mediaQuery.removeEventListener('change', handleChange);
			} else if (mediaQuery.addListener) {
				mediaQuery.addListener(handleChange);
				return () => mediaQuery.removeListener(handleChange);
			}
		}
	}, []);

	// ============================================================================
	// СБРОС СОСТОЯНИЯ ПРИ ОТКРЫТИИ/СМЕНЕ ИЗОБРАЖЕНИЯ
	// ============================================================================

	useEffect(() => {
		if (isOpen) {
			setCurrentIndex(initialIndex);
			const resetZoom = { scale: 1, translateX: 0, translateY: 0 };
			setZoom(resetZoom);
			zoomRef.current = resetZoom;
			setCurrentZoomScale(1);
			setDragOffset({ x: 0, y: 0 });
			setIsClosing(false);
			setIsDragging(false);
			isClosingRef.current = false;
			setImageSize(null);
			lastClickTimeRef.current = 0;
			gestureStateRef.current = null;
			
			if (clickTimeoutRef.current) {
				clearTimeout(clickTimeoutRef.current);
				clickTimeoutRef.current = null;
			}

			// Сбрасываем transform напрямую в DOM
			if (imageWrapperRef.current) {
				imageWrapperRef.current.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
			}

			setTimeout(() => centerThumbnail(initialIndex), 100);
		}
	}, [initialIndex, isOpen]);

	// ============================================================================
	// ОЧИСТКА ПРИ РАЗМОНТИРОВАНИИ
	// ============================================================================

	useEffect(() => {
		return () => {
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}
			if (clickTimeoutRef.current) {
				clearTimeout(clickTimeoutRef.current);
			}
		};
	}, []);

	// ============================================================================
	// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
	// ============================================================================

	const centerThumbnail = useCallback((index: number) => {
		if (!thumbnailsRef.current) return;
		const activeThumb = thumbnailsRef.current.children[index] as HTMLElement;
		if (activeThumb) {
			activeThumb.scrollIntoView({ inline: 'center', behavior: 'smooth' });
		}
	}, []);

	// Вычисление расстояния между двумя точками для pinch-to-zoom
	const getDistance = useCallback((p1: Point, p2: Point): number => {
		const dx = p1.x - p2.x;
		const dy = p1.y - p2.y;
		return Math.hypot(dx, dy);
	}, []);

	// Вычисление центра между двумя точками для зума
	const getCenter = useCallback((p1: Point, p2: Point): Point => {
		return {
			x: (p1.x + p2.x) * 0.5,
			y: (p1.y + p2.y) * 0.5,
		};
	}, []);

	// Вычисление ограничений границ для изображения при зуме
	const constrainBounds = useCallback((zoomState: ZoomState, currentImageSize: { width: number; height: number } | null): ZoomState => {
		if (!imageWrapperRef.current || !currentImageSize) {
			return zoomState;
		}
		
		// При масштабе <= 1 всегда центрируем изображение
		if (zoomState.scale <= 1.01) {
			return {
				scale: 1,
				translateX: 0,
				translateY: 0,
			};
		}

		// Используем актуальный размер изображения
		const scaledWidth = currentImageSize.width * zoomState.scale;
		const scaledHeight = currentImageSize.height * zoomState.scale;

		// Границы видимой области (с учетом отступов)
		const isMobile = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;
		const padding = isMobile ? MOBILE_PADDING : DESKTOP_PADDING;
		const thumbnailsHeight = isMobile ? MOBILE_THUMBNAILS_HEIGHT : DESKTOP_THUMBNAILS_HEIGHT;
		const viewportWidth = window.innerWidth - padding;
		const viewportHeight = window.innerHeight - padding - thumbnailsHeight;

		// Если масштабированное изображение меньше viewport, центрируем его
		if (scaledWidth <= viewportWidth && scaledHeight <= viewportHeight) {
			return {
				...zoomState,
				translateX: 0,
				translateY: 0,
			};
		}

		// Максимальные смещения (половина разницы между масштабированным размером и viewport)
		const maxTranslateX = Math.max(0, (scaledWidth - viewportWidth) / 2);
		const maxTranslateY = Math.max(0, (scaledHeight - viewportHeight) / 2);

		// Ограничиваем translate значения
		const constrainedTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, zoomState.translateX));
		const constrainedTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, zoomState.translateY));

		return {
			...zoomState,
			translateX: constrainedTranslateX,
			translateY: constrainedTranslateY,
		};
	}, []);

	// Применение transform напрямую в DOM (для производительности)
	const applyTransform = useCallback((zoomState: ZoomState, dragOffset: Point = { x: 0, y: 0 }, applyConstraints: boolean = true) => {
		if (!imageWrapperRef.current) return;
		
		// Применяем ограничения границ только для финального состояния (без dragOffset)
		const constrainedState = (dragOffset.x === 0 && dragOffset.y === 0 && applyConstraints)
			? constrainBounds(zoomState, imageSize) 
			: zoomState;
		
		const translateX = constrainedState.translateX + dragOffset.x;
		const translateY = constrainedState.translateY + dragOffset.y;
		
		// Используем translate3d для GPU-ускорения
		imageWrapperRef.current.style.transform = 
			`translate3d(${translateX}px, ${translateY}px, 0) scale(${constrainedState.scale})`;
	}, [constrainBounds, imageSize]);

	// ============================================================================
	// ОБРАБОТКА ЗАГРУЗКИ ИЗОБРАЖЕНИЯ
	// ============================================================================

	const calculateImageSize = useCallback((img: HTMLImageElement | null) => {
		if (typeof window === 'undefined' || !img) return;
		
		const { naturalWidth, naturalHeight } = img;
		
		const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
		const padding = isMobile ? MOBILE_PADDING : DESKTOP_PADDING;
		const thumbnailsHeight = isMobile ? MOBILE_THUMBNAILS_HEIGHT : DESKTOP_THUMBNAILS_HEIGHT;
		const maxWidth = window.innerWidth - padding;
		const maxHeight = window.innerHeight - padding - thumbnailsHeight;
		
		const widthRatio = maxWidth / naturalWidth;
		const heightRatio = maxHeight / naturalHeight;
		const ratio = Math.min(widthRatio, heightRatio, 1);
		
		return {
			width: naturalWidth * ratio, 
			height: naturalHeight * ratio 
		};
	}, []);

	const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
		const img = e.currentTarget;
		currentImageRef.current = img;
		const newSize = calculateImageSize(img);
		if (newSize) {
			setImageSize(newSize);
		}
	}, [calculateImageSize]);

	// ============================================================================
	// ОБРАБОТКА ИЗМЕНЕНИЯ РАЗМЕРА ОКНА
	// ============================================================================

	useEffect(() => {
		if (!isOpen || !currentImageRef.current) return;

		const handleResize = () => {
			const img = currentImageRef.current;
			if (!img) return;

			const newSize = calculateImageSize(img);
			if (newSize) {
				setImageSize(newSize);
				// Пересчитываем ограничения границ с новым размером
				const constrainedZoom = constrainBounds(zoomRef.current, newSize);
				zoomRef.current = constrainedZoom;
				setZoom(constrainedZoom);
				applyTransform(constrainedZoom, { x: 0, y: 0 }, true);
			}
		};

		// Throttle для оптимизации
		let timeoutId: NodeJS.Timeout | null = null;
		const throttledHandleResize = () => {
			if (timeoutId) return;
			timeoutId = setTimeout(() => {
				handleResize();
				timeoutId = null;
			}, 150);
		};

		window.addEventListener('resize', throttledHandleResize);

		return () => {
			window.removeEventListener('resize', throttledHandleResize);
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, [isOpen, calculateImageSize, constrainBounds, applyTransform]);

	// ============================================================================
	// НАВИГАЦИЯ ПО ИЗОБРАЖЕНИЯМ
	// ============================================================================

	const goToPrevious = useCallback(() => {
		if (zoomRef.current.scale > 1.01) return;
		setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
		const resetZoom = { scale: 1, translateX: 0, translateY: 0 };
		setZoom(resetZoom);
		zoomRef.current = resetZoom;
		applyTransform(resetZoom, { x: 0, y: 0 }, true);
	}, [images.length, applyTransform]);

	const goToNext = useCallback(() => {
		if (zoomRef.current.scale > 1.01) return;
		setCurrentIndex((prev) => (prev + 1) % images.length);
		const resetZoom = { scale: 1, translateX: 0, translateY: 0 };
		setZoom(resetZoom);
		zoomRef.current = resetZoom;
		applyTransform(resetZoom, { x: 0, y: 0 }, true);
	}, [images.length, applyTransform]);

	const goToImage = useCallback((index: number) => {
		if (zoomRef.current.scale > 1.01) return;
		setCurrentIndex(index);
		const resetZoom = { scale: 1, translateX: 0, translateY: 0 };
		setZoom(resetZoom);
		zoomRef.current = resetZoom;
		applyTransform(resetZoom, { x: 0, y: 0 }, true);
		setTimeout(() => centerThumbnail(index), 100);
	}, [centerThumbnail, applyTransform]);

	// ============================================================================
	// POINTER EVENTS (унифицированная обработка touch и mouse)
	// ============================================================================

	useEffect(() => {
		if (!isOpen || !containerRef.current || !imageWrapperRef.current) return;

		const container = containerRef.current;
		const imageWrapper = imageWrapperRef.current;

		const handlePointerDown = (e: PointerEvent) => {
			// Отменяем любые запланированные обновления
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}

			// Предотвращаем стандартное поведение на тач-устройствах
			if (e.pointerType === 'touch') {
				e.preventDefault();
			}

			// Захватываем pointer для предотвращения потери жеста
			if (e.target instanceof HTMLElement) {
				e.target.setPointerCapture(e.pointerId);
			}

			const pointer: PointerData = {
				id: e.pointerId,
				x: e.clientX,
				y: e.clientY,
			};

			const currentZoom = zoomRef.current;
			
			// Инициализируем или обновляем состояние жеста
			if (!gestureStateRef.current) {
				const rect = imageWrapper.getBoundingClientRect();
				const wrapperCenterX = rect.left + rect.width / 2;
				const wrapperCenterY = rect.top + rect.height / 2;
				
				gestureStateRef.current = {
					pointers: new Map(),
					startScale: currentZoom.scale,
					startTranslateX: currentZoom.translateX,
					startTranslateY: currentZoom.translateY,
					initialDistance: 0,
					initialCenter: { x: pointer.x, y: pointer.y },
					initialWrapperCenter: { x: wrapperCenterX, y: wrapperCenterY },
					lastCenter: { x: pointer.x, y: pointer.y },
					isZooming: false,
					isDragging: currentZoom.scale > 1,
					hasStartedGesture: false,
				};
			}

			const state = gestureStateRef.current;
			state.pointers.set(e.pointerId, pointer);
			const pointerCount = state.pointers.size;

			if (pointerCount === 1) {
				// Один палец/курсор
				state.startScale = currentZoom.scale;
				state.startTranslateX = currentZoom.translateX;
				state.startTranslateY = currentZoom.translateY;
				state.lastCenter = { x: pointer.x, y: pointer.y };
				state.isZooming = false;
				state.isDragging = currentZoom.scale > 1;
				state.hasStartedGesture = false;
			} else if (pointerCount === 2) {
				// Два пальца - инициализируем pinch-to-zoom
				const pointerArray = Array.from(state.pointers.values());
				const distance = getDistance(pointerArray[0], pointerArray[1]);
				const center = getCenter(pointerArray[0], pointerArray[1]);

				// Получаем начальные координаты wrapper'а для точного вычисления pivot point
				const rect = imageWrapper.getBoundingClientRect();
				const wrapperCenterX = rect.left + rect.width / 2;
				const wrapperCenterY = rect.top + rect.height / 2;

				// Инициализируем состояние для pinch-to-zoom
				state.startScale = currentZoom.scale;
				state.startTranslateX = currentZoom.translateX;
				state.startTranslateY = currentZoom.translateY;
				state.initialDistance = distance;
				state.initialCenter = center;
				state.initialWrapperCenter = { x: wrapperCenterX, y: wrapperCenterY };
				state.lastCenter = center;
				state.isZooming = true;
				state.isDragging = false;
				state.hasStartedGesture = true;
			}
		};

		const handlePointerMove = (e: PointerEvent) => {
			if (!gestureStateRef.current) return;

			const state = gestureStateRef.current;
			
			// Обновляем позицию pointer'а
			state.pointers.set(e.pointerId, {
				id: e.pointerId,
				x: e.clientX,
				y: e.clientY,
			});

			const pointerCount = state.pointers.size;

			// Переход от 2 пальцев к 1 при pinch-to-zoom
			if (pointerCount === 1 && state.isZooming) {
				const pointer = Array.from(state.pointers.values())[0];
				const currentZoom = zoomRef.current;
				
				// Синхронизируем state с текущим зумом
				setZoom(currentZoom);
				
				state.isZooming = false;
				state.isDragging = currentZoom.scale > 1;
				state.startScale = currentZoom.scale; // Обновляем startScale на текущий
				state.lastCenter = { x: pointer.x, y: pointer.y };
				state.startTranslateX = currentZoom.translateX;
				state.startTranslateY = currentZoom.translateY;
				state.hasStartedGesture = false;
				// НЕ делаем return, продолжаем обрабатывать драг если нужно
			}

			// Pinch-to-zoom (2 пальца)
			if (pointerCount === 2) {
				e.preventDefault();
				e.stopPropagation();
				
				const pointerArray = Array.from(state.pointers.values());
				const distance = getDistance(pointerArray[0], pointerArray[1]);
				const center = getCenter(pointerArray[0], pointerArray[1]);

				// Если еще не инициализировали состояние для зума
				if (!state.hasStartedGesture || state.initialDistance === 0) {
					const currentZoom = zoomRef.current;
					
					// Получаем начальные координаты wrapper'а для точного вычисления pivot point
					const rect = imageWrapper.getBoundingClientRect();
					const wrapperCenterX = rect.left + rect.width / 2;
					const wrapperCenterY = rect.top + rect.height / 2;
					
					state.startScale = currentZoom.scale;
					state.startTranslateX = currentZoom.translateX;
					state.startTranslateY = currentZoom.translateY;
					state.initialDistance = distance;
					state.initialCenter = center;
					state.initialWrapperCenter = { x: wrapperCenterX, y: wrapperCenterY };
					state.lastCenter = center;
					state.isZooming = true;
					state.isDragging = false;
					state.hasStartedGesture = true;
				}

				// Отменяем предыдущий RAF
				if (rafIdRef.current !== null) {
					cancelAnimationFrame(rafIdRef.current);
				}

				// Используем RAF для плавности
				rafIdRef.current = requestAnimationFrame(() => {
					if (!gestureStateRef.current || !imageWrapper) {
						rafIdRef.current = null;
						return;
					}

					const currentState = gestureStateRef.current;
					if (currentState.pointers.size !== 2 || !currentState.isZooming) {
						rafIdRef.current = null;
						return;
					}

					// Получаем актуальные позиции pointers
					const pointers = Array.from(currentState.pointers.values());
					if (pointers.length !== 2) {
						rafIdRef.current = null;
						return;
					}

					const currentDistance = getDistance(pointers[0], pointers[1]);
					const currentCenter = getCenter(pointers[0], pointers[1]);

					// Вычисляем новый масштаб на основе начального расстояния
					if (currentState.initialDistance > 0) {
						const scaleChange = currentDistance / currentState.initialDistance;
						const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, currentState.startScale * scaleChange));

						// Используем начальные координаты wrapper'а для точного вычисления pivot point
						// Это важно, потому что координаты wrapper'а могут меняться во время жеста
						const wrapperCenterX = currentState.initialWrapperCenter.x;
						const wrapperCenterY = currentState.initialWrapperCenter.y;

						// Вычисляем позицию pivot point (центра жеста) относительно начального центра wrapper'а
						// Это позиция точки зума в экранных координатах на момент начала жеста
						const initialPivotScreenX = currentState.initialCenter.x - wrapperCenterX;
						const initialPivotScreenY = currentState.initialCenter.y - wrapperCenterY;

						// Вычисляем смещение центра жеста во время движения (для драга одновременно с зумом)
						const centerDeltaX = currentCenter.x - currentState.initialCenter.x;
						const centerDeltaY = currentCenter.y - currentState.initialCenter.y;

						// Правильная формула для зума в точке (pivot point)
						// Цель: точка под пальцами должна оставаться на месте при зуме
						// 
						// Математика:
						// В начальный момент: позиция точки на изображении (в координатах изображения) =
						//   (initialPivotScreen - startTranslate) / startScale
						// 
						// После зума до newScale, чтобы точка осталась на месте экрана:
						//   initialPivotScreen = newTranslate + (позиция на изображении) * newScale
						//   newTranslate = initialPivotScreen - (initialPivotScreen - startTranslate) / startScale * newScale
						//   newTranslate = initialPivotScreen * (1 - newScale/startScale) + startTranslate * newScale/startScale
						// 
						// Также добавляем смещение центра жеста (для драга во время зума)
						const scaleRatio = newScale / currentState.startScale;
						
						// Новые координаты translate с учетом pivot point и смещения центра
						const newTranslateX = currentState.startTranslateX * scaleRatio + 
							initialPivotScreenX * (1 - scaleRatio) + 
							centerDeltaX;
						const newTranslateY = currentState.startTranslateY * scaleRatio + 
							initialPivotScreenY * (1 - scaleRatio) + 
							centerDeltaY;

						const newZoom: ZoomState = {
							scale: newScale,
							translateX: newTranslateX,
							translateY: newTranslateY,
						};

						// Применяем напрямую в DOM (ограничения применятся в applyTransform)
						zoomRef.current = newZoom;
						applyTransform(newZoom, { x: 0, y: 0 }, true);
						
						// Синхронизируем scale в отдельный state для показа/скрытия thumbnails
						setCurrentZoomScale(newZoom.scale);

						currentState.lastCenter = currentCenter;
					}

					rafIdRef.current = null;
				});
			} 
			// Перетаскивание при зуме (1 палец, scale > 1)
			if (pointerCount === 1) {
				const currentZoom = zoomRef.current;
				const isZoomed = currentZoom.scale > 1.01; // Небольшой порог для учета погрешностей
				
				// Если изображение увеличено, разрешаем драг
				if (isZoomed && (state.isDragging || state.startScale > 1)) {
					e.preventDefault();
					const pointer = Array.from(state.pointers.values())[0];
					
					// Инициализируем драг если еще не инициализирован
					if (!state.isDragging) {
						state.isDragging = true;
						setIsDragging(true); // Обновляем state для курсора
						state.startScale = currentZoom.scale;
						state.startTranslateX = currentZoom.translateX;
						state.startTranslateY = currentZoom.translateY;
						state.lastCenter = { x: pointer.x, y: pointer.y };
					}
					
					// Отменяем предыдущий RAF
					if (rafIdRef.current !== null) {
						cancelAnimationFrame(rafIdRef.current);
					}

					// Используем RAF для плавности
					rafIdRef.current = requestAnimationFrame(() => {
						if (!gestureStateRef.current || !imageWrapper) {
							rafIdRef.current = null;
							return;
						}

						const currentState = gestureStateRef.current;
						const currentZoomCheck = zoomRef.current;
						
						if (!currentState.isDragging || currentZoomCheck.scale <= 1.01) {
							rafIdRef.current = null;
							return;
						}

						// Синхронизируем с актуальными координатами в начале жеста
						if (currentState.startTranslateX !== currentZoomCheck.translateX || 
						    currentState.startTranslateY !== currentZoomCheck.translateY) {
							currentState.startTranslateX = currentZoomCheck.translateX;
							currentState.startTranslateY = currentZoomCheck.translateY;
						}

						// Получаем актуальную позицию pointer'а
						const currentPointer = currentState.pointers.get(pointer.id);
						if (!currentPointer) {
							rafIdRef.current = null;
							return;
						}

						// Вычисляем дельту движения
						const deltaX = currentPointer.x - currentState.lastCenter.x;
						const deltaY = currentPointer.y - currentState.lastCenter.y;

						// Новое смещение
						const newTranslateX = currentState.startTranslateX + deltaX;
						const newTranslateY = currentState.startTranslateY + deltaY;

						const newZoom: ZoomState = {
							...currentZoomCheck,
							translateX: newTranslateX,
							translateY: newTranslateY,
						};

						// Применяем напрямую в DOM (ограничения применятся в applyTransform)
						zoomRef.current = newZoom;
						applyTransform(newZoom, { x: 0, y: 0 }, true);

						// Обновляем последний центр для следующего кадра
						currentState.lastCenter = { x: currentPointer.x, y: currentPointer.y };
						rafIdRef.current = null;
					});
				}
				// Свайп для закрытия или навигации (1 палец, scale === 1)
				else if (currentZoom.scale <= 1.01 && !state.isZooming) {
					const pointer = Array.from(state.pointers.values())[0];
					const deltaX = pointer.x - state.lastCenter.x;
					const deltaY = pointer.y - state.lastCenter.y;

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
			}
		};

		const handlePointerUp = (e: PointerEvent) => {
			// Освобождаем pointer
			if (e.target instanceof HTMLElement) {
				e.target.releasePointerCapture(e.pointerId);
			}

			// Отменяем RAF
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}

			if (!gestureStateRef.current) return;

			const state = gestureStateRef.current;
			
			// Сохраняем данные pointer'а перед удалением для проверки свайпа
			const pointerBeforeDelete = state.pointers.get(e.pointerId);
			state.pointers.delete(e.pointerId);

			// Если остались активные pointers, продолжаем жест
			if (state.pointers.size > 0) {
				return;
			}

			// Все pointers отпущены - завершаем жест
			const finalZoom = zoomRef.current;
			
			// Применяем ограничения границ перед синхронизацией
			const constrainedZoom = constrainBounds(finalZoom, imageSize);
			if (constrainedZoom.scale !== finalZoom.scale || 
			    constrainedZoom.translateX !== finalZoom.translateX || 
			    constrainedZoom.translateY !== finalZoom.translateY) {
				zoomRef.current = constrainedZoom;
				applyTransform(constrainedZoom);
			}
			
			// Синхронизируем state
			if (state.isDragging || state.isZooming) {
				setZoom(zoomRef.current);
			}
			
			// Сбрасываем состояние перетаскивания для курсора
			if (state.isDragging) {
				setIsDragging(false);
			}

			// Проверяем свайп для закрытия
			if (isClosingRef.current && pointerBeforeDelete) {
				const deltaY = pointerBeforeDelete.y - state.lastCenter.y;
				if (deltaY > CLOSE_SWIPE_THRESHOLD) {
					onClose();
				} else {
					setDragOffset({ x: 0, y: 0 });
					setIsClosing(false);
					isClosingRef.current = false;
				}
			} 
			// Проверяем свайп для навигации
			else if (zoomRef.current.scale <= 1.01 && pointerBeforeDelete && !state.isZooming) {
				const deltaX = pointerBeforeDelete.x - state.lastCenter.x;
				const deltaY = pointerBeforeDelete.y - state.lastCenter.y;

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

			gestureStateRef.current = null;
		};

		const handlePointerCancel = (e: PointerEvent) => {
			// Освобождаем pointer
			if (e.target instanceof HTMLElement) {
				e.target.releasePointerCapture(e.pointerId);
			}

			// Отменяем RAF
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}

			if (!gestureStateRef.current) return;

			const state = gestureStateRef.current;
			state.pointers.delete(e.pointerId);

			// Если был активный жест, применяем ограничения и синхронизируем state
			const finalZoom = zoomRef.current;
			const constrainedZoom = constrainBounds(finalZoom, imageSize);
			if (constrainedZoom.scale !== finalZoom.scale || 
			    constrainedZoom.translateX !== finalZoom.translateX || 
			    constrainedZoom.translateY !== finalZoom.translateY) {
				zoomRef.current = constrainedZoom;
				applyTransform(constrainedZoom);
			}
			
			if (state.isDragging || state.isZooming) {
				setZoom(zoomRef.current);
			}
			
			// Сбрасываем состояние перетаскивания для курсора
			if (state.isDragging) {
				setIsDragging(false);
			}

			// Если все pointers отменены, сбрасываем состояние
			if (state.pointers.size === 0) {
				gestureStateRef.current = null;
				setDragOffset({ x: 0, y: 0 });
				setIsClosing(false);
				isClosingRef.current = false;
			}
		};

		// Регистрируем обработчики на контейнере
		container.addEventListener('pointerdown', handlePointerDown);
		container.addEventListener('pointermove', handlePointerMove);
		container.addEventListener('pointerup', handlePointerUp);
		container.addEventListener('pointercancel', handlePointerCancel);

		// Обработчики touch событий для iOS Safari (fallback)
		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches.length === 2) {
				e.preventDefault();
				e.stopPropagation();
			}
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (e.touches.length === 2) {
				e.preventDefault();
				e.stopPropagation();
			}
		};

		const handleTouchEnd = (e: TouchEvent) => {
			if (e.touches.length === 2) {
				e.preventDefault();
				e.stopPropagation();
			}
		};

		// Регистрируем touch обработчики для iOS
		container.addEventListener('touchstart', handleTouchStart, { passive: false });
		container.addEventListener('touchmove', handleTouchMove, { passive: false });
		container.addEventListener('touchend', handleTouchEnd, { passive: false });

		return () => {
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}

			container.removeEventListener('pointerdown', handlePointerDown);
			container.removeEventListener('pointermove', handlePointerMove);
			container.removeEventListener('pointerup', handlePointerUp);
			container.removeEventListener('pointercancel', handlePointerCancel);
			container.removeEventListener('touchstart', handleTouchStart);
			container.removeEventListener('touchmove', handleTouchMove);
			container.removeEventListener('touchend', handleTouchEnd);
		};
	}, [isOpen, images.length, goToPrevious, goToNext, onClose, getDistance, getCenter, applyTransform, constrainBounds, imageSize]);

	// ============================================================================
	// КЛАВИАТУРА (Escape, стрелки)
	// ============================================================================

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (zoomRef.current.scale > 1.01) {
					const resetZoom = { scale: 1, translateX: 0, translateY: 0 };
					setZoom(resetZoom);
					zoomRef.current = resetZoom;
					applyTransform(resetZoom, { x: 0, y: 0 }, true);
				} else {
					onClose();
				}
			} else if (e.key === "ArrowLeft" && zoomRef.current.scale <= 1.01) {
				goToPrevious();
			} else if (e.key === "ArrowRight" && zoomRef.current.scale <= 1.01) {
				goToNext();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
		};
	}, [isOpen, onClose, goToPrevious, goToNext, applyTransform]);

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
		
		if (newScale <= 1.01) {
			const resetZoom = { scale: 1, translateX: 0, translateY: 0 };
			setZoom(resetZoom);
			zoomRef.current = resetZoom;
			setIsDragging(false);
			applyTransform(resetZoom, { x: 0, y: 0 }, true);
		} else {
			const rect = imageWrapperRef.current.getBoundingClientRect();
			const centerX = e.clientX - rect.left - rect.width / 2;
			const centerY = e.clientY - rect.top - rect.height / 2;
			
			const scaleRatio = newScale / currentZoom.scale;
			const newTranslateX = centerX - (centerX - currentZoom.translateX) * scaleRatio;
			const newTranslateY = centerY - (centerY - currentZoom.translateY) * scaleRatio;

			const newZoom: ZoomState = {
				scale: newScale,
				translateX: newTranslateX,
				translateY: newTranslateY,
			};

			setZoom(newZoom);
			zoomRef.current = newZoom;
			applyTransform(newZoom);
		}
	}, [applyTransform]);

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
			
			if (currentZoom.scale > 1.01) {
				const resetZoom = { scale: 1, translateX: 0, translateY: 0 };
				setZoom(resetZoom);
				zoomRef.current = resetZoom;
				applyTransform(resetZoom, { x: 0, y: 0 }, true);
			} else {
				if (!imageWrapperRef.current) return;
				
				const rect = imageWrapperRef.current.getBoundingClientRect();
				const clickX = e.clientX - rect.left - rect.width / 2;
				const clickY = e.clientY - rect.top - rect.height / 2;
				
				const translateX = -clickX * (DOUBLE_CLICK_SCALE - 1);
				const translateY = -clickY * (DOUBLE_CLICK_SCALE - 1);
				
				const newZoom: ZoomState = {
					scale: DOUBLE_CLICK_SCALE,
					translateX,
					translateY,
				};

				setZoom(newZoom);
				zoomRef.current = newZoom;
				applyTransform(newZoom);
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
	}, [applyTransform]);

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
	// СИНХРОНИЗАЦИЯ DRAGOFFSET С TRANSFORM
	// ============================================================================

	useEffect(() => {
		// Применяем dragOffset к transform для свайпа закрытия
		if (imageWrapperRef.current) {
			applyTransform(zoomRef.current, dragOffset);
		}
	}, [dragOffset, applyTransform]);

	// ============================================================================
	// ВЫЧИСЛЯЕМЫЕ СТИЛИ
	// ============================================================================

	const closingOpacity = useMemo(() => {
		return isClosing 
			? Math.max(0.3, 1 - Math.abs(dragOffset.y) / CLOSE_SWIPE_THRESHOLD) 
			: 1;
	}, [isClosing, dragOffset.y]);

	// Определяем класс курсора в зависимости от состояния зума и перетаскивания
	const cursorClass = useMemo(() => {
		if (!isTouchDevice) {
			if (isDragging) {
				return styles.cursorGrabbing;
			} else if (zoom.scale > 1.01) {
				return styles.cursorGrab;
			}
		}
		return '';
	}, [zoom.scale, isDragging, isTouchDevice]);

	const overlayStyle = useMemo(() => ({
		opacity: closingOpacity,
		transition: isClosing ? 'none' : 'opacity 0.2s ease-out',
	}), [closingOpacity, isClosing]);

	// Синхронизируем scale из zoom state в currentZoomScale
	useEffect(() => {
		setCurrentZoomScale(zoom.scale);
	}, [zoom.scale]);

	const showNavigation = useMemo(() => 
		images.length > 1 && currentZoomScale <= 1.01 && !isTouchDevice,
		[images.length, currentZoomScale, isTouchDevice]
	);

	const showThumbnails = useMemo(() => 
		images.length > 1 && currentZoomScale <= 1.01,
		[images.length, currentZoomScale]
	);

	// ============================================================================
	// РЕНДЕР
	// ============================================================================

	if (!isOpen || !mounted) return null;

	const lightboxContent = (
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
					className={`${styles.imageContainer} ${cursorClass}`}
					onClick={handleImageClick}
				>
					<div 
						ref={imageWrapperRef}
						className={styles.imageWrapper}
						style={{ 
							width: imageSize ? `${imageSize.width}px` : 'auto',
							height: imageSize ? `${imageSize.height}px` : imageSize === null ? '1px' : 'auto',
							minHeight: imageSize === null ? '1px' : 'auto',
							opacity: closingOpacity,
						}}
					>
						<Image
							src={images[currentIndex]}
							alt={`${imageAlt} ${currentIndex + 1}`}
							fill
							className={styles.image}
							sizes="100vw"
							priority
							quality={95}
							draggable={false}
							onLoad={handleImageLoad}
						/>
					</div>
				</div>

				<div 
					ref={thumbnailsRef} 
					className={styles.thumbnails}
					style={{
						opacity: showThumbnails ? 1 : 0,
						pointerEvents: showThumbnails ? 'auto' : 'none',
						transform: showThumbnails ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
					}}
				>
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
			</div>
		</div>
	);

	// Рендерим через Portal в document.body для избежания проблем с z-index и overflow
	return createPortal(lightboxContent, document.body);
}
