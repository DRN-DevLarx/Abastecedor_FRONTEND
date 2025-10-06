import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-2">Página no encontrada</h2>
      <p className="mb-6 text-gray-400 text-center max-w-md">
        Lo sentimos, la página que estás buscando no existe o fue movida.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md"
      >
        Volver
      </button>
    </div>
  );
}

export default NotFound;
