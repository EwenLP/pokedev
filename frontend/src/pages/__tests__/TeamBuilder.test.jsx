import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TeamBuilder from '../TeamBuilder';
import { fetchAllPokemon } from '../../api/pokemonApi';
import { createTeam, updateTeam } from '../../api/teamApi';

// ─── MOCKS ──────────────────────────────────────────────────────────────────

// faut mocker l'API sinon ça va vraiment chercher les pokemons
vi.mock('../../api/pokemonApi', () => ({
  fetchAllPokemon: vi.fn(),
}));

// idem pour la sauvegarde, on veut pas que ça sauve vraiment
vi.mock('../../api/teamApi', () => ({
  createTeam: vi.fn(),
  updateTeam: vi.fn(),
}));

// TypeBadge c'est juste un composant qui affiche la couleur du type
// on s'en fout du rendu exact donc je le remplace par un truc simple
vi.mock('../../components/TypeBadge', () => ({
  default: ({ type }) => <span data-testid={`type-badge-${type}`}>{type}</span>,
}));

// ─── FIXTURES ───────────────────────────────────────────────────────────────

// des pokemons de test, j'en mets 7 parce que faut tester la limite de 6
// sinon on peut pas vérifier que le bouton disparait
const MOCK_POKEMON = [
  {
    id: 1,
    nameFr: 'Bulbizarre',
    image: 'https://example.com/1.png',
    types: ['grass', 'poison'],
    stats: { hp: 45, attack: 49, defense: 49, speed: 45 },
  },
  {
    id: 4,
    nameFr: 'Salamèche',
    image: 'https://example.com/4.png',
    types: ['fire'],
    stats: { hp: 39, attack: 52, defense: 43, speed: 65 },
  },
  {
    id: 7,
    nameFr: 'Carapuce',
    image: 'https://example.com/7.png',
    types: ['water'],
    stats: { hp: 44, attack: 48, defense: 65, speed: 43 },
  },
  {
    id: 25,
    nameFr: 'Pikachu',
    image: 'https://example.com/25.png',
    types: ['electric'],
    stats: { hp: 35, attack: 55, defense: 40, speed: 90 },
  },
  {
    id: 39,
    nameFr: 'Rondoudou',
    image: 'https://example.com/39.png',
    types: ['normal', 'fairy'],
    stats: { hp: 115, attack: 45, defense: 20, speed: 20 },
  },
  {
    id: 52,
    nameFr: 'Miaouss',
    image: 'https://example.com/52.png',
    types: ['normal'],
    stats: { hp: 40, attack: 45, defense: 35, speed: 90 },
  },
  {
    id: 94,
    nameFr: 'Gengar',
    image: 'https://example.com/94.png',
    types: ['ghost', 'poison'],
    stats: { hp: 60, attack: 65, defense: 60, speed: 110 },
  },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

// helper pour pas repeter le meme truc partout, render dans un routeur
function renderTeamBuilder(path = '/team-builder') {
  return render(
      <MemoryRouter initialEntries={[path]}>
        <TeamBuilder />
      </MemoryRouter>
  );
}

// on fait ca plein de fois donc j'ai fait une fonction
// ouvre la modal, cherche le pokemon, clique dessus
async function addPokemonViaModal(user, pokemonName) {
  // click sur le bouton pour ouvrir
  const openButton = screen.getByRole('button', { name: /\+ ajouter un pokémon/i });
  await user.click(openButton);

  // on attend que la modal s'ouvre (y'a un input de recherche dedans)
  await screen.findByPlaceholderText('Rechercher...');

  // on cherche le pokemon et on clique
  const pokemonButton = screen.getByRole('button', {
    name: new RegExp(pokemonName, 'i'),
  });
  await user.click(pokemonButton);
}

// ─── SUITE DE TESTS ─────────────────────────────────────────────────────────

describe('TeamBuilder Component', () => {
  beforeEach(() => {
    // avant chaque test on setup les mocks
    // comme ca ils font ce qu'on veut
    fetchAllPokemon.mockResolvedValue(MOCK_POKEMON);

    createTeam.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, name: 'Mon Équipe' }),
    });
    updateTeam.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, name: 'Mon Équipe' }),
    });
  });

  afterEach(() => {
    // reset les mocks apres chaque test sinon les tests interfèrent entre eux
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // ─── RENDERING ────────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('TU-001: doit afficher le composant TeamBuilder avec le nom et les slots par défaut', async () => {
      // juste check que le composant s'affiche normalement sans crash
      renderTeamBuilder();

      // on attend que l'API soit appelee
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      // le titre par defaut "Mon Équipe" doit etre la
      expect(screen.getByText('Mon Équipe')).toBeInTheDocument();

      // le badge 0/6 doit montrer qu'il y a 0 pokemons
      expect(screen.getByText('0/6')).toBeInTheDocument();

      // et les 6 slots vides doivent s'afficher
      expect(screen.getAllByText(/^Slot #\d$/)).toHaveLength(6);
    });

    it('TU-002: doit afficher la liste des Pokémon disponibles dans la modal', async () => {
      // quand tu ouvres la modal pour ajouter un pokemon, tu dois voir tous les pokemons
      const user = userEvent.setup();
      renderTeamBuilder();

      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      // on ouvre la modal
      await user.click(screen.getByRole('button', { name: /\+ ajouter un pokémon/i }));

      // tous les pokemons du mock doivent etre visibles
      expect(await screen.findByText(/Bulbizarre/i)).toBeInTheDocument();
      expect(screen.getByText(/Salamèche/i)).toBeInTheDocument();
      expect(screen.getByText(/Pikachu/i)).toBeInTheDocument();
      expect(screen.getByText(/Gengar/i)).toBeInTheDocument();
    });
  });

  // ─── SÉLECTION DE POKÉMON ─────────────────────────────────────────────────

  describe('Pokemon Selection', () => {
    it('TU-003: doit ajouter un Pokémon à l\'équipe quand il est sélectionné dans la modal', async () => {
      // quand je clique sur un pokemon dans la modal, il doit s'ajouter a mon equipe
      const user = userEvent.setup();
      renderTeamBuilder();

      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());
      await addPokemonViaModal(user, 'Bulbizarre');

      // bulbizarre doit maintenant etre dans les slots
      expect(screen.getByText('Bulbizarre')).toBeInTheDocument();

      // et le compteur doit passer a 1/6
      expect(screen.getByText('1/6')).toBeInTheDocument();
    });

    it('TU-004: doit permettre l\'ajout de plusieurs Pokémon successivement jusqu\'à 6', async () => {
      // tu dois pouvoir ajouter plusieurs pokemons d'affilement
      const user = userEvent.setup();
      renderTeamBuilder();

      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      // j'en ajoute 3
      await addPokemonViaModal(user, 'Bulbizarre');
      await addPokemonViaModal(user, 'Salamèche');
      await addPokemonViaModal(user, 'Carapuce');

      // tous les 3 doivent etre presents
      expect(screen.getByText('Bulbizarre')).toBeInTheDocument();
      expect(screen.getByText('Salamèche')).toBeInTheDocument();
      expect(screen.getByText('Carapuce')).toBeInTheDocument();
      // et le badge doit dire 3/6
      expect(screen.getByText('3/6')).toBeInTheDocument();
    });

    it('TU-005: doit masquer le bouton d\'ajout lorsque l\'équipe atteint 6 Pokémon', async () => {
      // une fois que tu as 6 pokemons, tu peux plus en ajouter
      // donc le bouton doit disparaitre
      const user = userEvent.setup();
      renderTeamBuilder();

      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      // j'ajoute 6 pokemons
      for (const name of ['Bulbizarre', 'Salamèche', 'Carapuce', 'Pikachu', 'Rondoudou', 'Miaouss']) {
        await addPokemonViaModal(user, name);
      }

      // le bouton "+ ajouter" ne doit plus etre la
      expect(
          screen.queryByRole('button', { name: /\+ ajouter un pokémon/i })
      ).not.toBeInTheDocument();

      // et le badge doit dire 6/6
      expect(screen.getByText('6/6')).toBeInTheDocument();
    });

    it('TU-006: doit retirer un Pokémon de l\'équipe au clic sur le bouton de suppression', async () => {
      // quand je clique sur le X pour supprimer un pokemon, il doit partir
      const user = userEvent.setup();
      renderTeamBuilder();

      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());
      await addPokemonViaModal(user, 'Bulbizarre');

      // verifie que c'est bien la avant de supprimer
      expect(screen.getByText('Bulbizarre')).toBeInTheDocument();

      // click sur le X
      await user.click(screen.getByRole('button', { name: /✕/ }));

      // bulbizarre doit avoir disparu
      expect(screen.queryByText('Bulbizarre')).not.toBeInTheDocument();
      // et retour a 0/6
      expect(screen.getByText('0/6')).toBeInTheDocument();
    });
  });

  // ─── FORMULAIRE ───────────────────────────────────────────────────────────

  describe('Form', () => {
    it('TU-007: doit permettre l\'édition du nom d\'équipe en cliquant sur le titre', async () => {
      // je dois pouvoir cliquer sur le titre pour le modifier
      const user = userEvent.setup();
      renderTeamBuilder();

      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      // click sur le titre
      await user.click(screen.getByText('Mon Équipe'));

      // un input doit apparaitre avec le texte dedans
      const nameInput = screen.getByDisplayValue('Mon Équipe');
      expect(nameInput).toBeInTheDocument();

      // je change le texte et j'appuie sur entree
      await user.clear(nameInput);
      await user.type(nameInput, 'Équipe Rocket');
      await user.keyboard('{Enter}');

      // le nouveau texte doit s'afficher et l'input doit partir
      expect(screen.getByText('Équipe Rocket')).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('TU-008: doit filtrer la liste des Pokémon dans la modal selon la saisie dans le champ de recherche', async () => {
      // quand je tape dans la barre de recherche, faut que ca filtre les pokemons
      const user = userEvent.setup();
      renderTeamBuilder();

      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      // ouvre la modal
      await user.click(screen.getByRole('button', { name: /\+ ajouter un pokémon/i }));
      const searchInput = await screen.findByPlaceholderText('Rechercher...');

      // je tape "pika"
      await user.type(searchInput, 'pika');

      // pikachu doit etre la
      expect(screen.getByText(/Pikachu/i)).toBeInTheDocument();
      // mais les autres ne doivent pas etre visibles
      expect(screen.queryByText(/Bulbizarre/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Salamèche/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Gengar/i)).not.toBeInTheDocument();
    });
  });

  // ─── STATISTIQUES ─────────────────────────────────────────────────────────

  describe('Statistics', () => {
    it('TU-009: doit calculer correctement les statistiques moyennes de l\'équipe', async () => {
      // quand j'ajoute des pokemons, ca doit calculer les stats moyennes
      // (hp moyen, attaque moyenne, etc)
      // bulbizarre: hp=45, atk=49, def=49, spd=45
      // salamèche:  hp=39, atk=52, def=43, spd=65
      // moyennes:    hp=42, atk=51, def=46, spd=55
      const user = userEvent.setup();
      renderTeamBuilder();

      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());
      await addPokemonViaModal(user, 'Bulbizarre');
      await addPokemonViaModal(user, 'Salamèche');

      // je verifie que les nombres affiches sont corrects
      const pvLabel = await screen.findByText('PV moyens');
      expect(pvLabel.previousElementSibling).toHaveTextContent('42');

      const atkLabel = screen.getByText('Attaque moy.');
      expect(atkLabel.previousElementSibling).toHaveTextContent('51');

      const defLabel = screen.getByText('Défense moy.');
      expect(defLabel.previousElementSibling).toHaveTextContent('46');

      const spdLabel = screen.getByText('Vitesse moy.');
      expect(spdLabel.previousElementSibling).toHaveTextContent('55');
    });

    it('TU-010: doit afficher le résumé d\'équipe uniquement quand l\'équipe n\'est pas vide', async () => {
      // si l'equipe est vide pas de resume
      // une fois que j'ajoute un pokemon le resume doit apparaitre
      const user = userEvent.setup();
      renderTeamBuilder();

      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      // au depart y'a rien
      expect(screen.queryByText("Résumé de l'équipe")).not.toBeInTheDocument();

      // j'ajoute un pokemon
      await addPokemonViaModal(user, 'Pikachu');
      // maintenant le resume doit etre la
      expect(await screen.findByText("Résumé de l'équipe")).toBeInTheDocument();
    });
  });

  // ─── SAUVEGARDE / API ─────────────────────────────────────────────────────

  describe('Save Team', () => {
    it('TU-011: doit afficher le bouton de sauvegarde de l\'équipe', async () => {
      // le bouton sauvegarder doit toujours etre la
      renderTeamBuilder();

      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      expect(
          screen.getByRole('button', { name: /sauvegarder l'équipe/i })
      ).toBeInTheDocument();
    });

    it('TU-012: doit appeler createTeam avec le nom et les Pokémon corrects lors de la sauvegarde', async () => {
      // quand je clique sur sauvegarder, l'API doit etre appelee avec le bon truc
      const user = userEvent.setup();
      renderTeamBuilder();

      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());
      await addPokemonViaModal(user, 'Bulbizarre');

      // click sur sauvegarder
      await user.click(screen.getByRole('button', { name: /sauvegarder l'équipe/i }));

      // createTeam doit avoir ete appelee avec les bonnes donnees
      expect(createTeam).toHaveBeenCalledOnce();
      expect(createTeam).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Mon Équipe',
            pokemons: expect.arrayContaining([
              expect.objectContaining({ id: 1, name: 'Bulbizarre' }),
            ]),
          })
      );
    });

    it('TU-013: doit afficher un message d\'erreur réseau si l\'appel API lève une exception', async () => {
      // si la sauvegarde plante, faut afficher une erreur
      createTeam.mockRejectedValue(new Error('Network Error'));

      const user = userEvent.setup();
      renderTeamBuilder();

      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());
      await addPokemonViaModal(user, 'Bulbizarre');

      await user.click(screen.getByRole('button', { name: /sauvegarder l'équipe/i }));

      // le message d'erreur doit s'afficher
      expect(await screen.findByText(/impossible de sauvegarder/i)).toBeInTheDocument();
    });

    it('TU-014: doit afficher une erreur de validation sans appeler l\'API si l\'équipe est vide', async () => {
      // je peux pas sauvegarder si y'a pas de pokemon
      const user = userEvent.setup();
      renderTeamBuilder();

      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      // je click sur sauvegarder sans rien ajouter
      await user.click(screen.getByRole('button', { name: /sauvegarder l'équipe/i }));

      // l'API ne doit pas etre appelee
      expect(createTeam).not.toHaveBeenCalled();

      // une erreur doit s'afficher
      expect(
          screen.getByText(/ajoutez au moins un pokémon avant de sauvegarder/i)
      ).toBeInTheDocument();
    });
  });

  // ─── EXPORT PDF ───────────────────────────────────────────────────────────

  describe('PDF Export', () => {
    it('TU-015: doit ouvrir une fenêtre d\'impression et y écrire le HTML de l\'équipe', async () => {
      // quand je click export pdf, ca doit ouvrir une fenetre avec mon equipe dedans
      const mockPrintWindow = {
        document: { open: vi.fn(), write: vi.fn(), close: vi.fn() },
        focus: vi.fn(),
        print: vi.fn(),
      };
      vi.spyOn(window, 'open').mockReturnValue(mockPrintWindow);

      const user = userEvent.setup();
      renderTeamBuilder();

      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());
      await addPokemonViaModal(user, 'Bulbizarre');

      // click sur export
      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      // window.open doit avoir ete appelee
      expect(window.open).toHaveBeenCalledWith('', '_blank', 'width=1000,height=800');

      // le html ecrit dans la fenetre doit avoir le nom du pokemon
      expect(mockPrintWindow.document.write).toHaveBeenCalledWith(
          expect.stringContaining('Bulbizarre')
      );

      // un message doit dire que c'est pret
      expect(screen.getByText(/aperçu prêt/i)).toBeInTheDocument();
    });
  });
});