import React from 'react'

function About() {
    return (
        <section id="About" class="bg-[#adb6aaa8] dark:bg-[#171731]">
            <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16">

                <div class="w-[100%] sm:w-[80%] mx-auto bg-[#adb6aa] dark:bg-gray-800 dark:border-gray-700 rounded-lg p-8 md:p-7 mb-8">
                    <span class="bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-blue-400 mb-2">
                        Productos confiables a tu alcance.
                    </span>
                    <h1 class="text-gray-900 dark:text-white text-3xl md:text-4xl font-extrabold mb-2">Acerca de nosotros</h1>
                    <p class="text-lg font-normal text-black dark:text-gray-400 mb-6">"En Adonay nos dedicamos a conectar productos con las personas que los necesitan. Nos enfocamos en ofrecer abastecimiento eficiente, precios accesibles y soluciones confiables. Creemos que un suministro responsable puede generar impacto positivo en la comunidad, fortaleciendo la economía local y apoyando el desarrollo sostenible."</p>
                </div>
                
                <div class="w-[100%] sm:w-[80%] mx-auto grid md:grid-cols-2 gap-8">
                    <div class="bg-[#adb6aa] dark:bg-gray-800 dark:border-gray-700 rounded-lg px-8 md:p-12">
                        
                    <span class="bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-blue-400 mb-2">
                        Creciendo con nuestra comunidad.
                    </span>
                        <h2 class="text-gray-900 dark:text-white text-3xl font-extrabold mb-2">Visión</h2>
                        <p class="text-lg font-normal text-black dark:text-gray-400 mb-4">Ser la empresa líder en abastecimiento de productos, reconocida por su eficiencia, responsabilidad social y compromiso con comunidades y clientes, contribuyendo al bienestar y crecimiento sostenible en cada mercado que servimos.</p>
                
                    </div>
                    <div class="bg-[#adb6aa] dark:bg-gray-800 dark:border-gray-700 rounded-lg px-8 md:p-12">
                    <span class="bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-blue-400 mb-2">
                        Comprometidos con la comunidad y el cliente.
                    </span>
                        <h2 class="text-gray-900 dark:text-white text-3xl font-extrabold mb-2">Misión</h2>
                        <p class="text-lg font-normal text-black dark:text-gray-400 mb-4">Proveer productos de manera confiable y accesible, garantizando disponibilidad constante, atención personalizada y soluciones innovadoras, para generar valor a nuestros clientes y fortalecer a las comunidades donde operamo.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default About
