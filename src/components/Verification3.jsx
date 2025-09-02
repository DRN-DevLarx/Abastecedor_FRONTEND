import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Loader from './Loader'
import {PostData} from '../services/ApiServices'

function Verification3() {
    
    const navigate = useNavigate()
    const [Code, setCode] = useState()

    const [ShowModal, setShowModal] = useState(false)
    const [LoaderView, setLoaderView] = useState(false)

    //Valores del componente anterior
    const { state } = useLocation();
    const { Name, LastName, Username, phone, email } = state || {};
    
    const handleChange = (value) => {
        if (/^\d*$/.test(value)) {
            setCode(value);
        }
    };

    // Validar código de verificación
    async function ValidateCode() {
        if (Code.length == 6) {
            setLoaderView(true)
            const endpoint = 'validarCodigo/';
            const response = await PostData(endpoint, {
                correo: email,
                codigo: Code,
            });
    
    
            if (response.status === 200) {
                navigate("/confirmarRegistro", { state: { Name, LastName, Username, phone, email }});            
            } else {
                setLoaderView(false)
                setShowModal(true)
            }
        }
    }

    // Validacion para limitar el reenvio del codigo
    const ResendCode = () => {

    }

    return (
        <div className="flex items-center">
            {LoaderView && (
                <Loader/>
            )}
            <form className="w-[100%] md:mt-4 md:w-[50%] flex flex-col gap-5 mx-auto border border-gray-700 rounded-2xl pb-5 ">
                {/* Texto explicativo */}
                <div className="w-[90%] mx-auto mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">             
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¡Regístrate y disfruta de todos nuestros servicios!</h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Al registrarte, podrás agregar productos a tu carrito, hacer pedidos en línea, dejar comentarios y calificaciones, consultar disponibilidad y recibir ofertas exclusivas. 
                        Además, tendrás un historial de tus pedidos y una experiencia personalizada según tus preferencias.
                    </p>
                </div>

                <ol className="my-3 pl-[13%] flex items-center text-center justify-center w-full">
                    <li className="flex w-full items-center text-blue-600 dark:text-blue-500 after:content-[''] after:w-full after:h-1 after:border-b after:border-blue-100 after:border-4 after:inline-block dark:after:border-blue-800">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-400 rounded-full lg:h-12 lg:w-12 dark:bg-blue-800 shrink-0">
                            <svg className="w-4 h-4 text-blue-600 lg:w-6 lg:h-6 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                                <path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z"/>
                            </svg>
                        </div>
                    </li>
                    <li className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-blue-100 after:border-4 after:inline-block dark:after:border-blue-800">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-800 rounded-full lg:h-12 lg:w-12 dark:bg-blue-800 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="white" className="opacity-80 w-4 h-4 lg:w-6 lg:h-6 bi bi-person-bounding-box" viewBox="0 0 16 16">
                                <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5"/>
                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                            </svg>
                        </div>
                    </li>
                    <li className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block dark:after:border-gray-700">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 dark:bg-blue-800 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="white" className="opacity-80 w-4 h-4 lg:w-6 lg:h-6 bi bi-envelope-check-fill" viewBox="0 0 16 16">
                            <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.026A2 2 0 0 0 2 14h6.256A4.5 4.5 0 0 1 8 12.5a4.49 4.49 0 0 1 1.606-3.446l-.367-.225L8 9.586zM16 4.697v4.974A4.5 4.5 0 0 0 12.5 8a4.5 4.5 0 0 0-1.965.45l-.338-.207z"/>
                            <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686"/>
                            </svg>
                        </div>
                    </li>
                    <li className="flex items-center w-full">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 dark:bg-gray-700 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" className="opacity-80 w-4 h-4 lg:w-6 lg:h-6 bi bi-check-circle-fill" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                            </svg>
                        </div>
                    </li>
                </ol>

                <div>
                    <p id="helper-text-explanation" className="w-[70%] mx-auto text-center mb-3 text-sm text-gray-500 dark:text-gray-400">
                        Por favor, introduzca el código de 6 dígitos que le enviamos a {email} 
                        <Link to="/registroContacto" state={{ Name, LastName, Username }} className='ml-1 text-white hover:underline' >¿Correo incorrecto?</Link> 
                    </p>

                    <div className="w-[100%] flex justify-center mb-2 space-x-2 rtl:space-x-reverse">
                        <div>
                            <label for="code-1" className="sr-only">code</label>
                            <input value={Code} onChange={e => handleChange(e.target.value)} type="text" autoComplete='off' inputMode='numeric' pattern="[0-9]*" maxlength="6" data-focus-input-init data-focus-input-next="code-2" id="code-1" className="placeholder:text-3xl block w-50 h-10 py-3  font-bold tracking-widest text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder='------' />
                            
                            <div className='text-center'>
                                <p onClick={ResendCode()} id="helper-text-explanation" className="inline cursor-pointer mx-auto mb-3 text-[10px] hover:underline text-blue-500 dark:text-blue-500">¿No recibistes el código?</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center w-[80%] mx-auto">
                    <Link to={-1} className="text-white flex items-center border border-gray-800 hover:bg-gray-900 font-medium rounded-lg text-sm px-5 py-2.5 dark:border-gray-600 dark:bg-blue-600 dark:hover:bg-blue-700">Volver</Link>

                    <button onClick={() => ValidateCode()} type="button" className="text-white flex items-center border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600  dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Siguiente
                        <svg className=" rtl:rotate-0 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                    </button>
                </div>
                <p className="mb-3 text-center text-sm font-medium text-gray-900 dark:text-gray-300" >¿Ya tienes una cuenta? <Link to="/IniciarSesion" className="cursor-pointer ml-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500" > Inicia sesión </Link> </p>
                
            </form>


            {/* Modal de errores */}
            {ShowModal && (
                <div className='fixed top-0 z-999 w-full h-full flex justify-center '>
                    <div className="m-auto overflow-y-auto overflow-x-hidden z-50">
                        <div className="relative p-4 w-full max-w-md max-h-full">
                            <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                                <button type="button" onClick={() => setShowModal(false)} className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="popup-modal">
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                                <div className="p-4 md:p-5 text-center">
                                    <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                    </svg>
                                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Código de verificación no válido verifica e intenta más tarde.</h3>
                                    <button onClick={() => setShowModal(false)} className="text-white border-1 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-red-300  font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                                        Verificar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* <p id="outlined_success_help" className="mt-2 text-xs text-green-600 dark:text-green-400"><span className="font-medium">Well done!</span> Some success message.</p>     */}

        </div>
    )
}

export default Verification3
