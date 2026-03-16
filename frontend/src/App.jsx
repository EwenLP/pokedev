import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Pokedex from "./pages/Pokedex.jsx";
import PokemonDetail from "./pages/PokemonDetail.jsx";
import TeamBuilder from "./pages/TeamBuilder.jsx";
import Login from "./pages/Login.jsx";

function AppLayout() {
	const location = useLocation();
	const isLoginPage = location.pathname === "/login";

	if (isLoginPage) {
		return (
			<Routes>
				<Route path="/login" element={<Login />} />
			</Routes>
		);
	}

	return (
		<div className="min-h-screen bg-slate-900 text-white p-8">
			<Routes>
				<Route path="/" element={<Pokedex />} />
				<Route path="/pokedex" element={<Pokedex />} />
				<Route path="/pokemon/:id" element={<PokemonDetail />} />
				<Route path="/team" element={<TeamBuilder />} />
				<Route path="/login" element={<Login />} />
			</Routes>
		</div>
	)
}

function App() {
	return (
		<BrowserRouter>
			<AppLayout />
		</BrowserRouter>
	)
}

export default App
