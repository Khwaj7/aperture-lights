import { useEffect, useState, type CSSProperties } from "react";
import { useDocumentTheme } from "../hooks/useDocumentTheme";
import { subscribeLamps, type CustomLamp } from "../lib/lampStore";

type OptimizedImg = {
    src: string;
    srcset?: string;
    sizes?: string;
    width: number;
    height: number;
};

type LampClient = {
    name: string;
    code: string;
    price: string;
    darkImg: OptimizedImg;
    lightImg: OptimizedImg;
};

type RenderedLamp = {
    key: string;
    name: string;
    price: string;
    darkSrc: string;
    lightSrc: string;
    darkImg?: OptimizedImg;
    lightImg?: OptimizedImg;
};

function customToRendered(c: CustomLamp): RenderedLamp {
    return {
        key: c.id,
        name: c.name,
        price: c.price,
        darkSrc: c.darkSrc,
        lightSrc: c.lightSrc ?? c.darkSrc, // fall back to dark if no light provided
    };
}

function builtInToRendered(b: LampClient): RenderedLamp {
    return {
        key: b.code,
        name: b.name,
        price: b.price,
        darkSrc: b.darkImg.src,
        lightSrc: b.lightImg.src,
        darkImg: b.darkImg,
        lightImg: b.lightImg,
    };
}

export default function LampGalleryClient({ lamps }: { lamps: LampClient[] }) {
    const { theme } = useDocumentTheme();
    const [custom, setCustom] = useState<CustomLamp[]>([]);

    useEffect(() => {
        const unsub = subscribeLamps(setCustom);
        return () => unsub();
    }, []);

    const all: RenderedLamp[] = [
        ...lamps.map(builtInToRendered),
        ...custom.map(customToRendered),
    ];

    return (
        <section className="grid" aria-label="Galerie de lampes">
            {all.map((lamp) => {
                const src = theme === "dark" ? lamp.darkSrc : lamp.lightSrc;
                const optimized = theme === "dark" ? lamp.darkImg : lamp.lightImg;

                return (
                    <article
                        key={lamp.key}
                        className="card glass lamp-card"
                        style={{ ["--img" as any]: `url(${src})` } as CSSProperties}
                    >
                        <div className="media-wrap">
                            <div className="media">
                                <img
                                    className="lamp-img"
                                    src={src}
                                    srcSet={optimized?.srcset}
                                    sizes={optimized?.sizes}
                                    width={optimized?.width}
                                    height={optimized?.height}
                                    alt={lamp.name}
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                        </div>

                        <div className="meta">
                            <div className="name">{lamp.name}</div>
                            <div className="price">{lamp.price}</div>
                        </div>
                    </article>
                );
            })}
        </section>
    );
}
