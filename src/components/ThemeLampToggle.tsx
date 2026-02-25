import { useEffect, useMemo } from "react";
import { useDocumentTheme } from "../hooks/useDocumentTheme";

export type Theme = "light" | "dark";

function getInitialTheme(): Theme {
    if (typeof document === "undefined") return "light";
    const current = document.documentElement.dataset.theme;
    return current === "dark" ? "dark" : "light";
}

export default function ThemeLampToggle() {
    const { theme, setTheme } = useDocumentTheme();

    useEffect(() => {
        setTheme(getInitialTheme());
    }, []);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("theme", theme);
    }, [theme]);

    const isOn = theme === "dark";
    const label = useMemo(() => (isOn ? "ON" : "OFF"), [isOn]);

    return (
        <button
            className="toggle"
            type="button"
            role="switch"
            aria-checked={isOn}
            aria-label="Activer ou désactiver le mode sombre et l'éclairage"
            onClick={() => setTheme((t: Theme) => (t === "dark" ? "light" : "dark"))}
        >
            <span className="pill" aria-hidden="true">
                <span className="knob" />
            </span>
            <span className="toggle-label">{label}</span>
        </button>
    );
}
