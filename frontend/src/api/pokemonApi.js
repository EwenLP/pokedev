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