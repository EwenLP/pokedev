export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#0a1120] text-white p-8 font-sans">
      {/* 1. Header / Navbar */}
      <header className="flex justify-between items-center max-w-7xl mx-auto mb-16">
        <h1 className="text-2xl font-bold text-cyan-400">PokéDex</h1>
        <nav className="flex gap-6 items-center text-gray-400">
          <a href="/" className="hover:text-white">Accueil</a>
          <a href="/pokedex" className="hover:text-white">Pokédex</a>
          <a href="/team" className="hover:text-white">Mon Équipe</a>
          <button className="bg-cyan-900/30 text-cyan-400 px-4 py-2 rounded-lg flex items-center gap-2 border border-cyan-800">
            👤 Profil
          </button>
          <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            ➜ Connexion
          </button>
        </nav>
      </header>

      {/* 2. Titre de la page */}
      <main className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-12">Mon Profil</h2>

        {/* 3. Card de connexion */}
        <div className="bg-[#111c30] border border-gray-800 rounded-2xl p-12 flex flex-col items-center text-center shadow-xl">
            <div className="bg-slate-800 w-20 h-20 rounded-xl mb-6 flex items-center justify-center text-4xl">
                👤
            </div>
          
            <h3 className="text-2xl font-semibold mb-2">
                Connectez-vous pour accéder à votre profil
            </h3>
            <p className="text-gray-400 mb-8">
                Gérez vos informations et votre équipe Pokémon.
            </p>
 
            <button className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-transform active:scale-95">
                <a href="/login" className="hover:text-white">➜ Se connecter</a>
            </button>
        </div>
      </main>
    </div>
  );
}