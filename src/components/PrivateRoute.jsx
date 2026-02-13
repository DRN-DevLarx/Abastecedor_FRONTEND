import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AutenticatedUserData } from "../services/Token/AuthServices";

import { getCookie } from "../services/Token/sessionManager";
import { GetData,PostData2 } from "../services/ApiServices";
import { VerifyAccessToken } from "../services/Token/AuthServices";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";

const PrivateRoute = ({ element, allowedRoles = [] }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const access_token = getCookie("access_token");
  
  let userQuery = null

  if(access_token) {
    userQuery = AutenticatedUserData();
  }

  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRole, setHasRole] = useState(null); // null = aún no evaluado

  /* ===========================
     VALIDAR SESIÓN
  =========================== */
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      const userData = await VerifyAccessToken();

      if (userData?.error) {
        let message = "";

        switch (userData.error) {
          case "NO_SESSION":
            message = "Porfavor, Inicia sesión";
            break;
          case "INVALID_SESSION":
          case "NO_REFRESH_TOKEN":
          case "REFRESH_EXPIRED":
            message =
              "Por seguridad, tu sesión expiró y se cerró automáticamente. Inicia sesión nuevamente.";
            break;
          case "NO_NEW_ACCESS_TOKEN":
            message =
              "No pudimos mantener tu sesión activa, por favor inicia sesión nuevamente.";
            break;
          case "INVALID_ACCESS_TOKEN":
          case "INVALID_REFRESH_TOKEN":
            message =
              "Se detectó un problema con tu sesión, inicia sesión nuevamente.";
            break;
          default:
            break;
        }
                
        if (message) {
          document.cookie.split(";").forEach(cookie => document.cookie = cookie.split("=")[0] + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;");
          localStorage.setItem("loginMessage", message);
          navigate("/IniciarSesion", { replace: true });
          return;
        }
      }

      setUser(userData);
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  /* ===========================
     OBTENER GRUPOS
  =========================== */
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await GetData("grupos/");
        setGroups(response || []);
      } catch (err) {
        console.error("Error al obtener grupos:", err);
        setGroups([]);
      }
    };

    fetchGroups();
  }, []);

  /* ===========================
     VALIDAR ROLES
  =========================== */
  useEffect(() => {
    if (!user || !groups) return;

    const valid =
      allowedRoles.length === 0 ||
      (
        groups.length > 0 &&
        Array.isArray(user.groups) &&
        groups
          .filter(g => user.groups.includes(g.id))
          .some(g => allowedRoles.includes(g.id))
      );

    setHasRole(valid);
  }, [user, groups, allowedRoles]);

  /* ===========================
     SWAL SOLO CUANDO NO TIENE ROL
  =========================== */
  useEffect(() => {
    if (hasRole === false) {
      Swal.fire({
        icon: "error",
        iconColor: "red",
        title: "Acceso denegado",
        text: "No tienes permisos para acceder a esta sección.",
        showConfirmButton: false,
        background: "#233876aa",
        color: "white",
        timer: 2500,
      }).then(() => {
        navigate("/IniciarSesion", { replace: true });
      });
    }
  }, [hasRole, navigate]);




  useEffect(() => {
    if (!userQuery) return; // si no hay token, no ejecutes nada
    
    if (userQuery.status === "success" && userQuery.data) {
      if (userQuery.data.password_temporal === true) {
        showPasswordResetSwal(userQuery.data.id);
      }
    }

  }, [access_token, userQuery?.status, userQuery?.data]);

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
          // const validSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
          const validNumber = /[0-9]/.test(password);

          // Actualizar requisitos
          reqLength.textContent = (validLength ? '✅' : '❌') + ' Al menos 6 caracteres';
          reqCase.textContent = (validCase ? '✅' : '❌') + ' Una mayúscula y minúscula';
          reqNumber.textContent = (validNumber ? '✅' : '❌') + ' Al menos un número';

          // Mensajes debajo de inputs
          msgPassword.textContent = (validLength && validCase && validNumber) ? '' : 'La contraseña es insegura ❌';
          msgConfirm.textContent = (confirmPassword === password) ? '' : 'Las contraseñas no coinciden ❌';
        };

        passInput.addEventListener('input', validate);
        confirmInput.addEventListener('input', validate);
      }
    }).then((result) => {
      if (result.isConfirmed) {

        updatePassword(result.value)
      }
    });
  }

  const updatePassword = async (NewPassword) => {
    
    // setShowLoader(true)
    console.log(access_token);
    const response = await PostData2("CContrasenaTemporal/",
      {
        password: NewPassword,
      },
      access_token
    );

    console.log(response);
    
    // setShowLoader(false)

    if(response){
      queryClient.invalidateQueries(["user"]);

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



  /* ===========================
     RENDER
  =========================== */
  // if (isLoading || hasRole === null) {
  //   return (
  //     <LoaderSessionV
  //       duration={1300}
  //       message="Validando acceso..."
  //     />
  //   );
  // }

  if (hasRole) {
    return element;
  }

  return null;
};

export default PrivateRoute;
