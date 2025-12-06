import { classes } from "@/lib/utils";

interface ChevronLeftProps extends React.SVGProps<SVGSVGElement> {
	className?: string;
}

export function ChevronLeft({ className, ...props }: ChevronLeftProps) {
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
				d="M16.414 6L10.414 12L16.414 18L15 19.4141L8.29295 12.707C7.90243 12.3165 7.90243 11.6835 8.29295 11.293L15 4.58594L16.414 6Z"
				fill="currentColor"
			/>
		</svg>
	);
}

