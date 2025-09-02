import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Register2 from './Register2';

function Register1() {
    const navigate = useNavigate()
    const [Name, setName] = useState("");
    const [LastName, setLastName] = useState("");
    const [Username, setUsername] = useState("");
    const [messages, setMessages] = useState({});
    const [userAvailable, setUserAvailable] = useState(null);
    
    // Reglas de validación
    const regexName = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/; // Solo letras
    const regexUser = /^[A-Za-z0-9._-]+$/; // Letras, números y . _ -
    const forbiddenWords = ["admin", "root", "test"];

    const validateField = (field, value) => {
        let message = "";
        if (!value) {
            message = "Campo obligatorio";
        } else {
            if ((field === "name")) {
                if (value.length < 3) {
                    message = "El nombre debe tener al menos 3 carácteres.";
                } else if (!regexName.test(value)) {
                    message = "Solo se permiten letras, sin espacios";
                } else if (forbiddenWords.includes(value.toLowerCase())) {
                    message = "Ese nombre está prohibido";
                }
            }
            
            if (field === "lastName") {
                
                if (value.length < 3) {
                message = "El apellido debe tener al menos 3 carácteres.";
                } else if (!regexName.test(value)) {
                    message = "Solo se permiten letras, sin espacios";
                } else if (forbiddenWords.includes(value.toLowerCase())) {
                    message = "Ese apellido está prohibido";
                }
            }

            if (field === "username") {
                if (value.length < 5) {
                    message = "El usuario debe tener al menos 5 carácteres.";
                } else if (!regexUser.test(value)) {
                    message = "Solo letras, números y . _ -";
                } else if (forbiddenWords.includes(value.toLowerCase())) {
                    message = "El usuario incluye una palabra prohibida";
                } else if (value.toLowerCase() === "usuario1") {
                    message = "Usuario no disponible ❌";
                    setUserAvailable(false);
                } else {
                    setUserAvailable(true);
                }
            }
        }
        return message;
    };

    const handleChange = (field, value) => {
        if (value.includes(" ")) return; // Bloquear espacios
        if (field === "name") setName(value);
        if (field === "lastName") setLastName(value);
        if (field === "username") setUsername(value);

        setMessages({ ...messages, [field]: validateField(field, value) });
    };

    // Validación global para habilitar botón
    const isFormValid = () => {
        const newMessages = {
            name: validateField("name", Name),
            lastName: validateField("lastName", LastName),
            username: validateField("username", Username),
        };
        setMessages(newMessages);

        // Si no hay mensajes de error, se navega
        if (!newMessages.name && !newMessages.lastName && !newMessages.username) {
            navigate("/registroContacto", { state: { Name, LastName, Username } });

        }
    };

    return (
        <div className="flex items-center">

            <form className="w-[100%] md:mt-4 md:w-[50%] flex flex-col gap-5 mx-auto border border-gray-700 rounded-2xl pb-5 ">
                {/* Texto explicativo */}
                <div className="w-[90%] mx-auto mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">             
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¡Regístrate y disfruta de todos nuestros servicios!</h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Al registrarte, podrás agregar productos a tu carrito, hacer pedidos en línea, dejar comentarios y calificaciones, consultar disponibilidad y recibir ofertas exclusivas. 
                        Además, tendrás un historial de tus pedidos y una experiencia personalizada según tus preferencias.
                    </p>
                </div>

                {/* Progreso */}
                <ol className="my-3 pl-[13%] flex items-center text-center justify-center w-full">
                    <li className="flex w-full items-center text-gray-600 dark:text-gray-500 after:content-[''] after:w-full after:h-1 after:border-b after:border-blue-100 after:border-4 after:inline-block dark:after:border-gray-800">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-400 rounded-full lg:h-12 lg:w-12 dark:bg-blue-800 shrink-0">
                            <svg className="w-4 h-4 text-blue-600 lg:w-6 lg:h-6 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                                <path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z"/>
                            </svg>
                        </div>
                    </li>
                    <li className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block dark:after:border-gray-700">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 dark:bg-gray-700 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="white" className="opacity-80 w-4 h-4 lg:w-6 lg:h-6 bi bi-person-bounding-box" viewBox="0 0 16 16">
                                <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5"/>
                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                            </svg>
                        </div>
                    </li>
                    <li className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block dark:after:border-gray-700">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 dark:bg-gray-700 shrink-0">
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

                {/* Nombre */}
                <div className="relative w-[80%] mx-auto">
                    <input onChange={(e) => handleChange("name", e.target.value)} autoComplete='off' value={Name} type="text" id="name" className="block px-2.5 pb-1.5 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                    <label htmlFor="name" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-3 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1">Nombre</label>
                    
                    {messages.name && <p className="text-red-500 text-[10px]">{messages.name}</p>}
                </div>

                {/* Apellido */}
                <div className="relative w-[80%] mx-auto">
                    <input onChange={(e) => handleChange("lastName", e.target.value)} autoComplete='off' value={LastName} type="text" id="lastname" className="block px-2.5 pb-1.5 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                    <label htmlFor="lastname" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-3 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1">Apellido</label>
                    
                    {messages.lastName && <p className="text-red-500 text-[10px]">{messages.lastName}</p>}
                </div>

                {/* Usuario */}
                <div className="relative w-[80%] mx-auto">
                    <input onChange={(e) => handleChange("username", e.target.value)} autoComplete='off' value={Username} type="text" id="username" className="block px-2.5 pb-1.5 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                    <label htmlFor="username" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-3 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1">Usuario</label>
                    
                    {messages.username ? (
                        <p className="text-red-500 text-[10px]">{messages.username}</p>
                    ) : userAvailable !== null ? (
                        userAvailable ? (
                            <p className="text-green-500 text-[10px]">Usuario disponible ✔</p>
                        ) : (
                            <p className="text-red-500 text-[10px]">Usuario no disponible ✖</p>
                        )
                    ) : null}
                </div>

                {/* Botones */}
                <div className="flex justify-between w-[80%] mx-auto">
                    <Link to={-1} className="text-white flex items-center border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600  dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12l4-4m-4 4 4 4"/>
                        </svg>
                        Volver
                    </Link>

                    <button type='button' onClick={() => isFormValid()} className="text-white flex items-center border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600  dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        Siguiente
                        <svg className=" rtl:rotate-0 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                    </button>
                </div>

                <p className="mb-3 text-center text-sm font-medium text-gray-900 dark:text-gray-300">¿Ya tienes una cuenta? <Link to="/IniciarSesion" className="cursor-pointer ml-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"> Inicia sesión </Link></p>
            </form>

        </div>
    )
}

export default Register1
