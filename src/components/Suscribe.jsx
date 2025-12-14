import React from 'react'
import { Link } from 'react-router-dom'

function Suscribe() {
    return (
        <section className="bg-[#adb6aaa8] dark:bg-[#171731] bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern.svg')] dark:bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern-dark.svg')]">
            <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 z-10 relative">
                <div className="inline-flex justify-between items-center py-1 px-1 pe-4 mb-7 text-sm text-[#38664e] bg-blue-100 rounded-full dark:bg-gray-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-gray-800">
                    <span className="text-xs bg-[#38664e] rounded-full text-white px-4 py-1.5 me-3">Explora, elige y recibe: </span> <span className="text-sm font-medium">¡Mira nuestros productos!</span> 
                    <svg className="w-2.5 h-2.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 10" fill="currentColor">
                        <path d="M1 0L6 5L1 10Z" />
                    </svg>
                </div>

                <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Ofrecemos gran cantidad de productos</h1>
                <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-200">En cada entrega, garantizamos productos necesarios, cuidando el bienestar de la comunidad y ofreciendo precios que suman, no que restan. Suscribéte y recibe notificaciones cuando haya un nuevo producto. </p>
                <div className="w-full max-w-md mx-auto">   
                    <label htmlFor="default-email" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Email sign-p</label>
                        <button type="button" className="text-white bg-[#38664e] hover:bg-[#219e5d9a] hover:text-black focus:ring-4 focus:outline-none focus:ring-[#38664e] font-medium rounded-lg text-sm px-4 py-2  dark:hover:bg-[#CCBFA4] y">Suscribirme</button>
                </div>
            </div>
        </section> 
    )
}

export default Suscribe



