import { useQuery } from "@tanstack/react-query";
import { VerificarToken } from "../services/Token/AuthServices";

export function AutenticatedUserData() {
  return useQuery({
    queryKey: ["user"],
    queryFn: VerificarToken,
    staleTime: 1000 * 60 * 5, // 5 min en cache
    retry: false, // no reintentar si no hay sesión
  });
}
