import Image from "next/image";
import styles from "./PhotoMasonry.module.css";

export interface PhotoMasonryProps {
	photos: Array<{
		src: string;
		alt: string;
		height?: number;
	}>;
}

export function PhotoMasonry({ photos }: PhotoMasonryProps) {
	return (
		<div className={styles.masonry}>
			{photos.map((photo, index) => {
				const height = photo.height || 640;
				const isTall = height === 640;
				const containerClass = isTall 
					? `${styles.imageContainer} ${styles.tall}` 
					: `${styles.imageContainer} ${styles.short}`;

				return (
					<div key={index} className={styles.card}>
						<div
							className={containerClass}
							style={{
								'--image-height': `${height}px`,
							} as React.CSSProperties}
						>
						<Image
							src={photo.src}
							alt={photo.alt}
							width={512}
							height={height}
							className={styles.image}
						/>
						</div>
					</div>
				);
			})}
		</div>
	);
}




