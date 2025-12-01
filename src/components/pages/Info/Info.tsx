import Image from "next/image";
import { Typography } from "@/components/Typography";
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
						<Typography size="XXS" font="mono" color="accent" className={styles.description}>
							информация
						</Typography>
						<div className={styles.infoHeroHeading}>
							<Typography size="LG" font="default" color="black" className={styles.infoHeroHeadingText}>
								Меня зовут Владимир, мне 22 года. занимаюсь дизайном уже пятый год и за это время понял одно — это
								то, в чём я чувствую себя на своём месте.
							</Typography>
							<Typography size="LG" font="default" color="black" className={styles.infoHeroHeadingText}>
								Для меня дизайн не профессия, а способ видеть логику и красоту во всём вокруг.
							</Typography>
						</div>
					</div>
					<Typography size="XS" font="default" color="black" className={styles.infoHeroParagraph}>
						Работаю фулл-тайм и продолжаю творить за пределами фигмы. Люблю музыку, играю на гитаре, мечтаю освоить
						барабаны, обожаю собак и вдохновляюсь командами, где идеи превращаются в систему.
					</Typography>
				</div>
				<div className={styles.infoHeroImage}>
					<div className={styles.backgroundVector}>
						<BackgroundPattern />
					</div>
					<Image
						src={`${basePath}/vovaInfo.png`}
						alt="Владимир Пантюшин"
						width={380}
						height={450}
						className={styles.infoHeroImageImg}
					/>
				</div>
			</div>

			<section className={styles.career}>
				<Typography size="XXS" font="mono" color="accent" className={styles.careerDescription}>
					карьера
				</Typography>
				<Typography size="LG" font="default" color="black" className={styles.careerHeading}>
					Маршрут творческого роста
				</Typography>
				<CareerTable rows={careerData} className={styles.careerTable} />
			</section>
		</div>
	);
}

