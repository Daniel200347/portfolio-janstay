import { ComponentType, useState, useCallback, useMemo, memo } from "react";
import { motion, useReducedMotion, type Variants, type Transition } from "framer-motion";

// Статические стили вынесены в константы для оптимизации и избежания пересоздания объектов
const CONTAINER_STYLE: React.CSSProperties = {
	position: "relative",
	display: "inline-block",
	verticalAlign: "baseline",
} as const;

const UNDERLINE_BASE_STYLE: React.CSSProperties = {
	position: "absolute",
	bottom: "-1px",
	left: 0,
	width: "100%",
	height: "1px",
	backgroundColor: "#FFFFFF",
	pointerEvents: "none",
	backfaceVisibility: "hidden",
	WebkitBackfaceVisibility: "hidden",
	transform: "translateZ(0)",
	willChange: "transform",
} as const;

export function UnderlineRedraw<P extends object>(
	Component: ComponentType<P>
): ComponentType<P> {
	const UnderlineRedrawComponent = memo(function UnderlineRedrawComponent(props: P) {
		const [isHovered, setIsHovered] = useState(false);
		const shouldReduceMotion = useReducedMotion();

		const handleMouseEnter = useCallback(() => {
			setIsHovered(true);
		}, []);

		const handleMouseLeave = useCallback(() => {
			setIsHovered(false);
		}, []);

		const underlineVariants = useMemo<Variants>(() => {
			if (shouldReduceMotion) {
				return {
					hidden: { scaleX: 0, opacity: 0 },
					visible: { scaleX: 1, opacity: 1 },
				};
			}

			return {
				hidden: {
					scaleX: 0,
					transformOrigin: "right",
				},
				visible: {
					scaleX: 1,
					transformOrigin: "left",
				},
			};
		}, [shouldReduceMotion]);

		const transition = useMemo<Transition>(() => {
			if (shouldReduceMotion) {
				return {
					duration: 0.15,
					ease: "easeOut",
				};
			}

			return {
				duration: 0.35,
				delay: isHovered ? 0.25 : 0,
				ease: [0.625, 0.05, 0, 1],
			};
		}, [isHovered, shouldReduceMotion]);

		return (
			<motion.div
				style={CONTAINER_STYLE}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<Component {...props} />
				<motion.div
					initial="hidden"
					animate={isHovered ? "visible" : "hidden"}
					variants={underlineVariants}
					transition={transition}
					style={UNDERLINE_BASE_STYLE}
				/>
			</motion.div>
		);
	});

	UnderlineRedrawComponent.displayName = `UnderlineRedraw(${Component.displayName || Component.name || "Component"})`;

	return UnderlineRedrawComponent as ComponentType<P>;
}
