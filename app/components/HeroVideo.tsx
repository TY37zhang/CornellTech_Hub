"use client";

import { useState, useRef, memo, useCallback } from "react";
import Image from "next/image";
import heroImg from "@/public/images/DJI_0440.webp";

function HeroVideo() {
    const [showVideo, setShowVideo] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Optimized video handlers
    const handleVideoClick = useCallback(() => {
        setShowVideo(true);
    }, []);

    const handleVideoCanPlay = useCallback(() => {
        videoRef.current?.play();
    }, []);

    const handleVideoEnded = useCallback(() => {
        setShowVideo(false);
    }, []);

    return (
        <div className="mx-auto aspect-video overflow-hidden rounded-xl sm:w-full relative">
            {showVideo ? (
                <video
                    ref={videoRef}
                    src="/videos/We%20are%20Cornell%20Tech.mp4"
                    muted
                    playsInline
                    autoPlay
                    className="w-full h-full object-cover"
                    onCanPlay={handleVideoCanPlay}
                    onEnded={handleVideoEnded}
                    preload="metadata"
                />
            ) : (
                <Image
                    src={heroImg}
                    alt="Cornell Tech Campus Preview"
                    placeholder="blur"
                    priority
                    sizes="(max-width: 1024px) 100vw, 700px"
                    quality={70}
                    className="object-cover w-full h-full cursor-pointer"
                    style={{ objectPosition: "center" }}
                    onClick={handleVideoClick}
                />
            )}
        </div>
    );
}

// Memoized component to prevent unnecessary re-renders
export default memo(HeroVideo);
