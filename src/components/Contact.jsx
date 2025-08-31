import React from 'react'
import ContactImage from '../assets/ContactImage.svg'

function Contact() {
  return (
    <div className="min-h-[90vh] flex flex-col md:flex-row items-center justify-center gap-8 px-4 py-8 bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern.svg')] dark:bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern-dark.svg')] bg-cover">
      
      {/* Formulario */}
      <form className="w-full md:w-[50%] lg:w-[40%] border-1 rounded-lg shadow-md bg-white dark:bg-gray-800 p-6">
        <div className="mb-5">
          <label htmlFor="full_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Nombre completo
          </label>
          <input
            type="text"
            id="full_name"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                       focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                       dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                       dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="John Doe"
            required
          />
        </div>

        <div className="mb-5">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                       focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                       dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                       dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="nombre@ejemplo.com"
            required
          />
        </div>

        <div className="mb-5">
          <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Asunto
          </label>
          <input
            type="text"
            id="subject"
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                       focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                       dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                       dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Escribe tu mensaje aquí.."
            required
          ></textarea>
        </div>

        <button
          type="submit"
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
  )
}

export default Contact
