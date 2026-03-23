import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Pokedex from "./pages/Pokedex.jsx";
import TeamBuilder from "./pages/TeamBuilder.jsx";
import HomePage from "./pages/Homepage.jsx";
import Login from "./pages/Login.jsx";

import PokemonDetail from "./components/PokemonDetail.jsx";
import Profil from "./pages/Profil.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
	return (
		<BrowserRouter>
			<div className="min-h-screen bg-slate-900 text-white p-8">
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/pokedex" element={<Pokedex />} />
					<Route path="/pokemon/:id" element={<PokemonDetail />} />
					<Route
						path="/team"
						element={
							<ProtectedRoute>
								<TeamBuilder />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/profil"
						element={
							<ProtectedRoute>
								<Profil />
							</ProtectedRoute>
						}
					/>
					<Route path="/login" element={<Login />} />
				</Routes>
			</div>
		</BrowserRouter>
	)
}

export default App