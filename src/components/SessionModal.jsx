// SwalModal.jsx
import React from "react";

function SessionModal({ message, onConfirm }) {
//   if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-96 shadow-xl flex flex-col items-center">
        {/* Ícono */}
        <div className="bg-yellow-100 dark:bg-yellow-600 rounded-full p-3 mb-4">
          {/* <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 dark:text-white" /> */}
        </div>

        {/* Título */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Aviso
        </h2>

        {/* Mensaje */}
        <p className="text-gray-700 dark:text-gray-300 text-center mb-6">{message}</p>

        {/* Botón */}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
          onClick={onConfirm}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

export default SessionModal;