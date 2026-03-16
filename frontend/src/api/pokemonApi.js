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

export async function fetchPokemonDescription(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  const data = await res.json();

  const entry = data.flavor_text_entries.find(
      (e) => e.language.name === "en"
  );

  return entry?.flavor_text.replace(/\f/g, " ");
}