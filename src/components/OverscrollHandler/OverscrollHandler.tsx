'use client';

import { useEffect } from 'react';

/**
 * Компонент для управления фоном overscroll на iOS Safari
 * Устанавливает синий фон только когда пользователь находится в области футера
 */
export function OverscrollHandler() {
	useEffect(() => {
		const handleScroll = () => {
			const footer = document.querySelector('[data-footer]');
			if (!footer) return;

			const footerRect = footer.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			
			// Если футер виден на экране (в пределах viewport или ниже), устанавливаем синий фон
			const isFooterVisible = footerRect.top < viewportHeight;
			
			if (isFooterVisible) {
				document.documentElement.style.setProperty(
					'--overscroll-bg',
					'var(--color-bg-blue-default)'
				);
			} else {
				document.documentElement.style.setProperty(
					'--overscroll-bg',
					'var(--color-bg-white-default)'
				);
			}
		};

		// Проверяем при загрузке и при скролле
		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleScroll);
		};
	}, []);

	return null;
}

