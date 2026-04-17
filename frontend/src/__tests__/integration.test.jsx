import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import Login from '../pages/Login';
import Register from '../pages/Register';
import NavBar from '../components/NavBar';
import ProtectedRoute from '../components/ProtectedRoute';

// ─── HELPERS ────────────────────────────────────────────────────────────────

function mockFetchOk(body) {
  return vi.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => body,
  });
}

function mockFetchError(status, body) {
  return vi.fn().mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => body,
  });
}

function renderLogin() {
  return render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/team" element={<div>Page équipe</div>} />
          <Route path="/register" element={<div>Page inscription</div>} />
        </Routes>
      </MemoryRouter>
  );
}

function renderRegister() {
  return render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/team" element={<div>Page équipe</div>} />
          <Route path="/login" element={<div>Page connexion</div>} />
        </Routes>
      </MemoryRouter>
  );
}

function renderNavBar(initialPath = '/') {
  return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
              path="*"
              element={
                <>
                  <NavBar />
                  <div>Contenu</div>
                </>
              }
          />
        </Routes>
      </MemoryRouter>
  );
}

// ─── SUITE DE TESTS ─────────────────────────────────────────────────────────

describe('Tests d\'intégration — Pokedev (11 tests)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('Login — parcours de connexion', () => {
    it('[TI-001] Connexion réussie → token sauvegardé et redirection vers /team', async () => {
      vi.stubGlobal('fetch', mockFetchOk({ token: 'fake-jwt-token' }));
      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText(/email ou username/i), 'ash');
      await user.type(screen.getByLabelText(/mot de passe/i), 'pikachu123');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      expect(await screen.findByText('Page équipe')).toBeInTheDocument();
    });

    it('[TI-002] Credentials incorrects → message d\'erreur, aucun token sauvegardé', async () => {
      vi.stubGlobal(
          'fetch',
          mockFetchError(401, { message: 'Identifiants incorrects.' })
      );
      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText(/email ou username/i), 'mauvais');
      await user.type(screen.getByLabelText(/mot de passe/i), 'faux');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      expect(await screen.findByText('Identifiants incorrects.')).toBeInTheDocument();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('[TI-003] Erreur réseau → "Impossible de contacter le serveur"', async () => {
      vi.stubGlobal(
          'fetch',
          vi.fn().mockRejectedValueOnce(new Error('Network Error'))
      );
      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText(/email ou username/i), 'ash');
      await user.type(screen.getByLabelText(/mot de passe/i), 'pikachu123');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      expect(
          await screen.findByText(/impossible de contacter le serveur/i)
      ).toBeInTheDocument();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('Register — parcours d\'inscription', () => {
    it('[TI-004] Inscription réussie → token sauvegardé et message de succès', async () => {
      vi.stubGlobal('fetch', mockFetchOk({ token: 'new-user-token' }));
      const user = userEvent.setup();
      renderRegister();

      await user.type(screen.getByLabelText(/email/i), 'ash@ketchum.com');
      await user.type(screen.getByLabelText(/username/i), 'Sacha');
      await user.type(screen.getByLabelText(/mot de passe/i), 'pikachu123');
      await user.click(screen.getByRole('button', { name: /s'inscrire/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('new-user-token');
      });
      expect(await screen.findByText(/inscription réussie/i)).toBeInTheDocument();
    });

    it('[TI-005] Email déjà utilisé → message d\'erreur API affiché', async () => {
      vi.stubGlobal(
          'fetch',
          mockFetchError(409, { message: 'Email déjà utilisé.' })
      );
      const user = userEvent.setup();
      renderRegister();

      await user.type(screen.getByLabelText(/email/i), 'existe@deja.com');
      await user.type(screen.getByLabelText(/username/i), 'Sacha');
      await user.type(screen.getByLabelText(/mot de passe/i), 'pikachu123');
      await user.click(screen.getByRole('button', { name: /s'inscrire/i }));

      expect(await screen.findByText('Email déjà utilisé.')).toBeInTheDocument();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('[TI-006] Erreur réseau lors de l\'inscription → message générique', async () => {
      vi.stubGlobal(
          'fetch',
          vi.fn().mockRejectedValueOnce(new Error('Network Error'))
      );
      const user = userEvent.setup();
      renderRegister();

      await user.type(screen.getByLabelText(/email/i), 'ash@ketchum.com');
      await user.type(screen.getByLabelText(/username/i), 'Sacha');
      await user.type(screen.getByLabelText(/mot de passe/i), 'pikachu123');
      await user.click(screen.getByRole('button', { name: /s'inscrire/i }));

      expect(
          await screen.findByText(/impossible de contacter le serveur/i)
      ).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('NavBar — affichage conditionnel selon le token', () => {
    it('[TI-007] Sans token → liens Connexion et Inscription visibles', () => {
      renderNavBar();

      expect(screen.getByRole('link', { name: /connexion/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /inscription/i })).toBeInTheDocument();
      expect(
          screen.queryByRole('button', { name: /déconnexion/i })
      ).not.toBeInTheDocument();
    });

    it('[TI-008] Avec token → bouton Déconnexion visible', () => {
      localStorage.setItem('token', 'valid-jwt-token');
      renderNavBar();

      expect(
          screen.getByRole('button', { name: /déconnexion/i })
      ).toBeInTheDocument();

      const connexionLinks = screen.queryAllByRole('link', { name: /^connexion$/i });
      expect(connexionLinks).toHaveLength(0);
    });

    it('[TI-009] Clic Déconnexion → token effacé et redirection vers /', async () => {
      localStorage.setItem('token', 'valid-jwt-token');
      const user = userEvent.setup();

      render(
          <MemoryRouter initialEntries={['/profil']}>
            <Routes>
              <Route
                  path="*"
                  element={
                    <>
                      <NavBar />
                      <div data-testid="current-page">profil</div>
                    </>
                  }
              />
              <Route
                  path="/"
                  element={
                    <>
                      <NavBar />
                      <div data-testid="current-page">accueil</div>
                    </>
                  }
              />
            </Routes>
          </MemoryRouter>
      );

      await user.click(screen.getByRole('button', { name: /déconnexion/i }));

      expect(localStorage.getItem('token')).toBeNull();
      await waitFor(() => {
        expect(screen.getByTestId('current-page')).toHaveTextContent('accueil');
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('ProtectedRoute — sécurité des routes privées', () => {
    it('[TI-010] Sans token → redirection automatique vers /login', () => {
      render(
          <MemoryRouter initialEntries={['/team']}>
            <Routes>
              <Route
                  path="/team"
                  element={
                    <ProtectedRoute>
                      <div>Contenu protégé</div>
                    </ProtectedRoute>
                  }
              />
              <Route path="/login" element={<div>Page de connexion</div>} />
            </Routes>
          </MemoryRouter>
      );

      expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
      expect(screen.getByText('Page de connexion')).toBeInTheDocument();
    });

    it('[TI-011] Avec token → affiche le contenu enfant sans redirection', () => {
      localStorage.setItem('token', 'valid-jwt-token');

      render(
          <MemoryRouter initialEntries={['/team']}>
            <Routes>
              <Route
                  path="/team"
                  element={
                    <ProtectedRoute>
                      <div>Contenu protégé</div>
                    </ProtectedRoute>
                  }
              />
              <Route path="/login" element={<div>Page de connexion</div>} />
            </Routes>
          </MemoryRouter>
      );

      expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
      expect(screen.queryByText('Page de connexion')).not.toBeInTheDocument();
    });
  });
});