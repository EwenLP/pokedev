import { useEffect, useState } from "react";
import { typeTranslations } from "../utils/Types";

export default function SearchBar({ pokemonList, setFilteredPokemon }) {
	const [searchName, setSearchName] = useState("");
	const [searchId, setSearchId] = useState("");
	const [selectedType, setSelectedType] = useState("");
	const [sort, setSort] = useState("id-asc");

	useEffect(() => {

		let filtered = [...pokemonList];

		if (searchName) {
			filtered = filtered.filter((pokemon) =>
				pokemon.name.toLowerCase().includes(searchName.toLowerCase())
			);
		}

		if (searchId) {
			filtered = filtered.filter(
				(pokemon) => pokemon.id === Number(searchId)
			);
		}

		if (selectedType) {
			filtered = filtered.filter((pokemon) =>
				pokemon.types.includes(selectedType)
			);
		}

		if (sort === "id-asc") {
			filtered.sort((a, b) => a.id - b.id);
		}

		if (sort === "id-desc") {
			filtered.sort((a, b) => b.id - a.id);
		}

		if (sort === "name-asc") {
			filtered.sort((a, b) => a.name.localeCompare(b.name));
		}

		if (sort === "name-desc") {
			filtered.sort((a, b) => b.name.localeCompare(a.name));
		}

		setFilteredPokemon(filtered);

	}, [pokemonList, searchName, searchId, selectedType, sort, setFilteredPokemon]);

	return (
		<div className="flex flex-wrap gap-4 mb-6">

		<input
			type="text"
			placeholder="Nom du Pokémon"
			className="p-2 rounded border border-white text-white bg-slate-800 w-full sm:w-auto"
			value={searchName}
			onChange={(e) => setSearchName(e.target.value)}
		/>

		<input
			type="number"
			placeholder="ID"
			className="p-2 rounded border border-white text-white bg-slate-800 w-full sm:w-24"
			value={searchId}
			onChange={(e) => setSearchId(e.target.value)}
		/>

		<select
			className="p-2 rounded border border-white text-white bg-slate-800 w-full sm:w-auto"
			value={selectedType}
			onChange={(e) => setSelectedType(e.target.value)}
		>
			<option value="">Tous les types</option>

			{Object.keys(typeTranslations).map((type) => (
				<option key={type} value={type}>
					{typeTranslations[type]}
				</option>
			))}
		</select>

		<select
			className="p-2 rounded border border-white text-white bg-slate-800 w-full sm:w-auto"
			value={sort}
			onChange={(e) => setSort(e.target.value)}
		>
			<option value="id-asc">ID ↑</option>
			<option value="id-desc">ID ↓</option>
			<option value="name-asc">Nom A → Z</option>
			<option value="name-desc">Nom Z → A</option>
		</select>

		</div>
	);
}