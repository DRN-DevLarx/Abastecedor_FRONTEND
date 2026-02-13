import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Loader from './Loader'
import { GetData, PostData } from '../services/ApiServices';
import Swal from 'sweetalert2'
import { Eye, EyeOff } from "lucide-react";

function Confirm4() {

    const navigate = useNavigate()
    const emailForVerification = sessionStorage.getItem('emailForVerification') || '';
    const [TemporaryData, setTemporaryData] = useState({})

    const [Password, setPassword] = useState("")
    const [ConfirmPassword, setConfirmPassword] = useState("")
    const [Message, setMessage] = useState("")
    const [Message2, setMessage2] = useState("")

    const [Validation1, setValidation1] = useState("❌")
    const [Validation2, setValidation2] = useState("❌")
    // const [Validation3, setValidation3] = useState("❌")
    const [Validation4, setValidation4] = useState("❌")    

    const [ShowModal, setShowModal] = useState(false)
    const [ShowLoader, setShowLoader] = useState(false)
    
    const [ShowPassword, setShowPassword] = useState(false);
    const [AcceptedTermsCheked, setAcceptedTermsCheked] = useState(false)
    const [MessageTerms, setMessageTerms] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            const TemporaryDataGet = await GetData('registroTemporal/');

            if (TemporaryDataGet) {
                const item = TemporaryDataGet.find((item) => item.email === emailForVerification);
                
                if (item) {
                    setTemporaryData(item);
                }  else {
                    navigate("/registro")
                }
            }
        };

        fetchData();
    }, []);    

    //Validaciones de contraseña
    const ValidatePassword = (e) => {
        const value = e.target.value;
        setPassword(value);

        // 1️⃣ Al menos 6 caracteres
        const validLength = value.length >= 6;
        setValidation1(validLength ? "✅" : "❌");

        // 2️⃣ Al menos una mayúscula y una minúscula
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const validCase = hasUpper && hasLower;
        setValidation2(validCase ? "✅" : "❌");

        // 3️⃣ Al menos un símbolo
        // const validSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        // setValidation3(validSymbol ? "✅" : "❌");

        // 4️⃣ Al menos un número
        const validNumber = /[0-9]/.test(value);
        setValidation4(validNumber ? "✅" : "❌");

        // Mensaje si la contraseña es insegura
        const isSecure = validLength && validCase && validNumber;
        setMessage(isSecure ? "" : "La contraseña es insegura ❌");
    };

    const ValidateConfirm = (e) => {
        const ConfirmValue = e.target.value;
        setConfirmPassword(ConfirmValue);

        if (ConfirmValue !== Password) {
            setMessage2("Las contraseñas no coinciden ❌");
        } else if ([Validation1, Validation2, Validation4].every(v => v === "✅")) {
            setMessage(""); // Limpiar mensaje si todo está bien
            setMessage2(""); // Limpiar mensaje si todo está bien
        } 
    };

    const AcceptedTerms = (condition) => {
        if (condition == "Accept") {
            setShowModal(false)
            setAcceptedTermsCheked(true)
        } 
        else if (condition == "Decline"){
            setShowModal(false)
            setAcceptedTermsCheked(false)
        } else {
            setAcceptedTermsCheked(prevState => !prevState)
        }
    }

    // Funcion de registrar usuario
    async function PostRegister() {
      
        
        let valid = true;

        // Validar contraseña
        if (Password.length === 0) {
            setMessage("Campo obligatorio");
            valid = false;
        }

        // Validar confirmación
        if (ConfirmPassword.length === 0) {
            setMessage2("Campo obligatorio");
            valid = false;
        } 

        // Validar términos
        if (!AcceptedTermsCheked) {
            setMessageTerms("Casilla faltante");
            valid = false;
        } else {
            setMessageTerms("");
        }

        // Si no hay errores => registrar
        if (valid && Message === "" && Message2 === "" && MessageTerms === "") {

            // Registro de usuarios
            setShowLoader(true)
            const endpoint = 'users/';
            const endpointInfo = 'informacionUsuarios/';
            const endpointGroup = 'asignarGrupo/';          

            const response = await PostData(endpoint, {
                password: Password,
                username: TemporaryData.username,
                first_name: TemporaryData.nombre,
                last_name: TemporaryData.apellido,
                email: TemporaryData.email
            });
                        
            if(response.status === 200 || response.status === 201) {                

                const responseUsersInfo = await PostData(endpointInfo, {
                    user: response.data.id,
                    telefono: TemporaryData.phone,
                    direccion: ""
                });
                                
                if (responseUsersInfo.status === 200 || responseUsersInfo.status === 201) {
                    
                    const responseUserGroup = await PostData(endpointGroup, {
                        user_id: response.data.id,
                        group_id: 2,
                    });
                    
                    setShowLoader(false)

                    if(responseUserGroup.status === 200 || responseUserGroup.status === 201) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Usuario registrado correctamente.',
                            text: 'Serás redirigido al login',
                            timer: 4000,
                            showConfirmButton: false,
                            background: '#233876aa',
                            color: 'white',
                            willClose: () => {
                                navigate('/IniciarSesion')
                            }
                        })

                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Ha ocurrido un error',
                            text: 'Si el error persiste, por favor contacte a soporte.',
                            confirmButtonText: 'Aceptar',
                            confirmButtonColor: '#3B82F6',
                            background: '#233876aa',
                            color: 'white'
                        })
                    }

                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Ha ocurrido un error',
                        text: 'Si el error persiste, por favor contacte a soporte.',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#3B82F6',
                        background: '#233876aa',
                        color: 'white'
                    })
                }

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Ha ocurrido un error',
                    text: 'Si el error persiste, por favor contacte a soporte.',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#3B82F6',
                    background: '#233876aa',
                    color: 'white'
                })
            }
        }
    };


    return (
        <div className="bg-[#adb6aaa8] dark:bg-[#171731] flex items-center justify-center min-h-[100vh]">
            {ShowLoader && (
                <Loader/>
            )}
            <form 
            className="bg-[#adb6aa] dark:bg-gray-800 py-4 w-[90%] md:w-[55%] lg:w-[40%] flex flex-col gap-7 rounded-2xl ">
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
                        <li className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-[#38664e] after:border-4 after:inline-block">
                            <div className=" flex items-center justify-center w-12 h-12 bg-[#38664e] rounded-full shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="text-blue-300 w-6 h-6 bi bi-envelope-check-fill" viewBox="0 0 16 16">
                                    <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.026A2 2 0 0 0 2 14h6.256A4.5 4.5 0 0 1 8 12.5a4.49 4.49 0 0 1 1.606-3.446l-.367-.225L8 9.586zM16 4.697v4.974A4.5 4.5 0 0 0 12.5 8a4.5 4.5 0 0 0-1.965.45l-.338-.207z"/>
                                    <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686"/>
                                </svg>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center justify-center w-12 h-12 bg-[#38664e] rounded-full shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-blue-300 w-6 h-6 bi bi-check-circle-fill" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                </svg>
                            </div>
                        </li>
                    </ol>
                </div>

                <div className="relative w-[80%] mx-auto mb-1">
                    {/* Password */}
                    <input autoComplete='off' type={ShowPassword ? "text" : "password"} id="password" value={Password} onChange={ValidatePassword} placeholder=" "
                        className="peer block px-2.5 pb-1.5 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none dark:text-white dark:border-gray-600 focus:border-green-300 focus:outline-none focus:ring-0"
                    />

                    <label
                        htmlFor="password"
                        className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-[#adb6aa] dark:bg-gray-800 px-2 
                        peer-placeholder-shown:scale-100 
                        peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 
                        peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1"
                    >
                        Contraseña
                    </label>

                    <button type="button" onClick={e => setShowPassword(!ShowPassword)} className="absolute right-3 top-3 flex items-center hover:text-white" >
                        {ShowPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>

                    {Message && <p className="absolute text-red-500 text-[13px]">{Message}</p>}

                    {/* Popover */}
                    <div className="bg-[#adb6aa] absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 invisible peer-focus:opacity-100 peer-focus:visible transition-opacity duration-300 text-sm text-gray-500 border border-gray-200 rounded-lg shadow-lg w-80 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">

                        <div className="p-3 space-y-2">
                            <p className="dark:text-white font-medium">Nivel de dificultad</p>
                            <div className="h-1 bg-gray-200 dark:bg-gray-600"></div>
                            <h3 className="font-medium">La contraseña debe tener:</h3>
                            <ul className="space-y-1">
                                <li className="flex items-center">{Validation1} Al menos 6 carácteres.</li>
                                <li className="flex items-center">{Validation2} Una mayúscula y minúscula.</li>
                                {/* <li className="flex items-center">{Validation3} Al menos un símbolo.</li> */}
                                <li className="flex items-center">{Validation4} Al menos un número.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="relative w-[80%] mx-auto mb-1">
                    {/* Confirm */}
                    <input
                        autoComplete='off'
                        type={ShowPassword ? "text" : "password"}
                        id="confirm"
                        value={ConfirmPassword}
                        onChange={ValidateConfirm}
                        className="peer block px-2.5 pb-1.5 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none dark:text-white dark:border-gray-600 focus:border-green-300 focus:outline-none focus:ring-0"
                        placeholder=" "
                    />

                    <label
                        htmlFor="confirm"
                        className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-[#adb6aa] dark:bg-gray-800 px-2 
                        peer-placeholder-shown:scale-100 
                        peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 
                        peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1"
                    >
                        Confirmar Contraseña
                    </label>
                    {Message2 && <p className="absolute text-red-500 text-[13px]">{Message2}</p>}

                </div>

                <div className='relative mb-1'>
                    <div className="w-[80%] mx-auto flex items-start">
                        <div className="flex items-center h-5">
                            <input onChange={() => AcceptedTerms()} id="terminos" type="checkbox" checked={AcceptedTermsCheked} value="" className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-2 focus:ring-red-300 dark:bg-gray-400 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
                        </div>
                        <label htmlFor="terminos" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Acepto los 
                        </label>

                        <p onClick={() => setShowModal(true)} className="cursor-pointer ml-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">términos y condiciones</p>.
                        
                    </div>
                    {MessageTerms && <p className="absolute text-red-500 text-[13px] w-[100%] pl-[10%] ">{MessageTerms}</p>}
                </div>


                <div className="flex justify-center w-[80%] mx-auto">
                    <button type='button' onClick={() => PostRegister()} className="text-white flex items-center focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 bg-[#38664e] hover:bg-[#24b469] hover:text-black focus:ring-[#38664e]">
                        Registrarme            
                    </button>
                </div>

                <p className="mb-3 text-center text-sm font-medium text-gray-900 dark:text-gray-300" >¿Ya tienes una cuenta? <Link to="/IniciarSesion" className="cursor-pointer ml-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500" > Inicia sesión </Link> </p>
            </form>

            {ShowModal && (
                <div className='absolute top-0 p-0 m-0 min-h-[100vh] w-full flex justify-center items-center z-50'>
                        <div className="relative bg-[#adb6aa] dark:bg-gray-800  max-w-md md:max-w-2xl max-h-full rounded-lg shadow-lg overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Términos y condiciones</h3>
                            <button type="button" className="text-gray-900 dark:text-gray-200  hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1 md:p-2 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setShowModal(false)}>
                            <svg className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Cerrar modal</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="scrollbar-custom p-3 md:p-5 space-y-3 md:space-y-4 text-gray-900 dark:text-gray-300 md:text-sm overflow-y-auto">
                            <p>Bienvenido/a a nuestra plataforma. Al utilizar nuestros servicios, usted acepta los presentes Términos y Condiciones, que regulan el uso de los productos, servicios y recursos ofrecidos por la compañía.</p>
                            <p>El acceso y uso de nuestros servicios implica la aceptación plena y sin reservas de todas las disposiciones aquí incluidas. La compañía se reserva el derecho de actualizar, modificar o ampliar los términos cuando lo considere necesario, con el fin de adaptarlos a cambios normativos, tecnológicos o de servicio.</p>
                            <p>La compañía se compromete a ofrecer productos y servicios de calidad, garantizando precios accesibles y un trato justo hacia todas las personas usuarias.</p>
                            <p>La compañía no se responsabiliza por interrupciones, fallos técnicos o causas de fuerza mayor que pudieran afectar el acceso temporal a los servicios. Sin embargo, se trabajará constantemente para garantizar la disponibilidad y seguridad de la plataforma.</p>
                            <p>Estos términos forman parte del acuerdo legal entre la compañía y sus usuarios. Se recomienda revisarlos periódicamente para estar al tanto de posibles cambios.</p>
                            <p className="font-bold text-sm text-gray-900 dark:text-gray-400 mt-4 md:mt-6">Última actualización: 31 de agosto de 2025</p>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col md:flex-row justify-end items-center p-3 md:p-5 border-t border-gray-200 dark:border-gray-600 gap-2 md:gap-3">
                            <button onClick={() => AcceptedTerms("Decline")} className="w-full md:w-auto text-gray-900 bg-transparent dark:text-gray-400 dark:border-gray-600 border border-gray-600 hover:bg-[#00000090] hover:text- focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center">Rechazo</button>
                            <button onClick={() => AcceptedTerms("Accept")} className="bg-[#38664e] hover:bg-[#24b469] hover:text-black focus:ring-[#38664e] w-full md:w-auto text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center">Acepto</button>
                        </div>
                        </div>
                </div>
                
            )}

        </div>
    )
}

export default Confirm4
