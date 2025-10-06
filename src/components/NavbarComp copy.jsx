
import {
  Avatar,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarToggle,
} from "flowbite-react";

import Logo from "../assets/logo.png";
import {Link, useNavigate} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getCookie, Logout, GenerateToken } from "../services/Token/sessionManager";
import { AutenticatedUserData } from "../services/Token/AuthServices";

import { GetData, PatchData } from "../services/ApiServices";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Loader from "./Loader";
import { LucideShoppingCart } from "lucide-react";


export default function NavbarComp() {

  const navigate = useNavigate()
  const [Autenticate, setAutenticate] = useState(false);
  const [ShowLoader, setShowLoader] = useState(false);
  
  const access_token = getCookie("access_token");
  const userQuery = AutenticatedUserData();

  const [Id, setId] = useState("");
  const [Username, setUsername] = useState("");
  const [UserImage, setUserImage] = useState("");
  const [IsAdmin, setIsAdmin] = useState(false);

  
  useEffect(() => {
      
      if (userQuery.status === "success" && userQuery.data) {
          setAutenticate(true)
          setId(userQuery.data.id) 
          setUsername(userQuery.data.username);

          
          if (userQuery.data.groups.includes(1)) {
            setIsAdmin(true)
          }
          
          if (!userQuery.data.is_active) {
            showPasswordResetSwal(userQuery.data.id)
          }
      }
  
      const fetchData = async () => {
          
          const GetUserInfo = await GetData("informacionUsuarios/");
                    
          // filtrar usuario por id
          const CurrentUserID = userQuery.data.id;
          const CurrenteUserInfo = GetUserInfo.find(CUInfo => CUInfo.user === CurrentUserID)
      
          if (CurrenteUserInfo) {
              setUserImage(CurrenteUserInfo.referenciaIMG);
              
              if(!CurrenteUserInfo.referenciaIMG) {
              setUserImage(DefaultImage);
              }
          } 
      }
      fetchData();
  }, [ access_token, userQuery.status, userQuery.data]);
  


  const showPasswordResetSwal = async (IdUser) => {
    let password = "";
    let confirmPassword = "";

    Swal.fire({
      title: 'Restablecer contraseña',
      confirmButtonText: 'Restablecer contraseña',
      confirmButtonColor: '#3B82F6',
      background: '#233876aa',
      color: 'white',
      html: `
        <div>
          <div class="h-16 w-100%">
            <input type="password" id="swalPassword" class="p-2 w-[60%] bg-transparent rounded-[5px]" placeholder="Nueva contraseña">
            
            <button type="button" id="togglePassword" class="absolute top-[100px] right-[130px] flex items-center text-gray-400 hover:text-white">
                <svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                </svg>
            </button>

            <p id="swalMsgPassword" class="text-left w-[60%] mx-auto bg-white text-red-600 text-[14px]"></p>
          </div>
          
          <div class="h-16 w-100%">
            <input type="password" id="swalConfirm" class="text-left p-2 w-[60%] bg-transparent rounded" placeholder="Confirmar contraseña">
            
            <button type="button" id="togglePassword2" class="absolute top-[165px] right-[130px] flex items-center text-gray-400 hover:text-white">
                <svg id="eyeIcon2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                </svg>
            </button>

            <p id="swalMsgConfirm"  class="text-left w-[60%] mx-auto bg-white text-red-600 text-[14px] mb-3"></p>
          </div>

          <div class="text-left w-[80%] mx-auto text-[12px]">
            <p id="reqLength">❌ Al menos 6 caracteres</p>
            <p id="reqCase">❌ Una mayúscula y minúscula</p>
            <p id="reqSymbol">❌ Al menos un símbolo (!@#$%^&*(),.?":{}|<>)</p>
            <p id="reqNumber">❌ Al menos un número</p>
          </div>
        </div>
      `,
      showCancelButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      preConfirm: () => {
        if (
          document.getElementById('reqLength').textContent.startsWith('✅') &&
          document.getElementById('reqCase').textContent.startsWith('✅') &&
          document.getElementById('reqSymbol').textContent.startsWith('✅') &&
          document.getElementById('reqNumber').textContent.startsWith('✅') &&
          password === confirmPassword
        ) {
          return password;
        } else {
          Swal.showValidationMessage("Corrige los errores antes de continuar");
          return false;
        }
      },
      didOpen: () => {
        const passInput = Swal.getPopup().querySelector('#swalPassword');
        const confirmInput = Swal.getPopup().querySelector('#swalConfirm');

        const msgPassword = Swal.getPopup().querySelector('#swalMsgPassword');
        const msgConfirm = Swal.getPopup().querySelector('#swalMsgConfirm');

        const reqLength = Swal.getPopup().querySelector('#reqLength');
        const reqCase = Swal.getPopup().querySelector('#reqCase');
        const reqSymbol = Swal.getPopup().querySelector('#reqSymbol');
        const reqNumber = Swal.getPopup().querySelector('#reqNumber');

        const toggleBtn = Swal.getPopup().querySelector('#togglePassword');
        const toggleBtn2 = Swal.getPopup().querySelector('#togglePassword2');
        const eyeIcon = Swal.getPopup().querySelector('#eyeIcon');
        const eyeIcon2 = Swal.getPopup().querySelector('#eyeIcon2');



        let showing = false;
        let showing2 = false;

        toggleBtn.addEventListener('click', () => {
          showing = !showing;
          passInput.type = showing ? "text" : "password";

          // Cambiar el ícono dinámicamente
          eyeIcon.innerHTML  = showing
            ? 
              `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
                <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
              </svg>`
            :
              `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
              </svg>`;
        }); 
        
        toggleBtn2.addEventListener('click', () => {
          showing2 = !showing2;
          confirmInput.type = showing2 ? "text" : "password";

          // Cambiar el ícono dinámicamente
          eyeIcon2.innerHTML  = showing2
            ? 
              `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
                <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
              </svg>`
            :
              `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
              </svg>`;
        }); 


        const validate = () => {
          password = passInput.value;
          confirmPassword = confirmInput.value;

          // Validaciones
          const validLength = password.length >= 6;
          const hasUpper = /[A-Z]/.test(password);
          const hasLower = /[a-z]/.test(password);
          const validCase = hasUpper && hasLower;
          const validSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
          const validNumber = /[0-9]/.test(password);

          // Actualizar requisitos
          reqLength.textContent = (validLength ? '✅' : '❌') + ' Al menos 6 caracteres';
          reqCase.textContent = (validCase ? '✅' : '❌') + ' Una mayúscula y minúscula';
          reqSymbol.textContent = (validSymbol ? '✅' : '❌') + ' Al menos un símbolo (!@#$%^&*(),.?":{}|<>)';
          reqNumber.textContent = (validNumber ? '✅' : '❌') + ' Al menos un número';

          // Mensajes debajo de inputs
          msgPassword.textContent = (validLength && validCase && validSymbol && validNumber) ? '' : 'La contraseña es insegura ❌';
          msgConfirm.textContent = (confirmPassword === password) ? '' : 'Las contraseñas no coinciden ❌';
        };

        passInput.addEventListener('input', validate);
        confirmInput.addEventListener('input', validate);
      }
    }).then((result) => {
      if (result.isConfirmed) {

        updatePassword(result.value, IdUser)
      }
    });
  }

  const updatePassword = async (NewPassword, IdUser) => {
    
    setShowLoader(true)
    const endpoint = "users/";
    const response = await PatchData(endpoint, IdUser, {
      password: NewPassword,
      is_active: true
    });

    setShowLoader(false)

    if(response){
      Swal.fire({
          icon: 'success',
          text: 'Contraseña restablecida con éxito.',
          showConfirmButton: false,
          showCancelButton: false,
          background: '#233876aa',
          color: 'white',
          timer: 3000,
      })
    } else {
      Swal.fire({
          icon: 'error',
          text: 'Error al restablecer la contraseña. Inténtalo de nuevo más tarde.',
          showConfirmButton: false,
          showCancelButton: false,
          background: '#233876aa',
          color: 'white',
          timer: 3000,
      })
    }
    
  }

  const ViewProfile = async () => {
      const TOKEN = await GenerateToken({ id: Id, ViewUserAdmin: false }, "UserCookie");

      if(TOKEN) {
        navigate("/perfil")
      }
  }

  const CerrarSesion = () => {
    setShowLoader(true); // mostrar loader

    setTimeout(() => {
      setShowLoader(false); // ocultar loader
      navigate("/IniciarSesion");
      Logout()
    }, 1500);
  };

  return (  
    <Navbar fluid rounded className="dark:text-[#CEC19F] bg-[#adb6aaa8] dark:bg-[#171731] py-0 h-18">

      {ShowLoader && (
          <Loader/>
      )}

      <NavbarBrand className="relative hidden sm:inline">
        <img src={Logo} className="h-18 w-35 sm:h-18" alt="Logo" />
      </NavbarBrand>

        <div className="flex gap-2 mt-4 sm:mt-0 md:order-1">
          <Dropdown
            arrowIcon={false}
            inline
            className="bg-[#adb6aa] mt-10 relative"
            label={
              <Avatar className="right-16 top-4 absolute sm:relative sm:right-0 sm:top-0" alt="Imagen de usuario" img={UserImage} rounded />
            }
          >
            {Autenticate && (
              <div>

                <DropdownHeader>
                  <span className="block text-sm">Nombre de usuario</span>
                  <span className="block truncate text-sm font-medium">{Username}</span>
                </DropdownHeader>
    
                <div className="" onClick={() => ViewProfile()}> <DropdownItem > Perfil </DropdownItem> </div>
 
                {IsAdmin && ( <Link to="/admin"> <DropdownItem > Administrar </DropdownItem>  </Link> )}

                <DropdownDivider className="bg-gray-900"/>

                <DropdownItem className="hover:scale-105" onClick={CerrarSesion}> Cerrar Sesión  </DropdownItem>
              </div>
           )}
          </Dropdown>

          <div className=" rounded-full p-1 absoute right-3 top-4 sm:relative flex items-center">
            <LucideShoppingCart size={30}/>
          </div>

          <NavbarToggle />
        </div>

      
      <NavbarCollapse>
        <hr className="border-gray-900 dark:border-[#668672c1]" />
        
        {!Autenticate ? (
          <div className="flex flex-col md:flex-row md:space-x-8 mt-4 md:mt-0 md:mb-0">
            <Link className="text-[15px] px-3 py-1 text-center rounded-[5px] hover: scale-110 hover:bg-[#668672c1] -mt-4 md:mt-0 lg:mt-0" to="/#"> Inicio</Link><hr className="border-gray-900 dark:border-[#668672c1]" />
            <Link className="text-[15px] px-3 py-1 text-center rounded-[5px] hover: scale-110 hover:bg-[#668672c1]" to="/about">Sobre nosotros</Link><hr className="border-gray-900 dark:border-[#668672c1]" />
            <Link className="text-[15px] px-3 py-1 text-center rounded-[5px] hover: scale-110 hover:bg-[#668672c1]" to="/productos">Productos</Link><hr className="border-gray-900 dark:border-[#668672c1]" />
            <Link className="text-[15px] px-3 py-1 text-center rounded-[5px] hover: scale-110 hover:bg-[#668672c1]" to="/contactar">Contacto</Link><hr className="border-gray-900 dark:border-[#668672c1]" />
          </div>
        )

        : (
          <div className="flex flex-col md:flex-row md:space-x-8 mt-4 md:mt-0 md:mb-0">
            <Link className="text-[15px] px-3 py-1 text-center rounded-[5px] hover:scale-110 hover:bg-[#668672c1]  -mt-4 md:mt-0 lg:mt-0" to="/principal"> Inicio</Link><hr className="border-gray-900 dark:border-[#668672c1]" />
            <Link className="text-[15px] px-3 py-1 text-center rounded-[5px] hover:scale-110 hover:bg-[#668672c1]" to="/about">Sobre nosotros</Link><hr className="border-gray-900 dark:border-[#668672c1]" />
            <Link className="text-[15px] px-3 py-1 text-center rounded-[5px] hover:scale-110 hover:bg-[#668672c1]" to="/contactar">Contacto</Link><hr className="border-gray-900 dark:border-[#668672c1]" />
          </div>
        )}

      </NavbarCollapse>
    </Navbar>
  );
}
