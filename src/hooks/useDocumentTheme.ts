import { useEffect, useState } from "react";
import type { Theme } from "../components/ThemeLampToggle";

export function useDocumentTheme() {
    const getTheme = (): Theme => {
        if (typeof document === "undefined") return "light";
        const current = document.documentElement.dataset.theme;
        return current === "dark" ? "dark" : "light";
    };

    const [theme, setTheme] = useState<Theme>(getTheme());

    useEffect(() => {
        const el = document.documentElement;
        setTheme(getTheme());

        const obs = new MutationObserver(() => {
            setTheme(getTheme());
        });
        obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });

        return () => obs.disconnect();
    }, []);

    return { theme, setTheme };
}