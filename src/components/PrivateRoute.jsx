import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoaderSessionV from "./LoaderSessionV";
import { GetData } from "../services/ApiServices";
import Swal from "sweetalert2";
import { Logout } from "../services/Token/sessionManager";
import { VerifyAccessToken } from "../services/Token/AuthServices"; // llamada directa

const PrivateRoute = ({ element, allowedRoles = [] }) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      const userData = await VerifyAccessToken();

      if (userData?.error) {
        let message = "";

        switch (userData.error) {
          case "NO_SESSION":
            message = "Debes iniciar sesión para acceder a esta sección.";
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
            message =
              "Ocurrió un error con tu sesión, por favor contacta con soporte.";
            break;
          case "INVALID_REFRESH_TOKEN":
            message =
              "Se detectó un problema con tu sesión, inicia sesión nuevamente.";
            break;
          default:
            message =
              "Ocurrió un error desconocido, por favor inicia sesión nuevamente.";
            break;
        }

        if (message) {
          localStorage.setItem("loginMessage", message);
          // Logout();
          navigate("/IniciarSesion", { replace: true });
          return;
        }
      }

      // Si no hubo error → guardo el usuario
      setUser(userData);
      setIsLoading(false);
    };

    checkAuth();
  }, []);


  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await GetData("grupos/");
        setGroups(response);
      } catch (err) {
        console.error("Error al obtener grupos:", err);
      }
    };
    fetchGroups();
  }, [navigate]);

  if (isLoading) {
    return <LoaderSessionV duration={1000} message="Validando acceso..." />;
  }

  console.log(allowedRoles)
  console.log(groups)
  console.log(user)

// Validación de roles por id
const hasRole =
  allowedRoles.length === 0 ||
  (
    groups?.length > 0 &&
    user?.groups && // 👈 protegemos contra undefined
    groups
      .filter((g) => user.groups.includes(g.id)) // solo grupos del usuario
      .some((g) => allowedRoles.includes(g.id)) // validación por id
  );

  
    console.log(hasRole)
  if (hasRole) {
    return element;
  }


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
    setTimeout(() => navigate(-1), 2500);
  });

  return null;
};

export default PrivateRoute;
