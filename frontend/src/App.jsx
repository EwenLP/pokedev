import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Pokedex from "./pages/Pokedex.jsx";
import TeamBuilder from "./pages/TeamBuilder.jsx";
import HomePage from "./pages/Homepage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import PokemonDetail from "./components/PokemonDetail.jsx";
import Profil from "./pages/Profil.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/NavBar.jsx";

function App() {
	return (
		<BrowserRouter>
			<div className="min-h-screen bg-[#0a1120] text-white">
				<Navbar />
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
					<Route path="/register" element={<Register />} />
				</Routes>
			</div>
		</BrowserRouter>
	)
}

export default App