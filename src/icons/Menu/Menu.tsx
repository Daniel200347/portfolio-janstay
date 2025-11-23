import React from "react";
import { classes } from "@/lib/utils";

interface MenuProps extends React.SVGProps<SVGSVGElement> {
	className?: string;
}

export function Menu({ className, ...props }: MenuProps) {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={classes(className)}
			{...props}
		>
			<path
				d="M18.3337 12.0833V13.75H1.66699V12.0833H18.3337ZM18.3337 6.25V7.91667H1.66699V6.25H18.3337Z"
				fill="currentColor"
			/>
		</svg>
	);
}

