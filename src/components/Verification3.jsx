import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Loader from './Loader'
import {GetData, PostData} from '../services/ApiServices'
import Swal from 'sweetalert2'

function Verification3() {
    
    const navigate = useNavigate()
    const emailForVerification = sessionStorage.getItem('emailForVerification') || '';
    const [TemporaryData, setTemporaryData] = useState({})
        
    const [Code, setCode] = useState("")

    const [ShowModal, setShowModal] = useState(false)
    const [ShowLoader, setShowLoader] = useState(false)
    
    // Cooldown para reenviar
    const [cooldown, setCooldown] = useState(0);
    const [intervalId, setIntervalId] = useState(null);


    const handleChange = (value) => {
        if (/^\d*$/.test(value)) {
            setCode(value);
        }
    };

    useEffect(() => {
        // Fetch inicial de datos
        const fetchData = async () => {
            const TemporaryDataGet = await GetData('registroTemporal/');

            if (TemporaryDataGet) {
                const item = TemporaryDataGet.find((item) => item.email === emailForVerification);
                
                if (item) {
                    setTemporaryData(item);
                }
            }
        };

        fetchData();

        // Manejo del cooldown
        if (cooldown > 0) {
            const id = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);

            setIntervalId(id);

            // limpiar intervalo cuando cooldown cambie o se desmonte
            return () => clearInterval(id);
        } else {
            clearInterval(intervalId);
            setIntervalId(null);
        }
        
    }, [cooldown, emailForVerification]); 

    // Validar código de verificación
    async function ValidateCode() {
        if (Code.length === 6) {
            setShowLoader(true);
            const endpoint = 'validarCodigo/';

            try {
                const response = await PostData(endpoint, {
                    correo: TemporaryData.email,
                    codigo: Code,
                });

                setShowLoader(false);

                if (response.status === 200) {
                    // Código correcto
                    navigate("/confirmarRegistro");

                } else if (response.status === 400) {
                    // Código incorrecto o expirado
                    Swal.fire({
                        icon: "error",
                        title: "Código no válido",
                        text: response.data.error || "Verifica e intenta más tarde.",
                        confirmButtonText: "Verificar",
                        confirmButtonColor: "#3B82F6",
                        background: "#233876aa",
                        color: "white",
                    });

                } else if (response.status === 500) {
                    // Error del servidor
                    Swal.fire({
                        icon: "error",
                        title: "Error en el servidor",
                        text: response.data.error || "Intenta nuevamente más tarde.",
                        confirmButtonText: "Aceptar",
                        confirmButtonColor: "#3B82F6",
                        background: "#233876aa",
                        color: "white",
                    });

                } else {
                    //  Respuesta inesperada
                    Swal.fire({
                        icon: "info",
                        title: "Respuesta inesperada",
                        text: "Código: " + response.status,
                        confirmButtonText: "Aceptar",
                        confirmButtonColor: "#3B82F6",
                        background: "#233876aa",
                        color: "white",
                    });
                }

            } catch (error) {
                setShowLoader(false);
                //  Error de conexión
                Swal.fire({
                    icon: "error",
                    title: "Error de conexión",
                    text: "No se pudo conectar con el servidor. Intenta más tarde.",
                    confirmButtonText: "Aceptar",
                    confirmButtonColor: "#3B82F6",
                    background: "#233876aa",
                    color: "white",
                });
            }
        } else {
            // Código incompleto
            Swal.fire({
                icon: "warning",
                title: "Código incompleto",
                text: "El código debe tener 6 dígitos.",
                confirmButtonText: "Aceptar",
                confirmButtonColor: "#3B82F6",
                background: "#233876aa",
                color: "white",
            });
        }
    }

    async function ResendCode() {
        if (cooldown > 0) return; // no dejar reenviar si está en cooldown

        setShowLoader(true);
        const endpoint = "reenviarCodigo/";

        try {
            const response = await PostData(endpoint, {
                correo: TemporaryData.email,
                nombre: TemporaryData.nombre,
            });

            setShowLoader(false);

            if (response.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Código reenviado",
                    text: response.data.mensaje || "Revisa tu correo 📩",
                    confirmButtonColor: "#3B82F6",
                    background: "#233876aa",
                    color: "white",
                    timer: 2000,
                    showConfirmButton: false,
                });

                // Iniciar contador regresivo según wait_time
                setCooldown(response.data.wait_time);
            
            } 
            else if (response.status === 429) {
                // Cooldown impuesto por el backend
                setCooldown(response.data.wait_time);

                Swal.fire({
                    icon: "info",
                    title: "Demasiados intentos",
                    text: response.data.error || "Debes esperar antes de reenviar.",
                    confirmButtonColor: "#3B82F6",
                    background: "#233876aa",
                    color: "white",
                });
            } 
            else if (response.status === 400) {
                Swal.fire({
                    icon: "warning",
                    title: "Error de validación",
                    text: response.data.error || "Correo inválido.",
                    confirmButtonColor: "#3B82F6",
                    background: "#233876aa",
                    color: "white",
                });
            } else if (response.status === 500) {
                Swal.fire({
                    icon: "error",
                    title: "Error del servidor",
                    text: response.data.error || "Intenta más tarde.",
                    confirmButtonColor: "#3B82F6",
                    background: "#233876aa",
                    color: "white",
                });
            } else {
                Swal.fire({
                    icon: "info",
                    title: "Respuesta inesperada",
                    text: "Código: " + response.status,
                    confirmButtonColor: "#3B82F6",
                    background: "#233876aa",
                    color: "white",
                });
            }
        } catch (error) {
            setShowLoader(false);
            Swal.fire({
                icon: "error",
                title: "Error de conexión",
                text: "No se pudo conectar con el servidor. Intenta más tarde.",
                confirmButtonColor: "#3B82F6",
                background: "#233876aa",
                color: "white",
            });
        }
    }


    return (
        <div className="bg-[#adb6aaa8] dark:bg-[#171731] flex items-center justify-center min-h-[100vh] overflow-auto">
            {ShowLoader && (
                <Loader/>
            )}
            <form className="bg-[#adb6aa] dark:bg-gray-800 py-4 w-[90%] md:w-[55%] lg:w-[40%] flex flex-col gap-3 rounded-2xl ">
                {/* Texto explicativo */}
                <div className="w-[90%] mx-auto py-2 px-4 bg-[#38664e] rounded-lg">             
                    <h2 className="text-lg font-semibold text-white mb-1">¡Regístrate y disfruta de todos nuestros servicios!</h2>
                    <p className="text-sm text-gray-300">
                        Al registrarte, podrás agregar productos a tu carrito, hacer pedidos en línea, dejar comentarios y calificaciones, consultar disponibilidad, recibir ofertas exclusivas entre otras cosas más.
                    </p>
                </div>


                {/* Progreso */}
                 <div className='flex items-center w-full'>
                    <ol className="flex justify-between w-[80%] mx-auto">
                        <li className="flex w-full items-center dark:text-gray-500 after:content-[''] after:w-full after:h-1 after:border-b after:border-[#38664e] after:border-4 after:inline-block">
                            <div className="flex items-center justify-center w-12 h-12 bg-[#38664e] rounded-full shrink-0">
                                <svg className="w-6 h-6 text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                                    <path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z"/>
                                </svg>
                            </div>
                        </li>

                        <li className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b  after:border-[#38664e] after:border-4 after:inline-block">
                            <div className="flex items-center justify-center w-12 h-12 bg-[#38664e] rounded-full shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="text-blue-300 w-6 h-6 bi bi-person-bounding-box" viewBox="0 0 16 16">
                                    <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5"/>
                                    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                </svg>
                            </div>
                        </li>
                        <li className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-300 after:border-4 after:inline-block dark:after:border-gray-700">
                            <div className=" flex items-center justify-center w-12 h-12 bg-[#38664e] rounded-full shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="text-blue-300 w-6 h-6 bi bi-envelope-check-fill" viewBox="0 0 16 16">
                                    <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.026A2 2 0 0 0 2 14h6.256A4.5 4.5 0 0 1 8 12.5a4.49 4.49 0 0 1 1.606-3.446l-.367-.225L8 9.586zM16 4.697v4.974A4.5 4.5 0 0 0 12.5 8a4.5 4.5 0 0 0-1.965.45l-.338-.207z"/>
                                    <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686"/>
                                </svg>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center justify-center w-12 h-12 bg-gray-500 rounded-full dark:bg-gray-700 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" className="text-blue-300 w-6 h-6 bi bi-check-circle-fill" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                </svg>
                            </div>
                        </li>
                    </ol>
                </div>

                <div>
                    <p id="helper-text-explanation" className="w-[70%] mx-auto text-center mb-3 text-sm text-black dark:text-gray-400">
                        Por favor, introduzca el código de 6 dígitos que le enviamos a {emailForVerification} 
                        <Link 
                        to="/registroContacto" 
                        state={{ Name: TemporaryData.nombre, LastName: TemporaryData.apellido, Username: TemporaryData.username }} 
                        className='ml-1 text-white font-bold hover:underline'
                        >
                        ¿Correo incorrecto?
                        </Link>
                    </p>

                    <div className="w-[100%] flex justify-center mb-2 space-x-2 rtl:space-x-reverse">
                        <div>
                            <label for="code-1" className="sr-only">code</label>
                            <input value={Code} onChange={e => handleChange(e.target.value)} type="text" autoComplete='off' inputMode='numeric' pattern="[0-9]*" maxlength="6" data-focus-input-init data-focus-input-next="code-2" id="code-1" 
                            className="placeholder:text-3xl block w-50 h-10 py-3  font-bold tracking-widest text-center text-gray-900 border rounded-lg  bg-gray-400 dark:bg-gray-700 dark:text-white focus:border-[#00ff7b] focus:ring-0" placeholder='------' />
                            
                            <div className='text-center'>
                                <button type='button' onClick={ResendCode} disabled={cooldown > 0} className={`inline cursor-pointer mx-auto my-3 text-[14px] ${ cooldown > 0 ? "text-gray-500 cursor-not-allowed" : "text-blue-600 hover:underline" }`}>
                                    {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar código" }
                                </button>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center w-[80%] mx-auto">

                <button type='button' onClick={() => ValidateCode()} className="text-white flex items-center font-medium rounded-lg text-sm px-5 py-2.5 bg-[#38664e] hover:bg-[#24b469] hover:text-black focus:ring-[#38664e]">
                    Siguiente
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
