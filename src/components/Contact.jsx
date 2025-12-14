import React from 'react'
import ContactImage from '../assets/ContactImage.svg'
import { jwtDecode } from "jwt-decode";
import {getCookie } from "../services/Token/sessionManager";
import { AutenticatedUserData } from "../services/Token/AuthServices";
import { useEffect, useState } from "react";
import { PostData } from '../services/ApiServices';
import Loader from "./Loader";
import Swal from 'sweetalert2';

function Contact() {
  
  const [ShowLoader, setShowLoader] = useState(false);
  const [Autenticate, setAutenticate] = useState(false);

  const [FullName, setFullName] = useState("");
  const [Email, setEmail] = useState("");
  const [Subject, setSubject] = useState("");
  const [Message, setMessage] = useState("");

  const access_token = getCookie("access_token");
  const role = access_token ? jwtDecode(access_token)?.role : null;

  let userQuery = "";

  if (access_token) {
    userQuery = AutenticatedUserData();
  }

  useEffect(() => {
    if (!access_token || userQuery.status !== "success" || !userQuery.data) return;
        
    setAutenticate(true);
    setFullName(userQuery.data.first_name + " " + userQuery.data.last_name);
    setEmail(userQuery.data.email);
        
  }, [access_token, userQuery.data, userQuery.status, role]);
  

  const EnviarConsulta = async () => {
    console.log(FullName, Email, Subject, Message);
    
    if(FullName.length === 0 || Email.length === 0 || Subject.length === 0 || Message.length === 0){
      Swal.fire({
          icon: 'error',
          text: 'Por favor completa todos los campos.',
          confirmButtonText: "Aceptar",
          showCancelButton: false,
          background: '#233876aa',
          color: 'white',
      })
    } else {
      setShowLoader(true);
      
      const endpoint = "consultas/"    
      const PostConsult = await PostData(endpoint, {
        nombre_completo: FullName,
        correo: Email,
        asunto: Subject,
        mensaje: Message,
      })
  
      setShowLoader(false);
  
      if(PostConsult.status === 200 || PostConsult.status === 201){

        Swal.fire({
          icon: 'success',
          text: 'Tu consulta ha sido enviada con éxito.',
          confirmButtonText: "Aceptar",
          showCancelButton: false,
          background: '#233876aa',
          color: 'white',
        })

        if(Autenticate) {
          setSubject("");
          setMessage("");
          
        } else {

          setFullName("");
          setEmail("");
          setSubject("");
          setMessage("");
        }

      } else {
        
        Swal.fire({
          icon: 'error',
          text: 'Ha ocurrido un error al enviar tu consulta. Por favor, inténtalo de nuevo más tarde.',
          confirmButtonText: "Aceptar",
          showCancelButton: false,
          background: '#233876aa',
          color: 'white',  
        })
      }
    }

    
  }
   

return (
  <div className="py-10 min-h-[90vh] bg-[#adb6aaa8] dark:bg-[#171731] flex items-center justify-center px-4">
    
    {ShowLoader && <Loader />}

    <div className="w-full max-w-6xl bg-[#adb6aa] dark:bg-gray-800 dark:text-[#CEC19F] rounded-xl shadow-lg p-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

        {/* ================= FORMULARIO ================= */}
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            Contáctanos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            ¿Tienes una queja o consulta?, escribénos y pronto te atenderemos.
          </p>

          <form className="space-y-5">

            {!Autenticate && (
              <div>
                <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={FullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            )}

            {!Autenticate && (
              <div>
                <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 
                             focus:ring-2 focus:ring-blue-500 outline-none
                             dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                Asunto
              </label>
              <input
                type="text"
                value={Subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Asunto del mensaje"
                className="w-full rounded-md border border-gray-300 px-4 py-2 
                           focus:ring-2 focus:ring-blue-500 outline-none
                           dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                Mensaje
              </label>
              <textarea
                rows="4"
                value={Message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="w-full rounded-md border border-gray-300 px-4 py-2 
                           focus:ring-2 focus:ring-blue-500 outline-none
                           dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={EnviarConsulta}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white 
                         font-medium py-2.5 rounded-md transition"
            >
              Enviar mensaje
            </button>

          </form>
        </div>

        {/* ================= INFO + MAPA ================= */}
        <div className="space-y-6">

          {/* MAPA */}
          <div className="w-full h-64 rounded-lg overflow-hidden shadow">
            <iframe
              title="Ubicación"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1629.0317718878473!2d-84.98432383691821!3d10.09713731861686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f9f89000d474b5f%3A0x7418d983b5fb216d!2sAbastecedor%20Adonai!5e0!3m2!1ses-419!2scr!4v1765662027551!5m2!1ses-419!2scr"
            ></iframe>
          </div>

          {/* INFO DE CONTACTO */}
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-blue-600">📍</span>
              <p>San José, Costa Rica</p>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-blue-600">📞</span>
              <p>(+506) 8888-8888</p>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-blue-600">✉️</span>
              <p>contacto@ejemplo.com</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
);

}

export default Contact
