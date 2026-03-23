import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
