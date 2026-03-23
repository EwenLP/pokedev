import { useState } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD

export default function Login() {
	const navigate = useNavigate();

	const [isRegister, setIsRegister] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const [formData, setFormData] = useState({
		email: "",
		username: "",
		password: "",
	});

	const handleChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);

		try {
			const url = isRegister
				? "http://localhost:3000/api/auth/register"
				: "http://localhost:3000/api/auth/login";

			const body = isRegister
				? {
						email: formData.email,
						username: formData.username,
						password: formData.password,
				  }
				: {
						email: formData.email,
						password: formData.password,
				  };

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Une erreur est survenue.");
			}

			if (data.token) {
				localStorage.setItem("token", data.token);
			}

			if (data.user) {
				localStorage.setItem("user", JSON.stringify(data.user));
			}

			setSuccess(data.message || "Succès.");

			setTimeout(() => {
				navigate("/pokedex");
			}, 800);
		} catch (err) {
			setError(err.message || "Erreur inconnue.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-screen-2xl mx-auto p-6 flex justify-center items-center min-h-[80vh]">
			<div className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-lg">
				<h1 className="text-3xl font-bold mb-6 text-center">
					{isRegister ? "Inscription" : "Connexion"}
				</h1>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<input
						type="email"
						name="email"
						placeholder="Email"
						value={formData.email}
						onChange={handleChange}
						className="w-full p-2 rounded border border-white text-white bg-transparent"
						required
					/>

					{isRegister && (
						<input
							type="text"
							name="username"
							placeholder="Nom d'utilisateur"
							value={formData.username}
							onChange={handleChange}
							className="w-full p-2 rounded border border-white text-white bg-transparent"
							required
						/>
					)}

					<input
						type="password"
						name="password"
						placeholder="Mot de passe"
						value={formData.password}
						onChange={handleChange}
						className="w-full p-2 rounded border border-white text-white bg-transparent"
						required
					/>

					{error && <p className="text-red-400 text-sm text-center">{error}</p>}
					{success && (
						<p className="text-green-400 text-sm text-center">{success}</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 transition disabled:opacity-50"
					>
						{loading
							? "Chargement..."
							: isRegister
							? "S'inscrire"
							: "Se connecter"}
					</button>
				</form>

				<div className="text-center mt-6">
					<button
						type="button"
						onClick={() => {
							setIsRegister(!isRegister);
							setError("");
							setSuccess("");
							setFormData({
								email: "",
								username: "",
								password: "",
							});
						}}
						className="text-white underline"
					>
						{isRegister
							? "Déjà un compte ? Se connecter"
							: "Pas de compte ? S'inscrire"}
					</button>
				</div>
			</div>
		</div>
	);
}
=======
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
    } catch {
      setIsError(true);
      setMessage("Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center p-6">
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
>>>>>>> 87f4efd7d5a6cd3f82ca81e16c5d544fc69f06e7
