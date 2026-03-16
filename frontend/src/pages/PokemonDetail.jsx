import { Link } from "react-router-dom";

export default function PokemonCard({ pokemon }) {
  return (
    <Link to={`/pokemon/${pokemon.id}`}>
      <div className="bg-slate-800 p-4 rounded-lg hover:bg-slate-700 transition">

        <img
          src={pokemon.image}
          alt={pokemon.name}
          className="mx-auto w-24"
        />

        <h3 className="text-center mt-2 font-semibold">
          {pokemon.name}
        </h3>

        <div className="flex justify-center gap-2 mt-2">
          {pokemon.apiTypes.map((type) => (
            <span
              key={type.name}
              className="text-xs bg-slate-600 px-2 py-1 rounded"
            >
              {type.name}
            </span>
          ))}
        </div>

      </div>
    </Link>
  );
}