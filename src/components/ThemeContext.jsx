import { createContext, useContext, useEffect, useState } from "react";
import { GetData } from "../services/ApiServices";
import { getCookie } from "../services/Token/sessionManager";
import { decodeJwt } from "jose";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

    const Token = getCookie("access_token");
    const UserId = decodeJwt(Token)?.user_id;

    const [theme, setTheme] = useState(null);
    const [loadingTheme, setLoadingTheme] = useState(true);

    useEffect(() => {
        if (!UserId) return;

        const fetchTheme = async () => {
            try {
                const response = await GetData(`informacionUsuarios/${UserId}/`);

                const userTheme = response?.tema || "light";
                setTheme(userTheme);

            } catch (error) {
                console.error("Error cargando tema de usuario:", error);
                setTheme("light");
            } finally {
                setLoadingTheme(false);
            }
        };

        fetchTheme();
    }, [UserId]);

    // 🔹 aplicar tema global
    useEffect(() => {

        if (!theme) return;
        document.documentElement.classList.toggle("dark", theme === "oscuro");
    }, [theme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                loadingTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
