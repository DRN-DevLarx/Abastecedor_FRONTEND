import { getCookie, Logout } from "./sessionManager";
import {jwtDecode} from "jwt-decode";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL;
// const API_URL = "http://127.0.0.1:8000/api/";

// Login
export async function Login(endpoint, body) {
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
            credentials: 'include'
        });

        
        const data = await response.json();
        return {
            status: response.status, // <-- aquí mandamos el estado HTTP
            data: data                      // <-- aquí mandamos el contenido JSON
        };
    } catch (error) {
        console.error('Error:', endpoint, error);
        throw error;
    }
}

export function AutenticatedUserData() {
  return useQuery({
    queryKey: ["user"],
    queryFn: VerifyAccessToken,
    staleTime: 1000 * 60 * 5, // 5 min en cache
    retry: false, // no reintentar si no hay sesión
    refetchOnMount: "always", // se asegura de pedir de nuevo al montarse

  });
}

// Verifica access token y refresca si es necesario
export async function VerifyAccessToken() {
  let accessToken = getCookie("access_token");
  const refreshToken = getCookie("refresh_token");

  // 1. Verificar access token
  if (accessToken) {
    try {
      const decoded = jwtDecode(accessToken);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        // console.log("Access token expirado");
        accessToken = null;
      } else {
        // console.log("Access token válido");
      }
    } catch (err) {
      // console.log("Access token manipulado o inválido");
      console.error(err);
      accessToken = null;
    }
  }

  // 2. Si no hay access token válido, intentar refrescar
  if (!accessToken) {
    if (!refreshToken) {
      const session = getCookie("Session");

      if (session) {
        try {
          const ActiveSession = jwtDecode(session).ActiveSession;          
          // console.log("No hay refresh token → cerrar sesión");
          return { error: "NO_REFRESH_TOKEN" };

        } catch (err) {
          // console.log("Session manipulada o inválida");
          return { error: "INVALID_SESSION" };
        }
      } else {
        // console.log("No hay session");
        return { error: "NO_SESSION" };
      }

    }

    try {
      const decodedRefresh = jwtDecode(refreshToken);
      const now = Date.now() / 1000;

      if (decodedRefresh.exp < now) {
        // console.log("Refresh token expirado");
        return { error: "REFRESH_EXPIRED" };
      }

      // console.log("Refresh token válido, intentando generar nuevo access token");
      const result = await refreshAccessToken(refreshToken);
      if (result.error) return { error: result.error };
      accessToken = result.access;

      // console.log("Access token refrescado con éxito");

    } catch (err) {
      // console.log("Refresh token manipulado o inválido");
      console.error(err);
      return { error: "INVALID_REFRESH_TOKEN" };
    }
  } else if (refreshToken) {
    // Validar refresh token cuando acces es valido
    try {
      const decoded = jwtDecode(refreshToken);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        // console.log("Refresh token expirado (localmente)");
        return { error: "REFRESH_EXPIRED" };
      }
    } catch (err) {
      // console.log("Refresh token manipulado o inválido (no es JWT)");
      return { error: "INVALID_REFRESH_TOKEN" };
    }

  } else {
    // console.log("Hay access token pero no existe refresh token");
    return { error: "NO_REFRESH_TOKEN" };
  }

  // 3. Llamar a la API con access token válido o recién generado
  try {
    const response = await fetch(`${API_URL}user-data/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // console.log("Access token rechazado por la API");
      return { error: "INVALID_ACCESS_TOKEN" };
    }

    const userData = await response.json();
    // console.log("Usuario validado correctamente:", userData);
    return userData;

  } catch (err) {
    // console.log("Error obteniendo datos de usuario");
    console.error(err);
    return { error: "INVALID_ACCESS_TOKEN" };
  }
}

// Función para refrescar access token usando refresh token
export async function refreshAccessToken(refreshToken) {
  try {
    // Validar refresh token antes de enviarlo
    try {
      const decoded = jwtDecode(refreshToken);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        console.log("Refresh token expirado (localmente)");
        return { error: "REFRESH_EXPIRED" };
      }
    } catch (err) {
      console.log("Refresh token manipulado o inválido (no es JWT)");
      return { error: "INVALID_REFRESH_TOKEN" };
    }

    // Enviar refresh token al backend para generar nuevo access token
    const response = await fetch(`${API_URL}token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      console.log("Refresh token rechazado por el backend");
      if (response.status === 401) {
        return { error: "INVALID_REFRESH_TOKEN" };
      } else {
        return { error: "NO_NEW_ACCESS_TOKEN" };
      }
    }

    const data = await response.json();

    if (!data.access) {
      console.log("No se recibió access token del backend");
      return { error: "NO_NEW_ACCESS_TOKEN" };
    }

    // Guardar nuevo access token en cookies
    document.cookie = `access_token=${data.access}; path=/; secure; SameSite=Strict`;
    console.log("Access token refrescado correctamente");

    return { access: data.access };

  } catch (err) {
    console.error("Error refrescando access token:", err);
    return { error: "INVALID_REFRESH_TOKEN" };
  }
}
