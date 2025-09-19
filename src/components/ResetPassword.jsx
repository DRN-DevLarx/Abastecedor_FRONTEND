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

    if (message) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        confirmButtonText: "Aceptar",
        confirmButtonColor: '#3B82F6',
        background: '#233876aa',
        color: 'white'
      })
      return;

    }    
    await RequestReset();
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
    <div className="flex items-center h-[100vh]">
      {ShowLoader && <Loader />}

      <form className="py-10 w-[90%] md:mt-4 md:w-[55%] lg:w-[40%] flex flex-col gap-7 mx-auto border border-gray-700 rounded-2xl">
        {/* Texto explicativo */}
        <div className="w-[80%] mx-auto mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Restablecer contraseña
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Ingresa tu correo electrónico registrado para restablecer tu contraseña.
          </p>
        </div>

        {/* Email */}
        <div className="relative w-[80%] mx-auto">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => handleChange(e.target.value)}
            className="block px-2.5 pb-1.5 pt-3 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 focus:outline-none peer"
            placeholder=" "
          />
          <label
            htmlFor="email"
            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-3 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-3 start-1"
          >
            Correo electrónico
          </label>
          {ErrorMessage && (
            <p className="text-red-500 text-xs mt-1">{ErrorMessage}</p>
          )}
        </div>

        {/* Botón */}
        <div className="flex justify-center w-[100%]">
          <button
            type="button"
            onClick={handleSubmit}
            className="text-white flex items-center border border-gray-800 hover:bg-gray-900 font-medium rounded-lg text-sm px-5 py-2.5 dark:border-gray-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Restablecer
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResetPassword;
