import "./App.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Pokedex from "./pages/Pokedex.jsx";
import PokemonDetail from "./components/PokemonDetail.jsx";
import TeamBuilder from "./pages/TeamBuilder.jsx";
import Login from "./pages/Login.jsx";

function App() {
	return (
		<BrowserRouter>
			<div className="min-h-screen bg-slate-900 text-white p-8">
				<Routes>
					<Route path="/" element={<Pokedex />} />
					<Route path="/pokedex" element={<Pokedex />} />
					<Route path="/pokemon/:id" element={<PokemonDetail />} />
					<Route path="/team" element={<TeamBuilder />} />
					<Route path="/login" element={<Login />} />
				</Routes>
			</div>
		</BrowserRouter>
	)
}

export default App;
