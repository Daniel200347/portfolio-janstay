'use client';

import { useEffect } from 'react';

/**
 * Хук для установки фиксированной высоты viewport в CSS переменную
 * Решает проблему Layout Shift на мобильном Safari при скролле
 * Высота вычисляется один раз при маунте и не меняется при скролле
 */
export function useViewportHeight() {
	useEffect(() => {
		// Функция для установки высоты
		const setViewportHeight = () => {
			// Вычисляем высоту viewport один раз
			const vh = window.innerHeight;
			// Устанавливаем CSS переменную в :root
			document.documentElement.style.setProperty('--app-height', `${vh}px`);
		};

		// Устанавливаем высоту при маунте
		setViewportHeight();

		// Обработчик для resize (только для изменения ориентации или реального изменения размера окна)
		// НЕ реагируем на скролл - это ключевой момент
		let resizeTimer: NodeJS.Timeout;
		const handleResize = () => {
			// Debounce для избежания лишних пересчетов
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				setViewportHeight();
			}, 150);
		};

		// Слушаем только resize, не scroll
		window.addEventListener('resize', handleResize, { passive: true });

		// Обработка изменения ориентации
		window.addEventListener('orientationchange', () => {
			// Небольшая задержка для корректного расчета после поворота
			setTimeout(setViewportHeight, 100);
		});

		return () => {
			window.removeEventListener('resize', handleResize);
			clearTimeout(resizeTimer);
		};
	}, []);
}

