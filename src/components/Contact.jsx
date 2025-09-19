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
    <div className="min-h-[90vh]  bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern.svg')] dark:bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern-dark.svg')] bg-cover">
     
     {ShowLoader && (
          <Loader/>
      )}      

      <div>
        <h1 className='mt-3 text-center text-white text-2xl'> ¿Tienes una queja o consulta?, escribénos y pronto te atenderemos. </h1>

        <div className='flex flex-col md:flex-row items-center justify-center gap-8 px-4 py-8'>
          {/* Formulario */}
          <form className="w-full md:w-[50%] lg:w-[40%] border-gray rounded-lg shadow-md bg-white dark:bg-transparent p-6">
            
            {!Autenticate && (
              <div className="mb-5">
                <label htmlFor="full_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Nombre y Apellido
                </label>
                <input
                  type="text"
                  id="full_name"
                  value={FullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                            focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                            dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="John Alfaro"
                  required
                />
              </div>
            )}

            {!Autenticate && (

              <div className="mb-5">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                            focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                            dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="nombre@ejemplo.com"
                  required
                />
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Asunto
              </label>
              <input
                type="text"
                id="subject"
                value={Subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                          focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                          dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                          dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Escribe el asunto"
                required
              />
            </div>

            <div className="mb-5">
              <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Mensaje
              </label>
              <textarea
                id="message"
                rows="4"
                value={Message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                          focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                          dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                          dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Escribe tu mensaje aquí.."
                required
              ></textarea>
            </div>

            <button
              type="button"
              onClick={EnviarConsulta}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none 
                        focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 
                        text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Enviar
            </button>
          </form>

          {/* Imagen */}
          <img
            className="w-full md:w-[45%] max-w-md object-contain"
            src={ContactImage}
            alt="imagen"
          />

        </div>

      </div>

    </div>
  )
}

export default Contact
