import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LucideCheck, LucideXCircle, LucideInfo } from "lucide-react";

let showAlertFn; // función global que se expondrá

export function showAlert(tipo = "success", titulo = "", mensaje = "", duration = 3000) {
  if (showAlertFn) showAlertFn({ tipo, titulo, mensaje, duration });
  else console.warn("Alert no está montado todavía.");
}

const config = {
  success: { bg: "bg-green-500", icon: <LucideCheck size={30} /> },
  error: { bg: "bg-red-500", icon: <LucideXCircle size={30} /> },
  info: { bg: "bg-blue-500", icon: <LucideInfo size={30} /> },
};

export default function Alert() {
  const [alert, setAlert] = useState({ mostrar: false, tipo: "success", titulo: "", mensaje: "" });

  useEffect(() => {
    showAlertFn = ({ tipo, titulo, mensaje, duration }) => {
      setAlert({ mostrar: true, tipo, titulo, mensaje });

      setTimeout(() => {
        setAlert({ mostrar: false, tipo, titulo, mensaje });
      }, duration);
    };
  }, []);

  return createPortal(
    <AnimatePresence>
      {alert.mostrar && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
          className="fixed top-10 left-1/2 -translate-x-1/2 z-50 w-full h-20"
        >
      
            <div className={`${config[alert.tipo].bg} w-[80%] sm:w-[60%] md:w-[50%] mx-auto rounded-lg shadow-lg flex items-center p-4 gap-3 text-white`}>
                <div>{config[alert.tipo].icon}</div>
                <div className="flex flex-col">
                <h1 className="font-bold text-lg">{alert.titulo}</h1>
                <p className="opacity-90">{alert.mensaje}</p>
                </div>
            </div>
                
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
