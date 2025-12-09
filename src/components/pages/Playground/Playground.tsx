"use client";

import {PhotoMasonry, PhotoMasonryItem} from "./PhotoMasonry";
import {FadeIn} from "@/components/FadeIn";
import {getBasePath} from "@/lib/utils";
import {Typography} from "@/components/Typography";
import styles from "./Playground.module.css";

export function Playground() {
    const basePath = getBasePath();

    const items: PhotoMasonryItem[] = [
        {
            src: `${basePath}/playground.png`,
            alt: "Playground photo 1",
            type: "image",
            width: 512,
            height: 640,
        },
        {
            src: `${basePath}/image1.png`,
            alt: "Playground photo 2",
            type: "image",
            width: 512,
            height: 384,
        },
        {
            src: `${basePath}/image3.png`,
            alt: "Playground photo 3",
            type: "image",
            width: 512,
            height: 640,
        },
        {
            src: `${basePath}/playground.png`,
            alt: "Playground photo 4",
            type: "image",
            width: 512,
            height: 640,
        },
        {
            src: `${basePath}/image2.png`,
            alt: "Playground photo 5",
            type: "image",
            width: 512,
            height: 640,
        },
        {
            src: `${basePath}/image3.png`,
            alt: "Playground photo 6",
            type: "image",
            width: 512,
            height: 384,
        },
        {
            src: `${basePath}/playground.png`,
            alt: "Playground photo 7",
            type: "image",
            width: 512,
            height: 384,
        },
        {
            src: `${basePath}/image.png`,
            alt: "Playground photo 8",
            type: "image",
            width: 512,
            height: 384,
        },
    ];

    return (
        <div className={styles.playground}>
            <div className={styles.textWrapper}>
                <FadeIn immediate delay={0.1}>
                    <Typography
                        size="XXS"
                        font="mono"
                        color="accent"
                        className={styles.descriptor}
                    >
                        Песочница
                    </Typography>
                </FadeIn>
                <FadeIn immediate delay={0.2}>
                    <Typography
                        size="MD"
                        font="default"
                        color="black"
                        className={styles.heading}
                    >
                        Это моя коллекция идей и авторских концепций, которые отражают личный подход к поиску новых решений, не требуя дополнительных пояснений.
                    </Typography>
                </FadeIn>
            </div>
            <div className={styles.masonryContainer}>
                <PhotoMasonry items={items}/>
            </div>
        </div>
    );
}
