// frontend/src/utils/filterPokemons.js

/**
 * Filtre et trie une liste de pokémons selon les critères de recherche.
 * Extrait du useEffect de SearchBar.jsx pour être testable en isolation.
 *
 * @param {Array} pokemonList - Liste complète des pokémons
 * @param {Object} filters
 * @param {string} filters.searchName - Recherche par nom (partiel, insensible casse)
 * @param {string} filters.searchId   - Recherche par ID exact
 * @param {string} filters.selectedType - Filtre par type ("" = tous)
 * @param {string} filters.sort       - Tri : "id-asc" | "id-desc" | "name-asc" | "name-desc"
 * @returns {Array} Liste filtrée et triée
 */
export function filterPokemons(pokemonList, { searchName, searchId, selectedType, sort }) {
  let filtered = [...pokemonList];

  if (searchName) {
    filtered = filtered.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchName.toLowerCase())
    );
  }

  if (searchId) {
    filtered = filtered.filter(
      (pokemon) => pokemon.id === Number(searchId)
    );
  }

  if (selectedType) {
    filtered = filtered.filter((pokemon) =>
      pokemon.types.includes(selectedType)
    );
  }

  if (sort === "id-asc")   filtered.sort((a, b) => a.id - b.id);
  if (sort === "id-desc")  filtered.sort((a, b) => b.id - a.id);
  if (sort === "name-asc") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-desc")filtered.sort((a, b) => b.name.localeCompare(a.name));

  return filtered;
}