export default function PokemonCard({ pokemon, onSelect }) {
    return (
        <div onClick={() => onSelect(pokemon)} className="bg-slate-800 p-4 rounded-lg text-center">
            <img
                src={pokemon.image}
                alt={pokemon.name}
                className="mx-auto w-24"
            />
            <h3 className="mt-2 capitalize text-lg font-semibold">{pokemon.name}</h3>
            <div className="flex justify-center gap-2 mt-2 text-sm">
                No. {pokemon.id}
            </div>
        </div>
    );
}