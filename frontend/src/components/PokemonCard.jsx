import { useState, useEffect } from "react";
import FavoriteIcon from "./FavoriteIcon";
import { addFavorite, removeFavorite } from "../api/favoriteApi";

export default function PokemonCard({ pokemon, onSelect, favorites = [] }) {
	const [isFavorite, setIsFavorite] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const isFav = favorites.some(
		(fav) => fav.pokemonApiId === pokemon.id
		);
		setIsFavorite(isFav);
	}, [favorites, pokemon.id]);

	const toggleFavorite = async (e) => {
		e.stopPropagation();

		if (loading) return;
		setLoading(true);

		try {
		if (isFavorite) {
			await removeFavorite(pokemon.id);
			setIsFavorite(false);
		} else {
			await addFavorite(pokemon);
			setIsFavorite(true);
		}

		window.dispatchEvent(new Event("favoritesUpdated"));
		} catch (error) {
		console.error("Erreur favoris :", error);
		} finally {
		setLoading(false);
		}
	};

	return (
		<div
		onClick={() => onSelect(pokemon)}
		className="bg-slate-800 p-4 rounded-lg text-center relative cursor-pointer hover:bg-slate-700 transition"
		>
		<button
			onClick={toggleFavorite}
			className="absolute top-2 right-2 hover:scale-110 active:scale-90 transition"
			disabled={loading}
		>
			<FavoriteIcon active={isFavorite} />
		</button>

		<img
			src={pokemon.image}
			alt={pokemon.name}
			className="mx-auto w-24"
		/>

		<h3 className="mt-2 capitalize text-lg font-semibold">
			{pokemon.name}
		</h3>

		<div className="mt-2 text-sm text-gray-400">
			No. {pokemon.id}
		</div>
		</div>
	);
}