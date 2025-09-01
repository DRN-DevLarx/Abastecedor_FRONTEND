import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react';

function Confirm4() {

    const navigate = useNavigate()
    const [ViewModal, setViewModal] = useState(false)
    const [AcceptedTermsCheked, setAcceptedTermsCheked] = useState(false)

    const AcceptedTerms = (condition) => {
        if (condition == "Accept") {
            setViewModal(false)
            setAcceptedTermsCheked(true)
        } 
        else if (condition == "Decline"){
            setViewModal(false)
            setAcceptedTermsCheked(false)
        } else {
            setAcceptedTermsCheked(prevState => !prevState)
        }
    }

    return (
        <div class="flex items-center">

            <form class="w-[100%] md:mt-4 md:w-[50%] flex flex-col gap-5 mx-auto border border-gray-700 rounded-2xl pb-5 ">
                {/* Texto explicativo */}
                <div className="w-[90%] mx-auto mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">             
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¡Regístrate y disfruta de todos nuestros servicios!</h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Al registrarte, podrás agregar productos a tu carrito, hacer pedidos en línea, dejar comentarios y calificaciones, consultar disponibilidad y recibir ofertas exclusivas. 
                        Además, tendrás un historial de tus pedidos y una experiencia personalizada según tus preferencias.
                    </p>
                </div>

                <ol class="my-3 pl-[13%] flex items-center text-center justify-center w-full">
                    <li class="flex w-full items-center text-blue-600 dark:text-blue-500 after:content-[''] after:w-full after:h-1 after:border-b after:border-blue-100 after:border-4 after:inline-block dark:after:border-blue-800">
                        <div class="flex items-center justify-center w-10 h-10 bg-blue-400 rounded-full lg:h-12 lg:w-12 dark:bg-blue-800 shrink-0">
                            <svg class="w-4 h-4 text-blue-600 lg:w-6 lg:h-6 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                                <path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z"/>
                            </svg>
                        </div>
                    </li>
                    <li class="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-blue-100 after:border-4 after:inline-block dark:after:border-blue-800">
                        <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full lg:h-12 lg:w-12 dark:bg-blue-800 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="white" class="opacity-80 w-4 h-4 lg:w-6 lg:h-6 bi bi-person-bounding-box" viewBox="0 0 16 16">
                                <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5"/>
                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                            </svg>
                        </div>
                    </li>
                    <li class="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block dark:after:border-blue-800">
                        <div class="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 dark:bg-blue-800 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="white" class="opacity-80 w-4 h-4 lg:w-6 lg:h-6 bi bi-envelope-check-fill" viewBox="0 0 16 16">
                            <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.026A2 2 0 0 0 2 14h6.256A4.5 4.5 0 0 1 8 12.5a4.49 4.49 0 0 1 1.606-3.446l-.367-.225L8 9.586zM16 4.697v4.974A4.5 4.5 0 0 0 12.5 8a4.5 4.5 0 0 0-1.965.45l-.338-.207z"/>
                            <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686"/>
                            </svg>
                        </div>
                    </li>
                    <li class="flex items-center w-full">
                        <div class="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 dark:bg-blue-800 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" class="opacity-80 w-4 h-4 lg:w-6 lg:h-6 bi bi-check-circle-fill" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                            </svg>
                        </div>
                    </li>
                </ol>


                <div class="relative z-999 w-[80%] mx-auto">
                    {/*Password */}
                    <input type="password" id="password" autocomplete="off" class="peer block px-2.5 pb-1.5 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600" placeholder=" "/>

                    <label for="password" class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Contraseña</label>

                    {/* Popover */}
                    <div class="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 z-10 opacity-0 invisible peer-focus:opacity-100 peer-focus:visible transition-opacity duration-300 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg shadow-xs w-90 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                        <div class="p-3 space-y-2">
                        <p class="  dark:text-white">Nivel de dificultad </p>
                        <div class="w-[80%]  grid grid-cols-3 gap-2">
                            <div class="h-1 bg-orange-300 dark:bg-orange-400"></div>
                            <div class="h-1 bg-gray-200 dark:bg-gray-600"></div>
                            <div class="h-1 bg-gray-200 dark:bg-gray-600"></div>
                        </div>
                        <h3>La contraseña debe tener:</h3>
                        <ul>
                            <li class="flex items-center"> ❌ Al menos 6 carácteres. </li>
                            <li class="flex items-center"> ❌ Al menos una letra mayúscula y minúscula.</li>
                            <li class="flex items-center"> ❌ Al menos un símbolo. </li>
                            <li class="flex items-center"> ❌ Al menos un número. </li>
                        </ul>
                        </div>
                    </div>
                </div>

                <div class="relative z-999 w-[80%] mx-auto">
                    {/*Confirm */}
                    <input type="password" id="confirm" autocomplete="off" class="peer block px-2.5 pb-1.5 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600" placeholder=" "/>

                    <label for="confirm" class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Confirmar contraseña</label>

                    {/* Popover */}
                    <div class="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 z-10 opacity-0 invisible peer-focus:opacity-100 peer-focus:visible transition-opacity duration-300 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg shadow-xs w-90 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                        <div class="p-3 space-y-2">
                        <p class="  dark:text-white">Nivel de dificultad </p>
                        <div class="w-[80%]  grid grid-cols-3 gap-2">
                            <div class="h-1 bg-orange-300 dark:bg-orange-400"></div>
                            <div class="h-1 bg-gray-200 dark:bg-gray-600"></div>
                            <div class="h-1 bg-gray-200 dark:bg-gray-600"></div>
                        </div>
                        <h3>La contraseña debe tener:</h3>
                        <ul>
                            <li class="flex items-center"> ❌ Al menos 6 carácteres. </li>
                            <li class="flex items-center"> ❌ Al menos una letra mayúscula y minúscula.</li>
                            <li class="flex items-center"> ❌ Al menos un símbolo. </li>
                            <li class="flex items-center"> ❌ Al menos un número. </li>
                        </ul>
                        </div>
                    </div>
                </div>


                <div className="w-[80%] mx-auto flex items-start mb-6">
                    <div className="flex items-center h-5">
                        <input onClick={() => AcceptedTerms()} id="terminos" type="checkbox" checked={AcceptedTermsCheked} value="" className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-2 focus:ring-red-300 dark:bg-gray-400 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
                    </div>
                    <label htmlFor="terminos" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Acepto los 
                    </label>

                    <p onClick={() => setViewModal(true)} className="cursor-pointer ml-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">términos y condiciones</p>.
                    
                </div>

                <div class="flex justify-between w-[80%] mx-auto">

                    <Link to={-1} class="text-white flex items-center border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600  dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12l4-4m-4 4 4 4"/>
                        </svg>
                        Volver
                    </Link>

                    <Link to="/IniciarSesion" class="text-white flex items-center border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600  dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Registrarme
                      
            
                    </Link>
                </div>
                <p class="mb-3 text-center text-sm font-medium text-gray-900 dark:text-gray-300" >¿Ya tienes una cuenta? <Link to="/IniciarSesion" class="cursor-pointer ml-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500" > Inicia sesión </Link> </p>
                
            </form>

            
            {/* <p id="outlined_success_help" class="mt-2 text-xs text-green-600 dark:text-green-400"><span class="font-medium">Well done!</span> Some success message.</p>     */}


            {ViewModal && (
                <div className='fixed w-full flex justify-center z-999'>
                    <div className=" w-full max-w-md md:max-w-2xl max-h-full">
                        <div className="relative bg-white rounded-lg shadow-lg dark:bg-gray-700 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Términos y condiciones</h3>
                            <button type="button" className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1 md:p-2 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setViewModal(false)}>
                            <svg className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Cerrar modal</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="scrollbar-custom p-3 md:p-5 space-y-3 md:space-y-4 text-gray-600 dark:text-gray-300 text-sm md:text-base overflow-y-auto max-h-[70vh]">
                            <p>Bienvenido/a a nuestra plataforma. Al utilizar nuestros servicios, usted acepta los presentes Términos y Condiciones, que regulan el uso de los productos, servicios y recursos ofrecidos por la compañía.</p>
                            <p>El acceso y uso de nuestros servicios implica la aceptación plena y sin reservas de todas las disposiciones aquí incluidas. La compañía se reserva el derecho de actualizar, modificar o ampliar los términos cuando lo considere necesario, con el fin de adaptarlos a cambios normativos, tecnológicos o de servicio.</p>
                            <p>La compañía se compromete a ofrecer productos y servicios de calidad, garantizando precios accesibles y un trato justo hacia todas las personas usuarias.</p>
                            <p>La compañía no se responsabiliza por interrupciones, fallos técnicos o causas de fuerza mayor que pudieran afectar el acceso temporal a los servicios. Sin embargo, se trabajará constantemente para garantizar la disponibilidad y seguridad de la plataforma.</p>
                            <p>Estos términos forman parte del acuerdo legal entre la compañía y sus usuarios. Se recomienda revisarlos periódicamente para estar al tanto de posibles cambios.</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 md:mt-6">Última actualización: 31 de agosto de 2025</p>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col md:flex-row justify-end items-center p-3 md:p-5 border-t border-gray-200 dark:border-gray-600 gap-2 md:gap-3">
                            <button onClick={() => AcceptedTerms("Accept")} className="w-full md:w-auto text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Acepto</button>

                            <button onClick={() => AcceptedTerms("Decline")} className="w-full md:w-auto text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Rechazo</button>
                        </div>
                        </div>
                    </div>
                </div>
                
            )}

        </div>
    )
}

export default Confirm4
