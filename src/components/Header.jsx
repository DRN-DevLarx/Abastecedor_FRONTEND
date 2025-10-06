import React from 'react'
import { Link } from 'react-router-dom'

import IMG from '../assets/ContactImage.svg'

function Header() {
    return (
        
    <section className="h-[500px] bg-center bg-no-repeat bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/conference.jpg')] bg-gray-700 bg-blend-multiply">
        <div className="px-4 mx-auto max-w-screen-xl text-center h-[100%] flex flex-col justify-center ">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl"> Ofrecemos gran cantidad <br /> de productos</h1>
            <p className="mb-8 text-lg font-normal text-gray-300 lg:text-xl sm:px-16 lg:px-48">En cada entrega, garantizamos productos necesarios, cuidando el bienestar de la comunidad y ofreciendo precios que suman, no que restan. <br /><br />
                Suscribéte y recibe notificaciones cuando haya un nuevo producto. ¡Registrate y mira todos los productos disponibles ahora!</p>
            
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
                <Link  to="/IniciarSesion" className="inline-flex justify-center items-center py-3 px-5 text-base text-center text-black font-bold rounded-lg bg-[#38664e] hover:bg-[#CCBFA4] focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
                    Iniciar sesión
                    <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                </Link>
                
                <Link to="/registro" className="inline-flex justify-center hover:text-black items-center py-3 px-5 sm:ms-4 text-base font-bold text-center text-white rounded-lg border border-[#38664e] hover:bg-[#ccbfa487] focus:ring-4 focus:ring-[#38664e]">
                    Registrarme
                </Link>  
            </div>
        </div>
    </section>
    )
}

export default Header
