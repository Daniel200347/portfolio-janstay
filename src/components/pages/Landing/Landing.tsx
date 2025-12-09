"use client";

import {useLayoutEffect, useRef, useCallback} from "react";
import Image from "next/image";
import {Typography} from "@/components/Typography";
import {CaseCard} from "@/components/CaseCard";
import {BackgroundPattern} from "@/components/BackgroundPattern";
import {FadeIn} from "@/components/FadeIn";
import {getBasePath} from "@/lib/utils";
import styles from "./Landing.module.css";

const MOBILE_BREAKPOINT = 701;
const FONT_SCALE = 0.114;
const FONT_MIN = 32;
const FONT_MAX = 80;
const LINE_HEIGHT_MIN = 36;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function Landing() {
    const basePath = getBasePath();
    const textContainerRef = useRef<HTMLDivElement>(null);

    const updateFontSize = useCallback(() => {
        const container = textContainerRef.current;
        if (!container) return;

        const width = window.innerWidth;
        if (width > MOBILE_BREAKPOINT) return;

        const heading = container.querySelector<HTMLElement>("h1");
        if (!heading?.classList.contains(styles.heading)) return;

        const fontSize = clamp(width * FONT_SCALE, FONT_MIN, FONT_MAX);
        const lineHeight = clamp(width * FONT_SCALE, LINE_HEIGHT_MIN, FONT_MAX);

        heading.style.fontSize = `${fontSize}px`;
        heading.style.lineHeight = `${lineHeight}px`;
    }, []);

    useLayoutEffect(() => {
        updateFontSize();

        const handleResize = () => requestAnimationFrame(updateFontSize);
        window.addEventListener("resize", handleResize, {passive: true});

        return () => window.removeEventListener("resize", handleResize);
    }, [updateFontSize]);

    return (
        <div className={styles.landing}>
            <section className={styles.hero}>
                <div className={styles.content}>
                    <div className={styles.profile}>
                        <FadeIn className={styles.avatar}>
                            <Image
                                src={`${basePath}/avatar.jpg`}
                                alt="Владимир Пантюшин"
                                width={160}
                                height={160}
                                className={styles.avatarImage}
                                priority
                                loading="eager"
                            />
                        </FadeIn>
                        <FadeIn delay={0.1}>
                            <Typography size="XXS" font="mono" color="accent" className={styles.name}>
                                Владимир Пантюшин
                            </Typography>
                        </FadeIn>
                    </div>
                    <div ref={textContainerRef} className={styles.textContainer}>
                        <FadeIn delay={0.2}>
                            <Typography size="XXL" font="default" color="black" className={styles.heading}>
                                Продуктовый <br/> дизайнер
                            </Typography>
                        </FadeIn>
                        <FadeIn delay={0.3}>
                            <Typography size="XS" font="default" color="black" className={styles.description}>
                                3+ года в fintech и web3. Внедряю DeFi-функции, проектирую платежные сценарии и аналитические панели. Обожаю строить дизайн-системы и сложные интерфейсные компоненты.
                            </Typography>
                        </FadeIn>
                    </div>
                </div>
                <FadeIn delay={0.4} immediate className={styles.descriptor}>
                    <Typography size="XXXS" font="mono" color="secondary">
                        Листай вниз, там работы
                    </Typography>
                </FadeIn>
                <FadeIn delay={0.5} className={styles.vector}>
                    <BackgroundPattern/>
                </FadeIn>
            </section>

            <section className={styles.cases}>
                <FadeIn delay={0.1}>
                    <CaseCard
                        company="Alena Support, 2025"
                        heading="Автоматизация бизнес-процессов для российского рынка"
                        paragraph="В роли продуктового дизайнера спроектировал и реализовал MVP для автоматизации: полностью локализованный сервис с поддержкой российских мессенджеров и платежей. Создал с нуля UI kit и интерфейс, разработал пользовательские сценарии — решение помогает бизнесу работать без ограничений зарубежных платформ."
                        href="/case/1"
                        images={[`${basePath}/image.png`, `${basePath}/image1.png`, `${basePath}/image2.png`]}
                        imageAlt="Автоматизация бизнес-процессов для российского рынка"
                    />
                </FadeIn>
                <FadeIn delay={0.2}>
                    <CaseCard
                        company="DEXTON, 2024 — 2025"
                        heading="Децентрализованное приложение на блокчейне TON"
                        paragraph="В рамках проекта разработал бренд, дизайн-систему и интерфейсы для экосистемы: от лендингов и промо‑страниц до сложных сервисов, таких как сетевой сканер и крипто‑портфолио. Организовывал работу команды — ставил задачи, проверял их выполнение, занимался оптимизацией и развитием продукта на каждом этапе."
                        href="/case/2"
                        images={[`${basePath}/image.png`, `${basePath}/image1.png`, `${basePath}/image2.png`]}
                        imageAlt="Децентрализованное приложение на блокчейне TON"
                    />
                </FadeIn>
                <FadeIn delay={0.3}>
                    <CaseCard
                        company="NDA, 2022 — 2024"
                        heading="Рефакторинг ЛК для P2P‑сервиса и платёжного шлюза"
                        paragraph="Выполнил глубокий редизайн личных кабинетов для операторов, мерчантов и администраторов P2P‑платёжного сервиса: повысил информативность интерфейсов, упростил обработку заявок и ускорил работу с ордерами. Разработал единый UI kit для разных сценариев использования и стандартизировал оформление платёжных страниц. Отвечал за согласование решений с заказчиком, сотрудничество с разработчиками и контроль итоговой реализации."
                        href="/case/3"
                        images={[`${basePath}/image.png`, `${basePath}/image1.png`, `${basePath}/image2.png`]}
                        imageAlt="Рефакторинг ЛК для P2P‑сервиса и платёжного шлюза"
                    />
                </FadeIn>
            </section>
        </div>
    );
}
