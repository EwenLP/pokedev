import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../utils/auth";
import { API_BASE_URL } from "../utils/api";

/**
 * @param {object} options
 * @param {string}   options.redirectTo   
 * @param {string}   [options.requiredRole]
 * @param {string}   [options.roleErrorMsg] 
 */
export function useLogin({ redirectTo, requiredRole = null, roleErrorMsg = "Accès non autorisé." }) {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(data.message || "Erreur de connexion.");
        return;
      }

      // Vérification du rôle depuis le payload JWT
      if (requiredRole && data.token) {
        try {
          const payload = JSON.parse(atob(data.token.split(".")[1]));
          if (payload.role !== requiredRole) {
            setIsError(true);
            setMessage(roleErrorMsg);
            return;
          }
        } catch {
          setIsError(true);
          setMessage("Token invalide.");
          return;
        }
      }

      if (data.token) {
        setToken(data.token);
      }

      setMessage("Connexion réussie.");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (import.meta.env.DEV) console.error("Erreur de connexion :", error);
      setIsError(true);
      setMessage("Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    identifier, setIdentifier,
    password, setPassword,
    message, isError, isLoading,
    handleSubmit,
  };
}