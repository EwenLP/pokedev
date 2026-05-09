// Tests unitaires — favoriteApi.js
// Outil : Vitest
// Auteur : [VIGIER Dorine]

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFavorites, addFavorite, removeFavorite } from '../src/api/favoriteApi';
import * as auth from '../src/utils/auth';

//Données de test
const mockPokemon = {
  id: 25,
  name: 'Pikachu',
  image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
};

const mockFavorites = [
  { id: 1, pokemonApiId: 25, pokemonName: 'Pikachu', spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' },
];

describe('getFavorites', () => {

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // TU-001
  it('TU-001: retourne [] sans appeler fetch si pas de token', async () => {
    vi.spyOn(auth, 'getToken').mockReturnValue(null);

    const result = await getFavorites();

    expect(result).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  // TU-002
  it('TU-002: retourne [] si la réponse HTTP n\'est pas ok (ex: 401)', async () => {
    vi.spyOn(auth, 'getToken').mockReturnValue('fake.jwt.token');
    global.fetch.mockResolvedValueOnce({ ok: false });

    const result = await getFavorites();

    expect(result).toEqual([]);
  });

  // TU-003
  it('TU-003: retourne les favoris si token valide et réponse ok', async () => {
    vi.spyOn(auth, 'getToken').mockReturnValue('fake.jwt.token');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFavorites,
    });

    const result = await getFavorites();

    expect(result).toEqual(mockFavorites);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/favorites'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer fake.jwt.token',
        }),
      })
    );
  });
});

describe('addFavorite', () => {

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.spyOn(auth, 'getToken').mockReturnValue('fake.jwt.token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // TU-004
  it('TU-004: envoie POST avec le bon body (mapping id→pokemonApiId, name→pokemonName, image→spriteUrl)', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });

    await addFavorite(mockPokemon);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/favorites'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          pokemonApiId: 25,
          pokemonName: 'Pikachu',
          spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        }),
      })
    );
  });

  // TU-005
  it('TU-005: appelle fetch même si le token est null (absence de garde)', async () => {
    vi.spyOn(auth, 'getToken').mockReturnValue(null);
    global.fetch.mockResolvedValueOnce({ ok: false, status: 401 });

    await addFavorite(mockPokemon);

    // fetch est bien appelé avec "Bearer null", pas de vérification préventive
    expect(global.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer null',
        }),
      })
    );
  });
});

describe('removeFavorite', () => {

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.spyOn(auth, 'getToken').mockReturnValue('fake.jwt.token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // TU-006
  it('TU-006: envoie DELETE avec l\'ID dans l\'URL', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });

    await removeFavorite(25);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/favorites/25'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});