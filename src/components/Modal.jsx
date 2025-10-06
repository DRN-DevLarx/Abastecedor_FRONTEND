import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { XSquare } from "lucide-react";

let showModalFn; // función global que se expondrá

/**
 * Llama al modal desde cualquier función
 * @param {string} titulo - título principal
 * @param {string} subtitulo - subtítulo opcional
 * @param {string} mensaje - mensaje principal
 * @param {string} buttonText - texto del botón
 * @param {function|null} onConfirm - callback al confirmar
 * @param {string} buttonColor - color del botón (tailwind)
 */
export function showModal(
  titulo = "",
  subtitulo = "",
  mensaje = "",
  buttonText = "Aceptar",
  onConfirm = null,
  buttonColor = "bg-blue-600"
) {
  if (showModalFn) showModalFn({ titulo, subtitulo, mensaje, buttonText, onConfirm, buttonColor });
  else console.warn("Modal no está montado todavía.");
}

export default function Modal() {
  const [modal, setModal] = useState({
    mostrar: false,
    titulo: "",
    subtitulo: "",
    mensaje: "",
    buttonText: "Aceptar",
    onConfirm: null,
    buttonColor: "bg-blue-600",
  });

  useEffect(() => {
    showModalFn = ({ titulo, subtitulo, mensaje, buttonText, onConfirm, buttonColor }) => {
      setModal({ mostrar: true, titulo, subtitulo, mensaje, buttonText, onConfirm, buttonColor });
    };
  }, []);

  const cerrar = () => setModal((prev) => ({ ...prev, mostrar: false }));

  return createPortal(
    <AnimatePresence>
      {modal.mostrar && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#00000099] rounded-2xl shadow-xl w-[90%] py-6 px-8 relative sm:w-[70% md:w-[60%] lg:w-[50%]"
          >
            {/* Cerrar */}
            <button
              onClick={cerrar}
              className="absolute top-5 right-3 text-gray-500 hover:text-gray-700"
            >
              <XSquare size={26} />
            </button>

            {/* Contenido */}
            {modal.titulo && <h3 className="text-[17px] font-bold text-[#2da065] mb-2">{modal.titulo}</h3>}
            {modal.subtitulo && <h3 className="w-full text-center mt-10 text-lg font-bold text-white mb-2">{modal.subtitulo}</h3>}
            {modal.mensaje && <p className="text-center text-gray-500 mb-10">{modal.mensaje}</p>}

            {/* Botón principal */}
            <button
              onClick={() => {
                if (modal.onConfirm) modal.onConfirm();
                cerrar();
              }}
              className={`py-1 px-5 text-black border border-red-700 font-serif font-bold rounded-[5px] transition hover:bg-red-600 hover:drop-shadow-[10px_10px_20px_#f80404cf] hover:translate-y-[-2px] ${modal.buttonColor} hover:opacity-90`}
            >
              {modal.buttonText}
            </button>
          </motion.div>
        </motion.div> 
      )}
    </AnimatePresence>,
    document.body
  );
}
