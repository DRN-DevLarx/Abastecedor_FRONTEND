import React from 'react'
import { Link } from 'react-router-dom'

function Login () {
  return (
    <div className="flex items-center">
      <form className="w-[100%] md:mt-4 md:w-[50%] flex flex-col gap-5 mx-auto border border-gray-700 rounded-2xl pb-5">
        
        {/* Texto explicativo */}
        <div className="w-[90%] mx-auto mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">             
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Bienvenido de nuevo 👋
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Inicia sesión para acceder a tu carrito, hacer pedidos, dejar comentarios, consultar disponibilidad y disfrutar de una experiencia personalizada con tus productos favoritos.
          </p>
        </div>

        {/* Usuario */}
        <div class="relative w-[80%] mx-auto">
            <input type="text" autoComplete='off' id="username" class="block px-2.5 pb-1.5 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
            <label for="username" class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Usuario</label>
        </div>

        {/* Contraseña */}
        <div className="relative w-[80%] mx-auto">
          <input 
            type="password" 
            id="password" 
            autoComplete="off"
            className="peer block px-2.5 pb-1.5 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600" 
            placeholder=" " 
          />
            <label for="password" class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Contraseña</label>

        </div>

        {/* Recordarme + Olvidé contraseña */}
        <div className="w-[80%] mx-auto flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
            Recordarme
          </label>
          <Link to="/recuperar" className="text-blue-600 hover:underline dark:text-blue-400">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Botones */}
        <div className="flex justify-between w-[80%] mx-auto">
          <Link 
            to={-1} 
            className="text-white flex items-center border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <svg className="w-6 h-6 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12l4-4m-4 4 4 4"/>
            </svg>
            Volver
          </Link>

          <button 
            type="submit"
            className="text-white flex items-center border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2 dark:border-gray-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Iniciar sesión
          </button>
        </div>

        {/* Redirección al registro */}
        <p className="mb-3 text-center text-sm font-medium text-gray-900 dark:text-gray-300">
          ¿No tienes una cuenta? 
          <Link to="/registro" className="cursor-pointer ml-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Login
