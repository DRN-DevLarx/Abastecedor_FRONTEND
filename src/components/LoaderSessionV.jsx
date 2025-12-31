import { useState, useEffect } from "react";

function LoaderSessionV({ message = "Verificando sesión...", duration = 500 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#adb6aaa8] dark:bg-[#171731]">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

        {/* Texto */}
        <p className="mt-4 text-white text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}

export default LoaderSessionV;
