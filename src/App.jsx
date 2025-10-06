import { useState, useEffect } from "react";
import { getCookie } from "./services/Token/sessionManager";
import { GetData, PatchData } from "./services/ApiServices";
import Routing from "./routes/routing";
import { AutenticatedUserData } from "./services/Token/AuthServices";

function App() {
  const access_token = getCookie("access_token");
  let userQuery = null;

  if (access_token) {
    userQuery = AutenticatedUserData();
  }

  const [darkMode, setDarkMode] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(false);

  
  // 2) Escucha cambios de darkMode y aplica la clase
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // 3) Alternar manualmente en vivo
  const toggleTheme = async () => {
    const newTheme = darkMode ? "normal" : "oscuro";

    // ⚡ Cambiar primero el estado para reflejarlo en UI inmediatamente
    setDarkMode(!darkMode);

    // ⏳ Luego guardar en la BD
    try {
      const PatchTheme = await PatchData("informacionUsuarios/", userQuery.data.id, {
        tema: newTheme
      })

    } catch (error) {
      console.error("Error al guardar tema en BD:", error);
    }
  };


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Botón de toggle */}
      <button
        onClick={toggleTheme}
        className="z-100 fixed top-80 right-30 px-4 py-2 rounded dark:bg-red-600 bg-blue-500 text-white transition"
      >
        {darkMode ? "Modo Claro" : "Modo Oscuro"}
      </button>

      <Routing />
    </div>
  );
}

export default App;
