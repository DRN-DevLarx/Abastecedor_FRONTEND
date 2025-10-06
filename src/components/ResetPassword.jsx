import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import { GetData, PostData } from "../services/ApiServices";
import Swal from "sweetalert2";

function ResetPassword() {
  const navigate = useNavigate();
  const [UserEmails, setUserEmails] = useState([]);
  const [email, setEmail] = useState("");
  const [ShowLoader, setShowLoader] = useState(false);
  const [ErrorMessage, setErrorMessage] = useState("");

  // Cargar correos ya registrados
  useEffect(() => {
    const fetchData = async () => {
      const endpoint = "users/";
      const UserData = await GetData(endpoint);

      if (UserData) {
        const emails = UserData.map((user) => user.email);
        setUserEmails(emails);
      }
    };

    fetchData();
  }, []);

  // Validación
  const validateEmail = (value) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {
      return "Por favor ingresa tu correo electrónico.";
    }
    if (!regexEmail.test(value)) {
      return "Ingresa un correo electrónico válido.";
    }
    if (!UserEmails.includes(value)) {
      return "El correo electrónico no está registrado.";
    }
    return "";
  };

  // Cada vez que se escribe, validamos
  const handleChange = (value) => {
    setEmail(value);
    setErrorMessage(validateEmail(value));
  };

  // Validar y enviar al dar click
  const handleSubmit = async () => {
    const message = validateEmail(email);
    setErrorMessage(message);

    if (!message) {      
      await RequestReset();
    }    
  };

  // Solicitar restablecimiento de contraseña
  async function RequestReset() {
    setShowLoader(true);

    try {
      const endpoint = "restablecer/"
      const response = await PostData(endpoint, { 
        correo: email,
      });

      setShowLoader(false);

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Correo enviado",
          text: "Revisa tu bandeja de entrada para continuar con el restablecimiento.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#3B82F6",
          background: "#233876aa",
          color: "white",
        });
        navigate("/iniciarSesion");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.data?.error || "No se pudo enviar el correo.",
          confirmButtonText: "Aceptar",
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
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#3B82F6",
        background: "#233876aa",
        color: "white",
      });
    }
  }

  return (
    <div className="bg-[#adb6aaa8] dark:bg-[#171731] flex items-center h-[100vh]">
      {ShowLoader && <Loader />}

      <form className="bg-[#adb6aa] dark:bg-gray-800 py-5 w-[80%] sm:w-[60%] md:mt-4 md:w-[55%] lg:w-[40%] flex flex-col gap-7 mx-auto border border-gray-700 rounded-2xl">
        {/* Texto explicativo */}
        <div className="w-[80%] mx-auto py-2 px-4 bg-[#38664e] rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-1">
            Restablecer contraseña
          </h2>
          <p className="text-sm text-gray-300">
            Ingresa tu correo electrónico registrado para restablecer tu contraseña.
          </p>
        </div>

        {/* Email */}
        <div className="relative w-[80%] mx-auto mb-3">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => handleChange(e.target.value)}
            className="block px-2.5 pb-1.5 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none dark:text-white dark:border-gray-600 focus:border-green-300 focus:outline-none focus:ring-0 peer"
            placeholder=" "
          />
          <label
            htmlFor="email"
            className="absolute text-sm bg-[#adb6aa] dark:bg-gray-800 text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-3 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1"
          >
            Correo electrónico
          </label>
          {ErrorMessage && (
            <p className="absolute text-red-500 text-xs mt-1">{ErrorMessage}</p>
          )}
        </div>

        {/* Botón */}
        <div className="flex justify-center w-[100%]">
          <button
            type="button"
            onClick={handleSubmit}
            className="text-white flex items-center focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2 text-center me-2 bg-[#38664e] hover:bg-[#24b469] hover:text-black focus:ring-[#38664e] "
          >
            Restablecer
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResetPassword;
