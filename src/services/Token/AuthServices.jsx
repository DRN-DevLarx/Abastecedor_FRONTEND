import { getCookie, CerrarSesionPorSeguridad } from "./sessionManager";

import { useQuery } from "@tanstack/react-query";

const API_URL = "http://127.0.0.1:8000/api/";

export async function VerificarToken() {
    const accessToken = getCookie("access_token");

    if (!accessToken) {
        CerrarSesionPorSeguridad()
    }
    
    const response = await fetch(`${API_URL}user-data/`, {
      method: "GET",
      
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
        }
      });
        
    if (!response.ok) {        
        CerrarSesionPorSeguridad();        
    } else {
      const userData = await response.json();
      return userData;
    } 

}

// POST
export async function AutenticateUser(endpoint, body) {
    
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
    queryFn: VerificarToken,
    staleTime: 1000 * 60 * 5, // 5 min en cache
    retry: false, // no reintentar si no hay sesión
  });
}
