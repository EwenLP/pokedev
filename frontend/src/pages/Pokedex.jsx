import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Ajout pour la navigation
import { fetchAllPokemon } from "../api/pokemonApi";
import PokemonCard from "../components/PokemonCard";
import SearchBar from "../components/SearchBar";
import PokemonDetail from "../components/PokemonDetail.jsx";

export default function Pokedex() {
	const [loading, setLoading] = useState(true);
	const [pokemonList, setPokemonList] = useState([]);
	const [selectedPokemon, setSelectedPokemon] = useState(null);
	const [search, setSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [filteredPokemon, setFilteredPokemon] = useState([]);

	const pokemonPerPage = 12;
	const indexOfLastPokemon = currentPage * pokemonPerPage;
	const indexOfFirstPokemon = indexOfLastPokemon - pokemonPerPage;

	const currentPokemon = filteredPokemon.slice(
		indexOfFirstPokemon,
		indexOfLastPokemon
	);

	const totalPages = Math.ceil(filteredPokemon.length / pokemonPerPage);

	useEffect(() => {
		async function loadPokemon() {
			const allPokemon = await fetchAllPokemon();

			const detailedPokemon = allPokemon.map((pokemon) => ({
				id: pokemon.id,
				name: pokemon.nameFr,
				description: pokemon.descriptionFr,
				image: pokemon.image,
				types: pokemon.types
			}));

			setPokemonList(detailedPokemon);
			setFilteredPokemon(detailedPokemon);
			setLoading(false);
		}

		loadPokemon();
	}, []);

	useEffect(() => {
		setCurrentPage(1);
	}, [search]);

	if (loading) {
		return <p className="text-center mt-20">Chargement du Pokédex...</p>;
	}

	return (
		<>
			{/* Contenu principal */}
			<div className="max-w-screen-2xl mx-auto p-6 flex justify-center gap-8">
				{/* Pokedex */}
				<div>
					<h1 className="text-3xl font-bold mb-6">Pokédex</h1>
					<SearchBar
						pokemonList={pokemonList}
						setFilteredPokemon={setFilteredPokemon}
					/>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{currentPokemon.map((pokemon) => (
							<PokemonCard
								key={pokemon.id}
								pokemon={pokemon}
								onSelect={setSelectedPokemon}
							/>
						))}
					</div>
					<div className="flex justify-center gap-4 mt-8">
						<button
							onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
							className="px-4 py-2 bg-slate-700 rounded"
						>
							Précédent
						</button>

						<span className="flex items-center">
                      Page {currentPage} / {totalPages}
                   </span>

						<button
							onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
							className="px-4 py-2 bg-slate-700 rounded"
						>
							Suivant
						</button>
					</div>
				</div>

				{/* Détail */}
				<div className="flex items-center">
					<PokemonDetail pokemon={selectedPokemon} />
				</div>
			</div>
		</>
	);
}