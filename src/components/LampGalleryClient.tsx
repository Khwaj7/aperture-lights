// LampGalleryClient.tsx
import type { CSSProperties } from "react";
import { useDocumentTheme } from "../hooks/useDocumentTheme";

type LampClient = {
    name: string;
    code: string;
    price: string;
    img: {
        src: string;
        srcset?: string;
        sizes?: string;
        width: number;
        height: number;
    };
};

export default function LampGalleryClient({ lamps }: { lamps: LampClient[] }) {
    const { theme } = useDocumentTheme();
    return (
        <section className="grid" aria-label="Galerie de lampes">
            {lamps.map((lamp) => {
                const src = theme === "dark" ? `/src/assets/lamps/${lamp.code}.JPG`
                    : `/src/assets/lamps/${lamp.code}-off.JPG`;

                return (
                    <article
                        key={lamp.code}
                        className="card glass lamp-card"
                        style={{ ["--img" as any]: `url(${src})` } as CSSProperties}
                    >
                        {/* wrapper overflow visible => halo visible sous l'image */}
                        <div className="media-wrap">
                            <div className="media">
                                <img
                                    className="lamp-img"
                                    src={src}
                                    srcSet={lamp.img.srcset}
                                    sizes={lamp.img.sizes}
                                    width={lamp.img.width}
                                    height={lamp.img.height}
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
            })
            }
        </section>
    );
}
