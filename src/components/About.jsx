import React from 'react'

function About() {
    return (
        <section class="bg-[#adb6aaa8] dark:bg-[#171731]">
            <div class="container px-6 py-10 mx-auto">
                <h1 class="text-2xl font-semibold text-gray-800 capitalize lg:text-3xl dark:text-white"> Sobre Nosotros</h1>

                <div class="mt-2">
                    <span class="inline-block w-40 h-1 bg-[#38664e] rounded-full"></span>
                    <span class="inline-block w-3 h-1 ml-1 bg-[#38664e] rounded-full"></span>
                    <span class="inline-block w-1 h-1 ml-1 bg-[#38664e] rounded-full"></span>
                </div>

                <div class="mt-0 lg:flex lg:items-center">
                    <div class="grid w-full grid-cols-2 gap-8 lg:w-1/2 xl:gap-16 md:grid-cols-2">

                        <div class="space-y-3 col-span-2">

                            <p class="text-gray-500 dark:text-gray-300">
                                En Adonay nos dedicamos a conectar productos con las personas que los necesitan. Nos enfocamos en ofrecer abastecimiento eficiente, precios accesibles y soluciones confiables. Creemos que un suministro responsable puede generar impacto positivo en la comunidad, fortaleciendo la economía local y apoyando el desarrollo sostenible.
                            </p>
                        </div>

                        <div class="space-y-3">
                            <h1 class="text-xl font-semibold text-gray-700 capitalize dark:text-white">Visión</h1>

                            <p class="text-gray-500 dark:text-gray-300">
                                Ser la empresa líder en abastecimiento de productos, reconocida por su eficiencia, responsabilidad social y compromiso con comunidades y clientes, contribuyendo al bienestar y crecimiento sostenible en cada mercado que servimos.
                            </p>
                        </div>

                        <div class="space-y-3">
                            <h1 class="text-xl font-semibold text-gray-700 capitalize dark:text-white"> Misión </h1>

                            <p class="text-gray-500 dark:text-gray-300">
                                Proveer productos de manera confiable y accesible, garantizando disponibilidad constante, atención personalizada y soluciones innovadoras, para generar valor a nuestros clientes y fortalecer a las comunidades donde operamos.
                            </p>
                        </div>
                    </div>

                    <div class="hidden lg:flex lg:w-1/2 lg:justify-center">
                        <img class="w-[28rem] h-[28rem] flex-shrink-0 object-cover xl:w-[25rem] xl:h-[25rem] rounded-full" src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt=""/>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default About
