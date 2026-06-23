import { Link } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";

export default function AdminLogin() {
  const {
    identifier, setIdentifier,
    password, setPassword,
    message, isError, isLoading,
    handleSubmit,
  } = useLogin({
    redirectTo: "/admin",
    requiredRole: "ADMIN",
    roleErrorMsg: "Accès réservé aux administrateurs.",
  });

  return (
    <main className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-red-700/40 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-red-900/30 p-8">

        <div className="mb-6 text-center">
          <img src="/pokeball.png" alt="Admin Pokeball" className="w-14 h-14 mx-auto mb-3 drop-shadow" />
          <h1 className="text-3xl font-bold tracking-tight text-red-400">Espace Admin</h1>
          <p className="text-slate-300 mt-2 text-sm">Connexion réservée aux administrateurs.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-slate-200 mb-2">
              Email ou username
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="admin@pokedev.com"
              className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/50 transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/50 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-60 disabled:cursor-not-allowed font-semibold py-3 transition"
          >
            {isLoading ? "Connexion..." : "Connexion Admin"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Connexion utilisateur ?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Se connecter
          </Link>
        </p>

        {message && (
          <p className={`mt-5 text-sm rounded-lg px-3 py-2 ${
            isError
              ? "bg-red-500/15 text-red-200 border border-red-400/40"
              : "bg-emerald-500/15 text-emerald-200 border border-emerald-400/40"
          }`}>
            {message}
          </p>
        )}
      </section>
    </main>
  );
}