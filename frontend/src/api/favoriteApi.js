import { getToken } from "../utils/auth";

const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/favorites`;

export async function getFavorites() {
const token = getToken();
if (!token) return [];

const res = await fetch(BASE_URL, {
	headers: {
		Authorization: `Bearer ${token}`,
	},
});

if (!res.ok) return [];
	return res.json();
}

export async function addFavorite(pokemon) {
	const token = getToken();
	if (!token) return [];
	return fetch(BASE_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${getToken()}`,
		},
		body: JSON.stringify({
			pokemonApiId: pokemon.id,
			pokemonName: pokemon.name,
			spriteUrl: pokemon.image,
		}),
	});
}

export async function removeFavorite(id) {
	return fetch(`${BASE_URL}/${id}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${getToken()}`,
		},
	});
}