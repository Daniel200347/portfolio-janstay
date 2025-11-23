import { Typography } from "@/components/Typography";
import styles from "./AccentHeading.module.css";

interface AccentHeadingProps {
	children: React.ReactNode;
	className?: string;
}

export function AccentHeading({ children, className }: AccentHeadingProps) {
	return (
		<Typography size="LG" font="default" color="accent" className={className}>
			{children}
		</Typography>
	);
}

