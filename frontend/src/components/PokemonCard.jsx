export default function PokemonCard({ pokemon }) {
  return (
    <div className="bg-slate-800 p-4 rounded-lg text-center">

      <img
        src={pokemon.image}
        alt={pokemon.name}
        className="mx-auto w-24"
      />

      <h3 className="mt-2 capitalize">{pokemon.name}</h3>

      <div className="flex justify-center gap-2 mt-2">
        {pokemon.types.map((type) => (
          <span key={type} className="bg-slate-600 px-2 py-1 rounded text-xs">
            {type}
          </span>
        ))}
      </div>

    </div>
  );
}