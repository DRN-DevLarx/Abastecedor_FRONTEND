import { createContext, useContext, useEffect, useState } from "react";
import { GetData } from "../services/ApiServices";
import { getCookie } from "../services/Token/sessionManager";
import { decodeJwt } from "jose";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

    const [token, setToken] = useState(() => getCookie("access_token"));
    const [userId, setUserId] = useState(null);

    const [theme, setTheme] = useState(null);
    const [loadingTheme, setLoadingTheme] = useState(true);

    // 🔹 Escuchar login / logout
    useEffect(() => {
        const interval = setInterval(() => {
            const currentToken = getCookie("access_token");
            setToken(prev => prev !== currentToken ? currentToken : prev);
        }, 500); // polling ligero

        return () => clearInterval(interval);
    }, []);

    // 🔹 Decodificar token
    useEffect(() => {
        if (!token) {
            setUserId(null);
            setTheme(null);
            setLoadingTheme(false);
            return;
        }

        try {
            const decoded = decodeJwt(token);
            setUserId(decoded?.user_id ?? null);
        } catch {
            setUserId(null);
        }
    }, [token]);

    // 🔹 Cargar tema por usuario
    useEffect(() => {
        if (!userId) {
            document.documentElement.classList.remove("dark");
            return;
        }

        const fetchTheme = async () => {
            try {
                setLoadingTheme(true);
                const response = await GetData(`informacionUsuarios/${userId}/`);
                setTheme(response?.tema || "light");
            } catch (error) {
                console.error("Error cargando tema:", error);
                setTheme("light");
            } finally {
                setLoadingTheme(false);
            }
        };

        fetchTheme();
    }, [userId]);

    // 🔹 Aplicar tema
    useEffect(() => {
        document.documentElement.classList.toggle(
            "dark",
            theme === "oscuro"
        );
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, loadingTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
