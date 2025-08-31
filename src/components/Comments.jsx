import React from 'react'
import UserImage from "../assets/UserImage.png";

function Comments() {
    return (
        <section className="bg-gray-100 dark:bg-gray-900 py-10 px-4 border-t-2 border-gray-700">
            
            <div className="max-w-6xl mx-auto grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                
            <article className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                    <img className="w-10 h-10 me-4 rounded-full" src={UserImage} alt=""/>
                    <div className="font-medium dark:text-white">
                        <p>María González <time datetime="2020-06-10 19:00" className="block text-sm text-gray-500 dark:text-gray-400">Joined on June 2020</time></p>
                    </div>
                </div>
                <div className="flex items-center mb-1 space-x-1 rtl:space-x-reverse">
                    {/* Estrellas */}
                    <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg"><path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/></svg>
                    <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg"><path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/></svg>
                    <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg"><path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/></svg>
                    <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg"><path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/></svg>
                    <svg className="w-4 h-4 text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg"><path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/></svg>
                    <h3 className="ms-2 text-sm font-semibold text-gray-900 dark:text-white">Excelente calidad y servicio</h3>
                </div>
                <footer className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                </footer>
                <p className="mb-2 text-gray-500 dark:text-gray-400">
                    He comprado varios productos de este abastecedor y la calidad siempre ha sido sobresaliente. Cada entrega llega a tiempo y en perfecto estado.
                    Además, sus precios son muy competitivos y el servicio al cliente responde rápidamente a cualquier duda. Sin duda seguiré comprando aquí.
                </p>
              
            </article>


    
            </div>
        </section>
    )
}

export default Comments
