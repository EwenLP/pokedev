const API_URL = "https://pokeapi.co/api/v2";

export async function fetchPokemonList(limit = 151) {
	const res = await fetch(`${API_URL}/pokemon?limit=${limit}`);
	const data = await res.json();
	return data.results;
}

export async function fetchPokemonDetails(url) {
	const res = await fetch(url);
	return res.json();
}

export async function fetchPokemonFrenchData(id) {
	const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
	const data = await res.json();

	const nameFr = data.names.find(
		(n) => n.language.name === "fr"
	)?.name;

	const descriptionFr = data.flavor_text_entries.find(
		(d) => d.language.name === "fr"
	)?.flavor_text.replace(/\f/g, " ");

	const genusFr = data.genera.find(
		(g) => g.language.name === "fr"
	)?.genus;

	return {
		name: nameFr,
		description: descriptionFr,
		genus: genusFr
	};
}