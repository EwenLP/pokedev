import { Link } from 'react-router-dom';
import Navbar from '../components/NavBar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a1120] text-white font-sans">
      <Navbar />

      <main className="flex flex-col items-center justify-center h-[calc(100vh-100px)] px-4">
        <h1 className="text-6xl font-extrabold text-cyan-400 mb-4 tracking-tight">
          PokéDex
        </h1>
        <p className="text-gray-400 text-center mb-12 max-w-sm">
          Explorez tous les Pokémon et créez votre équipe de rêve
        </p>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Link
            to="/pokedex"
            className="bg-[#111c30] border border-gray-800 rounded-2xl p-5 flex items-center gap-4 hover:border-cyan-800 hover:bg-[#152240] transition-all group"
          >
            <div className="bg-cyan-900/40 p-3 rounded-xl border border-cyan-800">
              <span className="text-cyan-400 text-xl">📖</span>
            </div>
            <div>
              <p className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                Voir le Pokédex
              </p>
              <p className="text-gray-400 text-sm">Parcourez tous les Pokémon</p>
            </div>
          </Link>

          <Link
            to="/team"
            className="bg-[#111c30] border border-gray-800 rounded-2xl p-5 flex items-center gap-4 hover:border-cyan-800 hover:bg-[#152240] transition-all group"
          >
            <div className="bg-cyan-900/40 p-3 rounded-xl border border-cyan-800">
              <span className="text-cyan-400 text-xl">👥</span>
            </div>
            <div>
              <p className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                Créer mon Équipe
              </p>
              <p className="text-gray-400 text-sm">Composez votre équipe de 6 Pokémon</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
