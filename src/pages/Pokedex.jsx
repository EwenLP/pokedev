import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPokemonList, fetchPokemonDetails } from "../api/pokemonApi";
import PokemonCard from "../components/PokemonCard";

export default function Pokedex() {
	const [loading, setLoading] = useState(true);
	const [pokemonList, setPokemonList] = useState([]);
	const [search, setSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const pokemonPerPage = 12;
	const filteredPokemon = pokemonList.filter((pokemon) =>
		pokemon.name.toLowerCase().includes(search.toLowerCase())
	);

	const indexOfLastPokemon = currentPage * pokemonPerPage;
	const indexOfFirstPokemon = indexOfLastPokemon - pokemonPerPage;

	const currentPokemon = filteredPokemon.slice(
		indexOfFirstPokemon,
		indexOfLastPokemon
	);

	const totalPages = Math.ceil(filteredPokemon.length / pokemonPerPage);

	useEffect(() => {
		async function loadPokemon() {
			const list = await fetchPokemonList();

			const detailedPokemon = await Promise.all(
				list.map(async (pokemon) => {
					const details = await fetchPokemonDetails(pokemon.url);

					return {
					id: details.id,
					name: details.name,
					image: details.sprites.other["official-artwork"].front_default,
					types: details.types.map((t) => t.type.name),
					};
				})
			);

			setPokemonList(detailedPokemon);
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
		<div className="max-w-6xl mx-auto p-6">
			<div className="flex items-center justify-between gap-4 mb-6">
				<h1 className="text-3xl font-bold">Pokédex</h1>
				<Link className="px-4 py-2 bg-blue-700 rounded" to="/team">
					Créer mon équipe
				</Link>
			</div>
			<input
				type="text"
				placeholder="Rechercher un Pokémon"
				className="w-full mb-6 p-2 rounded border border-white text-white"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
				{currentPokemon.map((pokemon) => (
					<PokemonCard key={pokemon.id} pokemon={pokemon} />
				))}
			</div>
			<div className="flex justify-center gap-4 mt-8">
				<button
					onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
					className="px-4 py-2 bg-slate-700 rounded"
				>
					Précédent
				</button>
				<span className="px-4 py-2">
					Page {currentPage} / {totalPages}
				</span>
				<button
					onClick={() =>
					setCurrentPage((p) => Math.min(p + 1, totalPages))
					}
					className="px-4 py-2 bg-slate-700 rounded"
				>
					Suivant
				</button>
			</div>
		</div>
	);
}
