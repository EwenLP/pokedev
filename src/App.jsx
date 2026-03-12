import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Pokedex from "./pages/Pokedex";
import PokemonDetail from "./pages/PokemonDetail";

function App() {
	return (
		<BrowserRouter>
			<div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
				<Routes>
				<Route path="/" element={<Pokedex />} />
				<Route path="/pokedex" element={<Pokedex />} />
				<Route path="/pokemon/:id" element={<PokemonDetail />} />
				</Routes>
			</div>
		</BrowserRouter>
	)
}

export default App