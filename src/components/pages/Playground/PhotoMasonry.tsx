"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { FadeIn } from "@/components/FadeIn";
import { Lightbox } from "@/components/Lightbox";
import styles from "./PhotoMasonry.module.css";

export interface PhotoMasonryItem {
	src: string;
	alt: string;
	type?: "image" | "video";
	videoSrc?: string;
	poster?: string;
	width?: number;
	height?: number;
}

export interface PhotoMasonryProps {
	items: PhotoMasonryItem[];
}

export function PhotoMasonry({ items }: PhotoMasonryProps) {
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
	const [isLightboxOpen, setIsLightboxOpen] = useState(false);
	const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

	const lightboxImages = useMemo(
		() => items.filter((item) => item.type !== "video").map((item) => item.src),
		[items]
	);

	const imageIndexMap = useMemo(() => {
		const map = new Map<number, number>();
		let imageIndex = 0;
		items.forEach((item, index) => {
			if (item.type !== "video") {
				map.set(index, imageIndex++);
			}
		});
		return map;
	}, [items]);

	const firstImageIndex = useMemo(() => {
		return items.findIndex((item) => item.type !== "video");
	}, [items]);

	const handleItemClick = useCallback(
		(index: number) => {
			const item = items[index];
			if (item.type === "video") return;

			const imageIndex = imageIndexMap.get(index);
			if (imageIndex !== undefined && imageIndex < lightboxImages.length) {
				setLightboxIndex(imageIndex);
				setIsLightboxOpen(true);
			}
		},
		[items, imageIndexMap, lightboxImages.length]
	);

	const handleCloseLightbox = useCallback(() => {
		setIsLightboxOpen(false);
		setLightboxIndex(null);
	}, []);

	const setVideoRef = useCallback((index: number) => {
		return (el: HTMLVideoElement | null) => {
			if (el) {
				videoRefs.current.set(index, el);
			} else {
				videoRefs.current.delete(index);
			}
		};
	}, []);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const video = entry.target as HTMLVideoElement;
						const src = video.dataset.src;
						if (src && !video.src) {
							video.src = src;
							video.load();
							video.play().catch(() => {});
						}
					}
				});
			},
			{ rootMargin: "50px" }
		);

		const videos = Array.from(videoRefs.current.values());
		videos.forEach((video) => observer.observe(video));

		return () => {
			videos.forEach((video) => observer.unobserve(video));
		};
	}, [items]);

	return (
		<>
			<div className={styles.container}>
				<div className={styles.list}>
					{items.map((item, index) => {
						const isFirstImage = index === firstImageIndex && item.type !== "video";
						return (
							<FadeIn key={`${item.src}-${index}`} delay={index * 0.1}>
								<button
									type="button"
									className={styles.item}
									onClick={() => handleItemClick(index)}
								>
									<div className={styles.image}>
										{item.type === "video" ? (
											<video
												ref={setVideoRef(index)}
												className={styles.video}
												poster={item.poster}
												data-src={item.videoSrc || item.src}
												width={item.width || 320}
												height={item.height || 180}
												muted
												loop
												playsInline
												preload="none"
											/>
										) : (
											<Image
												src={item.src}
												alt={item.alt}
												width={item.width || 512}
												height={item.height || 640}
												className={styles.imageElement}
												priority={isFirstImage}
												loading={isFirstImage ? undefined : "lazy"}
											/>
										)}
									</div>
								</button>
							</FadeIn>
						);
					})}
				</div>
			</div>

			{lightboxIndex !== null && (
				<Lightbox
					images={lightboxImages}
					currentIndex={lightboxIndex}
					isOpen={isLightboxOpen}
					onClose={handleCloseLightbox}
					imageAlt="Playground"
				/>
			)}
		</>
	);
}
