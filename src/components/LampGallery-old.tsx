type Lamp = {
    name: string;
    price: string;
    src: string;
};

const LAMPS: Lamp[] = [
    { name: "Lampe Aurore", price: "100 €", src: "/src/assets/lamps/lamp1.JPG" },
    { name: "Lampe Nébula", price: "100 €", src: "/src/assets/lamps/lamp2.JPG" },
    { name: "Lampe Halo", price: "100 €", src: "/src/assets/lamps/lamp3.JPG" },
];

export default function LampGallery() {
    return (
        <section className="grid" aria-label="Galerie de lampes">
            {LAMPS.map((lamp) => (
                <article key={lamp.src} className="card glass">
                    <div className="media">
                        <img className="lamp-img" src={lamp.src} alt={lamp.name} loading="lazy" />
                    </div>
                    <div className="meta">
                        <div className="name">{lamp.name}</div>
                        <div className="price">{lamp.price}</div>
                    </div>
                </article>
            ))}
        </section>
    );
}
