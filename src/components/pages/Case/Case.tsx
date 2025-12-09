import {Typography} from "@/components/Typography";
import styles from "./Case.module.css";
import taskSectionStyles from "@/components/TaskSection/TaskSection.module.css";
import Image from "next/image";
import {getBasePath} from "@/lib/utils";
import {List} from "@/components/List";
import {TaskSection} from "@/components/TaskSection";
import classNames from "classnames";
import {Button, CaseCard} from "@/components";
import {Slider} from "@/components/Slider";

export function Case() {
    const roleList = [
        "Исследование рынка",
        "Построение архитектуры продукта и флоу",
        "Дизайн интерфейса и компонентов",
        "Контроль соответствия макетов и реализации",
        "UX-сопровождение, еженедельные синки",
    ]
    const insightsList = [
        "Нет интеграции с MAX",
        "Массовое использование обходных решений",
        "Важна простота и скорость внедрения",
        "Коммуникация через MAX воспринимается как преимущество",
    ]
    const strategyList = [
        "Вручную: гибкая настройка под задачи",
        "По шаблону: быстрый старт для типовых сценариев",
    ]

    const basePath = getBasePath();
    return (
        <div className={styles.case}>
            <section className={styles.hero}>
                <div className={styles.caseHeaderWrapper}>
                    <div className={styles.caseHeaderHero}>
                        <div className={styles.heroTextWrapper}>
                            <Typography size="XXS" font="mono" color="accent">
                                Alena Support
                            </Typography>
                            <Typography
                                size="LG"
                                font="default"
                                color="black"
                                className={styles.description}
                            >
                                Автоматизация бизнес-процессов для российского рынка
                            </Typography>
                        </div>

                        <div className={styles.bageWrapper}>
                            <div className={styles.bage}>
                                <Typography
                                    size="XXS"
                                    font="default"
                                    color="secondary"
                                >
                                    ПОЗИЦИЯ
                                </Typography>

                                <Typography
                                    className={styles.bageDescription}
                                    size="XS"
                                    font="default"
                                    color="black"
                                >
                                    Продуктовый дизайнер
                                </Typography>
                            </div>
                            <div className={styles.bage}>
                                <Typography
                                    size="XXS"
                                    font="default"
                                    color="secondary"
                                >
                                    СФЕРА
                                </Typography>

                                <Typography
                                    className={styles.bageDescription}
                                    size="XS"
                                    font="default"
                                    color="black"
                                >
                                    SaaS, автоматизация процессов
                                </Typography>
                            </div>
                            <div className={styles.bage}>
                                <Typography
                                    size="XXS"
                                    font="default"
                                    color="secondary"
                                >
                                    ДАТА
                                </Typography>

                                <Typography
                                    className={styles.bageDescription}
                                    size="XS"
                                    font="default"
                                    color="black"
                                >
                                    Июнь — Сентябрь 2025
                                </Typography>
                            </div>

                        </div>

                    </div>
                    <Image
                        width={100}
                        height={100}
                        className={classNames(styles.marginTop,styles.image)}
                        src={`${basePath}/image.png`}
                        alt="Автоматизация бизнес-процессов"
                    />
                </div>
            </section>
            <TaskSection
                label="ЗАДАЧА"
                title={
                    <>
                        РАЗРАБОТАТЬ ПЛАТФОРМУ ДЛЯ АВТОМАТИЗАЦИИ <br/> ПРОЦЕССОВ, ИНТЕГРИРОВАННУЮ<br/> С
                        РОССИЙСКИМИ ПЛАТЁЖНЫМИ СИСТЕМАМИ<br/> И МЕССЕНДЖЕРОМ МАХ
                    </>
                }
            >
                <div className={taskSectionStyles.contextText}>
                    <div className={taskSectionStyles.context}>
                        <Typography size="XXS" font="mono" color="secondary" className={taskSectionStyles.contextLabel}>
                            КОНТЕКСТ
                        </Typography>
                        <Typography size="XS" font="default" color="black" className={taskSectionStyles.contextParagraph}>
                            В 2025 году санкции серьёзно усложнили работу малого бизнеса: появились проблемы с
                            оплатой зарубежных сервисов, использование привычных каналов коммуникации (Telegram,
                            WhatsApp) оказалось под запретом.
                        </Typography>
                    </div>
                    <Typography size="XS" font="default" color="black" className={classNames(taskSectionStyles.contextParagraph, styles.contextStyle)}>
                        На рынке отсутствовали сервисы, интегрированные с национальным мессенджером МАХ, который
                        быстро набирал аудиторию среди компаний.
                    </Typography>
                </div>
            </TaskSection>
            <TaskSection
                label="РОЛЬ"
                title={
                    <>
                        В рамках проекта отвечал за весь дизайн- <br/>процесс: от анализа конкурентов <br/> и
                        проработки пользовательских сценариев <br/> до создания интерфейса, передачи
                        готовых <br/> материалов и регулярной коммуникации <br/> с командой
                    </>
                }
            >
                <List listTexts={roleList}/>
            </TaskSection>
            <TaskSection
                label="ИНСАЙТЫ"
                title={
                    <>
                        Для погружения изучил мнения малого <br /> бизнеса, pain points после санкций <br /> и конкурентную
                        среду. Выделил основные <br /> инсайты
                    </>
                }
            >
                <List listTexts={insightsList}/>

            </TaskSection>
            <div className={classNames(styles.marginTop, styles.iconsWrapper)}>
                <Image
                    width={100}
                    height={100}
                    className={styles.longImage}
                    src={`${basePath}/photo123.jpg`}
                    alt="Автоматизация бизнес-процессов"
                />
                <Image
                    width={100}
                    height={100}
                    className={styles.longImage}
                    src={`${basePath}/photo123.jpg`}
                    alt="Автоматизация бизнес-процессов"
                />
            </div>

            <section>
                <TaskSection
                    label="СТРАТЕГИЯ"
                    title={
                        <>
                            Основу продукта формируют два сценария <br /> автоматизации
                        </>
                    }
                >
                    <List className={taskSectionStyles.titleBottomMargin} listTexts={strategyList}/>

                    <Typography size="XS" font="default" color="black" className={taskSectionStyles.contextParagraph}>
                        Сформировал карту продукта, архитектуру и навигацию с прицелом на масштабирование: команда может внедрять новые интеграции и сценарии — без пересборки IA.
                    </Typography>
                </TaskSection>
                <div className={styles.marginTop}>

                    {/*проверка на наличие img */}
                    <Slider
                        className={styles.slider}
                        images={[
                            `${basePath}/image.png`,
                            `${basePath}/image1.png`,
                            `${basePath}/image2.png`
                        ]}
                        imageAlt="Автоматизация бизнес-процессов"
                    />
                </div>
            </section>

            <section>
                <TaskSection
                    label="ДИЗАЙН-СИСТЕМА"
                    title={
                        <>
                            Для продукта собрал гибкую библиотеку <br/> компонентов на токенах: типографика, <br/> цвета, спейсинг
                        </>
                    }
                >
                    <div className={taskSectionStyles.contextText}>
                        <Typography size="XS" font="default" color="black" className={taskSectionStyles.contextParagraph}>
                            Основная логика — акцент на читабельности и минимализме, каждый элемент протестирован и подготовлен к масштабированию. Особое внимание уделил состояниям компонентов и их адаптации в макете, чтобы все работало единообразно и без усложнений.
                        </Typography>
                        <Typography size="XS" font="default" color="black" className={classNames(taskSectionStyles.contextParagraph, styles.contextStyle)}>
                            В интерфейсе заложены принципы <br/> функционального минимализма — продукт нового <br/> поколения, без лишних деталей.
                        </Typography>
                    </div>
                </TaskSection>
                <div className={classNames(styles.marginTop,styles.imageWrapper)}>
                    <div className={styles.iconsWrapper}>
                        <Image
                            width={100}
                            height={100}
                            className={styles.longImage}
                            src={`${basePath}/photo123.jpg`}
                            alt="Автоматизация бизнес-процессов"
                        />
                        <Image
                            width={100}
                            height={100}
                            className={styles.longImage}
                            src={`${basePath}/photo123.jpg`}
                            alt="Автоматизация бизнес-процессов"
                        />
                    </div>
                    <Image
                        width={100}
                        height={100}
                        className={styles.image}
                        src={`${basePath}/image.png`}
                        alt="Автоматизация бизнес-процессов"
                    />
                </div>
            </section>

            <section>
                <TaskSection
                    label="Команда"
                    title={
                        <>
                            Взаимодействие строилось на прозрачной <br /> коммуникации с разработчиками — частые <br /> созвоны по макетам и флоу, ревью <br /> сверстанных компонентов, регулярное <br /> обсуждение нюансов
                        </>
                    }
                >

                    <Typography size="XS" font="default" color="black" className={taskSectionStyles.contextParagraph}>
                        Участвовал в детализации спецификаций и готовил пояснения к нестандартным элементам. Контролировал качество внедрения — сверка макетов с живыми страницами, чек-листы и быстрая обратная связь помогали поддерживать точность реализации.
                    </Typography>
                </TaskSection>
                <Image
                    width={100}
                    height={100}
                    className={classNames(styles.marginTop,styles.image)}
                    src={`${basePath}/image.png`}
                    alt="Автоматизация бизнес-процессов"
                />
            </section>

            <section>
                <TaskSection
                    label="Итоги"
                    title={
                        <>
                            Разработал и внедрил основу продукта: <br /> архитектуру, флоу, макеты, библиотеку <br /> компонентов. Настроил UX‑интеграцию <br /> мессенджера MAX с российскими <br /> платёжными системами
                        </>
                    }
                >
                    <div className={styles.specificContext}>
                        <Typography size="XS" font="default" color="black" className={classNames(taskSectionStyles.contextParagraph, styles.contextStyle)}>
                            Организовал передачу макетов и выстроил точный канал обратной связи с разработкой. Проект готов к масштабированию — UI и компоненты легко дорабатываются, новые интеграции поддерживаются без сложной переработки.
                        </Typography>
                        <div className={taskSectionStyles.context}>
                            <Typography size="XXS" font="mono" color="secondary" className={taskSectionStyles.contextLabel}>
                                МОЙ ВКЛАД
                            </Typography>
                            <Typography size="XS" font="default" color="black" className={taskSectionStyles.contextParagraph}>
                                Cоздание архитектуры и удобной среды, быстрая адаптация под реальные задачи рынка, проработка дизайна для ускорения внедрения. Этот проект прокачал навыки анализа рынка, проектирования IA и сборки дизайн-системы «с нуля». В будущем усилил бы фокус на документации и сразу подключал бы UX-тестирование.
                            </Typography>
                        </div>
                    </div>
                </TaskSection>
                <Image
                    width={100}
                    height={100}
                    className={classNames(styles.marginTop,styles.image)}
                    src={`${basePath}/image.png`}
                    alt="Автоматизация бизнес-процессов"
                />
            </section>
            <section className={styles.footer}>
                <div className={styles.footerContainer}>
                    <div className={styles.footerTextWrapper}>
                        <Typography size="XXS" font="mono" color="accent" >
                            ДАВАЙ ОБСУДИМ
                        </Typography>
                        <Typography
                            size="LG"
                            font="default"
                            color="black"
                            className={styles.footerDescription}
                        >
                            Если что-то зацепило или появилось своё видение, не стесняйся — напиши мне в Telegram. Всегда открыт к новым идеям, коллаборациям и вопросам
                        </Typography>
                    </div>
                    <Button href={"https://t.me/yajevladimir"} variant="flip" className={styles.button}>
                        НАПИСАТЬ В ТГ
                    </Button>

                </div>

                <div className={styles.cases}>
                    <CaseCard
                        company="DEXTON, 2024 — 2025"
                        heading="Децентрализованное приложение на блокчейне TON"
                        paragraph="В рамках проекта разработал бренд, дизайн-систему и интерфейсы для экосистемы: от лендингов и промо‑страниц до сложных сервисов, таких как сетевой сканер и крипто‑портфолио. Организовывал работу команды — ставил задачи, проверял их выполнение, занимался оптимизацией и развитием продукта на каждом этапе."
                        href="/case"
                        images={[`${basePath}/image.png`, `${basePath}/image1.png`, `${basePath}/image2.png`]}
                        imageAlt="Децентрализованное приложение на блокчейне TON"
                    />
                    <CaseCard
                        company="NDA, 2022 — 2024"
                        heading="Рефакторинг ЛК для P2P‑сервиса и платёжного шлюза"
                        paragraph="Выполнил глубокий редизайн личных кабинетов для операторов, мерчантов и администраторов P2P‑платёжного сервиса: повысил информативность интерфейсов, упростил обработку заявок и ускорил работу с ордерами. Разработал единый UI kit для разных сценариев использования и стандартизировал оформление платёжных страниц. Отвечал за согласование решений с заказчиком, сотрудничество с разработчиками и контроль итоговой реализации."
                        href="/case"
                        images={[`${basePath}/image.png`, `${basePath}/image1.png`, `${basePath}/image2.png`]}
                        imageAlt="Рефакторинг ЛК для P2P‑сервиса и платёжного шлюза"
                    />
                </div>
            </section>

        </div>
    );
}

