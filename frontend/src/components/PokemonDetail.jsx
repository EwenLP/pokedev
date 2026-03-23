import TypeBadge from "./TypeBadge.jsx";

export default function PokemonDetail({ pokemon }) {
	if (!pokemon) {
		return (
		<div className="flex items-center justify-center text-gray-400 gap-4 border border-sky-950/50 p-4">
			<img className="object-scale-down h-6 w-6" src="/pokeball.png" alt="Pokeball" />
			<p className="border-l border-l-sky-950/50 pl-4">Sélectionne un Pokémon</p>
		</div>
		);
	}

	return (
		<div className="bg-slate-800 rounded-xl p-6">
		<img
			src={pokemon.image}
			alt={pokemon.name}
			className="mx-auto w-64"
		/>

		<div className="bg-slate-600 rounded-xl p-6">
			<h2 className="text-2xl font-bold mt-4 capitalize flex justify-center items-center gap-4">
			{pokemon.name}
			<p className="text-base pt-2">No. {pokemon.id}</p>
			</h2>

			<div className="flex justify-center gap-2 mt-4">
			{pokemon.types.map((type) => (
				<TypeBadge key={type} type={type} />
			))}
			</div>

			<p className="text-gray-300 mt-4 text-center">
			{pokemon.description}
			</p>
		</div>
		</div>
	);
}