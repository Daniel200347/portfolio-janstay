"use client";

import Image from "next/image";
import { Typography } from "@/components/Typography";
import { FadeIn } from "@/components/FadeIn";
import { CareerTable, CareerRow } from "@/components/CareerTable";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { getBasePath } from "@/lib/utils";
import styles from "./Info.module.css";

const careerData: CareerRow[] = [
	{ year: "2025", company: "Alena Support", position: "Продуктовый дизайнер" },
	{ year: "2024 — 2025", company: "Dexton", position: "UX/UI Дизайнер" },
	{ year: "2022 — 2024", company: "КОДВАЙС ЛАБ", position: "UX/UI Дизайнер" },
	{ year: "2021 — 2022", company: "Terminal", position: "Веб-дизайнер" },
	{ year: "2020  — 2023", company: "Freelance", position: "Дизайнер" },
];

export function Info() {
	const basePath = getBasePath();

	return (
		<div className={styles.infoContainer}>
			<div className={styles.infoHero}>
				<div className={styles.textWrapper}>
					<div className={styles.headingAndDescription}>
						<FadeIn immediate delay={0.1}>
							<Typography size="XXS" font="mono" color="accent" className={styles.description}>
								Информация
							</Typography>
						</FadeIn>
						<div className={styles.infoHeroHeading}>
							<FadeIn immediate delay={0.2}>
								<Typography size="LG" font="default" color="black" className={styles.infoHeroHeadingText}>
                                    Меня зовут Владимир, мне 22 года. занимаюсь дизайном уже пятый год и за это время понял одно — это то, в чём я чувствую себя на своём месте.
                                </Typography>
							</FadeIn>
							<FadeIn immediate delay={0.3}>
								<Typography size="LG" font="default" color="black" className={styles.infoHeroHeadingText}>
                                    Для меня дизайн не профессия, а способ видеть логику и красоту во всём вокруг.
								</Typography>
							</FadeIn>
						</div>
					</div>
				</div>
				<div className={styles.bottomContent}>
					<FadeIn immediate delay={0.4}>
						<Typography size="XS" font="default" color="black" className={styles.infoHeroParagraph}>
                            Работаю фулл-тайм и продолжаю творить за пределами фигмы. Люблю музыку, играю на гитаре, мечтаю освоить барабаны, обожаю собак и вдохновляюсь командами, где идеи превращаются в систему.
						</Typography>
					</FadeIn>
					<FadeIn immediate delay={0.5} className={styles.infoHeroImage}>
						<div className={styles.backgroundVector}>
							<BackgroundPattern />
						</div>
						<Image
							src={`${basePath}/vladimir.jpg`}
							alt="Владимир Пантюшин"
							width={380}
							height={450}
							className={styles.infoHeroImageImg}
							priority
							loading="eager"
						/>
					</FadeIn>
				</div>
			</div>

			<section className={styles.career}>
				<FadeIn delay={0.1}>
					<Typography size="XXS" font="mono" color="accent" className={styles.careerDescription}>
						карьера
					</Typography>
				</FadeIn>
				<div className={styles.careerContent}>
					<FadeIn delay={0.2}>
						<Typography size="LG" font="default" color="black" className={styles.careerHeading}>
							Маршрут <br/> творческого роста
						</Typography>
					</FadeIn>
					<FadeIn delay={0.3}>
						<CareerTable rows={careerData} className={styles.careerTable} />
					</FadeIn>
				</div>
			</section>
		</div>
	);
}

