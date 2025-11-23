import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import { Slider } from "@/components/Slider";
import styles from "./CaseCard.module.css";

interface CaseCardProps {
	company: string;
	heading: string;
	paragraph: string;
	href: string;
	images?: string[];
	imageAlt?: string;
}

export function CaseCard({
	company,
	heading,
	paragraph,
	href,
	images = [],
	imageAlt = "",
}: CaseCardProps) {
	return (
		<article className={styles.caseCard}>
			<div className={styles.info}>
				<div className={styles.textContainer}>
					<div className={styles.headingAndCompany}>
						<Typography size="XXS" font="mono" color="accent" className={styles.company}>
							{company}
						</Typography>
						<Typography size="LG" font="default" color="black" className={styles.heading}>
							{heading}
						</Typography>
					</div>
					<Typography size="XS" font="default" color="black" className={styles.paragraph}>
						{paragraph}
					</Typography>
				</div>
				<Button href={href} variant="flip" className={styles.button}>
					ЧИТАТЬ КЕЙС
				</Button>
			</div>
			<div className={styles.picture}>
				{images.length > 0 ? (
					<Slider images={images} imageAlt={imageAlt} />
				) : null}
			</div>
		</article>
	);
}

