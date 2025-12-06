import { classes } from "@/lib/utils";

interface ChevronRightProps extends React.SVGProps<SVGSVGElement> {
	className?: string;
}

export function ChevronRight({ className, ...props }: ChevronRightProps) {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			className={classes(className)}
			{...props}
			aria-hidden="true"
		>
			<path
				d="M8.00008 6L14.0001 12L8.00008 18L9.41414 19.4141L16.1212 12.707C16.5117 12.3165 16.5117 11.6835 16.1212 11.293L9.41414 4.58594L8.00008 6Z"
				fill="currentColor"
			/>
		</svg>
	);
}

