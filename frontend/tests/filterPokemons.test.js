// Tests unitaires — filterPokemons.js
// Outil : Vitest
// Auteur : [VIGIER Dorine]

import { describe, it, expect } from 'vitest';
import { filterPokemons } from '../src/utils/filterPokemons';

//Données pour les tests
const mockPokemonList = [
  { id: 1,  name: 'Bulbizarre', types: ['grass', 'poison'] },
  { id: 4,  name: 'Salamèche',  types: ['fire'] },
  { id: 6,  name: 'Dracaufeu',  types: ['fire', 'flying'] },
  { id: 7,  name: 'Carapuce',   types: ['water'] },
  { id: 25, name: 'Pikachu',    types: ['electric'] },
];

// Filtres par défaut (aucun filtre actif)
const defaultFilters = {
  searchName: '',
  searchId: '',
  selectedType: '',
  sort: 'id-asc',
};

// Recherche par nom
describe('filterPokemons: recherche par nom', () => {
  // TU-007
  it('TU-007: filtre par nom partiel (insensible à la casse)', () => {
    const result = filterPokemons(mockPokemonList, { ...defaultFilters, searchName: 'cara' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Carapuce');
  });
});

// Filtre par type
describe('filterPokemons: filtre par type', () => {
  // TU-008
  it('TU-008: retourne uniquement les pokémons du type sélectionné', () => {
    const result = filterPokemons(mockPokemonList, { ...defaultFilters, selectedType: 'fire' });
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.types.includes('fire'))).toBe(true);
  });
});

describe('filterPokemons: tri', () => {

  // TU-009
  it('TU-009: tri par ID croissant (id-asc)', () => {
    const result = filterPokemons(mockPokemonList, { ...defaultFilters, sort: 'id-asc' });
    const ids = result.map((p) => p.id);
    expect(ids).toEqual([1, 4, 6, 7, 25]);
  });

  // TU-010
  it('TU-010: tri par nom A→Z (name-asc)', () => {
    const result = filterPokemons(mockPokemonList, { ...defaultFilters, sort: 'name-asc' });
    const names = result.map((p) => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});