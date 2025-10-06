import * as jose from "jose";

export function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) return value;
  }
  return null;
}

export function Logout() {
  // limpiar cookies
  document.cookie.split(";").forEach(cookie => document.cookie = cookie.split("=")[0] + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;");
  return true;
}


/**
 * Genera un JWT y lo guarda en una cookie
 * @param {Object} payload - Datos a guardar en el token (ej: { id: 123 })
 * @param {String} cookieName - Nombre de la cookie (default: "IdUser")
 * @param {String|Number} duration - Duración del token (ej: "7d", "2h", 3600)
 */
export const GenerateToken = async (
  payload,
  cookieName = "IdUser",
  duration = "7d" // valor por defecto
) => {
  try {
    const secret = new TextEncoder().encode("clave"); // clave fija

    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(duration) // ahora configurable
      .sign(secret);

    document.cookie = `${cookieName}=${token}; path=/; secure; SameSite=Strict`;
    return token;

  } catch (err) {
    console.error("Error al generar token:", err);
    return null;
  }

  // Maneras de uso
  // await GenerateToken({ id: 123 });              // expira en 7 días
  // await GenerateToken({ id: 123, cualquiercosa: "valor_x" }, "Sesion");    // expira en 7 días, cookie "Sesion"
  // await GenerateToken({ id: 123 }, "Sesion", "2h"); // expira en 2 horas
  // await GenerateToken({ id: 123 }, "Sesion", 3600); // expira en 3600s (1h)

};
