import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { addLamp, usingFirebase } from "../lib/lampStore";

const MAX_DIM = 1000;          // px — longest side
const JPEG_QUALITY = 0.82;
const MAX_TOTAL_KB = 4500;     // soft cap for the localStorage fallback

type CompressedImage = {
    blob: Blob;
    previewUrl: string;        // object URL for the preview <img>
    sizeKb: number;
};

/** Compress a File into a JPEG Blob, capped at MAX_DIM on the longest side. */
function compressImage(file: File): Promise<CompressedImage> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error("Image invalide"));
            img.onload = () => {
                const { width, height } = img;
                const scale = Math.min(1, MAX_DIM / Math.max(width, height));
                const w = Math.round(width * scale);
                const h = Math.round(height * scale);

                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d");
                if (!ctx) return reject(new Error("Canvas indisponible"));
                ctx.drawImage(img, 0, 0, w, h);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error("Compression échouée"));
                        resolve({
                            blob,
                            previewUrl: URL.createObjectURL(blob),
                            sizeKb: Math.round(blob.size / 1024),
                        });
                    },
                    "image/jpeg",
                    JPEG_QUALITY
                );
            };
            img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    });
}

export default function LampAddForm() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [dark, setDark] = useState<CompressedImage | null>(null);
    const [light, setLight] = useState<CompressedImage | null>(null);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const dialogRef = useRef<HTMLDivElement | null>(null);

    // Esc to close
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    // Reset form on close (and free preview URLs)
    useEffect(() => {
        if (open) return;
        if (dark) URL.revokeObjectURL(dark.previewUrl);
        if (light) URL.revokeObjectURL(light.previewUrl);
        setName("");
        setPrice("");
        setDark(null);
        setLight(null);
        setErr(null);
        setBusy(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    async function handleFile(
        e: ChangeEvent<HTMLInputElement>,
        kind: "dark" | "light"
    ) {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-picking same file
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setErr("Le fichier doit être une image.");
            return;
        }
        setErr(null);
        setBusy(true);
        try {
            const compressed = await compressImage(file);
            if (kind === "dark") {
                if (dark) URL.revokeObjectURL(dark.previewUrl);
                setDark(compressed);
            } else {
                if (light) URL.revokeObjectURL(light.previewUrl);
                setLight(compressed);
            }
        } catch (e: any) {
            setErr(e?.message || "Erreur de compression image");
        } finally {
            setBusy(false);
        }
    }

    function clearImage(kind: "dark" | "light") {
        if (kind === "dark" && dark) {
            URL.revokeObjectURL(dark.previewUrl);
            setDark(null);
        } else if (kind === "light" && light) {
            URL.revokeObjectURL(light.previewUrl);
            setLight(null);
        }
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setErr(null);

        const trimmedName = name.trim();
        const trimmedPrice = price.trim();
        if (!trimmedName) return setErr("Le nom est requis.");
        if (!trimmedPrice) return setErr("Le prix est requis.");
        if (!dark) return setErr("Une image (mode sombre) est requise.");

        // Only enforce localStorage cap when running in fallback mode
        if (!usingFirebase) {
            const totalKb = dark.sizeKb + (light?.sizeKb ?? 0);
            if (totalKb > MAX_TOTAL_KB) {
                return setErr(
                    `Images trop lourdes (${totalKb} KB). Réessaie avec des images plus petites.`
                );
            }
        }

        setBusy(true);
        try {
            await addLamp({
                name: trimmedName,
                price: trimmedPrice,
                darkBlob: dark.blob,
                lightBlob: light?.blob ?? null,
            });
            setOpen(false);
        } catch (e: any) {
            setErr(e?.message || "Erreur lors de l'enregistrement");
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            {/* Discreet floating trigger — works on desktop + mobile */}
            <button
                type="button"
                className="add-lamp-fab glass"
                aria-label="Ajouter une lampe"
                title="Ajouter une lampe"
                onClick={() => setOpen(true)}
            >
                <span aria-hidden="true">+</span>
            </button>

            {open && (
                <div
                    className="add-lamp-backdrop"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Ajouter une lampe"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setOpen(false);
                    }}
                >
                    <div ref={dialogRef} className="add-lamp-modal glass">
                        <div className="add-lamp-header">
                            <h2>Ajouter une lampe</h2>
                            <button
                                type="button"
                                className="add-lamp-close"
                                aria-label="Fermer"
                                onClick={() => setOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        {!usingFirebase && (
                            <div className="add-lamp-note">
                                Stockage local uniquement (configure Firebase pour partager
                                avec tous les visiteurs).
                            </div>
                        )}

                        <form className="add-lamp-form" onSubmit={onSubmit}>
                            <label className="add-lamp-field">
                                <span>Nom</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Lampe Aurore"
                                    required
                                />
                            </label>

                            <label className="add-lamp-field">
                                <span>Prix</span>
                                <input
                                    type="text"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="120 €"
                                    required
                                />
                            </label>

                            <div className="add-lamp-images">
                                <ImagePicker
                                    label="Image — mode sombre (allumée)"
                                    hint="Requis"
                                    required
                                    src={dark?.previewUrl ?? null}
                                    onChange={(e) => handleFile(e, "dark")}
                                    onClear={() => clearImage("dark")}
                                />
                                <ImagePicker
                                    label="Image — mode clair (éteinte)"
                                    hint="Optionnel mais recommandé"
                                    src={light?.previewUrl ?? null}
                                    onChange={(e) => handleFile(e, "light")}
                                    onClear={() => clearImage("light")}
                                />
                            </div>

                            {err && <div className="add-lamp-err">{err}</div>}

                            <div className="add-lamp-actions">
                                <button
                                    type="button"
                                    className="add-lamp-btn ghost"
                                    onClick={() => setOpen(false)}
                                    disabled={busy}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="add-lamp-btn primary"
                                    disabled={busy}
                                >
                                    {busy ? "Envoi…" : "Ajouter"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

function ImagePicker({
    label,
    hint,
    required,
    src,
    onChange,
    onClear,
}: {
    label: string;
    hint: string;
    required?: boolean;
    src: string | null;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
}) {
    return (
        <div className={`img-picker ${src ? "has-image" : ""}`}>
            <div className="img-picker-label">
                <span>{label}</span>
                <em className={required ? "required" : ""}>{hint}</em>
            </div>

            <label className="img-picker-drop">
                {src ? (
                    <img src={src} alt="" />
                ) : (
                    <div className="img-picker-empty">
                        <div className="plus">+</div>
                        <div className="txt">Choisir une image</div>
                    </div>
                )}
                <input
                     type="file"
                    accept="image/*"
                    onChange={onChange}
                    hidden
                />
            </label>

            {src && (
                <button
                    type="button"
                    className="img-picker-clear"
                    onClick={onClear}
                    aria-label="Retirer l'image"
                >
                    Retirer
                </button>
            )}
        </div>
    );
}
