import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { expect, test, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import ProtectedRoute from "../src/components/ProtectedRoute.jsx";
import Navbar from "../src/components/NavBar.jsx";

beforeEach(() => {
  localStorage.clear();
});

// --- TEST 1 : ROUTING PROTÉGÉ ---
test('Redirige vers la page de login si aucun token n’est présent', () => {
  render(
    <MemoryRouter initialEntries={['/profil']}>
      <Routes>
        <Route path="/login" element={<div>Page Login</div>} />
        <Route path="/profil" element={
          <ProtectedRoute>
            <div>Page Profil Privée</div>
          </ProtectedRoute>
        } />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText(/Page Login/i)).toBeInTheDocument();
  expect(screen.queryByText(/Page Profil Privée/i)).not.toBeInTheDocument();
});

// --- TEST 2 : UI GLOBAL (LOGIN) ---
test('Affiche le bouton Connexion quand l’utilisateur n’est pas connecté', () => {
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
  
  expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
});

// --- TEST 3 : UI GLOBAL (LOGOUT) ---
test('Affiche le bouton Déconnexion quand un token est présent', () => {
  localStorage.setItem('token', 'fake-token'); 
  
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
  
  expect(screen.getByText(/Déconnexion/i)).toBeInTheDocument();
});

// --- TEST 4 : NAVIGATION (NAVBAR) ---
test('Vérifie la présence des liens principaux dans la Navbar', () => {
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
  
  const pokedexElements = screen.getAllByText(/PokéDex/i);
  expect(pokedexElements.length).toBeGreaterThanOrEqual(1);

  expect(screen.getByText(/Accueil/i)).toBeInTheDocument();
  expect(screen.getByText(/Mon Équipe/i)).toBeInTheDocument();
  expect(screen.getByText(/Profil/i)).toBeInTheDocument();
});