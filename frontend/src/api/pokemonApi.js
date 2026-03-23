const API_URL = "https://pokeapi.co/api/v2";
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours
const POKEDEX_CACHE_KEY = "pokedex_all_pokemon";

// Cache mémoire pour éviter de parser le localStorage à chaque appel
let memoryCache = null;

function getFromCache(key) {
	const cached = localStorage.getItem(key);
	if (!cached) return null;

	try {
		const { data, timestamp } = JSON.parse(cached);
		if (Date.now() - timestamp < CACHE_EXPIRATION) {
			return data;
		}
		localStorage.removeItem(key);
	} catch (e) {
		localStorage.removeItem(key);
	}
	return null;
}

function setToCache(key, data) {
	try {
		const cacheData = {
			data,
			timestamp: Date.now()
		};
		localStorage.setItem(key, JSON.stringify(cacheData));
	} catch (e) {
		console.warn("localStorage quota exceeded, could not cache data", e);
	}
}

/**
 * Charge tous les Pokémon (liste + détails + données FR) en un seul appel
 * et met tout en cache. Les appels suivants sont servis depuis le cache.
 */
export async function fetchAllPokemon(limit = 151) {
	// 1. Vérifier le cache mémoire (instantané)
	if (memoryCache && memoryCache.limit === limit) {
		return memoryCache.data;
	}

	// 2. Vérifier le cache localStorage
	const cached = getFromCache(POKEDEX_CACHE_KEY);
	if (cached && cached.length >= limit) {
		memoryCache = { limit, data: cached };
		return cached;
	}

	// 3. Pas de cache → on fetch tout
	const listRes = await fetch(`${API_URL}/pokemon?limit=${limit}`);
	const listData = await listRes.json();

	const allPokemon = await Promise.all(
		listData.results.map(async (pokemon) => {
			const detailsRes = await fetch(pokemon.url);
			const details = await detailsRes.json();

			const speciesRes = await fetch(`${API_URL}/pokemon-species/${details.id}`);
			const species = await speciesRes.json();

			const nameFr = species.names.find(
				(n) => n.language.name === "fr"
			)?.name;

			const descriptionFr = species.flavor_text_entries.find(
				(d) => d.language.name === "fr"
			)?.flavor_text.replace(/\f/g, " ");

			const genusFr = species.genera.find(
				(g) => g.language.name === "fr"
			)?.genus;

			return {
				id: details.id,
				name: details.name,
				nameFr,
				descriptionFr,
				genusFr,
				image: details.sprites.other["official-artwork"].front_default,
				types: details.types.map((t) => t.type.name)
			};
		})
	);

	// Trier par ID
	allPokemon.sort((a, b) => a.id - b.id);

	// Mettre en cache
	setToCache(POKEDEX_CACHE_KEY, allPokemon);
	memoryCache = { limit, data: allPokemon };

	return allPokemon;
}

/**
 * Récupère un Pokémon par ID depuis le cache global.
 * Si le cache n'existe pas encore, charge tout le Pokédex.
 */
export async function getPokemonById(id, limit = 151) {
	const all = await fetchAllPokemon(limit);
	return all.find((p) => p.id === id) || null;
}
