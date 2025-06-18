"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import heroImg from "@/public/images/DJI_0440.jpg";

export default function HeroVideo() {
    const [showVideo, setShowVideo] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <div className="mx-auto aspect-video overflow-hidden rounded-xl sm:w-full lg:order-last relative">
            {showVideo ? (
                <video
                    ref={videoRef}
                    src="/videos/We%20are%20Cornell%20Tech.mp4"
                    muted
                    playsInline
                    autoPlay
                    className="w-full h-full object-cover"
                    onCanPlay={() => videoRef.current?.play()}
                    onEnded={() => setShowVideo(false)}
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
                    onClick={() => setShowVideo(true)}
                />
            )}
        </div>
    );
}
