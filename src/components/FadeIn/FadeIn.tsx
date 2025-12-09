"use client";

import { motion } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

interface FadeInProps {
	children: ReactNode;
	className?: string;
	delay?: number;
	immediate?: boolean;
	style?: React.CSSProperties;
}

export function FadeIn({ children, className, delay = 0, immediate = false, style }: FadeInProps) {
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Проверяем, находится ли элемент в viewport при монтировании
		const checkViewport = () => {
			if (ref.current) {
				const rect = ref.current.getBoundingClientRect();
				const isInViewport = rect.top < window.innerHeight + 50 && rect.bottom > -50;
				setShouldAnimate(isInViewport);
			}
		};

		// Небольшая задержка для корректной проверки
		const timer = setTimeout(checkViewport, 100);
		return () => clearTimeout(timer);
	}, []);

	if (immediate) {
		return (
			<motion.div
				className={className}
				style={style}
				initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
				animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
				transition={{ duration: 0.7, ease: "easeOut", delay }}
			>
				{children}
			</motion.div>
		);
	}

	return (
		<motion.div
			ref={ref}
			className={className}
			style={style}
			initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
			animate={shouldAnimate ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
			whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
			viewport={{ once: true, margin: "-50px" }}
			transition={{ duration: 0.7, ease: "easeOut", delay }}
		>
			{children}
		</motion.div>
	);
}

