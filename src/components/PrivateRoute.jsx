import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoaderSessionV from "./LoaderSessionV";
import { GetData } from "../services/ApiServices";
import Swal from "sweetalert2";
import { VerifyAccessToken } from "../services/Token/AuthServices";

const PrivateRoute = ({ element, allowedRoles = [] }) => {
  const navigate = useNavigate();

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
          case "INVALID_REFRESH_TOKEN":
            message =
              "Se detectó un problema con tu sesión, inicia sesión nuevamente.";
            break;
          default:
            break;
        }

        if (message) {
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

  /* ===========================
     RENDER
  =========================== */
  if (isLoading || hasRole === null) {
    return (
      <LoaderSessionV
        duration={1300}
        message="Validando acceso..."
      />
    );
  }

  if (hasRole) {
    return element;
  }

  return null;
};

export default PrivateRoute;
