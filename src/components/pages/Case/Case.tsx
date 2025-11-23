import { Typography } from "@/components/Typography";

interface CaseProps {
	slug: string;
}

export function Case({ slug }: CaseProps) {
	return (
		<div>
			<Typography size="XL" color="black">
				Case {slug}
			</Typography>
		</div>
	);
}

