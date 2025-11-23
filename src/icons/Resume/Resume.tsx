import React from "react";
import { classes } from "@/lib/utils";

interface ResumeProps extends React.SVGProps<SVGSVGElement> {
	className?: string;
}

export function Resume({ className, ...props }: ResumeProps) {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			className={classes(className)}
			{...props}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12.2873 1.03487V5.46513H16.6422L12.2873 1.03487Z"
				fill="currentColor"
			/>
			<path
				d="M11.1273 6.625H16.7523V19H3.2998V1H11.1273V6.625Z"
				fill="currentColor"
			/>
		</svg>
	);
}

