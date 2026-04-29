import type { CSSProperties } from "react";
import { useDocumentTheme } from "../hooks/useDocumentTheme";

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

export default function LampGalleryClient({ lamps }: { lamps: LampClient[] }) {
    const { theme } = useDocumentTheme();
    return (
        <section className="grid" aria-label="Galerie de lampes">
            {lamps.map((lamp) => {
                const img = theme === "dark" ? lamp.darkImg : lamp.lightImg;

                return (
                    <article
                        key={lamp.code}
                        className="card glass lamp-card"
                        style={{ ["--img" as any]: `url(${img.src})` } as CSSProperties}
                    >
                        <div className="media-wrap">
                            <div className="media">
                                <img
                                    className="lamp-img"
                                    src={img.src}
                                    srcSet={img.srcset}
                                    sizes={img.sizes}
                                    width={img.width}
                                    height={img.height}
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
