import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import { Slider } from "@/components/Slider";
import { FadeIn } from "@/components/FadeIn";
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
					<FadeIn>
						<div className={styles.headingAndCompany}>
							<Typography size="XXS" font="mono" color="accent" className={styles.company}>
								{company}
							</Typography>
							<Typography size="LG" font="default" color="black" className={styles.heading}>
								{heading}
							</Typography>
						</div>
					</FadeIn>
					<FadeIn delay={0.1}>
						<Typography size="XS" font="default" color="black" className={styles.paragraph}>
							{paragraph}
						</Typography>
					</FadeIn>
				</div>
				<FadeIn delay={0.2}>
					<Button href={href} variant="flip" className={styles.button}>
						Читать кейс
					</Button>
				</FadeIn>
			</div>
			<div className={styles.picture}>
				{images.length > 0 ? (
					<FadeIn delay={0.3} style={{ width: '100%', height: '100%', position: 'relative' }}>
						<Slider images={images} imageAlt={imageAlt} />
					</FadeIn>
				) : null}
			</div>
		</article>
	);
}

