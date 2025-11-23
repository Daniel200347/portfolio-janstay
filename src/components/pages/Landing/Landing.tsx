import Image from "next/image";
import { Typography } from "@/components/Typography";
import { CaseCard } from "@/components/CaseCard";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { getBasePath } from "@/lib/utils";
import styles from "./Landing.module.css";

export function Landing() {
	const basePath = getBasePath();
	return (
		<div className={styles.landing}>
			<section className={styles.hero}>
				<BackgroundPattern />
				<div className={styles.content}>
					<div className={styles.designer}>
						<div className={styles.avatar}>
							<Image
								src={`${basePath}/avatar.svg`}
								alt="Владимир Пантюшин"
								width={160}
								height={160}
								className={styles.avatarImage}
							/>
						</div>
						<Typography size="XXS" font="mono" color="accent" className={styles.name}>
							Владимир Пантюшин
						</Typography>
					</div>
					<div className={styles.headingRow}>
						<Typography size="XXL" font="default" color="black" className={styles.heading}>
							Продуктовый дизайнер
						</Typography>
						<Typography size="XS" font="default" color="black" className={styles.paragraph}>
							3+ года в fintech и web3, Внедряю DeFi-функции, проектирую платежные сценарии и аналитические панели. Обожаю строить дизайн-системы и сложные интерфейсные компоненты.
						</Typography>
					</div>
					<Typography size="XXXS" font="mono" color="secondary" className={styles.scrollHint}>
						листай вниз, там работы
					</Typography>
				</div>
			</section>

			<section className={styles.cases}>
				<CaseCard
					company="Alena Support, 2025"
					heading="Автоматизация бизнес-процессов для российского рынка"
					paragraph="В роли продуктового дизайнера спроектировал и реализовал MVP для автоматизации: полностью локализованный сервис с поддержкой российских мессенджеров и платежей. Создал с нуля UI kit и интерфейс, разработал пользовательские сценарии — решение помогает бизнесу работать без ограничений зарубежных платформ."
					href="/case/1"
					images={[`${basePath}/image.png`, `${basePath}/image1.png`, `${basePath}/image2.png`]}
					imageAlt="Автоматизация бизнес-процессов для российского рынка"
				/>
				<CaseCard
					company="dexton, 2024 — 2025"
					heading="Децентрализованное приложение на блокчейне TON"
					paragraph="В рамках проекта разработал бренд, дизайн-систему и интерфейсы для экосистемы: от лендингов и промо‑страниц до сложных сервисов, таких как сетевой сканер и крипто‑портфолио. Организовывал работу команды — ставил задачи, проверял их выполнение, занимался оптимизацией и развитием продукта на каждом этапе."
					href="/case/2"
					images={[`${basePath}/image.png`, `${basePath}/image1.png`, `${basePath}/image2.png`]}
					imageAlt="Децентрализованное приложение на блокчейне TON"
				/>
				<CaseCard
					company="nda, 2022 — 2024"
					heading="Рефакторинг ЛК для P2P‑сервиса и платёжного шлюза"
					paragraph="Выполнил глубокий редизайн личных кабинетов для операторов, мерчантов и администраторов P2P‑платёжного сервиса: повысил информативность интерфейсов, упростил обработку заявок и ускорил работу с ордерами. Разработал единый UI kit для разных сценариев использования и стандартизировал оформление платёжных страниц. Отвечал за согласование решений с заказчиком, сотрудничество с разработчиками и контроль итоговой реализации."
					href="/case/3"
					images={[`${basePath}/image.png`, `${basePath}/image1.png`, `${basePath}/image2.png`]}
					imageAlt="Рефакторинг ЛК для P2P‑сервиса и платёжного шлюза"
				/>
			</section>
		</div>
	);
}
