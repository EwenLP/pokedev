import http from 'k6/http';
import { group, check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% des requêtes sous 500ms
  },
};

const BASE_URL = 'http://[::1]:5173'

export default function () {
  
  // 1. Accueil
  group('01_Homepage', function () {
    const res = http.get(`${BASE_URL}/`);
    check(res, { 'status 200': (r) => r.status === 200 });
  });

  sleep(1);

  // 2. Consultation du Pokedex
  group('02_Pokedex', function () {
    const res = http.get(`${BASE_URL}/pokedex`);
    check(res, { 'pokedex chargé': (r) => r.status === 200 });
  });

  sleep(2);

  // 3. Détail d'un Pokémon (ID aléatoire entre 1 et 151)
  group('03_PokemonDetail', function () {
    const randomId = Math.floor(Math.random() * 151) + 1;
    const res = http.get(`${BASE_URL}/pokemon/${randomId}`);
    check(res, { 'detail chargé': (r) => r.status === 200 });
  });

  sleep(2);

  // 4. Tentative d'accès au Profil (ProtectedRoute)
  group('04_Protected_Profil', function () {
    const res = http.get(`${BASE_URL}/profil`);
    // Ici, si l'utilisateur n'est pas connecté, React Router redirige 
    // côté client, mais la requête HTTP initiale peut varier.
    check(res, { 'profil accessible ou redirigé': (r) => r.status === 200 });
  });

  sleep(1);
}