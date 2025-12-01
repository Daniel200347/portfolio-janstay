import {PhotoMasonry} from "./PhotoMasonry";
import {getBasePath} from "@/lib/utils";
import {Typography} from "@/components/Typography";
import styles from "./Playground.module.css";

export function Playground() {
    const basePath = getBasePath();

    const photos = [
        {
            src: `${basePath}/playground.png`,
            alt: "Playground photo 1",
            height: 640,
        },
        {
            src: `${basePath}/vovaInfo.png`,
            alt: "Playground photo 2",
            height: 384,
        },
        {
            src: `${basePath}/image3.png`,
            alt: "Playground photo 3",
            height: 640,
        },
        {
            src: `${basePath}/playground.png`,
            alt: "Playground photo 1",
            height: 640,
        },
        {
            src: `${basePath}/vovaInfo.png`,
            alt: "Playground photo 2",
            height: 640,
        },
        {
            src: `${basePath}/image3.png`,
            alt: "Playground photo 3",
            height: 384,
        },
        {
            src: `${basePath}/playground.png`,
            alt: "Playground photo 1",
            height: 384,
        },
        {
            src: `${basePath}/vovaInfo.png`,
            alt: "Playground photo 2",
            height: 384,
        },
        {
            src: `${basePath}/image3.png`,
            alt: "Playground photo 3",
            height: 384,
        },
        {
            src: `${basePath}/image1.png`,
            alt: "Playground photo 4",
            height: 640,
        },
        {
            src: `${basePath}/image2.png`,
            alt: "Playground photo 5",
            height: 640,
        },
        {
            src: `${basePath}/image.png`,
            alt: "Playground photo 6",
            height: 384,
        },
    ];

    return (
        <div className={styles.playground}>
            <div className={styles.textWrapper}>
                <Typography
                    size="XXS"
                    font="mono"
                    color="accent"
                    className={styles.title}
                >
                    Песочница
                </Typography>
                <Typography
                    size="LG"
                    font="default"
                    color="black"
                    className={styles.description}
                >
                    Это моя коллекция идей и авторских концепций, которые отражают личный подход к поиску новых решений,
                    не требуя дополнительных пояснений
                </Typography>
            </div>
            <PhotoMasonry photos={photos}/>
        </div>
    );
}
