import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TeamBuilder from '../TeamBuilder';
import { fetchAllPokemon } from '../../api/pokemonApi';
import { createTeam, updateTeam } from '../../api/teamApi';

// ─── MOCKS ──────────────────────────────────────────────────────────────────

vi.mock('../../api/pokemonApi', () => ({
  fetchAllPokemon: vi.fn(),
}));

vi.mock('../../api/teamApi', () => ({
  createTeam: vi.fn(),
  updateTeam: vi.fn(),
}));

vi.mock('../../components/TypeBadge', () => ({
  default: ({ type }) => <span data-testid={`type-badge-${type}`}>{type}</span>,
}));

// ─── FIXTURES ───────────────────────────────────────────────────────────────

const MOCK_POKEMON = [
  { id: 1,  nameFr: 'Bulbizarre', image: 'https://example.com/1.png',  types: ['grass', 'poison'],   stats: { hp: 45,  attack: 49, defense: 49, speed: 45  } },
  { id: 4,  nameFr: 'Salamèche',  image: 'https://example.com/4.png',  types: ['fire'],              stats: { hp: 39,  attack: 52, defense: 43, speed: 65  } },
  { id: 7,  nameFr: 'Carapuce',   image: 'https://example.com/7.png',  types: ['water'],             stats: { hp: 44,  attack: 48, defense: 65, speed: 43  } },
  { id: 25, nameFr: 'Pikachu',    image: 'https://example.com/25.png', types: ['electric'],          stats: { hp: 35,  attack: 55, defense: 40, speed: 90  } },
  { id: 39, nameFr: 'Rondoudou',  image: 'https://example.com/39.png', types: ['normal', 'fairy'],   stats: { hp: 115, attack: 45, defense: 20, speed: 20  } },
  { id: 52, nameFr: 'Miaouss',    image: 'https://example.com/52.png', types: ['normal'],            stats: { hp: 40,  attack: 45, defense: 35, speed: 90  } },
  { id: 94, nameFr: 'Gengar',     image: 'https://example.com/94.png', types: ['ghost', 'poison'],   stats: { hp: 60,  attack: 65, defense: 60, speed: 110 } },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

function renderTeamBuilder(path = '/team-builder') {
  return render(
      <MemoryRouter initialEntries={[path]}>
        <TeamBuilder />
      </MemoryRouter>
  );
}

async function addPokemonViaModal(user, pokemonName) {
  const openButton = screen.getByRole('button', { name: /\+ ajouter un pokémon/i });
  await user.click(openButton);
  await screen.findByPlaceholderText('Rechercher...');
  const pokemonButton = screen.getByRole('button', {
    name: new RegExp(pokemonName, 'i'),
  });
  await user.click(pokemonButton);
}

// matcher pour un texte type "0/6" qui peut contenir des espaces ou des sauts
const matchRatio = (ratio) => (_, el) =>
    el?.textContent?.replace(/\s+/g, '') === ratio;

// ─── SUITE DE TESTS ─────────────────────────────────────────────────────────

describe('TeamBuilder — Tests unitaires (15 tests)', () => {
  beforeEach(() => {
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
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('Rendu initial du composant', () => {
    it('[TU-001] Affiche le titre par défaut et les 6 slots vides', async () => {
      renderTeamBuilder();
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      expect(screen.getByText('Mon Équipe')).toBeInTheDocument();
      expect(screen.getByText(matchRatio('0/6'))).toBeInTheDocument();
      expect(screen.getAllByText(/^Slot #\d$/)).toHaveLength(6);
    });

    it('[TU-002] Affiche la liste des Pokémon disponibles dans la modal', async () => {
      const user = userEvent.setup();
      renderTeamBuilder();
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      await user.click(screen.getByRole('button', { name: /\+ ajouter un pokémon/i }));

      expect(await screen.findByText(/Bulbizarre/i)).toBeInTheDocument();
      expect(screen.getByText(/Salamèche/i)).toBeInTheDocument();
      expect(screen.getByText(/Pikachu/i)).toBeInTheDocument();
      expect(screen.getByText(/Gengar/i)).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('Sélection de Pokémon', () => {
    it('[TU-003] Ajoute un Pokémon à l\'équipe quand sélectionné dans la modal', async () => {
      const user = userEvent.setup();
      renderTeamBuilder();
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      await addPokemonViaModal(user, 'Bulbizarre');

      expect(screen.getByText('Bulbizarre')).toBeInTheDocument();
      expect(screen.getByText(matchRatio('1/6'))).toBeInTheDocument();
    });

    it('[TU-004] Permet l\'ajout de plusieurs Pokémon successivement', async () => {
      const user = userEvent.setup();
      renderTeamBuilder();
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      await addPokemonViaModal(user, 'Bulbizarre');
      await addPokemonViaModal(user, 'Salamèche');
      await addPokemonViaModal(user, 'Carapuce');

      expect(screen.getByText('Bulbizarre')).toBeInTheDocument();
      expect(screen.getByText('Salamèche')).toBeInTheDocument();
      expect(screen.getByText('Carapuce')).toBeInTheDocument();
      expect(screen.getByText(matchRatio('3/6'))).toBeInTheDocument();
    });

    it('[TU-005] Masque le bouton d\'ajout à 6 Pokémon (règle métier)', async () => {
      const user = userEvent.setup();
      renderTeamBuilder();
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      for (const name of ['Bulbizarre', 'Salamèche', 'Carapuce', 'Pikachu', 'Rondoudou', 'Miaouss']) {
        await addPokemonViaModal(user, name);
      }

      expect(
          screen.queryByRole('button', { name: /\+ ajouter un pokémon/i })
      ).not.toBeInTheDocument();
      expect(screen.getByText(matchRatio('6/6'))).toBeInTheDocument();
    });

    it('[TU-006] Retire un Pokémon au clic sur le bouton de suppression', async () => {
      const user = userEvent.setup();
      renderTeamBuilder();
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      await addPokemonViaModal(user, 'Bulbizarre');
      expect(screen.getByText('Bulbizarre')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /✕/ }));

      expect(screen.queryByText('Bulbizarre')).not.toBeInTheDocument();
      expect(screen.getByText(matchRatio('0/6'))).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('Formulaire d\'édition', () => {
    it('[TU-007] Permet l\'édition du nom d\'équipe en cliquant sur le titre', async () => {
      const user = userEvent.setup();
      renderTeamBuilder();
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      await user.click(screen.getByText('Mon Équipe'));

      const nameInput = screen.getByDisplayValue('Mon Équipe');
      expect(nameInput).toBeInTheDocument();

      await user.clear(nameInput);
      await user.type(nameInput, 'Équipe Rocket');
      await user.keyboard('{Enter}');

      expect(screen.getByText('Équipe Rocket')).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('[TU-008] Filtre la liste selon la saisie dans la barre de recherche', async () => {
      const user = userEvent.setup();
      renderTeamBuilder();
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      await user.click(screen.getByRole('button', { name: /\+ ajouter un pokémon/i }));
      const searchInput = await screen.findByPlaceholderText('Rechercher...');

      await user.type(searchInput, 'pika');

      expect(screen.getByText(/Pikachu/i)).toBeInTheDocument();
      expect(screen.queryByText(/Bulbizarre/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Salamèche/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Gengar/i)).not.toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('Statistiques d\'équipe', () => {
    it('[TU-009] Calcule correctement les stats moyennes (PV / ATK / DEF / SPD)', async () => {
      // Bulbizarre: 45/49/49/45  +  Salamèche: 39/52/43/65
      // Moyennes:   42/51/46/55
      const user = userEvent.setup();
      renderTeamBuilder();
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      await addPokemonViaModal(user, 'Bulbizarre');
      await addPokemonViaModal(user, 'Salamèche');

      const pvLabel = await screen.findByText('PV moyens');
      expect(pvLabel.previousElementSibling).toHaveTextContent('42');

      const atkLabel = screen.getByText('Attaque moy.');
      expect(atkLabel.previousElementSibling).toHaveTextContent('51');

      const defLabel = screen.getByText('Défense moy.');
      expect(defLabel.previousElementSibling).toHaveTextContent('46');

      const spdLabel = screen.getByText('Vitesse moy.');
      expect(spdLabel.previousElementSibling).toHaveTextContent('55');
    });

    it('[TU-010] Affiche le résumé d\'équipe uniquement si l\'équipe n\'est pas vide', async () => {
      const user = userEvent.setup();
      renderTeamBuilder();
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      expect(screen.queryByText("Résumé de l'équipe")).not.toBeInTheDocument();

      await addPokemonViaModal(user, 'Pikachu');
      expect(await screen.findByText("Résumé de l'équipe")).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('Sauvegarde via l\'API', () => {
    it('[TU-011] Affiche le bouton de sauvegarde', async () => {
      renderTeamBuilder();
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      expect(
          screen.getByRole('button', { name: /sauvegarder l'équipe/i })
      ).toBeInTheDocument();
    });

    it('[TU-012] Appelle createTeam avec le bon payload', async () => {
      const user = userEvent.setup();
      renderTeamBuilder();
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      await addPokemonViaModal(user, 'Bulbizarre');
      await user.click(screen.getByRole('button', { name: /sauvegarder l'équipe/i }));

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

    it('[TU-013] Affiche un message d\'erreur si l\'API lève une exception', async () => {
      createTeam.mockRejectedValue(new Error('Network Error'));
      const user = userEvent.setup();
      renderTeamBuilder();
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      await addPokemonViaModal(user, 'Bulbizarre');
      await user.click(screen.getByRole('button', { name: /sauvegarder l'équipe/i }));

      expect(
          await screen.findByText(/impossible de sauvegarder/i)
      ).toBeInTheDocument();
    });

    it('[TU-014] Bloque la sauvegarde et affiche une erreur si l\'équipe est vide', async () => {
      const user = userEvent.setup();
      renderTeamBuilder();
      await waitFor(() => expect(fetchAllPokemon).toHaveBeenCalledOnce());

      await user.click(screen.getByRole('button', { name: /sauvegarder l'équipe/i }));

      expect(createTeam).not.toHaveBeenCalled();
      expect(
          screen.getByText(/ajoutez au moins un pokémon avant de sauvegarder/i)
      ).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('Export PDF', () => {
    it('[TU-015] Ouvre une fenêtre d\'impression et écrit le HTML de l\'équipe', async () => {
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
      await user.click(screen.getByRole('button', { name: /export pdf/i }));

      expect(window.open).toHaveBeenCalledWith('', '_blank', 'width=1000,height=800');
      expect(mockPrintWindow.document.write).toHaveBeenCalledWith(
          expect.stringContaining('Bulbizarre')
      );
      expect(screen.getByText(/aperçu prêt/i)).toBeInTheDocument();
    });
  });
});