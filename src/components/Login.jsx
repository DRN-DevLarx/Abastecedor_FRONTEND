import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from "react";
import { Login } from '../services/Token/AuthServices';
import Swal from 'sweetalert2';
import Loader from './Loader';
import { Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { GenerateToken } from '../services/Token/sessionManager';

function LoginForm () {
  // Logout()
  const navigate = useNavigate();
  // const queryClient = useQueryClient();

  const [ShowLoader, setShowLoader] = useState(false);

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const message = localStorage.getItem("loginMessage");

    if (message) {
      Swal.fire({
        icon: "warning",
        text: message,
        confirmButtonColor: "#3B82F6",
        background: "#233876aa",
        color: "white",
      }).then(() => {
        localStorage.removeItem("loginMessage");   // Limpiar mensaje     
      });
    }
    
  }, []);


  async function LogIn(userName, password) {
      if (!userName || !password) {
          Swal.fire({
              icon: 'info',
              text: "Por favor, ingresa tu usuario y contraseña.",
              showConfirmButton: false,
              background: '#233876aa',
              color: 'white',
              timer: 3000
          });
          return;
      }

      setShowLoader(true);

      try {
          const responseLogin = await Login("token/", {
              username: userName,
              password: password,
          });

          if (responseLogin.status === 200) {
              document.cookie = `access_token=${responseLogin.data.access}; path=/; secure; SameSite=Strict`;
              document.cookie = `refresh_token=${responseLogin.data.refresh}; path=/; secure; SameSite=Strict`;

              const TOKEN = await GenerateToken(
                  { ActiveSession: "true" },
                  "Session"
              );

              if (TOKEN) {
                  navigate("/principal");
              }
          } else {
            Swal.fire({
                icon: 'error',
                text: "El usuario o contraseña es incorrecto.",
                showConfirmButton: false,
                background: '#233876aa',
                color: 'white',
                timer: 3000
            });
          }

      } catch (error) {
          console.error("Error en el login:", error);

          Swal.fire({
              icon: 'error',
              text: "Error del servidor. Si el problema persiste, por favor comuníquese con soporte.",
              showConfirmButton: false,
              background: '#233876aa',
              color: 'white',
              timer: 3500
          });

      } finally {
          setShowLoader(false);
      }
  }

  return (
    <div className="bg-[#adb6aaa8] dark:bg-[#171731] flex items-center justify-center min-h-[100vh]">
      {ShowLoader && <Loader />}

      <form className="-mt-5 md:mt-0 bg-[#adb6aa] dark:bg-gray-800 pt-3 pb-5 w-[90%] md:w-[55%] lg:w-[40%] flex flex-col gap-6 border border-gray-700 rounded-2xl">
        
        {/* Texto explicativo */}
        <div className="w-[90%] mx-auto mt-6 p-4 bg-[#38664e] rounded-lg">             
          <h2 className="text-lg font-semibold text-white mb-2">
            Bienvenido de nuevo 👋
          </h2>
          <p className="text-sm text-gray-300">
            Inicia sesión para acceder a tu carrito, hacer pedidos, dejar comentarios, consultar disponibilidad y disfrutar de una experiencia personalizada con tus productos favoritos.
          </p>
        </div>

        {/* Usuario */}
        <div className="relative w-[80%] mx-auto">
            <input type="text"onChange={e => setUserName(e.target.value)}  autoComplete='off' id="username" className="block px-2.5 pb-1.5 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-green-300 peer" placeholder=" " />
            <label htmlFor="username" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-[#adb6aafd] dark:bg-gray-800 px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Usuario</label>
        </div>

        {/* Contraseña */}
        <div className="relative w-[80%] mx-auto">
          <input type={showPassword ? "text" : "password"} onChange={e => setPassword(e.target.value)} id="password" autoComplete="off" className="peer block px-2.5 pb-1.5 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 focus:border-green-300 focus:outline-none focus:ring-0" placeholder=" "/>

          <label htmlFor="password" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-[#adb6aafd] dark:bg-gray-800 px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Contraseña</label>
          
          <button type="button" onClick={e => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-900 dark:text-white  hover:scale-120" >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Olvidé la contraseña */}
        <div className="w-[80%] mx-auto text-sm -mt-4">

          <Link to="/restablecer" className="text-blue-600 hover:underline dark:text-blue-400">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Botones */}
        <div className="flex justify-between w-[80%] mx-auto">
          <Link to="/" className="text-white flex items-center border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 text-center me-2  dark:border-gray-600  dark:hover:bg-[#00000040] dark:focus:ring-blue-800">
              <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12l4-4m-4 4 4 4"/>
              </svg>
              Volver
          </Link>

          <button type="button" onClick={e => LogIn(userName, password)} 
          className="text-white flex items-center focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-2 py-2.5 text-center bg-[#38664e] hover:bg-[#24b469] hover:text-black focus:ring-[#38664e]">
            Iniciar sesión
          </button>
        </div>

        {/* Redirección al registro */}
        <p className="mb-3 text-center text-sm font-medium text-gray-900 dark:text-gray-300">
          ¿No tienes una cuenta? 
          <Link to="/registro" className="cursor-pointer ml-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  )
}

export default LoginForm
