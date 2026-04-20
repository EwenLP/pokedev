import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setToken } from "../utils/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Login() {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(data.message || "Erreur de connexion.");
        return;
      }

      if (data.token) {
        setToken(data.token);
      }

      setMessage("Connexion réussie.");
      navigate("/team", { replace: true });
    } catch (error) {
      if (import.meta.env.DEV) console.error("Erreur de connexion :", error);
      setIsError(true);
      setMessage("Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-indigo-900/30 p-8">
        <div className="mb-6 text-center">
          <img
            src="/pokeball.png"
            alt="Pokeball"
            className="w-14 h-14 mx-auto mb-3 drop-shadow"
          />
          <h1 className="text-3xl font-bold tracking-tight">Connexion</h1>
          <p className="text-slate-300 mt-2 text-sm">
            Connecte-toi avec ton email ou ton username.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-slate-200 mb-2"
            >
              Email ou username
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
              placeholder="ex: admin@pokebuild.com ou admin"
              className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/50 transition"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200 mb-2"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/50 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed font-semibold py-3 transition"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
            S'inscrire
          </Link>
        </p>

        {message && (
          <p
            className={`mt-5 text-sm rounded-lg px-3 py-2 ${
              isError
                ? "bg-red-500/15 text-red-200 border border-red-400/40"
                : "bg-emerald-500/15 text-emerald-200 border border-emerald-400/40"
            }`}
          >
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
